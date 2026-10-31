/** Minimal RFC 4180 CSV parser: handles quoted fields, escaped quotes and newlines inside quotes. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Turns CSV rows into objects keyed by normalised heading ("In Stock" → "in_stock"). */
export function rowsToRecords(rows: string[][]): Record<string, string>[] {
  const [head = [], ...body] = rows;
  const keys = head.map((h) =>
    h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
  );
  return body
    .filter((r) => r.some((cell) => cell.trim()))
    .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}
