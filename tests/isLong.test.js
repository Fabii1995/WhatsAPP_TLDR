const assert = require("assert");
const { isLong } = require("../lib/isLong");

const lines = (n) => Array.from({ length: n }, (_, i) => "a" + i).join("\n");

assert.strictEqual(isLong(lines(11)), false, "11 lines is short");
assert.strictEqual(isLong(lines(12)), true, "12 lines is long");
assert.strictEqual(isLong(lines(11) + "\n\n\n\n"), false, "blank lines ignored");
assert.strictEqual(isLong(lines(6).split("\n").join("\n\n")), false, "6 lines + blanks is short");
assert.strictEqual(isLong("x".repeat(149)), false, "149 chars is short");
assert.strictEqual(isLong("x".repeat(150)), true, "150 chars is long");
assert.strictEqual(isLong("x ".repeat(149)), false, "spaces not counted");
assert.strictEqual(isLong("x ".repeat(150)), true, "150 non-space chars with spaces");
assert.strictEqual(isLong(""), false, "empty");
assert.strictEqual(isLong("x".repeat(40), { minChars: 30 }), true, "custom threshold");

console.log("isLong: all tests passed");
