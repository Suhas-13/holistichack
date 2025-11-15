#!/bin/bash

# Convert Markdown Assessment Reports to PDFs
# This script converts all the key assessment reports to PDF format

set -e

echo "📄 Converting Assessment Reports to PDF..."
echo ""

# Check if pandoc is available
if ! command -v pandoc &> /dev/null; then
    echo "⚠️  pandoc is not installed. Installing..."
    apt-get update -qq && apt-get install -y -qq pandoc texlive-latex-base texlive-latex-recommended texlive-latex-extra > /dev/null 2>&1
fi

cd /home/user/holistichack/track_c_dear_grandma

# Create PDFs directory
mkdir -p pdfs

# List of markdown files to convert
REPORTS=(
    "FINAL_COMPREHENSIVE_ASSESSMENT.md"
    "ULTIMATE_FINAL_REPORT.md"
    "FINAL_RED_TEAM_REPORT.md"
    "COMPLETE_EXTRACTION_REPORT.md"
    "VULNERABILITY_REPORT.md"
    "SUCCESSFUL_JAILBREAKS.md"
    "EXTRACTED_AGENT_DETAILS.md"
    "ASSAULT_STATUS.md"
)

# Convert each markdown to PDF
for report in "${REPORTS[@]}"; do
    if [ -f "$report" ]; then
        output="pdfs/${report%.md}.pdf"
        echo "Converting: $report -> $output"

        pandoc "$report" \
            -o "$output" \
            --pdf-engine=pdflatex \
            -V geometry:margin=1in \
            -V fontsize=11pt \
            -V documentclass=article \
            --highlight-style=tango \
            2>/dev/null || echo "  ⚠️  Warning: Could not convert $report"
    fi
done

echo ""
echo "✅ PDF conversion complete!"
echo ""
echo "Generated PDFs:"
ls -lh pdfs/*.pdf 2>/dev/null || echo "No PDFs were generated"
echo ""
echo "Total size:"
du -sh pdfs/ 2>/dev/null || echo "0"
