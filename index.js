#!/usr/bin/env node

const API_URL = "https://api.coingecko.com/api/v3/coins/markets";

const PARAMS = {
  vs_currency: "usd",
  order: "market_cap_desc",
  per_page: "5",
  page: "1",
  sparkline: "false",
};

// Disabled for pipes/redirects and when NO_COLOR is set, so output stays clean.
const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR;

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  positive: "\x1b[32m", // green
  negative: "\x1b[31m", // red
  neutral: "\x1b[90m", // gray
};

function colorize(text, color) {
  return USE_COLOR ? `${COLORS[color]}${text}${COLORS.reset}` : text;
}

const COLUMNS = [
  { header: "#", align: "right", value: (coin, i) => String(i + 1) },
  { header: "Name", align: "left", value: (coin) => coin.name },
  { header: "Symbol", align: "left", value: (coin) => coin.symbol.toUpperCase() },
  { header: "Price", align: "right", value: (coin) => formatPrice(coin.current_price) },
  { header: "24h %", align: "right", value: (coin) => formatChange(coin.price_change_percentage_24h) },
];

async function fetchTopCoins() {
  const url = `${API_URL}?${new URLSearchParams(PARAMS)}`;
  const response = await fetch(url, { headers: { accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`CoinGecko responded with ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function formatPrice(price) {
  if (typeof price !== "number") return "n/a";

  // Sub-dollar coins need more precision than the usual two decimals.
  const decimals = price < 1 ? 6 : 2;
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function formatChange(change) {
  if (typeof change !== "number") return colorize("n/a", "neutral");

  // Classify on the rounded value so the color always matches what is printed:
  // a change of 0.0001% displays as 0.00% and reads as flat, not a gain.
  const rounded = Number(change.toFixed(2));
  const { arrow, color } =
    rounded > 0
      ? { arrow: "▲", color: "positive" }
      : rounded < 0
        ? { arrow: "▼", color: "negative" }
        : { arrow: "•", color: "neutral" };

  return colorize(`${arrow} ${Math.abs(rounded).toFixed(2)}%`, color);
}

// Color codes take up no screen space, so they must not count toward column width.
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;
const visibleLength = (text) => text.replace(ANSI_PATTERN, "").length;

function renderTable(rows, columns) {
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

async function main() {
  const coins = await fetchTopCoins();
  const rows = coins.map((coin, i) => COLUMNS.map((column) => column.value(coin, i)));

  console.log("\nTop 5 Cryptocurrencies by Market Cap\n");
  console.log(renderTable(rows, COLUMNS));
  console.log(`\nSource: CoinGecko · ${new Date().toLocaleString()}\n`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
