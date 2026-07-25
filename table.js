// Color codes take up no screen space, so they must not count toward column width.
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;
const visibleLength = (text) => text.replace(ANSI_PATTERN, "").length;

/**
 * Renders a box-drawn table.
 *
 * @param rows Cell text, already formatted; may contain ANSI color codes.
 * @param columns Column definitions, each with a `header` and an `align`
 *   of "left" or "right". Must line up with the cells in each row.
 */
export function renderTable(rows, columns) {
  const headers = columns.map((column) => column.header);
  const widths = columns.map((column, i) =>
    Math.max(visibleLength(headers[i]), ...rows.map((row) => visibleLength(row[i])))
  );

  const pad = (text, width, align) => {
    const padding = " ".repeat(Math.max(0, width - visibleLength(text)));
    return align === "right" ? padding + text : text + padding;
  };

  const line = (left, fill, middle, right) =>
    left + widths.map((width) => fill.repeat(width + 2)).join(middle) + right;

  const row = (cells) =>
    "│ " + cells.map((cell, i) => pad(cell, widths[i], columns[i].align)).join(" │ ") + " │";

  return [
    line("┌", "─", "┬", "┐"),
    row(headers),
    line("├", "─", "┼", "┤"),
    ...rows.map(row),
    line("└", "─", "┴", "┘"),
  ].join("\n");
}
