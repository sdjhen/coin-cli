const API_URL = "https://api.coingecko.com/api/v3/coins/markets";

const PARAMS = {
  vs_currency: "usd",
  order: "market_cap_desc",
  page: "1",
  sparkline: "false",
};

export async function fetchTopCoins(count) {
  const url = `${API_URL}?${new URLSearchParams({ ...PARAMS, per_page: String(count) })}`;
  const response = await fetch(url, { headers: { accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`CoinGecko responded with ${response.status} ${response.statusText}`);
  }

  return response.json();
}
