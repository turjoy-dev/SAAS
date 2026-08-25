import os
import sys

# 1. Set environment for CI test
os.environ["ENVIRONMENT"] = "development"

# 2. Add backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Backend", "sop-backend-python"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.utils.exporter import generate_pdf, generate_docx

def test_pdf():
    print("Testing generate_pdf...")
    sample_text = "This is a sample document for testing PDF export engine."
    pdf_bytes = generate_pdf(sample_text, title="Test PDF Document", doc_type="sop", family="A")
    
    assert pdf_bytes is not None, "PDF byte stream is None"
    assert len(pdf_bytes) > 0, "PDF byte stream is empty"
    print(f"Generated PDF stream size: {len(pdf_bytes)} bytes")
    print("✅ PDF_EXPORT_OK")

def test_docx():
    print("Testing generate_docx...")
    sample_text = "This is a sample document for testing docx export engine."
    docx_bytes = generate_docx(sample_text, title="Test Word Document", doc_type="sop", family="A")
    
    assert docx_bytes is not None, "DOCX byte stream is None"
    assert len(docx_bytes) > 0, "DOCX byte stream is empty"
    
    signature = docx_bytes[:2]
    print(f"DOCX Signature: {signature}")
    assert signature == b"PK", f"Invalid docx signature: {signature}"
    print("✅ DOCX_EXPORT_OK")

if __name__ == "__main__":
    try:
        test_pdf()
        test_docx()
        print("\n🎉 All export verification tests passed successfully!")
    except Exception as e:
        print(f"❌ ERROR: Export test failed: {e}", file=sys.stderr)
        sys.exit(1)
