import io
from datetime import datetime, timezone

from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

_STYLES = getSampleStyleSheet()
_HEADER_BG = colors.HexColor("#1f2937")
_ROW_ALT_BG = colors.HexColor("#f3f4f6")
_GRID_COLOR = colors.HexColor("#d1d5db")


def _document(buffer: io.BytesIO, landscape_mode: bool = False) -> SimpleDocTemplate:
    return SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4) if landscape_mode else A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )


def _header(title: str) -> list:
    generated_at = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC")
    return [
        Paragraph(title, _STYLES["Title"]),
        Paragraph(f"Généré le {generated_at}", _STYLES["Normal"]),
        Spacer(1, 0.5 * cm),
    ]


def _table_style() -> TableStyle:
    return TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), _HEADER_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, _GRID_COLOR),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, _ROW_ALT_BG]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
    )


def key_value_to_pdf(title: str, rows: list[tuple[str, str]]) -> bytes:
    buffer = io.BytesIO()
    doc = _document(buffer)
    table_data = [["Indicateur", "Valeur"]] + [[key, value] for key, value in rows]
    table = Table(table_data, colWidths=[9 * cm, 6 * cm], repeatRows=1)
    table.setStyle(_table_style())
    doc.build(_header(title) + [table])
    return buffer.getvalue()


def rows_to_pdf(rows: list[BaseModel], model_cls: type[BaseModel], title: str) -> bytes:
    buffer = io.BytesIO()
    doc = _document(buffer, landscape_mode=True)
    fieldnames = list(model_cls.model_fields.keys())
    elements = _header(title)
    if not rows:
        elements.append(Paragraph("Aucune donnée pour cette période.", _STYLES["Normal"]))
    else:
        table_data = [fieldnames]
        for row in rows:
            dumped = row.model_dump()
            table_data.append([("" if dumped[name] is None else str(dumped[name])) for name in fieldnames])
        usable_width = landscape(A4)[0] - 3 * cm
        col_width = usable_width / len(fieldnames)
        table = Table(table_data, colWidths=[col_width] * len(fieldnames), repeatRows=1)
        table.setStyle(_table_style())
        elements.append(table)
    doc.build(elements)
    return buffer.getvalue()
