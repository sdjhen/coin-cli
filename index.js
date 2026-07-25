#!/usr/bin/env node

import { fetchTopCoins } from "./api.js";
import { formatChange, formatPrice } from "./format.js";
import { renderTable } from "./table.js";

const DEFAULT_COUNT = 5;
const MAX_COUNT = 250; // CoinGecko caps per_page at 250.
const LOOKUP_POOL = 10; // A name/ticker lookup searches the top 10 by market cap.

const COLUMNS = [
  { header: "#", align: "right", value: (coin, rank) => String(rank) },
  { header: "Name", align: "left", value: (coin) => coin.name },
  { header: "Symbol", align: "left", value: (coin) => coin.symbol.toUpperCase() },
  { header: "Price", align: "right", value: (coin) => formatPrice(coin.current_price) },
  { header: "24h %", align: "right", value: (coin) => formatChange(coin.price_change_percentage_24h) },
];

// The argument is either a count ("10") or a coin name/ticker ("Ethereum", "ETH").
function parseArgument(argument) {
  if (argument === undefined) return { count: DEFAULT_COUNT };

  if (/^\d+$/.test(argument)) {
    const count = Number(argument);
    if (count < 1 || count > MAX_COUNT) {
      throw new Error(`Number of coins must be between 1 and ${MAX_COUNT}, got ${count}`);
    }
    return { count };
  }

  return { query: argument };
}

// Matching is exact on either the full name or the ticker, so "ETH" can never
// quietly resolve to some other coin that merely contains those letters.
function findCoin(coins, query) {
  const wanted = query.trim().toLowerCase();
  const match = coins.find(
    (coin) => coin.name.toLowerCase() === wanted || coin.symbol.toLowerCase() === wanted
  );

  if (!match) {
    const known = coins.map((coin) => `${coin.name} (${coin.symbol.toUpperCase()})`).join(", ");
    throw new Error(`"${query}" is not in the top ${LOOKUP_POOL} by market cap. Try: ${known}`);
  }

  return match;
}

async function main() {
  const { count, query } = parseArgument(process.argv[2]);
  const coins = await fetchTopCoins(query ? LOOKUP_POOL : count);

  // Rank comes from the market-cap ordering rather than the row position, so a
  // single looked-up coin still shows where it actually sits in the table.
  const ranks = new Map(coins.map((coin, i) => [coin, i + 1]));
  const selected = query ? [findCoin(coins, query)] : coins;
  const rows = selected.map((coin) => COLUMNS.map((column) => column.value(coin, ranks.get(coin))));

  const heading = query
    ? `${selected[0].name} (${selected[0].symbol.toUpperCase()}) · #${ranks.get(selected[0])} by Market Cap`
    : `Top ${selected.length} Cryptocurrencies by Market Cap`;

  console.log(`\n${heading}\n`);
  console.log(renderTable(rows, COLUMNS));
  console.log(`\nSource: CoinGecko · ${new Date().toLocaleString()}\n`);
}

// Set the code rather than calling process.exit, which can tear the process down
// while the HTTP socket is still open and trip a libuv assertion on Windows.
main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
