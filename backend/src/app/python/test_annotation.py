# Test script for CV annotation
# Run: python test_annotation.py

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

import json
import base64

# Test imports
print("Testing imports...")
try:
    import fitz

    print(f"[OK] PyMuPDF version: {fitz.version}")
except ImportError as e:
    print(f"[FAIL] PyMuPDF import failed: {e}")

try:
    from docx import Document

    print("[OK] python-docx imported")
except ImportError as e:
    print(f"[FAIL] python-docx import failed: {e}")

try:
    from docx2pdf import convert

    print("[OK] docx2pdf imported")
except ImportError as e:
    print(f"[FAIL] docx2pdf import failed: {e}")

print("\n--- Testing PDF annotation ---")

# Create a simple test PDF
try:
    doc = fitz.open()
    page = doc.new_page()

    # Add some text
    page.insert_text((72, 100), "John Doe - Software Developer", fontsize=16)
    page.insert_text((72, 130), "Skills: Word, Excel, PowerPoint", fontsize=12)
    page.insert_text(
        (72, 150), "Experience: 2 years working with computers", fontsize=12
    )
    page.insert_text((72, 170), "Education: Bachelor Degree", fontsize=12)

    # Save to bytes
    test_pdf = doc.tobytes()
    doc.close()
    print(f"[OK] Created test PDF ({len(test_pdf)} bytes)")

    # Test annotation
    doc = fitz.open(stream=test_pdf, filetype="pdf")
    page = doc[0]

    # Search and highlight
    test_annotations = [
        {
            "text": "Word, Excel, PowerPoint",
            "reason": "Too generic skills",
            "severity": "warning",
        },
        {
            "text": "2 years working with computers",
            "reason": "Vague description",
            "severity": "critical",
        },
    ]

    colors = {
        "critical": (1, 0.2, 0.2),
        "warning": (1, 0.8, 0),
        "info": (0.2, 0.6, 1),
    }

    highlighted_count = 0
    for ann in test_annotations:
        text = ann["text"]
        quads = page.search_for(text, quads=True)
        if quads:
            for quad in quads:
                highlight = page.add_highlight_annot(quad)
                highlight.set_colors(stroke=colors.get(ann["severity"], colors["info"]))
                highlight.set_info(content=ann["reason"])
                highlight.update()
                highlighted_count += 1
            print(f"[OK] Found and highlighted: '{text[:30]}...'")
        else:
            print(f"[FAIL] Text not found: '{text[:30]}...'")

    # Save annotated PDF
    output_path = os.path.join(os.path.dirname(__file__), "test_annotated.pdf")
    doc.save(output_path)
    doc.close()

    print(f"\n[OK] Annotated PDF saved to: {output_path}")
    print(f"  Total highlights: {highlighted_count}")
    print("\nPlease open the PDF to verify highlights are visible!")

except Exception as e:
    print(f"[FAIL] Error: {e}")
    import traceback

    traceback.print_exc()
