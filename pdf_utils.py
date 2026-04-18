from __future__ import annotations

import fitz


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract plain text from a PDF file represented as bytes."""
    with fitz.open(stream=pdf_bytes, filetype="pdf") as document:
        return "".join(page.get_text() for page in document)
