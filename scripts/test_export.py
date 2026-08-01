import os
import sys

# Add backend directory to path so we can import app and other modules
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Backend", "sop-backend-python"))

# Enforce production mode so WeasyPrint does not silently degrade to HTML text
os.environ["ENVIRONMENT"] = "production"

from app.utils.exporter import generate_pdf, generate_docx

def test_pdf():
    print("Testing generate_pdf...")
    sample_text = "This is a sample document for testing WeasyPrint PDF export."
    pdf_bytes = generate_pdf(sample_text, title="Test PDF", doc_type="sop", family="A")
    
    assert pdf_bytes is not None, "PDF bytes are None"
    assert len(pdf_bytes) > 0, "PDF bytes are empty"
    
    # Assert PDF file signature (%PDF-)
    signature = pdf_bytes[:5]
    print(f"PDF Signature: {signature}")
    assert signature == b"%PDF-", f"Invalid PDF signature: {signature}"
    print("PDF_EXPORT_OK")

def test_docx():
    print("Testing generate_docx...")
    sample_text = "This is a sample document for testing docx export."
    docx_bytes = generate_docx(sample_text, title="Test Word", doc_type="sop", family="A")
    
    assert docx_bytes is not None, "docx bytes are None"
    assert len(docx_bytes) > 0, "docx bytes are empty"
    
    # Assert zip/docx file signature (PK..)
    signature = docx_bytes[:2]
    print(f"docx Signature: {signature}")
    assert signature == b"PK", f"Invalid docx signature: {signature}"
    print("DOCX_EXPORT_OK")

if __name__ == "__main__":
    try:
        test_pdf()
        test_docx()
        print("\nAll export tests passed successfully.")
    except Exception as e:
        print(f"ERROR: Export test failed: {e}", file=sys.stderr)
        sys.exit(1)
