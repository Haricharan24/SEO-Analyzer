from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.platypus import TableStyle
import io

METRIC_LABELS = {
    "score": "Overall Score",
    "title_present": "Title Present",
    "title_length": "Title Length",
    "meta_present": "Meta Description Present",
    "meta_length": "Meta Description Length",
    "word_count": "Word Count",
    "h1_present": "H1 Present",
    "hierarchy_ok": "Heading Hierarchy OK",
    "keyword_density": "Keyword Density (%)",
    "keyword_in_title": "Keyword in Title",
    "keyword_in_headings": "Keyword in Headings",
    "keyword_in_first_paragraph": "Keyword in First Paragraph",
    "internal_links": "Internal Links",
    "external_links": "External Links",
    "images_without_alt": "Images Without ALT",
    "readability_score": "Readability Score (Flesch)",
}


def generate_pdf_bytes(title, report_data):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    elements.append(Paragraph(title, styles["Heading1"]))
    elements.append(Spacer(1, 12))

    # Compare Mode
    if "URL 1" in report_data:
        report1 = report_data["URL 1"]
        report2 = report_data["URL 2"]

        data = [["Metric", "URL 1", "URL 2"]]

        for key in report1.keys():
            label = METRIC_LABELS.get(key, key)
            data.append([
                label,
                str(report1.get(key, "N/A")),
                str(report2.get(key, "N/A"))
            ])

        table = Table(data, colWidths=[220, 140, 140])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2563eb")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        elements.append(table)

    # Single Mode
    else:
        data = [["Metric", "Result"]]
        for key, value in report_data.items():
            label = METRIC_LABELS.get(key, key)
            data.append([label, str(value)])

        table = Table(data, colWidths=[280, 220])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2563eb")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        elements.append(table)

    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf