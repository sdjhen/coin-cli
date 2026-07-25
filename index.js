#!/usr/bin/env node

import { fetchTopCoins } from "./api.js";
import { formatChange, formatPrice } from "./format.js";
import { renderTable } from "./table.js";

const DEFAULT_COUNT = 5;
const MAX_COUNT = 250; // CoinGecko caps per_page at 250.

const COLUMNS = [
  { header: "#", align: "right", value: (coin, i) => String(i + 1) },
  { header: "Name", align: "left", value: (coin) => coin.name },
  { header: "Symbol", align: "left", value: (coin) => coin.symbol.toUpperCase() },
  { header: "Price", align: "right", value: (coin) => formatPrice(coin.current_price) },
  { header: "24h %", align: "right", value: (coin) => formatChange(coin.price_change_percentage_24h) },
];

// Accepts a plain positive integer; anything else is a usage error rather than a
// silent fallback to the default, so typos do not look like a working run.
function parseCount(argument) {
  if (argument === undefined) return DEFAULT_COUNT;

  if (!/^\d+$/.test(argument)) {
    throw new Error(`Expected a whole number of coins, got "${argument}"`);
  }

  const count = Number(argument);
  if (count < 1 || count > MAX_COUNT) {
    throw new Error(`Number of coins must be between 1 and ${MAX_COUNT}, got ${count}`);
  }

  return count;
}

async function main() {
  const count = parseCount(process.argv[2]);
  const coins = await fetchTopCoins(count);
  const rows = coins.map((coin, i) => COLUMNS.map((column) => column.value(coin, i)));

  console.log(`\nTop ${coins.length} Cryptocurrencies by Market Cap\n`);
  console.log(renderTable(rows, COLUMNS));
  console.log(`\nSource: CoinGecko · ${new Date().toLocaleString()}\n`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
