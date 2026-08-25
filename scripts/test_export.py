import os
import sys

# 1. Enforce production mode BEFORE importing app.config
os.environ["ENVIRONMENT"] = "production"

# 2. Add backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Backend", "sop-backend-python"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.utils.exporter import generate_pdf, generate_docx

def test_pdf():
    print("Testing generate_pdf...")
    sample_text = "This is a sample document for testing WeasyPrint PDF export."
    pdf_bytes = generate_pdf(sample_text, title="Test PDF", doc_type="sop", family="A")
    
    assert pdf_bytes is not None, "PDF bytes are None"
    assert len(pdf_bytes) > 0, "PDF bytes are empty"
    
    signature = pdf_bytes[:5]
    print(f"PDF Signature: {signature}")
    assert signature == b"%PDF-", f"Invalid PDF signature: {signature}. Got: {signature}"
    print("✅ PDF_EXPORT_OK")

def test_docx():
    print("Testing generate_docx...")
    sample_text = "This is a sample document for testing docx export."
    docx_bytes = generate_docx(sample_text, title="Test Word", doc_type="sop", family="A")
    
    assert docx_bytes is not None, "docx bytes are None"
    assert len(docx_bytes) > 0, "docx bytes are empty"
    
    signature = docx_bytes[:2]
    print(f"docx Signature: {signature}")
    assert signature == b"PK", f"Invalid docx signature: {signature}"
    print("✅ DOCX_EXPORT_OK")

if __name__ == "__main__":
    try:
        test_pdf()
        test_docx()
        print("\n🎉 All export tests passed successfully.")
    except Exception as e:
        print(f"❌ ERROR: Export test failed: {e}", file=sys.stderr)
        sys.exit(1)
