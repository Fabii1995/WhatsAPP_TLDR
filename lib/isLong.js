// A message is "long" if it has enough non-empty lines OR enough non-whitespace characters.
const DEFAULT_THRESHOLDS = { minLines: 12, minChars: 150 };

function isLong(text, thresholds) {
  const { minLines, minChars } = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "").length;
  const chars = text.replace(/\s/g, "").length;
  return lines >= minLines || chars >= minChars;
}

if (typeof module !== "undefined") module.exports = { isLong, DEFAULT_THRESHOLDS };
