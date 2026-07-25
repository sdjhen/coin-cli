// Disabled for pipes/redirects and when NO_COLOR is set, so output stays clean.
const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR;

const COLORS = {
  reset: "\x1b[0m",
  positive: "\x1b[32m", // green
  negative: "\x1b[31m", // red
  neutral: "\x1b[90m", // gray
};

function colorize(text, color) {
  return USE_COLOR ? `${COLORS[color]}${text}${COLORS.reset}` : text;
}

export function formatPrice(price) {
  if (typeof price !== "number") return "n/a";

  // Sub-dollar coins need more precision than the usual two decimals.
  const decimals = price < 1 ? 6 : 2;
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatChange(change) {
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
