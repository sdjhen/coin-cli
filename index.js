#!/usr/bin/env node

import { fetchTopCoins } from "./api.js";
import { formatChange, formatPrice } from "./format.js";
import { renderTable } from "./table.js";

const COLUMNS = [
  { header: "#", align: "right", value: (coin, i) => String(i + 1) },
  { header: "Name", align: "left", value: (coin) => coin.name },
  { header: "Symbol", align: "left", value: (coin) => coin.symbol.toUpperCase() },
  { header: "Price", align: "right", value: (coin) => formatPrice(coin.current_price) },
  { header: "24h %", align: "right", value: (coin) => formatChange(coin.price_change_percentage_24h) },
];

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
