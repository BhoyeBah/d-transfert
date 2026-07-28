import io
from datetime import datetime, timezone
from xml.sax.saxutils import escape

from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

_STYLES = getSampleStyleSheet()
_HEADER_BG = colors.HexColor("#1f2937")
_ROW_ALT_BG = colors.HexColor("#f3f4f6")
_GRID_COLOR = colors.HexColor("#d1d5db")

_HEADER_CELL_STYLE = ParagraphStyle(
    "reportHeaderCell", parent=_STYLES["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=9.5, textColor=colors.white
)
_BODY_CELL_STYLE = ParagraphStyle("reportBodyCell", parent=_STYLES["Normal"], fontSize=7, leading=8.5)

# Identifiants techniques (clé primaire, clés étrangères) : aucune valeur pour un rapport
# imprimé/exporté par un utilisateur métier — on affiche déjà le nom/type associé à côté
# (supplier_name, client_name, source_type, entity_type...), donc on les exclut du PDF.
# Le CSV les garde : utile pour un rapprochement en base par un tiers technique.
def _is_technical_id_field(name: str) -> bool:
    return name == "id" or name.endswith("_id")


_FIELD_LABELS: dict[str, str] = {
    "kind": "Type",
    "reference": "Référence",
    "type_or_mode": "Type / mode",
    "type": "Type",
    "amount": "Montant",
    "currency": "Devise",
    "status": "Statut",
    "created_at": "Date",
    "direction": "Sens",
    "balance_before": "Solde avant",
    "balance_after": "Solde après",
    "source_type": "Source",
    "note": "Note",
    "action": "Action",
    "entity_type": "Entité",
    "supplier_name": "Fournisseur",
    "client_name": "Client",
    "delta": "Variation",
    "reason": "Motif",
    "collaborator_company_name": "Collaborateur",
    "collaborator_company_matricule": "Matricule",
    "balance": "Solde",
}

# Poids relatif de largeur de colonne : les champs à contenu généralement long (notes,
# dates, noms, motifs) reçoivent plus de place que les champs courts (devise, sens, statut).
_COLUMN_WIDTH_WEIGHTS: dict[str, float] = {
    "note": 2.0,
    "reason": 1.6,
    "reference": 1.4,
    "created_at": 1.3,
    "collaborator_company_name": 1.4,
    "supplier_name": 1.3,
    "client_name": 1.3,
}


def _label_for(field: str) -> str:
    return _FIELD_LABELS.get(field, field.replace("_", " ").capitalize())


def _format_cell(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.strftime("%d/%m/%Y %H:%M")
    return escape(str(value))


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
    fieldnames = [name for name in model_cls.model_fields if not _is_technical_id_field(name)]
    elements = _header(title)
    if not rows:
        elements.append(Paragraph("Aucune donnée pour cette période.", _STYLES["Normal"]))
    else:
        table_data = [[Paragraph(_label_for(name), _HEADER_CELL_STYLE) for name in fieldnames]]
        for row in rows:
            dumped = row.model_dump()
            table_data.append(
                [Paragraph(_format_cell(dumped[name]), _BODY_CELL_STYLE) for name in fieldnames]
            )
        usable_width = landscape(A4)[0] - 3 * cm
        weights = [_COLUMN_WIDTH_WEIGHTS.get(name, 1.0) for name in fieldnames]
        total_weight = sum(weights)
        col_widths = [usable_width * weight / total_weight for weight in weights]
        table = Table(table_data, colWidths=col_widths, repeatRows=1)
        table.setStyle(_table_style())
        elements.append(table)
    doc.build(elements)
    return buffer.getvalue()
