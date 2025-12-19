// services/cvWorker.js
const { spawn } = require("child_process");
const path = require("path");
const readline = require("readline");
const crypto = require("crypto");

class CvWorker {
  constructor(workerId = 0) {
    this.workerId = workerId;
    this.proc = null;
    this.rl = null;

    this.pending = new Map(); // id -> {resolve,reject,timer}
    this.queue = [];
    this.busy = false;

    this.maxQueue = 50;
    this.timeoutMs = 60_000; // Giảm từ 120s xuống 60s

    this.restartDelayMs = 500;
    this.start();
  }

  _getScriptPath() {
    if (process.env.CV_WORKER_SCRIPT) return process.env.CV_WORKER_SCRIPT;
    return path.join(__dirname, "..", "python", "rateCv.py");
  }

  start() {
    const script = this._getScriptPath();
    const pythonExe = process.env.PYTHON_PATH || "python";

    console.log(`[cvWorker#${this.workerId}] starting...`);
    console.log(`[cvWorker#${this.workerId}] python =`, pythonExe);
    console.log(`[cvWorker#${this.workerId}] script =`, script);

    this.proc = spawn(pythonExe, ["-u", script], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
      },
      windowsHide: true,
    });

    this.proc.on("spawn", () => console.log(`[cvWorker#${this.workerId}] spawned ok`));

    this.proc.stdin.on("error", (err) => {
      console.error(`[cvWorker#${this.workerId} stdin error]`, err.message);
    });

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
      console.error(`[cvWorker#${this.workerId} stderr]`, d.toString());
    });

    this.proc.on("exit", (code, sig) => {
      console.error(`[cvWorker#${this.workerId}] exited code=${code} sig=${sig}`);

      for (const [id, job] of this.pending.entries()) {
        clearTimeout(job.timer);
        job.reject(new Error(`Python worker exited (code=${code}, sig=${sig})`));
      }
      this.pending.clear();
      this.busy = false;

      setTimeout(() => this.start(), this.restartDelayMs);
    });

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

/**
 * Worker Pool - Chạy nhiều Python workers song song
 * Cấu hình số lượng qua env CV_WORKER_POOL_SIZE (mặc định: 3)
 */
class CvWorkerPool {
  constructor() {
    const poolSize = parseInt(process.env.CV_WORKER_POOL_SIZE, 10) || 3;
    console.log(`[CvWorkerPool] Initializing with ${poolSize} workers...`);

    this.workers = [];
    for (let i = 0; i < poolSize; i++) {
      this.workers.push(new CvWorker(i));
    }
    this.currentIndex = 0;
  }

  /**
   * Chọn worker ít bận nhất (least busy) hoặc round-robin nếu tất cả đều busy
   */
  _selectWorker() {
    // Ưu tiên worker không busy
    for (const worker of this.workers) {
      if (!worker.busy && worker.queue.length === 0) {
        return worker;
      }
    }

    // Nếu tất cả busy, chọn worker có queue ngắn nhất
    let minWorker = this.workers[0];
    let minQueueLen = minWorker.queue.length;

    for (const worker of this.workers) {
      if (worker.queue.length < minQueueLen) {
        minWorker = worker;
        minQueueLen = worker.queue.length;
      }
    }

    return minWorker;
  }

  async runJob(params) {
    const worker = this._selectWorker();
    console.log(`[CvWorkerPool] Dispatching to worker#${worker.workerId} (queue: ${worker.queue.length})`);
    return worker.runJob(params);
  }
}

module.exports = new CvWorkerPool();
