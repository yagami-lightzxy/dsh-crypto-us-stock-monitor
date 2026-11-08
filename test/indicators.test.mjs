// Unit tests for lib/indicators.js (0.6.0).
// Plain node asserts, no dependencies, no network.
// Run: node test/indicators.test.mjs
import assert from "node:assert/strict";

const MODULE_URL = new URL("../lib/indicators.js", import.meta.url).href;
const { TA_DEFAULTS, TA_LIMITS, normalizeTaConfig, configSignature, computeIndicators, evaluateStrategy } = await import(MODULE_URL);

let passed = 0;
const failures = [];
function check(name, fn) {
	try {
		fn();
		passed += 1;
	} catch (error) {
		failures.push(`${name}: ${error.message}`);
	}
}
function near(actual, expected, tolerance = 1e-9) {
	assert.ok(Number.isFinite(actual), `not finite: ${actual}`);
	assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} +/- ${tolerance}, got ${actual}`);
}
function finiteOrNull(value, label) {
	assert.ok(value === null || Number.isFinite(value), `${label}: expected finite or null, got ${value}`);
}

// ---------- deterministic series ----------
const linear = (length, start, step) => Array.from({ length }, (_, index) => start + index * step);
const flat = (length, value) => Array.from({ length }, () => value);
const drift = (length) => {
	const pattern = [1.1, 0.7, -0.5, 1.2, 0.4, -0.3, 0.9, -0.2];
	const closes = [100];
	for (let index = 1; index < length; index += 1) closes.push(closes[index - 1] + pattern[index % pattern.length]);
	return closes;
};
const withRange = (closes, spread = 1) => ({
	highs: closes.map((close) => close + spread),
	lows: closes.map((close) => close - spread)
});
const volumesOf = (length, value = 1000) => flat(length, value);
const volumesSpike = (length, value = 1000, spike = 5000) => {
	const volumes = flat(length, value);
	volumes[volumes.length - 1] = spike;
	return volumes;
};

const HAND_CONFIG = { maFast: 3, maSlow: 5, rsiPeriod: 2, macdFast: 2, macdSlow: 3, macdSignal: 2, bollPeriod: 5, bollMult: 2, atrPeriod: 2, maLong: 10, adxPeriod: 5, breakoutDays: 5, volumePeriod: 5 };
const HAND_CLOSES = [100, 102, 101, 103, 102, 104];
// 55 flat bars + the 6 hand bars: the last SMA/BOLL windows keep the hand math,
// while the 0.6.0 61-bar minimum is satisfied. (A bare 6-bar series is now null.)
const HAND_EXT = [...flat(55, 100), ...HAND_CLOSES];
const BULL_CLOSES = drift(120);
const BEAR_CLOSES = linear(120, 200, -1);
const FLAT_CLOSES = flat(120, 100);

// ---------- independent reference implementations ----------
function refSmaAt(values, period, end) {
	const window = values.slice(end - period, end);
	return window.reduce((sum, value) => sum + value, 0) / window.length;
}
function refEmaSeries(values, period) {
	const alpha = 2 / (period + 1);
	let previous = null;
	return values.map((value, index) => {
		if (index < period - 1) return null;
		if (index === period - 1) previous = values.slice(0, period).reduce((sum, item) => sum + item, 0) / period;
		else previous = value * alpha + previous * (1 - alpha);
		return previous;
	});
}
function refMacd(closes, fastPeriod, slowPeriod, signalPeriod) {
	const fast = refEmaSeries(closes, fastPeriod);
	const slow = refEmaSeries(closes, slowPeriod);
	const line = closes.map((_, index) => (fast[index] === null || slow[index] === null ? null : fast[index] - slow[index]));
	const offset = line.findIndex((value) => value !== null);
	const signal = refEmaSeries(line.slice(offset), signalPeriod);
	const hist = line.map((value, index) => {
		if (value === null) return null;
		const current = signal[index - offset];
		return current === null || current === undefined ? null : value - current;
	});
	return { line: line.at(-1), signal: signal.at(-1), hist: hist.at(-1), prevHist: hist.at(-2) };
}
function refBoll(closes, period, mult) {
	const window = closes.slice(-period);
	const middle = window.reduce((sum, value) => sum + value, 0) / period;
	const variance = window.reduce((sum, value) => sum + (value - middle) ** 2, 0) / period;
	const deviation = Math.sqrt(variance);
	return { upper: middle + mult * deviation, middle, lower: middle - mult * deviation };
}
function refAtr(highs, lows, closes, period) {
	const ranges = [];
	for (let index = 1; index < closes.length; index += 1) {
		const previousClose = closes[index - 1];
		ranges.push(Math.max(highs[index] - lows[index], Math.abs(highs[index] - previousClose), Math.abs(lows[index] - previousClose)));
	}
	let atr = ranges.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
	for (let index = period; index < ranges.length; index += 1) atr = (atr * (period - 1) + ranges[index]) / period;
	return atr;
}
function refRsiSeries(closes, period) {
	const values = new Array(closes.length).fill(null);
	if (closes.length < period + 1) return values;
	let gains = 0;
	let losses = 0;
	for (let index = 1; index <= period; index += 1) {
		const diff = closes[index] - closes[index - 1];
		if (diff > 0) gains += diff;
		else losses -= diff;
	}
	gains /= period;
	losses /= period;
	const calc = () => (gains === 0 && losses === 0 ? 50 : losses === 0 ? 100 : gains === 0 ? 0 : 100 - 100 / (1 + gains / losses));
	values[period] = calc();
	for (let index = period + 1; index < closes.length; index += 1) {
		const diff = closes[index] - closes[index - 1];
		gains = (gains * (period - 1) + Math.max(diff, 0)) / period;
		losses = (losses * (period - 1) + Math.max(-diff, 0)) / period;
		values[index] = calc();
	}
	return values;
}
function refAdx(highs, lows, closes, period) {
	const tr = [];
	const plus = [];
	const minus = [];
	for (let index = 1; index < closes.length; index += 1) {
		const upMove = highs[index] - highs[index - 1];
		const downMove = lows[index - 1] - lows[index];
		plus.push(upMove > downMove && upMove > 0 ? upMove : 0);
		minus.push(downMove > upMove && downMove > 0 ? downMove : 0);
		tr.push(Math.max(highs[index] - lows[index], Math.abs(highs[index] - closes[index - 1]), Math.abs(lows[index] - closes[index - 1])));
	}
	let sumTr = 0;
	let sumPlus = 0;
	let sumMinus = 0;
	for (let index = 0; index < period; index += 1) {
		sumTr += tr[index];
		sumPlus += plus[index];
		sumMinus += minus[index];
	}
	const dxs = [];
	for (let index = period - 1; index < tr.length; index += 1) {
		if (index > period - 1) {
			sumTr = sumTr - sumTr / period + tr[index];
			sumPlus = sumPlus - sumPlus / period + plus[index];
			sumMinus = sumMinus - sumMinus / period + minus[index];
		}
		const plusDi = sumTr > 0 ? (100 * sumPlus) / sumTr : 0;
		const minusDi = sumTr > 0 ? (100 * sumMinus) / sumTr : 0;
		const sum = plusDi + minusDi;
		dxs.push(sum > 0 ? (100 * Math.abs(plusDi - minusDi)) / sum : 0);
	}
	let adx = dxs.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
	for (let index = period; index < dxs.length; index += 1) adx = (adx * (period - 1) + dxs[index]) / period;
	return adx;
}
function findMacdCrosses(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
	const fast = refEmaSeries(closes, fastPeriod);
	const slow = refEmaSeries(closes, slowPeriod);
	const line = closes.map((_, index) => (fast[index] === null || slow[index] === null ? null : fast[index] - slow[index]));
	const offset = line.findIndex((value) => value !== null);
	const signal = refEmaSeries(line.slice(offset), signalPeriod);
	const crosses = [];
	for (let index = offset + signalPeriod; index < line.length; index += 1) {
		const prevLine = line[index - 1];
		const prevSignal = signal[index - 1 - offset];
		const currentLine = line[index];
		const currentSignal = signal[index - offset];
		if (prevLine === null || prevSignal === null || currentLine === null || currentSignal === null) continue;
		if (prevLine <= prevSignal && currentLine > currentSignal) crosses.push({ kind: "golden", index });
		if (prevLine >= prevSignal && currentLine < currentSignal) crosses.push({ kind: "death", index });
	}
	return crosses;
}
function assertFiniteTree(value, path = "root") {
	if (typeof value === "number") {
		assert.ok(Number.isFinite(value), `${path} not finite: ${value}`);
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => assertFiniteTree(item, `${path}[${index}]`));
		return;
	}
	if (value && typeof value === "object") {
		for (const [key, item] of Object.entries(value)) assertFiniteTree(item, `${path}.${key}`);
	}
}

// ---------- config: defaults, limits, normalization, signature ----------
check("TA_DEFAULTS exact (15 fields)", () => {
	assert.deepEqual(TA_DEFAULTS, {
		maFast: 5, maSlow: 20, rsiPeriod: 14, macdFast: 12, macdSlow: 26, macdSignal: 9,
		bollPeriod: 20, bollMult: 2, atrPeriod: 14, threshold: 0.2, style: "balanced",
		maLong: 50, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20
	});
	assert.equal(Object.keys(TA_DEFAULTS).length, 15);
});
check("TA_LIMITS exact (14 fields)", () => {
	assert.deepEqual(TA_LIMITS.maSlow, [5, 200]);
	assert.deepEqual(TA_LIMITS.threshold, [0.05, 0.6]);
	assert.deepEqual(TA_LIMITS.maLong, [10, 200]);
	assert.deepEqual(TA_LIMITS.adxPeriod, [5, 50]);
	assert.deepEqual(TA_LIMITS.breakoutDays, [5, 60]);
	assert.deepEqual(TA_LIMITS.volumePeriod, [5, 60]);
	assert.equal(Object.keys(TA_LIMITS).length, 14);
});
check("normalize(undefined) equals defaults", () => assert.deepEqual(normalizeTaConfig(), { ...TA_DEFAULTS }));
check("clamp maSlow 999 -> 200", () => assert.equal(normalizeTaConfig({ maSlow: 999 }).maSlow, 200));
check("clamp threshold 5 -> 0.6", () => assert.equal(normalizeTaConfig({ threshold: 5 }).threshold, 0.6));
check("clamp new integer fields", () => {
	const config = normalizeTaConfig({ maLong: 999, adxPeriod: 0, breakoutDays: 999, volumePeriod: 0 });
	assert.equal(config.maLong, 200);
	assert.equal(config.adxPeriod, 5);
	assert.equal(config.breakoutDays, 60);
	assert.equal(config.volumePeriod, 5);
	assert.equal(normalizeTaConfig({ maLong: 0 }).maLong, 10);
});
check("swaps maFast > maSlow", () => {
	const config = normalizeTaConfig({ maFast: 50, maSlow: 10 });
	assert.equal(config.maFast, 10);
	assert.equal(config.maSlow, 50);
});
check("equal ma values become strictly ordered", () => {
	const config = normalizeTaConfig({ maFast: 10, maSlow: 10 });
	assert.ok(config.maFast < config.maSlow, `${config.maFast}/${config.maSlow}`);
});
check("integer params rounded", () => {
	const config = normalizeTaConfig({ maFast: 7.9, maSlow: 20.6, maLong: 49.6, adxPeriod: 14.4, breakoutDays: 20.6, volumePeriod: 19.5 });
	assert.equal(config.maFast, 8);
	assert.equal(config.maSlow, 21);
	assert.equal(config.maLong, 50);
	assert.equal(config.adxPeriod, 14);
	assert.equal(config.breakoutDays, 21);
	assert.equal(config.volumePeriod, 20);
});
check("style whitelist and fallback", () => {
	assert.equal(normalizeTaConfig({ style: "scalp" }).style, "balanced");
	for (const style of ["balanced", "trend", "momentum", "meanrev"]) assert.equal(normalizeTaConfig({ style }).style, style);
});
check("unknown keys ignored, fresh object returned", () => {
	const raw = { maFast: 7, extra: 1 };
	const config = normalizeTaConfig(raw);
	assert.deepEqual(Object.keys(config).sort(), ["adxPeriod", "atrPeriod", "bollMult", "bollPeriod", "breakoutDays", "maFast", "maLong", "maSlow", "macdFast", "macdSignal", "macdSlow", "rsiPeriod", "style", "threshold", "volumePeriod"].sort());
	config.maFast = 33;
	assert.equal(raw.maFast, 7);
	assert.equal(normalizeTaConfig(raw).maFast, 7);
});
check("wild input stays inside TA_LIMITS", () => {
	const config = normalizeTaConfig({ maFast: -99, maSlow: 999, rsiPeriod: 0, macdFast: 0, macdSlow: 999, macdSignal: 0, bollPeriod: 0, bollMult: 99, atrPeriod: 0, threshold: 99, maLong: -99, adxPeriod: -99, breakoutDays: 999, volumePeriod: 0 });
	for (const key of Object.keys(TA_LIMITS)) {
		const [min, max] = TA_LIMITS[key];
		assert.ok(config[key] >= min && config[key] <= max, `${key}=${config[key]}`);
	}
	assert.ok(config.maFast < config.maSlow);
});
check("default signature has the unchanged prefix plus appended fields", () => {
	const signature = configSignature(TA_DEFAULTS);
	assert.equal(signature, "5-20-14-12-26-9-20-2-14-0.2-balanced-50-14-20-20");
	assert.ok(signature.startsWith("5-20-14-12-26-9-20-2-14-0.2-balanced-"));
});
check("signature reflects new fields", () => {
	const base = configSignature({});
	const changed = configSignature({ maLong: 120, adxPeriod: 20, breakoutDays: 30, volumePeriod: 10 });
	assert.notEqual(base, changed);
	assert.ok(changed.endsWith("-120-20-30-10"));
});
check("signature stable across key order", () => {
	const a = configSignature({ maLong: 120, maFast: 10, maSlow: 30, style: "trend", volumePeriod: 10 });
	const b = configSignature({ style: "trend", volumePeriod: 10, maSlow: 30, maFast: 10, maLong: 120 });
	assert.equal(a, b);
});

// ---------- base indicators regression (0.4/0.5 fields unchanged) ----------
check("61-bar extended hand series computes", () => {
	const indicators = computeIndicators({ closes: HAND_EXT, config: HAND_CONFIG });
	assert.ok(indicators);
	assert.equal(indicators.bars, 61);
	assert.equal(indicators.price, 104);
});
check("hand SMA/BOLL values preserved on the extended series", () => {
	const indicators = computeIndicators({ closes: HAND_EXT, config: HAND_CONFIG });
	near(indicators.maFast, 103, 1e-12);
	near(indicators.maSlow, 102.4, 1e-12);
	near(indicators.maFastPrev, 102, 1e-12);
	near(indicators.maSlowPrev, 101.6, 1e-12);
	near(refSmaAt(HAND_EXT, 3, 61), 103, 1e-12);
	const window = [102, 101, 103, 102, 104];
	const middle = 102.4;
	const deviation = Math.sqrt(window.reduce((sum, value) => sum + (value - middle) ** 2, 0) / window.length);
	near(indicators.boll.middle, middle, 1e-12);
	near(indicators.boll.upper, middle + 2 * deviation, 1e-12);
	near(indicators.boll.lower, middle - 2 * deviation, 1e-12);
});
check("hand RSI matches independent Wilder reference", () => {
	const indicators = computeIndicators({ closes: HAND_EXT, config: HAND_CONFIG });
	const reference = refRsiSeries(HAND_EXT, 2);
	near(indicators.rsi, reference[60], 1e-12);
	near(indicators.rsiPrev, reference[59], 1e-12);
});
check("hand MACD matches independent reference", () => {
	const indicators = computeIndicators({ closes: HAND_EXT, config: HAND_CONFIG });
	const reference = refMacd(HAND_EXT, 2, 3, 2);
	near(indicators.macd.line, reference.line, 1e-12);
	near(indicators.macd.signal, reference.signal, 1e-12);
	near(indicators.macd.hist, reference.hist, 1e-12);
	near(indicators.macd.prevHist, reference.prevHist, 1e-12);
});
check("hand ATR null without highs/lows", () => {
	const indicators = computeIndicators({ closes: HAND_EXT, config: HAND_CONFIG });
	assert.equal(indicators.atr, null);
	assert.equal(indicators.atrPct, null);
	assert.equal(indicators.values.atrPct, null);
	assert.equal(indicators.kdj.k, null);
	assert.equal(indicators.adx.adx, null);
	assert.equal(indicators.breakout20, null);
	assert.equal(indicators.candle, null);
});
check("hand change5d/7d/20d on the extended series", () => {
	const indicators = computeIndicators({ closes: HAND_EXT, config: HAND_CONFIG });
	near(indicators.change5dPct, 4, 1e-12);
	near(indicators.change7dPct, 4, 1e-12);
	near(indicators.change20dPct, 4, 1e-12);
});
check("120-bar MACD/BOLL/ATR match references", () => {
	const closes = linear(120, 100, 0.9);
	const range = withRange(closes);
	const indicators = computeIndicators({ closes, ...range, config: TA_DEFAULTS });
	const macdRef = refMacd(closes, 12, 26, 9);
	near(indicators.macd.line, macdRef.line, 1e-9);
	near(indicators.macd.signal, macdRef.signal, 1e-9);
	near(indicators.macd.hist, macdRef.hist, 1e-9);
	near(indicators.macd.prevHist, macdRef.prevHist, 1e-9);
	const bollRef = refBoll(closes, 20, 2);
	near(indicators.boll.middle, bollRef.middle, 1e-9);
	near(indicators.boll.upper, bollRef.upper, 1e-9);
	near(indicators.boll.lower, bollRef.lower, 1e-9);
	near(indicators.atr, refAtr(range.highs, range.lows, closes, 14), 1e-9);
});
check("percent changes match direct formula", () => {
	const closes = linear(120, 100, 0.9);
	const indicators = computeIndicators({ closes, ...withRange(closes), config: TA_DEFAULTS });
	const price = closes.at(-1);
	near(indicators.change5dPct, (price / closes.at(-6) - 1) * 100, 1e-12);
	near(indicators.change7dPct, (price / closes.at(-8) - 1) * 100, 1e-12);
	near(indicators.change20dPct, (price / closes.at(-21) - 1) * 100, 1e-12);
});
check("values mirror top-level fields", () => {
	const closes = linear(120, 100, 0.9);
	const indicators = computeIndicators({ closes, ...withRange(closes), config: TA_DEFAULTS });
	assert.equal(indicators.values.rsi, indicators.rsi);
	assert.equal(indicators.values.macdHist, indicators.macd.hist);
	assert.equal(indicators.values.atrPct, indicators.atrPct);
	assert.equal(indicators.values.percentB, indicators.boll.percentB);
});
check("rangePosition and swings are sane", () => {
	const closes = linear(120, 100, 0.9);
	const indicators = computeIndicators({ closes, ...withRange(closes), config: TA_DEFAULTS });
	assert.ok(indicators.rangePosition >= 0 && indicators.rangePosition <= 1);
	assert.ok(indicators.swingHigh20 >= indicators.price);
	assert.ok(indicators.swingLow20 <= indicators.price);
});

// ---------- insufficient / invalid input ----------
check("empty/short/null inputs return null without throwing", () => {
	assert.doesNotThrow(() => {
		assert.equal(computeIndicators(), null);
		assert.equal(computeIndicators({}), null);
		assert.equal(computeIndicators({ closes: [] }), null);
		assert.equal(computeIndicators({ closes: linear(10, 100, 1) }), null);
		assert.equal(computeIndicators({ closes: linear(60, 100, 1) }), null);
		assert.equal(computeIndicators({ closes: "nope" }), null);
		assert.equal(computeIndicators({ closes: [100, null, 102] }), null);
		assert.equal(computeIndicators({ closes: [0, 1, 2] }), null);
	});
});
check("61 bars works with default config", () => {
	const closes = linear(61, 100, 1);
	const indicators = computeIndicators({ closes, ...withRange(closes), volumes: volumesOf(61), config: {} });
	assert.ok(indicators);
	assert.equal(indicators.bars, 61);
});
check("wild configs never throw", () => {
	assert.doesNotThrow(() => computeIndicators({ closes: linear(250, 100, 1), config: { maFast: 999, maSlow: -5, rsiPeriod: 999, macdFast: 999, macdSlow: 999, macdSignal: 999, bollPeriod: 999, bollMult: 999, atrPeriod: 999, threshold: 999, style: "x", maLong: 999, adxPeriod: 999, breakoutDays: 999, volumePeriod: 999 } }));
});
check("n=120 and n=250 both compute", () => {
	const short = computeIndicators({ closes: linear(120, 100, 0.5), config: TA_DEFAULTS });
	const long = computeIndicators({ closes: linear(250, 100, 0.3), config: TA_DEFAULTS });
	assert.equal(short.bars, 120);
	assert.equal(long.bars, 250);
});

// ---------- new 0.6.0 fields: presence and semantics ----------
const CLOSES = linear(120, 100, 1);
const RANGE = withRange(CLOSES);
const VOLUMES = volumesOf(120);
const BASE = { closes: CLOSES, ...RANGE, volumes: VOLUMES, config: TA_DEFAULTS };
const IND = computeIndicators(BASE);
check("new fields are present and typed", () => {
	assert.equal(IND.bars, 120);
	assert.ok(Number.isFinite(IND.maLong));
	assert.ok(Number.isFinite(IND.maLongPrev));
	assert.ok(Number.isFinite(IND.maLongSlopePct));
	assert.ok(Number.isFinite(IND.priceVsMaSlowPct));
	assert.ok(Number.isFinite(IND.priceVsMaLongPct));
	assert.ok(["bull", "bear", "mixed"].includes(IND.maAlignment));
	assert.ok(Number.isFinite(IND.kdj.k) && Number.isFinite(IND.kdj.d) && Number.isFinite(IND.kdj.j));
	assert.ok(Number.isFinite(IND.cci));
	assert.ok(Number.isFinite(IND.williamsR));
	assert.ok(Number.isFinite(IND.adx.adx) && Number.isFinite(IND.adx.plusDi) && Number.isFinite(IND.adx.minusDi));
	assert.ok(Number.isFinite(IND.volumeRatio));
	assert.ok(Number.isFinite(IND.volumeTrend));
	assert.ok(Number.isFinite(IND.obvSlopePct));
	assert.equal(typeof IND.breakout20, "boolean");
	assert.equal(typeof IND.breakdown20, "boolean");
	assert.ok(Number.isFinite(IND.high60) && Number.isFinite(IND.low60));
	assert.ok(Number.isFinite(IND.distanceHigh60Pct) && Number.isFinite(IND.distanceLow60Pct));
	assert.ok(Number.isFinite(IND.bandwidthPct));
	assert.ok(Number.isFinite(IND.bandwidthPercentile) && IND.bandwidthPercentile >= 0 && IND.bandwidthPercentile <= 100);
	assert.ok(Number.isFinite(IND.atrPercentile) && IND.atrPercentile >= 0 && IND.atrPercentile <= 100);
	assert.ok(IND.macdCross === null || ["golden", "death"].includes(IND.macdCross));
	assert.ok(IND.rsiDivergence === null || ["bullish", "bearish"].includes(IND.rsiDivergence));
	assert.ok(IND.candle === null || ["bullish-engulfing", "bearish-engulfing", "hammer", "shooting-star", "doji"].includes(IND.candle));
});
check("maLong, slope and price-vs-MA formulas", () => {
	const closes = CLOSES;
	const price = closes[closes.length - 1];
	const maLong = refSmaAt(closes, 50, 120);
	const maLongPrev = refSmaAt(closes, 50, 119);
	const maLongPrev5 = refSmaAt(closes, 50, 115);
	const maSlow = refSmaAt(closes, 20, 120);
	near(IND.maLong, maLong, 1e-12);
	near(IND.maLongPrev, maLongPrev, 1e-12);
	near(IND.maLongSlopePct, ((maLong - maLongPrev5) / maLongPrev5) * 100, 0.001);
	near(IND.priceVsMaSlowPct, ((price / maSlow) - 1) * 100, 0.001);
});
check("high60/low60 and bandwidth formulas", () => {
	const closes = CLOSES;
	const highs = RANGE.highs;
	const lows = RANGE.lows;
	const last = closes.length - 1;
	assert.equal(IND.high60, Math.max(...highs.slice(last - 59)));
	assert.equal(IND.low60, Math.min(...lows.slice(last - 59)));
	near(IND.distanceHigh60Pct, ((IND.price - IND.high60) / IND.high60) * 100, 0.01);
	near(IND.distanceLow60Pct, ((IND.price - IND.low60) / IND.low60) * 100, 0.01);
	near(IND.bandwidthPct, ((IND.boll.upper - IND.boll.lower) / IND.boll.middle) * 100, 0.001);
});
check("volumes with null bars are treated as zero volume", () => {
	const volumes = volumesOf(120);
	volumes[30] = null;
	const indicators = computeIndicators({ closes: CLOSES, ...RANGE, volumes, config: TA_DEFAULTS });
	assert.ok(Number.isFinite(indicators.volumeRatio));
	assert.ok(Number.isFinite(indicators.volumeTrend));
	assert.ok(Number.isFinite(indicators.obvSlopePct));
	assert.ok(Number.isFinite(indicators.rsi));
});
check("0.4/0.5 output field shape preserved", () => {
	const closes = linear(120, 100, 0.9);
	const indicators = computeIndicators({ closes, ...withRange(closes), config: TA_DEFAULTS });
	for (const key of ["price", "bars", "maFast", "maSlow", "maFastPrev", "maSlowPrev", "rsi", "rsiPrev", "atr", "atrPct", "change5dPct", "change7dPct", "change20dPct", "rangePosition", "swingHigh20", "swingLow20"]) {
		assert.ok(key in indicators, key);
	}
	assert.deepEqual(Object.keys(indicators.macd).sort(), ["hist", "line", "prevHist", "signal"]);
	assert.deepEqual(Object.keys(indicators.boll).sort(), ["lower", "middle", "percentB", "upper"]);
	for (const key of ["label", "score", "threshold", "components"]) assert.ok(key in indicators.trend, key);
	assert.deepEqual(Object.keys(indicators.trend.components).sort(), ["ma", "momentum", "range"]);
	assert.deepEqual(Object.keys(indicators.values).sort(), ["atrPct", "macdHist", "percentB", "rsi"]);
	const strategy = evaluateStrategy({ indicators });
	for (const key of ["action", "label", "score", "reasons", "levels"]) assert.ok(key in strategy, key);
});
check("maLong slope and alignment on uptrend", () => {
	assert.ok(IND.maLongSlopePct > 0);
	assert.equal(IND.maAlignment, "bull");
	assert.ok(IND.priceVsMaSlowPct > 0 && IND.priceVsMaLongPct > 0);
	const downCloses = linear(120, 220, -1);
	const down = computeIndicators({ closes: downCloses, ...withRange(downCloses), volumes: VOLUMES, config: TA_DEFAULTS });
	assert.equal(down.maAlignment, "bear");
	assert.ok(down.maLongSlopePct < 0);
});
check("kdj K/D stay in 0..100 (J unbounded), CCI and %R finite", () => {
	assert.ok(IND.kdj.k >= 0 && IND.kdj.k <= 100);
	assert.ok(IND.kdj.d >= 0 && IND.kdj.d <= 100);
	assert.ok(Number.isFinite(IND.kdj.j));
	assert.ok(IND.williamsR >= -100 && IND.williamsR <= 0);
	assert.ok(Number.isFinite(IND.cci));
});
check("adx > 0 on a trend and higher than on a flat series", () => {
	const flatCloses = flat(120, 100);
	const flatInd = computeIndicators({ closes: flatCloses, ...withRange(flatCloses), volumes: VOLUMES, config: TA_DEFAULTS });
	assert.ok(IND.adx.adx > 0, String(IND.adx.adx));
	assert.ok(IND.adx.adx > flatInd.adx.adx, `${IND.adx.adx} vs ${flatInd.adx.adx}`);
	const reference = refAdx(RANGE.highs, RANGE.lows, CLOSES, 14);
	near(IND.adx.adx, Math.round(reference * 100) / 100, 0.01);
});
check("volumeRatio = 1 on constant volume, > 1 on a spike", () => {
	assert.equal(IND.volumeRatio, 1);
	assert.equal(IND.volumeTrend, 1);
	const spiked = computeIndicators({ closes: CLOSES, ...RANGE, volumes: volumesSpike(120), config: TA_DEFAULTS });
	assert.ok(spiked.volumeRatio > 1, String(spiked.volumeRatio));
	assert.ok(spiked.volumeTrend > 1, String(spiked.volumeTrend));
	assert.ok(spiked.obvSlopePct > 0);
});
check("breakout20 true on a new-high series, false on a downtrend", () => {
	const up = linear(120, 100, 1.2);
	const upInd = computeIndicators({ closes: up, ...withRange(up, 0.5), volumes: VOLUMES, config: TA_DEFAULTS });
	assert.equal(upInd.breakout20, true);
	assert.equal(upInd.breakdown20, false);
	const down = linear(120, 220, -1.2);
	const downInd = computeIndicators({ closes: down, ...withRange(down, 0.5), volumes: VOLUMES, config: TA_DEFAULTS });
	assert.equal(downInd.breakout20, false);
	assert.equal(downInd.breakdown20, true);
});
check("60-bar levels and distances", () => {
	assert.ok(IND.high60 >= IND.price);
	assert.ok(IND.low60 <= IND.price);
	assert.ok(IND.distanceHigh60Pct <= 0, String(IND.distanceHigh60Pct));
	assert.ok(IND.distanceLow60Pct >= 0, String(IND.distanceLow60Pct));
});
check("bandwidth and ATR percentiles are 0..100", () => {
	assert.ok(IND.bandwidthPercentile >= 0 && IND.bandwidthPercentile <= 100);
	assert.ok(IND.atrPercentile >= 0 && IND.atrPercentile <= 100);
});
check("macdCross detects golden and death on crafted series", () => {
	const wave = [];
	for (let index = 0; index < 70; index += 1) wave.push(100 + index * 0.05);
	for (let index = 0; index < 25; index += 1) wave.push(103.5 - index * 0.9);
	for (let index = 0; index < 30; index += 1) wave.push(81 + index * 0.8);
	const crosses = findMacdCrosses(wave).filter((cross) => cross.index >= 61);
	const golden = crosses.find((cross) => cross.kind === "golden");
	const death = crosses.find((cross) => cross.kind === "death");
	assert.ok(golden && death, "crafted wave must contain both crosses");
	for (const cross of [golden, death]) {
		const slice = wave.slice(0, cross.index + 1);
		const indicators = computeIndicators({ closes: slice, ...withRange(slice, 0.5), volumes: volumesOf(slice.length), config: TA_DEFAULTS });
		assert.equal(indicators.macdCross, cross.kind, `bar ${cross.index}`);
	}
});
check("rsiDivergence bullish on a lower-low / higher-RSI series", () => {
	const closes = [];
	for (let index = 0; index <= 39; index += 1) closes.push(110 - index * 0.25);
	closes.push(100);
	for (let index = 41; index <= 59; index += 1) closes.push(100 + (index - 40) * 0.4);
	closes.push(107);
	const highs = closes.map((value) => value + 0.5);
	const lows = closes.map((value) => value - 0.5);
	lows[60] = 98;
	highs[60] = 108;
	const indicators = computeIndicators({ closes, highs, lows, volumes: volumesOf(61), config: TA_DEFAULTS });
	assert.equal(indicators.rsiDivergence, "bullish");
	assert.ok(indicators.rsi > 50);
});
check("candle patterns on crafted bars", () => {
	const engulfing = computeIndicators({
		closes: [...flat(58, 100), 102, 100, 103],
		highs: [...flat(58, 100.5), 102.5, 101, 104],
		lows: [...flat(58, 99.5), 101.5, 99, 98],
		volumes: volumesOf(61),
		config: TA_DEFAULTS
	});
	assert.equal(engulfing.candle, "bullish-engulfing");
	const doji = computeIndicators({
		closes: [...flat(60, 100), 100.05],
		highs: [...flat(60, 100.5), 101],
		lows: [...flat(60, 99.5), 99],
		volumes: volumesOf(61),
		config: TA_DEFAULTS
	});
	assert.equal(doji.candle, "doji");
	const hammer = computeIndicators({
		closes: [...flat(60, 100), 100.4],
		highs: [...flat(60, 100.5), 100.6],
		lows: [...flat(60, 99.5), 98],
		volumes: volumesOf(61),
		config: TA_DEFAULTS
	});
	assert.equal(hammer.candle, "hammer");
	const shootingStar = computeIndicators({
		closes: [...flat(60, 100), 99.6],
		highs: [...flat(60, 100.5), 102],
		lows: [...flat(60, 99.5), 99.4],
		volumes: volumesOf(61),
		config: TA_DEFAULTS
	});
	assert.equal(shootingStar.candle, "shooting-star");
});
check("missing volumes -> volume fields null, price fields unaffected", () => {
	const indicators = computeIndicators({ closes: CLOSES, ...RANGE, config: TA_DEFAULTS });
	assert.equal(indicators.volumeRatio, null);
	assert.equal(indicators.volumeTrend, null);
	assert.equal(indicators.obvSlopePct, null);
	assert.ok(Number.isFinite(indicators.adx.adx));
	assert.ok(Number.isFinite(indicators.atrPercentile));
});
check("mismatched highs/lows -> high/low-dependent fields null-safe", () => {
	const indicators = computeIndicators({ closes: CLOSES, highs: [1, 2, 3], lows: [1, 2], volumes: VOLUMES, config: TA_DEFAULTS });
	assert.equal(indicators.atr, null);
	assert.equal(indicators.kdj.k, null);
	assert.equal(indicators.cci, null);
	assert.equal(indicators.williamsR, null);
	assert.equal(indicators.adx.adx, null);
	assert.equal(indicators.breakout20, null);
	assert.equal(indicators.candle, null);
	assert.ok(Number.isFinite(indicators.high60));
	assert.ok(Number.isFinite(indicators.low60));
});

// ---------- trend / strategy regression ----------
check("uptrend labels 多头 (balanced + trend styles)", () => {
	for (const style of ["balanced", "trend"]) {
		const indicators = computeIndicators({ closes: linear(120, 100, 1), config: { style } });
		assert.equal(indicators.trend.label, "多头", style);
		assert.ok(indicators.trend.score > 0.2);
	}
});
check("downtrend labels 空头 (balanced + trend styles)", () => {
	for (const style of ["balanced", "trend"]) {
		const indicators = computeIndicators({ closes: BEAR_CLOSES, config: { style } });
		assert.equal(indicators.trend.label, "空头", style);
		assert.ok(indicators.trend.score < -0.2);
	}
});
check("flat series labels 震荡 with score 0", () => {
	for (const style of ["balanced", "trend"]) {
		const indicators = computeIndicators({ closes: FLAT_CLOSES, config: { style } });
		assert.equal(indicators.trend.label, "震荡", style);
		near(indicators.trend.score, 0, 1e-12);
	}
});
check("meanrev inverts the oversold score", () => {
	const balanced = computeIndicators({ closes: BEAR_CLOSES, config: { style: "balanced" } });
	const meanrev = computeIndicators({ closes: BEAR_CLOSES, config: { style: "meanrev" } });
	assert.ok(balanced.trend.score < -0.3);
	assert.ok(meanrev.trend.score > 0.3);
});
check("scores and components stay bounded for every style", () => {
	for (const style of ["balanced", "trend", "momentum", "meanrev"]) {
		const indicators = computeIndicators({ closes: BULL_CLOSES, config: { style } });
		assert.ok(indicators.trend.score >= -1 && indicators.trend.score <= 1, style);
		for (const [key, value] of Object.entries(indicators.trend.components)) {
			assert.ok(Number.isFinite(value) && value >= -1 && value <= 1, `${style}.${key}=${value}`);
		}
	}
});
check("bullish series -> buy/add with positive score and 2..4 reasons", () => {
	const indicators = computeIndicators({ closes: BULL_CLOSES, ...withRange(BULL_CLOSES), volumes: volumesOf(120), config: { style: "balanced" } });
	const strategy = evaluateStrategy({ indicators, config: { style: "balanced" } });
	assert.ok(["buy", "add"].includes(strategy.action), strategy.action);
	assert.ok(strategy.score > 0, String(strategy.score));
	assert.ok(strategy.reasons.length >= 2 && strategy.reasons.length <= 4);
	for (const reason of strategy.reasons) assert.ok(typeof reason === "string" && reason.length > 3);
	assert.ok(strategy.reasons.some((reason) => /\d/.test(reason)));
});
check("extremely overbought RSI>75 never returns buy", () => {
	const closes = linear(120, 100, 1);
	const indicators = computeIndicators({ closes, ...withRange(closes), config: { style: "balanced" } });
	assert.ok(indicators.rsi > 75, String(indicators.rsi));
	const strategy = evaluateStrategy({ indicators, config: { style: "balanced" } });
	assert.notEqual(strategy.action, "buy");
});
check("meanrev oversold -> add/watch with positive score", () => {
	const indicators = computeIndicators({ closes: BEAR_CLOSES, ...withRange(BEAR_CLOSES), config: { style: "meanrev" } });
	const strategy = evaluateStrategy({ indicators, config: { style: "meanrev" } });
	assert.ok(strategy.score > 0, String(strategy.score));
	assert.ok(["add", "watch"].includes(strategy.action), strategy.action);
	assert.ok(strategy.reasons[0].includes("超跌关注反弹"));
});
check("bearish trend style -> reduce", () => {
	const indicators = computeIndicators({ closes: BEAR_CLOSES, ...withRange(BEAR_CLOSES), config: { style: "trend" } });
	const strategy = evaluateStrategy({ indicators, config: { style: "trend" } });
	assert.equal(strategy.action, "reduce");
	assert.ok(strategy.score <= -45);
});
check("levels risk/reward math is consistent", () => {
	const indicators = computeIndicators({ closes: BULL_CLOSES, ...withRange(BULL_CLOSES), volumes: volumesOf(120), config: TA_DEFAULTS });
	const strategy = evaluateStrategy({ indicators });
	const levels = strategy.levels;
	assert.ok(levels);
	near(levels.stopLong, indicators.price - 2 * indicators.atr, 1e-9);
	near(levels.targetLong, indicators.price + 3 * indicators.atr, 1e-9);
	near(levels.support, Math.min(indicators.swingLow20, levels.stopLong), 1e-9);
	near(levels.resistance, Math.max(indicators.swingHigh20, levels.targetLong), 1e-9);
	near(levels.riskPct, (2 * indicators.atr / indicators.price) * 100, 1e-9);
	near(levels.rewardPct, (3 * indicators.atr / indicators.price) * 100, 1e-9);
	near(levels.rr, levels.rewardPct / levels.riskPct, 0.05);
	assert.equal(levels.rr, 1.5);
});
check("missing highs/lows -> atr null and levels null", () => {
	const indicators = computeIndicators({ closes: BULL_CLOSES, config: TA_DEFAULTS });
	assert.equal(indicators.atr, null);
	const strategy = evaluateStrategy({ indicators });
	assert.ok(strategy);
	assert.equal(strategy.levels, null);
});
check("evaluateStrategy is null-safe", () => {
	assert.doesNotThrow(() => {
		assert.equal(evaluateStrategy(), null);
		assert.equal(evaluateStrategy({}), null);
		assert.equal(evaluateStrategy({ indicators: null }), null);
		assert.equal(evaluateStrategy({ indicators: {}, price: 100 }), null);
	});
});
check("price falls back to indicators.price", () => {
	const indicators = computeIndicators({ closes: BULL_CLOSES, ...withRange(BULL_CLOSES), config: TA_DEFAULTS });
	const a = evaluateStrategy({ indicators });
	const b = evaluateStrategy({ indicators, price: indicators.price });
	assert.equal(a.action, b.action);
	assert.equal(a.score, b.score);
});
check("action labels and score bounds", () => {
	const labels = { buy: "买入", add: "加仓", hold: "持有", reduce: "减仓", watch: "观望" };
	const cases = [[BULL_CLOSES, "balanced"], [BEAR_CLOSES, "trend"], [FLAT_CLOSES, "balanced"]];
	for (const [closes, style] of cases) {
		const indicators = computeIndicators({ closes, ...withRange(closes), config: { style } });
		const strategy = evaluateStrategy({ indicators, config: { style } });
		assert.equal(strategy.label, labels[strategy.action], style);
		assert.ok(strategy.score >= -100 && strategy.score <= 100);
	}
});
check("reasons avoid leverage/position-size/disclaimer wording", () => {
	const indicators = computeIndicators({ closes: BULL_CLOSES, ...withRange(BULL_CLOSES), config: TA_DEFAULTS });
	const strategy = evaluateStrategy({ indicators });
	const joined = strategy.reasons.join("|");
	for (const banned of ["杠杆", "仓位", "投资建议", "保证"]) assert.ok(!joined.includes(banned), banned);
});
check("250 bars flows through indicators, the new fields and strategy", () => {
	const closes = linear(250, 100, 0.4);
	const indicators = computeIndicators({ closes, ...withRange(closes), volumes: volumesOf(250), config: TA_DEFAULTS });
	const strategy = evaluateStrategy({ indicators });
	assert.equal(indicators.bars, 250);
	assert.ok(Number.isFinite(indicators.maLong) && Number.isFinite(indicators.adx.adx) && Number.isFinite(indicators.atrPercentile));
	assert.ok(strategy && ["buy", "add", "hold", "reduce", "watch"].includes(strategy.action));
});
check("no NaN/Infinity in a 300-bar random walk across all styles", () => {
	let seed = 42;
	const random = () => {
		seed = (seed * 1103515245 + 12345) % 2147483648;
		return seed / 2147483648;
	};
	const closes = [100];
	for (let index = 1; index < 300; index += 1) closes.push(Math.max(1, closes[index - 1] * (1 + (random() - 0.48) * 0.03)));
	const highs = closes.map((value) => value * 1.01);
	const lows = closes.map((value) => value * 0.99);
	const volumes = closes.map(() => 500 + random() * 1500);
	for (const style of ["balanced", "trend", "momentum", "meanrev"]) {
		const indicators = computeIndicators({ closes, highs, lows, volumes, config: { style } });
		assertFiniteTree(indicators, style);
		assertFiniteTree(evaluateStrategy({ indicators, config: { style } }), `${style}.strategy`);
	}
});

// ---------- report ----------
const total = passed + failures.length;
if (failures.length > 0) {
	console.error(`FAIL ${passed}/${total}`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}
console.log(`PASS ${passed}/${total}`);

