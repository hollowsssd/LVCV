// services/cvWorker.js
const { spawn } = require("child_process");
const path = require("path");
const readline = require("readline");
const crypto = require("crypto");

class CvWorker {
  constructor() {
    this.proc = null;
    this.rl = null;

    this.pending = new Map(); // id -> {resolve,reject,timer}
    this.queue = [];
    this.busy = false;

    this.maxQueue = 50;
    this.timeoutMs = 120_000;

    this.restartDelayMs = 500; // để tránh vòng lặp restart quá nhanh
    this.start();
  }

  _getScriptPath() {
    // CV_WORKER_SCRIPT=D:\CV\backend\src\app\python\rateCv.py
    if (process.env.CV_WORKER_SCRIPT) return process.env.CV_WORKER_SCRIPT;

    // path python
    return path.join(__dirname, "..", "python", "rateCv.py");
  }

  start() {
    const script = this._getScriptPath();
    const pythonExe = process.env.PYTHON_PATH || "python"; 

    console.log("[cvWorker] starting...");
    console.log("[cvWorker] python =", pythonExe);
    console.log("[cvWorker] script =", script);

    this.proc = spawn(pythonExe, ["-u", script], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        // Fix charmap/encoding trên Windows
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
      },
      windowsHide: true,
    });

    this.proc.on("spawn", () => console.log("[cvWorker] spawned ok"));

    // IMPORTANT: bắt lỗi async của stdin để khỏi crash Node
    this.proc.stdin.on("error", (err) => {
      console.error("[cvWorker stdin error]", err.message);
    });

    // stdout line-by-line (mỗi dòng là 1 JSON)
    this.rl = readline.createInterface({ input: this.proc.stdout });

    this.rl.on("line", (line) => {
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        return;
      }

      const id = msg?.id;
      if (!id) return;

      const job = this.pending.get(id);
      if (!job) return;

      clearTimeout(job.timer);
      this.pending.delete(id);

      if (msg.ok) job.resolve(msg.data);
      else job.reject(new Error(msg.error || "Python worker error"));
    });

    this.proc.stderr.on("data", (d) => {
      console.error("[cvWorker stderr]", d.toString());
    });

    this.proc.on("exit", (code, sig) => {
      console.error(`[cvWorker] exited code=${code} sig=${sig}`);

      // reject hết job đang chờ
      for (const [id, job] of this.pending.entries()) {
        clearTimeout(job.timer);
        job.reject(new Error(`Python worker exited (code=${code}, sig=${sig})`));
      }
      this.pending.clear();
      this.busy = false;

      // restart có delay để tránh loop
      setTimeout(() => this.start(), this.restartDelayMs);
    });

    // drain nếu có queue từ trước
    this._drain();
  }

  async runJob({ mime, buffer, job_title }) {
    if (this.queue.length >= this.maxQueue) throw new Error("Worker queue is full");
    if (!buffer || !Buffer.isBuffer(buffer)) throw new Error("Invalid buffer");

    const id = crypto.randomUUID?.() || crypto.randomBytes(16).toString("hex");
    const payload = {
      id,
      mime: mime || "application/pdf",
      job_title: job_title || "Không cung cấp",
      data_b64: buffer.toString("base64"),
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("Worker timeout"));
        this._drain();
      }, this.timeoutMs);

      this.queue.push({ id, payload, resolve, reject, timer });
      this._drain();
    });
  }


  _drain() {
    if (!this.proc || this.proc.killed) return;
    if (this.busy) return;
    if (!this.proc.stdin || !this.proc.stdin.writable) return;

    const item = this.queue.shift();
    if (!item) return;

    this.busy = true;

    this.pending.set(item.id, {
      resolve: (v) => {
        this.busy = false;
        item.resolve(v);
        this._drain();
      },
      reject: (e) => {
        this.busy = false;
        item.reject(e);
        this._drain();
      },
      timer: item.timer,
    });

    // Ghi stdin có thể phát lỗi async, nên dùng callback
    this.proc.stdin.write(JSON.stringify(item.payload) + "\n", (err) => {
      if (!err) return;

      clearTimeout(item.timer);
      this.pending.delete(item.id);
      this.busy = false;

      item.reject(new Error(`stdin write failed: ${err.message}`));
      this._drain();
    });
  }
}

module.exports = new CvWorker();
