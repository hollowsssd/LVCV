# python
import os, sys, json, base64, traceback
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Fix Unicode trên Windows console
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

load_dotenv()
API_KEY = os.getenv("GEMINI_KEY")
if not API_KEY:
    print(json.dumps({"id": None, "ok": False, "error": "Missing GEMINI_KEY"}), flush=True)
    sys.exit(1)

client = genai.Client(api_key=API_KEY)

SYSTEM = """Bạn là chuyên gia tuyển dụng đa ngành (Tech/Business/Marketing/Sales/Finance/HR/Design/Data/Operations,...) với 18 năm kinh nghiệm.
Bạn chấm CV theo vị trí ứng tuyển mà ứng viên cung cấp.

Nguyên tắc:
- Chấm điểm 1–100. Điểm phải hợp lý và nhất quán với nhận xét.
- Ưu tiên mức độ phù hợp với vị trí: kỹ năng cứng, kinh nghiệm liên quan, dự án/đầu ra, thành tựu định lượng (metrics).
- Nếu thiếu số liệu, thiếu dự án liên quan, mô tả chung chung → trừ điểm rõ ràng.
- Góp ý phải cụ thể, có checklist hành động + ví dụ chỉnh sửa câu chữ.
- Nếu CV lệch ngành so với job_title, nêu thẳng và hướng dẫn cách pivot.
- Trả về đúng JSON theo schema, không thêm chữ ngoài JSON.
"""

CV_SCHEMA = {
    "type": "object",
    "properties": {
        "job_title": {"type": "string"},
        "muc_do_phu_hop": {"type": "integer"},
        "diem_tong": {"type": "integer"},       
        "nhan_xet_tong_quan": {"type": "string"},
        "diem_chi_tiet": {
            "type": "object",
            "properties": {
                "trinh_bay": {"type": "integer"},
                "noi_dung": {"type": "integer"},
                "kinh_nghiem": {"type": "integer"},
                "ky_nang": {"type": "integer"},
                "thanh_tuu": {"type": "integer"},
            },
            "required": ["trinh_bay", "noi_dung", "kinh_nghiem", "ky_nang", "thanh_tuu"],
        },
        "uu_diem": {"type": "array", "items": {"type": "string"}},
        "can_cai_thien": {"type": "array", "items": {"type": "string"}},
        "goi_y_chi_tiet": {"type": "string"},
    },
    "required": [
        "job_title",
        "muc_do_phu_hop",
        "diem_tong",
        "nhan_xet_tong_quan",
        "diem_chi_tiet",
        "uu_diem",
        "can_cai_thien",
        "goi_y_chi_tiet",
    ],
}

def evaluate(file_bytes: bytes, mime: str, job_title: str):
    prompt = f"""
Vị trí ứng tuyển: {job_title}

Yêu cầu:
- Chấm theo đúng vị trí trên.
- "job_title" trả về đúng như input.
- "muc_do_phu_hop": 1-100 (mức fit với vị trí).
- "diem_tong": 1-100 (chất lượng CV tổng thể).
- Thiếu số liệu định lượng / mô tả chung chung / không có dự án liên quan -> trừ điểm và nêu rõ.
- Checklist hành động: liệt kê các bước chỉnh sửa CV theo đúng vị trí.
"""
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=file_bytes, mime_type=mime),
            prompt,
        ],
        config={
            "system_instruction": SYSTEM,
            "response_mime_type": "application/json",
            "response_json_schema": CV_SCHEMA,
        },
    )
    return json.loads(resp.text)

# Protocol stdin: mỗi dòng là JSON: { id, mime, job_title, data_b64 }
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    req = None
    try:
        req = json.loads(line)
        job_id = req.get("id")
        mime = (req.get("mime") or "application/pdf").strip()
        job_title = (req.get("job_title") or "Không cung cấp").strip()
        data_b64 = req["data_b64"]

        file_bytes = base64.b64decode(data_b64)
        result = evaluate(file_bytes, mime, job_title)

        out = {"id": job_id, "ok": True, "data": result}
        # nếu Windows vẫn kén, đổi ensure_ascii=True
        print(json.dumps(out, ensure_ascii=False), flush=True)

    except Exception as e:
        out = {
            "id": req.get("id") if isinstance(req, dict) else None,
            "ok": False,
            "error": str(e),
            "trace": traceback.format_exc(limit=3),
        }
        print(json.dumps(out, ensure_ascii=False), flush=True)
