"""
app/services/csv_export.py
----------------------------
Shared CSV export helper. Not COBOL-related — this is pure Python
formatting of already-computed data (JSON dict rows -> downloadable CSV).
"""

import csv
import io
from typing import List, Dict
from fastapi.responses import StreamingResponse


def rows_to_csv_response(rows: List[Dict], fieldnames: List[str], filename: str) -> StreamingResponse:
    """
    rows       : list of dicts (e.g. the "data" list already returned by a report)
    fieldnames : column order/headers for the CSV — extra dict keys not in
                 this list are ignored (extrasaction="ignore")
    filename   : suggested download filename (sent via Content-Disposition)
    """
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )