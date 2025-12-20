# python
import os, sys, json, base64, traceback, tempfile, io
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Fix Unicode trên Windows console
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

# Optional imports for PDF/DOC processing
try:
    import fitz  # PyMuPDF

    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False
    print("[WARN] PyMuPDF not installed. PDF annotation disabled.", file=sys.stderr)

try:
    from docx import Document as DocxDocument

    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

try:
    from docx2pdf import convert as docx2pdf_convert

    HAS_DOCX2PDF = True
except ImportError:
    HAS_DOCX2PDF = False

load_dotenv()
API_KEY = os.getenv("GEMINI_KEY")
if not API_KEY:
    print(
        json.dumps({"id": None, "ok": False, "error": "Missing GEMINI_KEY"}), flush=True
    )
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

QUAN TRỌNG VỀ ANNOTATIONS:
- Trong field "annotations", bạn PHẢI trích dẫn CHÍNH XÁC các đoạn text từ CV cần sửa.
- Mỗi annotation phải có "text" là chuỗi COPY NGUYÊN VĂN từ CV (để hệ thống có thể tìm và highlight).
- "reason" giải thích tại sao cần sửa và gợi ý cách sửa.
- "severity": "critical" (lỗi nghiêm trọng), "warning" (cần cải thiện), "info" (gợi ý nhỏ).
- Chỉ trích những đoạn text thực sự có trong CV, không bịa ra.
"""

CV_SCHEMA = {
    "type": "object",
    "properties": {
        "job_title": {"type": "string"},
        "muc_do_phu_hop": {"type": "integer"},
        "diem_tong": {"type": "integer"},
        "nhan_xet_tong_quan": {"type": "string"},
        "recommend_query": {"type": "string"},
        "diem_chi_tiet": {
            "type": "object",
            "properties": {
                "trinh_bay": {"type": "integer"},
                "noi_dung": {"type": "integer"},
                "kinh_nghiem": {"type": "integer"},
                "ky_nang": {"type": "integer"},
                "thanh_tuu": {"type": "integer"},
            },
            "required": [
                "trinh_bay",
                "noi_dung",
                "kinh_nghiem",
                "ky_nang",
                "thanh_tuu",
            ],
        },
        "uu_diem": {"type": "array", "items": {"type": "string"}},
        "can_cai_thien": {"type": "array", "items": {"type": "string"}},
        "goi_y_chi_tiet": {"type": "string"},
        "annotations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "text": {"type": "string"},
                    "reason": {"type": "string"},
                    "severity": {"type": "string"},
                },
                "required": ["text", "reason", "severity"],
            },
        },
    },
    "required": [
        "job_title",
        "muc_do_phu_hop",
        "diem_tong",
        "nhan_xet_tong_quan",
        "recommend_query",
        "diem_chi_tiet",
        "uu_diem",
        "can_cai_thien",
        "goi_y_chi_tiet",
        "annotations",
    ],
}

# Color mapping for annotations (RGB normalized 0-1)
SEVERITY_COLORS = {
    "critical": (1, 0.2, 0.2),  # Red
    "warning": (1, 0.8, 0),  # Orange/Yellow
    "info": (0.2, 0.6, 1),  # Blue
}


def convert_doc_to_pdf(file_bytes: bytes, mime: str) -> bytes:
    """Convert DOC/DOCX to PDF bytes. Returns original if already PDF or conversion fails."""

    if mime == "application/pdf":
        return file_bytes

    # Check if it's a Word document
    is_docx = (
        mime
        in [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ]
        or mime.endswith(".docx")
        or mime.endswith(".doc")
    )

    if not is_docx:
        return file_bytes

    if not HAS_DOCX2PDF:
        print(
            "[WARN] docx2pdf not installed. Cannot convert DOC/DOCX.", file=sys.stderr
        )
        return file_bytes

    try:
        # Write to temp file, convert, read back
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp_in:
            tmp_in.write(file_bytes)
            tmp_in_path = tmp_in.name

        tmp_out_path = tmp_in_path.replace(".docx", ".pdf")

        docx2pdf_convert(tmp_in_path, tmp_out_path)

        with open(tmp_out_path, "rb") as f:
            pdf_bytes = f.read()

        # Cleanup
        try:
            os.unlink(tmp_in_path)
            os.unlink(tmp_out_path)
        except:
            pass

        return pdf_bytes

    except Exception as e:
        print(f"[WARN] DOC to PDF conversion failed: {e}", file=sys.stderr)
        return file_bytes


def annotate_pdf(pdf_bytes: bytes, annotations: list) -> bytes:
    """
    Annotate PDF with highlights based on annotations list.
    Each annotation: {"text": "...", "reason": "...", "severity": "critical|warning|info"}
    Returns annotated PDF bytes.
    """
    if not HAS_PYMUPDF:
        return pdf_bytes

    if not annotations:
        return pdf_bytes

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        for ann in annotations:
            text = ann.get("text", "").strip()
            severity = ann.get("severity", "info").lower()
            reason = ann.get("reason", "")

            if not text or len(text) < 3:
                continue

            color = SEVERITY_COLORS.get(severity, SEVERITY_COLORS["info"])

            # Search in all pages
            for page_num in range(len(doc)):
                page = doc[page_num]

                # Search for text instances
                text_instances = page.search_for(text, quads=True)

                if not text_instances:
                    # Try with normalized whitespace
                    normalized_text = " ".join(text.split())
                    text_instances = page.search_for(normalized_text, quads=True)

                for quad in text_instances:
                    # Add highlight annotation
                    highlight = page.add_highlight_annot(quad)
                    highlight.set_colors(stroke=color)
                    highlight.update()

        # Save to bytes with proper encoding
        output = io.BytesIO()
        doc.save(output)
        doc.close()

        return output.getvalue()

    except Exception as e:
        print(f"[WARN] PDF annotation failed: {e}", file=sys.stderr)
        return pdf_bytes


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
- Tạo "recommend_query" là 1 chuỗi ngắn để tìm việc trong DB bằng cách search title/description.
- Format recommend_query: 6-12 keyword, ưu tiên English/Vietnamese job keywords.
- Ví dụ: "junior php developer laravel mysql rest api"
- Không dùng ký tự đặc biệt rườm rà, không xuống dòng.

VỀ ANNOTATIONS:
- Trích dẫn 5-10 đoạn text CHÍNH XÁC từ CV cần highlight để sửa.
- Mỗi annotation: copy nguyên văn text từ CV (để hệ thống tự động tô màu).
- severity: "critical" (phải sửa), "warning" (nên sửa), "info" (gợi ý).
- Ví dụ: {{"text": "Kỹ năng: Word, Excel, PowerPoint", "reason": "Quá generic, nên liệt kê skill chuyên môn theo job", "severity": "warning"}}
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

        # Evaluate with Gemini
        result = evaluate(file_bytes, mime, job_title)

        # Get annotations for highlighting
        annotations = result.get("annotations", [])

        # Convert DOC/DOCX to PDF if needed
        pdf_bytes = convert_doc_to_pdf(file_bytes, mime)

        # Annotate PDF with highlights
        annotated_pdf = annotate_pdf(pdf_bytes, annotations)

        # Add annotated PDF to result as base64
        if annotated_pdf and len(annotated_pdf) > 0:
            result["annotated_pdf_b64"] = base64.b64encode(annotated_pdf).decode(
                "utf-8"
            )

        out = {"id": job_id, "ok": True, "data": result}
        print(json.dumps(out, ensure_ascii=False), flush=True)

    except Exception as e:
        out = {
            "id": req.get("id") if isinstance(req, dict) else None,
            "ok": False,
            "error": str(e),
            "trace": traceback.format_exc(limit=3),
        }
        print(json.dumps(out, ensure_ascii=False), flush=True)
