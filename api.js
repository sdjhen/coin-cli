const API_URL = "https://api.coingecko.com/api/v3/coins/markets";

const PARAMS = {
  vs_currency: "usd",
  order: "market_cap_desc",
  per_page: "5",
  page: "1",
  sparkline: "false",
};

export async function fetchTopCoins() {
  const url = `${API_URL}?${new URLSearchParams(PARAMS)}`;
  const response = await fetch(url, { headers: { accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`CoinGecko responded with ${response.status} ${response.statusText}`);
  }

  return response.json();
}
