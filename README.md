# coin-cli

Show the top cryptocurrencies by market cap in a terminal table.

## Description

`coin-cli` is a small Node.js command-line tool that fetches live market data from the
[CoinGecko API](https://www.coingecko.com/en/api) and prints it as a box-drawn table.

- **Top-N listing** — show any number of coins from 1 to 250, ranked by market cap.
- **Single-coin lookup** — pass a name or ticker to look up one coin from the top 10.
- **Readable prices** — sub-dollar coins get six decimals, everything else gets two.
- **Colored 24h change** — green for gains, red for losses, gray for flat.
  Color is disabled automatically when output is piped or when `NO_COLOR` is set.

No API key and no dependencies — it uses the built-in `fetch`, so Node 18 or newer is required.

## Installation

Clone the repository and link it so the `coin-cli` command is on your `PATH`:

```bash
git clone <repository-url>
cd coin-cli
npm link
```

To run it without installing anything globally, use `node` directly from the project folder:

```bash
node index.js
```

or via the npm script:

```bash
npm start
```

## Usage

```
coin-cli [count | name | symbol]
```

The single optional argument is either a **count** (a number from 1 to 250) or a
**coin name / ticker**. With no argument, the top 5 coins are shown.

### Show the top coins

```bash
coin-cli
```

```
Top 5 Cryptocurrencies by Market Cap

┌───┬──────────┬────────┬────────────┬─────────┐
│ # │ Name     │ Symbol │      Price │   24h % │
├───┼──────────┼────────┼────────────┼─────────┤
│ 1 │ Bitcoin  │ BTC    │ $64,383.00 │ ▲ 0.40% │
│ 2 │ Ethereum │ ETH    │  $1,875.31 │ ▲ 0.60% │
│ 3 │ Tether   │ USDT   │  $0.999247 │ • 0.00% │
│ 4 │ BNB      │ BNB    │    $568.28 │ ▲ 1.20% │
│ 5 │ USDC     │ USDC   │  $0.999778 │ • 0.00% │
└───┴──────────┴────────┴────────────┴─────────┘

Source: CoinGecko · 25/07/2026, 20:15:10
```

### Choose how many coins to show

```bash
coin-cli 3
```

```
Top 3 Cryptocurrencies by Market Cap

┌───┬──────────┬────────┬────────────┬─────────┐
│ # │ Name     │ Symbol │      Price │   24h % │
├───┼──────────┼────────┼────────────┼─────────┤
│ 1 │ Bitcoin  │ BTC    │ $64,383.00 │ ▲ 0.40% │
│ 2 │ Ethereum │ ETH    │  $1,875.31 │ ▲ 0.60% │
│ 3 │ Tether   │ USDT   │  $0.999247 │ • 0.00% │
└───┴──────────┴────────┴────────────┴─────────┘

Source: CoinGecko · 25/07/2026, 20:15:12
```

### Look up a single coin

Pass a ticker or a full name — matching is case-insensitive, so `eth`, `ETH` and
`Ethereum` are equivalent. The `#` column shows the coin's real market-cap rank.

```bash
coin-cli eth
```

```
Ethereum (ETH) · #2 by Market Cap

┌───┬──────────┬────────┬───────────┬─────────┐
│ # │ Name     │ Symbol │     Price │   24h % │
├───┼──────────┼────────┼───────────┼─────────┤
│ 2 │ Ethereum │ ETH    │ $1,875.11 │ ▲ 0.60% │
└───┴──────────┴────────┴───────────┴─────────┘

Source: CoinGecko · 25/07/2026, 20:15:10
```

Lookups only search the top 10 by market cap. Anything outside it is an error that
lists the coins you can pick from:

```bash
coin-cli doge
```

```
Error: "doge" is not in the top 10 by market cap. Try: Bitcoin (BTC), Ethereum (ETH),
Tether (USDT), BNB (BNB), USDC (USDC), XRP (XRP), Solana (SOL), TRON (TRX),
Figure Heloc (FIGR_HELOC), WhiteBIT Coin (WBT)
```

### Plain output for pipes and files

Colors are dropped automatically when output is not a terminal, so redirected output
stays clean. Set `NO_COLOR` to turn them off in the terminal too.

```bash
coin-cli 10 > top-ten.txt
NO_COLOR=1 coin-cli
```

## Project layout

| File | Purpose |
| --- | --- |
| [index.js](index.js) | Entry point: argument parsing, coin lookup, output |
| [api.js](api.js) | CoinGecko request |
| [format.js](format.js) | Price and 24h-change formatting, ANSI color |
| [table.js](table.js) | Box-drawing table renderer |

## License

MIT
