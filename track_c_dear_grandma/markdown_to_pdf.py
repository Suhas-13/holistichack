#!/usr/bin/env python3
"""
Convert Markdown Assessment Reports to PDF
Using markdown2 + weasyprint for fast, simple PDF generation
"""

import os
import sys
from pathlib import Path

# Try to import required libraries
try:
    import markdown
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
except ImportError:
    print("Installing required dependencies...")
    os.system(f"{sys.executable} -m pip install -q markdown weasyprint")
    import markdown
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration

# CSS styling for professional PDF output
PDF_STYLE = """
@page {
    size: letter;
    margin: 1in;
}

body {
    font-family: 'DejaVu Sans', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
}

h1 {
    color: #2c3e50;
    border-bottom: 3px solid #3498db;
    padding-bottom: 10px;
    font-size: 24pt;
    margin-top: 20px;
}

h2 {
    color: #34495e;
    border-bottom: 2px solid #95a5a6;
    padding-bottom: 8px;
    font-size: 18pt;
    margin-top: 15px;
}

h3 {
    color: #7f8c8d;
    font-size: 14pt;
    margin-top: 12px;
}

code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'DejaVu Sans Mono', 'Courier New', monospace;
    font-size: 9pt;
}

pre {
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    overflow-x: auto;
    font-size: 9pt;
}

pre code {
    background-color: transparent;
    padding: 0;
}

blockquote {
    border-left: 4px solid #3498db;
    padding-left: 15px;
    margin-left: 0;
    color: #555;
    font-style: italic;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 15px 0;
}

table th {
    background-color: #3498db;
    color: white;
    padding: 8px;
    text-align: left;
}

table td {
    border: 1px solid #ddd;
    padding: 8px;
}

table tr:nth-child(even) {
    background-color: #f9f9f9;
}

ul, ol {
    margin-left: 20px;
}

strong {
    color: #2c3e50;
}

a {
    color: #3498db;
    text-decoration: none;
}

.page-break {
    page-break-after: always;
}
"""

def convert_markdown_to_pdf(md_file: Path, output_dir: Path):
    """Convert a single markdown file to PDF"""
    try:
        # Read markdown content
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()

        # Convert markdown to HTML
        html_content = markdown.markdown(
            md_content,
            extensions=[
                'extra',
                'codehilite',
                'tables',
                'fenced_code',
                'toc'
            ]
        )

        # Wrap in HTML document
        full_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{md_file.stem}</title>
</head>
<body>
    {html_content}
</body>
</html>
        """

        # Output PDF path
        pdf_file = output_dir / f"{md_file.stem}.pdf"

        # Generate PDF
        font_config = FontConfiguration()
        HTML(string=full_html).write_pdf(
            pdf_file,
            stylesheets=[CSS(string=PDF_STYLE, font_config=font_config)]
        )

        # Get file size
        size_mb = pdf_file.stat().st_size / (1024 * 1024)

        print(f"✅ {md_file.name} -> {pdf_file.name} ({size_mb:.2f} MB)")
        return True

    except Exception as e:
        print(f"❌ Failed to convert {md_file.name}: {e}")
        return False


def main():
    """Main conversion function"""
    base_dir = Path("/home/user/holistichack/track_c_dear_grandma")
    output_dir = base_dir / "pdfs"
    output_dir.mkdir(exist_ok=True)

    # Reports to convert
    reports = [
        "FINAL_COMPREHENSIVE_ASSESSMENT.md",
        "ULTIMATE_FINAL_REPORT.md",
        "FINAL_RED_TEAM_REPORT.md",
        "COMPLETE_EXTRACTION_REPORT.md",
        "VULNERABILITY_REPORT.md",
        "SUCCESSFUL_JAILBREAKS.md",
        "EXTRACTED_AGENT_DETAILS.md",
        "ASSAULT_STATUS.md",
    ]

    print("📄 Converting Assessment Reports to PDF\n")
    print("=" * 60)

    converted = 0
    failed = 0

    for report_name in reports:
        report_path = base_dir / report_name
        if report_path.exists():
            if convert_markdown_to_pdf(report_path, output_dir):
                converted += 1
            else:
                failed += 1
        else:
            print(f"⚠️  {report_name} not found, skipping")

    print("=" * 60)
    print(f"\n✅ Conversion complete!")
    print(f"   Converted: {converted}")
    print(f"   Failed: {failed}")
    print(f"   Output directory: {output_dir}")

    # Show total size
    total_size = sum(f.stat().st_size for f in output_dir.glob("*.pdf"))
    print(f"   Total size: {total_size / (1024 * 1024):.2f} MB")


if __name__ == "__main__":
    main()
