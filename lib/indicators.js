// Pure technical-indicator, trend-score and rule-based strategy engine for
// dsh-crypto-us-stock-monitor (0.6.0). No dependencies, no I/O, no side effects.
//
// Base (0.4.0): SMA; Wilder RSI (seeded with the first `period` changes, flat
// data => 50); SMA-seeded EMA MACD; BOLL (population std); Wilder ATR.
// 0.6.0 adds: KDJ(9), CCI(20), Williams %R(14), ADX/DMI (Wilder), OBV slope,
// volume ratio/trend, breakout/breakdown, 60-bar high/low, BOLL bandwidth
// percentile, ATR percentile, MACD cross, RSI divergence and candle patterns.
// Values that cannot be computed are null, never 0/NaN.
//
// Candle patterns: the input has no opens, so open is approximated by the
// previous close (gap-less proxy): body = |close - prevClose|, range =
// high - low, wicks measured from that proxy body. Thresholds:
//   doji               body <= 10% of range
//   hammer             lowerWick >= 2*body and upperWick <= body
//   shooting-star      upperWick >= 2*body and lowerWick <= body
//   bullish-engulfing  close > prevClose, prev candle down, high >= prevHigh
//                      and low <= prevLow (outside-up bar)
//   bearish-engulfing  the mirror (outside-down bar)
// Precedence: engulfing -> doji -> hammer -> shooting-star.

export const TA_DEFAULTS = { maFast: 5, maSlow: 20, rsiPeriod: 14, macdFast: 12, macdSlow: 26, macdSignal: 9, bollPeriod: 20, bollMult: 2, atrPeriod: 14, threshold: 0.2, style: "balanced", maLong: 50, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20 };
export const TA_LIMITS = { maFast: [3, 50], maSlow: [5, 200], rsiPeriod: [2, 50], macdFast: [2, 50], macdSlow: [3, 100], macdSignal: [2, 50], bollPeriod: [5, 100], bollMult: [1, 4], atrPeriod: [2, 50], threshold: [0.05, 0.6], maLong: [10, 200], adxPeriod: [5, 50], breakoutDays: [5, 60], volumePeriod: [5, 60] };

const STYLES = ["balanced", "trend", "momentum", "meanrev"];
// meanrev flips all three signs so that price below the MAs, negative momentum
// and a low 20-bar range position read as a positive (oversold) score:
// ma .30 / momentum -.40 / range (inverted) .30.
const STYLE_WEIGHTS = {
	balanced: { ma: 0.45, momentum: 0.35, range: 0.2 },
	trend: { ma: 0.65, momentum: 0.2, range: 0.15 },
	momentum: { ma: 0.25, momentum: 0.6, range: 0.15 },
	meanrev: { ma: -0.3, momentum: -0.4, range: -0.3 }
};
const ACTION_LABELS = { buy: "买入", add: "加仓", hold: "持有", reduce: "减仓", watch: "观望" };
const KDJ_WINDOW = 9;
const CCI_WINDOW = 20;
const WILLIAMS_WINDOW = 14;
const PERCENTILE_WINDOW = 60;

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function round(value, digits) {
	if (!Number.isFinite(value)) return null;
	const factor = 10 ** digits;
	return Math.round(value * factor) / factor;
}
function mean(values) {
	return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;
}
function sign(value) {
	return value > 0 ? 1 : value < 0 ? -1 : 0;
}
function finiteOrNull(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function toFiniteNumber(value) {
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	if (typeof value === "string" && value.trim() !== "") {
		const number = Number(value);
		return Number.isFinite(number) ? number : null;
	}
	return null;
}
function sanitizeSeries(values) {
	if (!Array.isArray(values) || values.length === 0) return null;
	const numbers = [];
	for (const value of values) {
		const number = toFiniteNumber(value);
		if (number === null) return null;
		numbers.push(number);
	}
	return numbers;
}
function sanitizeVolumes(values) {
	if (!Array.isArray(values) || values.length === 0) return null;
	const volumes = [];
	for (const value of values) {
		// A bar without a reported volume (Yahoo sometimes emits null) is
		// treated as zero volume; a wholly absent array means "no volume data".
		if (value === null || value === undefined || value === "") {
			volumes.push(0);
			continue;
		}
		const number = Number(value);
		if (!Number.isFinite(number) || number < 0) return null;
		volumes.push(number);
	}
	return volumes;
}
function intParam(source, key) {
	const [min, max] = TA_LIMITS[key];
	const value = Number(source[key]);
	const number = Number.isFinite(value) ? Math.round(value) : TA_DEFAULTS[key];
	return clamp(number, min, max);
}
function floatParam(source, key) {
	const [min, max] = TA_LIMITS[key];
	const value = Number(source[key]);
	const number = Number.isFinite(value) ? value : TA_DEFAULTS[key];
	return round(clamp(number, min, max), 2);
}

// Clamp every numeric field, enforce maFast < maSlow (swap when violated) and
// whitelist the style. Unknown keys are ignored; a fresh object is returned.
export function normalizeTaConfig(raw) {
	const source = raw && typeof raw === "object" ? raw : {};
	let maFast = intParam(source, "maFast");
	let maSlow = intParam(source, "maSlow");
	if (maFast >= maSlow) [maFast, maSlow] = [maSlow, maFast];
	if (maFast >= maSlow) {
		maSlow = clamp(maFast + 1, TA_LIMITS.maSlow[0], TA_LIMITS.maSlow[1]);
		if (maFast >= maSlow) maFast = clamp(maSlow - 1, TA_LIMITS.maFast[0], TA_LIMITS.maFast[1]);
	}
	return {
		maFast, maSlow,
		rsiPeriod: intParam(source, "rsiPeriod"),
		macdFast: intParam(source, "macdFast"),
		macdSlow: intParam(source, "macdSlow"),
		macdSignal: intParam(source, "macdSignal"),
		bollPeriod: intParam(source, "bollPeriod"),
		bollMult: floatParam(source, "bollMult"),
		atrPeriod: intParam(source, "atrPeriod"),
		threshold: floatParam(source, "threshold"),
		style: STYLES.includes(source.style) ? source.style : TA_DEFAULTS.style,
		maLong: intParam(source, "maLong"),
		adxPeriod: intParam(source, "adxPeriod"),
		breakoutDays: intParam(source, "breakoutDays"),
		volumePeriod: intParam(source, "volumePeriod")
	};
}

// Short stable cache key; the 0.4/0.5 prefix is unchanged and the new config
// fields are appended (e.g. "...-0.2-balanced-50-14-20-20").
export function configSignature(config) {
	const c = normalizeTaConfig(config);
	return [c.maFast, c.maSlow, c.rsiPeriod, c.macdFast, c.macdSlow, c.macdSignal, c.bollPeriod, c.bollMult, c.atrPeriod, c.threshold, c.style, c.maLong, c.adxPeriod, c.breakoutDays, c.volumePeriod].join("-");
}

function smaAt(values, period, end) {
	if (period < 1 || end < period) return null;
	let sum = 0;
	for (let index = end - period; index < end; index += 1) sum += values[index];
	return sum / period;
}
function rsiFrom(gains, losses) {
	if (gains === 0 && losses === 0) return 50;
	if (losses === 0) return 100;
	if (gains === 0) return 0;
	return 100 - 100 / (1 + gains / losses);
}
function rsiSeries(closes, period) {
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
	values[period] = rsiFrom(gains, losses);
	for (let index = period + 1; index < closes.length; index += 1) {
		const diff = closes[index] - closes[index - 1];
		gains = (gains * (period - 1) + Math.max(diff, 0)) / period;
		losses = (losses * (period - 1) + Math.max(-diff, 0)) / period;
		values[index] = rsiFrom(gains, losses);
	}
	return values;
}
function emaSeries(values, period) {
	const result = new Array(values.length).fill(null);
	if (values.length < period) return result;
	let sum = 0;
	for (let index = 0; index < period; index += 1) sum += values[index];
	let previous = sum / period;
	result[period - 1] = previous;
	const alpha = 2 / (period + 1);
	for (let index = period; index < values.length; index += 1) {
		previous = values[index] * alpha + previous * (1 - alpha);
		result[index] = previous;
	}
	return result;
}
function macdSnapshot(closes, config) {
	const fast = emaSeries(closes, config.macdFast);
	const slow = emaSeries(closes, config.macdSlow);
	const first = Math.max(config.macdFast, config.macdSlow) - 1;
	const line = [];
	for (let index = first; index < closes.length; index += 1) line.push(fast[index] - slow[index]);
	const signal = emaSeries(line, config.macdSignal);
	const hist = line.map((value, index) => (signal[index] === null ? null : value - signal[index]));
	const last = hist.length - 1;
	return {
		line: line[last],
		signal: signal[last],
		hist: hist[last],
		prevHist: last >= 1 ? hist[last - 1] : null,
		prevLine: last >= 1 ? line[last - 1] : null,
		prevSignal: last >= 1 ? signal[last - 1] : null
	};
}
// Wilder ATR as a full series (null before `period`), used both for the current
// ATR and for the ATR percentile.
function atrSeries(highs, lows, closes, period) {
	if (!highs || !lows || highs.length !== closes.length || lows.length !== closes.length) return null;
	const series = new Array(closes.length).fill(null);
	if (closes.length < period + 1) return series;
	const ranges = [];
	for (let index = 1; index < closes.length; index += 1) {
		const previousClose = closes[index - 1];
		ranges.push(Math.max(highs[index] - lows[index], Math.abs(highs[index] - previousClose), Math.abs(lows[index] - previousClose)));
	}
	let atr = mean(ranges.slice(0, period));
	series[period] = atr;
	for (let index = period + 1; index < closes.length; index += 1) {
		atr = (atr * (period - 1) + ranges[index - 1]) / period;
		series[index] = atr;
	}
	return series;
}
function relativeChange(closes, lookback) {
	const index = closes.length - 1 - lookback;
	if (index < 0 || !(closes[index] > 0)) return null;
	return ((closes[closes.length - 1] - closes[index]) / closes[index]) * 100;
}

// KDJ(9) with RSV, K/D seeded at 50 and J = 3K - 2D (J is not clamped).
function kdjSnapshot(highs, lows, closes) {
	if (!highs || !lows || highs.length !== closes.length || lows.length !== closes.length) return { k: null, d: null, j: null };
	if (closes.length < KDJ_WINDOW) return { k: null, d: null, j: null };
	let k = 50;
	let d = 50;
	for (let index = KDJ_WINDOW - 1; index < closes.length; index += 1) {
		let highest = -Infinity;
		let lowest = Infinity;
		for (let cursor = index - KDJ_WINDOW + 1; cursor <= index; cursor += 1) {
			if (highs[cursor] > highest) highest = highs[cursor];
			if (lows[cursor] < lowest) lowest = lows[cursor];
		}
		const rsv = highest > lowest ? ((closes[index] - lowest) / (highest - lowest)) * 100 : 50;
		k = (2 * k + rsv) / 3;
		d = (2 * d + k) / 3;
	}
	return { k: round(k, 2), d: round(d, 2), j: round(3 * k - 2 * d, 2) };
}
function cciValue(highs, lows, closes) {
	if (!highs || !lows || highs.length !== closes.length || lows.length !== closes.length) return null;
	if (closes.length < CCI_WINDOW) return null;
	const typical = [];
	for (let index = closes.length - CCI_WINDOW; index < closes.length; index += 1) typical.push((highs[index] + lows[index] + closes[index]) / 3);
	const meanTp = mean(typical);
	const deviation = mean(typical.map((value) => Math.abs(value - meanTp)));
	if (!(deviation > 0)) return null;
	return round((typical[typical.length - 1] - meanTp) / (0.015 * deviation), 2);
}
function williamsRValue(highs, lows, closes) {
	if (!highs || !lows || highs.length !== closes.length || lows.length !== closes.length) return null;
	if (closes.length < WILLIAMS_WINDOW) return null;
	let highest = -Infinity;
	let lowest = Infinity;
	for (let index = closes.length - WILLIAMS_WINDOW; index < closes.length; index += 1) {
		if (highs[index] > highest) highest = highs[index];
		if (lows[index] < lowest) lowest = lows[index];
	}
	if (!(highest > lowest)) return null;
	return round(((highest - closes[closes.length - 1]) / (highest - lowest)) * -100, 2);
}
// ADX/DMI with Wilder smoothing; seeds are sums over the first `period` bars,
// then the classic Wilder recursion. Returns nulls when highs/lows are missing.
function adxSnapshot(highs, lows, closes, period) {
	const empty = { adx: null, plusDi: null, minusDi: null };
	if (!highs || !lows || highs.length !== closes.length || lows.length !== closes.length) return empty;
	if (closes.length < period * 2 + 1) return empty;
	const tr = [];
	const plusDm = [];
	const minusDm = [];
	for (let index = 1; index < closes.length; index += 1) {
		const upMove = highs[index] - highs[index - 1];
		const downMove = lows[index - 1] - lows[index];
		plusDm.push(upMove > downMove && upMove > 0 ? upMove : 0);
		minusDm.push(downMove > upMove && downMove > 0 ? downMove : 0);
		tr.push(Math.max(highs[index] - lows[index], Math.abs(highs[index] - closes[index - 1]), Math.abs(lows[index] - closes[index - 1])));
	}
	let smoothedTr = 0;
	let smoothedPlus = 0;
	let smoothedMinus = 0;
	for (let index = 0; index < period; index += 1) {
		smoothedTr += tr[index];
		smoothedPlus += plusDm[index];
		smoothedMinus += minusDm[index];
	}
	let dxSum = 0;
	let adx = null;
	let plusDi = 0;
	let minusDi = 0;
	for (let index = period - 1; index < tr.length; index += 1) {
		if (index > period - 1) {
			smoothedTr = smoothedTr - smoothedTr / period + tr[index];
			smoothedPlus = smoothedPlus - smoothedPlus / period + plusDm[index];
			smoothedMinus = smoothedMinus - smoothedMinus / period + minusDm[index];
		}
		plusDi = smoothedTr > 0 ? (100 * smoothedPlus) / smoothedTr : 0;
		minusDi = smoothedTr > 0 ? (100 * smoothedMinus) / smoothedTr : 0;
		const sum = plusDi + minusDi;
		const dx = sum > 0 ? (100 * Math.abs(plusDi - minusDi)) / sum : 0;
		if (adx === null) {
			dxSum += dx;
			if (index - period + 1 === period - 1) {
				adx = dxSum / period;
			}
		} else {
			adx = (adx * (period - 1) + dx) / period;
		}
	}
	if (adx === null) return empty;
	return { adx: round(adx, 2), plusDi: round(plusDi, 2), minusDi: round(minusDi, 2) };
}
function volumeStats(volumes, config) {
	if (!volumes) return { volumeRatio: null, volumeTrend: null };
	const previousMean = smaAt(volumes, config.volumePeriod, volumes.length - 1);
	const volumeRatio = previousMean !== null && previousMean > 0 ? volumes[volumes.length - 1] / previousMean : null;
	const fast = smaAt(volumes, 5, volumes.length);
	const slow = smaAt(volumes, 20, volumes.length);
	const volumeTrend = fast !== null && slow !== null && slow > 0 ? fast / slow : null;
	return { volumeRatio: round(volumeRatio, 3), volumeTrend: round(volumeTrend, 3) };
}
function obvSlopePct(volumes, closes) {
	if (!volumes || closes.length < 11) return null;
	const obvValues = [0];
	let obv = 0;
	for (let index = 1; index < closes.length; index += 1) {
		if (closes[index] > closes[index - 1]) obv += volumes[index];
		else if (closes[index] < closes[index - 1]) obv -= volumes[index];
		obvValues.push(obv);
	}
	const change = obvValues[obvValues.length - 1] - obvValues[obvValues.length - 11];
	let total = 0;
	for (let index = closes.length - 10; index < closes.length; index += 1) total += volumes[index];
	if (!(total > 0)) return null;
	return round((change / total) * 100, 2);
}
// Breakout uses the previous `days` bars (today excluded).
function breakoutState(highs, lows, closes, days) {
	if (!highs || !lows || highs.length !== closes.length || lows.length !== closes.length) return { breakout20: null, breakdown20: null };
	if (closes.length < days + 1) return { breakout20: null, breakdown20: null };
	let highest = -Infinity;
	let lowest = Infinity;
	for (let index = closes.length - 1 - days; index < closes.length - 1; index += 1) {
		if (highs[index] > highest) highest = highs[index];
		if (lows[index] < lowest) lowest = lows[index];
	}
	const price = closes[closes.length - 1];
	return { breakout20: price > highest, breakdown20: price < lowest };
}
// 60-bar high/low including today; falls back to closes without highs/lows.
function highLowStats(highs, lows, closes) {
	const window = Math.min(PERCENTILE_WINDOW, closes.length);
	const highSource = highs ?? closes;
	const lowSource = lows ?? closes;
	const start = closes.length - window;
	let high60 = -Infinity;
	let low60 = Infinity;
	for (let index = start; index < closes.length; index += 1) {
		if (highSource[index] > high60) high60 = highSource[index];
		if (lowSource[index] < low60) low60 = lowSource[index];
	}
	const price = closes[closes.length - 1];
	return {
		high60,
		low60,
		distanceHigh60Pct: high60 > 0 ? round(((price - high60) / high60) * 100, 2) : null,
		distanceLow60Pct: low60 > 0 ? round(((price - low60) / low60) * 100, 2) : null
	};
}
function bandwidthSeries(closes, config) {
	const values = [];
	if (closes.length < config.bollPeriod) return values;
	for (let index = config.bollPeriod - 1; index < closes.length; index += 1) {
		const window = closes.slice(index - config.bollPeriod + 1, index + 1);
		const middle = mean(window);
		if (!(middle > 0)) {
			values.push(null);
			continue;
		}
		const deviation = Math.sqrt(mean(window.map((value) => (value - middle) ** 2)));
		values.push(((2 * config.bollMult * deviation) / middle) * 100);
	}
	return values;
}
function percentileRank(values, current) {
	if (!Number.isFinite(current) || values.length === 0) return null;
	let atOrBelow = 0;
	for (const value of values) if (value <= current) atOrBelow += 1;
	return round((atOrBelow / values.length) * 100, 2);
}
function macdCrossValue(macd) {
	if (macd.prevLine === null || macd.prevSignal === null || macd.line === null || macd.signal === null) return null;
	if (macd.prevLine <= macd.prevSignal && macd.line > macd.signal) return "golden";
	if (macd.prevLine >= macd.prevSignal && macd.line < macd.signal) return "death";
	return null;
}
// RSI divergence against the bar 20 bars back. Bullish: lower low (>0.1%) with
// RSI higher by >1; bearish: higher high (>0.1%) with RSI lower by >1.
function rsiDivergence(highs, lows, closes, rsiValues) {
	if (!rsiValues || closes.length < 22) return null;
	const last = closes.length - 1;
	const previous = last - 20;
	const currentRsi = rsiValues[last];
	const previousRsi = rsiValues[previous];
	if (currentRsi === null || previousRsi === null) return null;
	const lowSource = lows ?? closes;
	const highSource = highs ?? closes;
	const currentLow = lowSource[last];
	const previousLow = lowSource[previous];
	if (Number.isFinite(currentLow) && Number.isFinite(previousLow) && previousLow > 0 && currentLow < previousLow * 0.999 && currentRsi > previousRsi + 1) return "bullish";
	const currentHigh = highSource[last];
	const previousHigh = highSource[previous];
	if (Number.isFinite(currentHigh) && Number.isFinite(previousHigh) && previousHigh > 0 && currentHigh > previousHigh * 1.001 && currentRsi < previousRsi - 1) return "bearish";
	return null;
}
function candlePattern(highs, lows, closes) {
	if (!highs || !lows || highs.length !== closes.length || lows.length !== closes.length) return null;
	if (closes.length < 3) return null;
	const last = closes.length - 1;
	const price = closes[last];
	const previousClose = closes[last - 1];
	const previousPreviousClose = closes[last - 2];
	const high = highs[last];
	const low = lows[last];
	const previousHigh = highs[last - 1];
	const previousLow = lows[last - 1];
	const range = high - low;
	if (!(range > 0)) return null;
	const body = Math.abs(price - previousClose);
	const upperWick = high - Math.max(price, previousClose);
	const lowerWick = Math.min(price, previousClose) - low;
	if (price > previousClose && previousClose < previousPreviousClose && high >= previousHigh && low <= previousLow) return "bullish-engulfing";
	if (price < previousClose && previousClose > previousPreviousClose && high >= previousHigh && low <= previousLow) return "bearish-engulfing";
	if (body <= range * 0.1) return "doji";
	if (body > 0 && lowerWick >= body * 2 && upperWick <= body) return "hammer";
	if (body > 0 && upperWick >= body * 2 && lowerWick <= body) return "shooting-star";
	return null;
}

export function computeIndicators(input = {}) {
	const config = normalizeTaConfig(input?.config);
	const closes = sanitizeSeries(input?.closes);
	if (!closes) return null;
	const bars = closes.length;
	const price = closes[bars - 1];
	if (!(price > 0)) return null;
	const minimum = Math.max(
		config.maSlow + 1,
		config.rsiPeriod + 1,
		config.macdFast + config.macdSignal,
		config.macdSlow + config.macdSignal,
		config.bollPeriod + 1,
		config.maLong + 1,
		config.adxPeriod * 2 + 1,
		config.breakoutDays + 2,
		61
	);
	if (bars < minimum) return null;
	const highs = sanitizeSeries(input?.highs);
	const lows = sanitizeSeries(input?.lows);
	const volumes = sanitizeVolumes(input?.volumes);
	const volumeSeries = volumes && volumes.length === bars ? volumes : null;
	const highSeries = highs && highs.length === bars ? highs : null;
	const lowSeries = lows && lows.length === bars ? lows : null;
	const maFast = smaAt(closes, config.maFast, bars);
	const maSlow = smaAt(closes, config.maSlow, bars);
	const maFastPrev = smaAt(closes, config.maFast, bars - 1);
	const maSlowPrev = smaAt(closes, config.maSlow, bars - 1);
	const maLong = smaAt(closes, config.maLong, bars);
	const maLongPrev = smaAt(closes, config.maLong, bars - 1);
	const maLongPrev5 = smaAt(closes, config.maLong, bars - 5);
	const maLongSlopePct = maLong !== null && maLongPrev5 !== null && maLongPrev5 !== 0 ? ((maLong - maLongPrev5) / maLongPrev5) * 100 : null;
	const priceVsMaSlowPct = maSlow !== null && maSlow !== 0 ? ((price / maSlow) - 1) * 100 : null;
	const priceVsMaLongPct = maLong !== null && maLong !== 0 ? ((price / maLong) - 1) * 100 : null;
	const maAlignment = maFast !== null && maSlow !== null && maLong !== null
		? (price > maFast && maFast > maSlow && maSlow > maLong ? "bull" : price < maFast && maFast < maSlow && maSlow < maLong ? "bear" : "mixed")
		: "mixed";
	const rsiValues = rsiSeries(closes, config.rsiPeriod);
	const rsi = rsiValues[bars - 1];
	const rsiPrev = rsiValues[bars - 2];
	const macd = macdSnapshot(closes, config);
	const bollWindow = closes.slice(bars - config.bollPeriod);
	const bollMiddle = mean(bollWindow);
	const bollStd = Math.sqrt(mean(bollWindow.map((value) => (value - bollMiddle) ** 2)));
	const bollUpper = bollMiddle + config.bollMult * bollStd;
	const bollLower = bollMiddle - config.bollMult * bollStd;
	const percentB = bollUpper > bollLower ? (price - bollLower) / (bollUpper - bollLower) : null;
	const atrValues = atrSeries(highSeries, lowSeries, closes, config.atrPeriod);
	const atr = atrValues ? atrValues[bars - 1] : null;
	const atrPct = atr === null ? null : (atr / price) * 100;
	const change5dPct = relativeChange(closes, 5);
	const change7dPct = relativeChange(closes, 7);
	const change20dPct = relativeChange(closes, 20);
	const windowSize = Math.min(20, bars);
	const swingHigh20 = Math.max(...(highSeries ?? closes).slice(bars - windowSize));
	const swingLow20 = Math.min(...(lowSeries ?? closes).slice(bars - windowSize));
	const rangePosition = swingHigh20 > swingLow20 ? clamp((price - swingLow20) / (swingHigh20 - swingLow20), 0, 1) : 0.5;
	const components = {
		ma: 0.5 * sign(price - maFast) + 0.3 * sign(price - maSlow) + 0.2 * sign(maFast - maSlow),
		momentum: change5dPct === null || macd.hist === null ? null : 0.5 * Math.tanh(change5dPct / 5) + 0.5 * Math.tanh((macd.hist / price) * 100 / 1.5),
		range: rangePosition === null ? null : 2 * rangePosition - 1
	};
	const weights = STYLE_WEIGHTS[config.style];
	let weighted = 0;
	let totalWeight = 0;
	for (const key of ["ma", "momentum", "range"]) {
		const component = components[key];
		if (component === null) continue;
		weighted += component * weights[key];
		totalWeight += Math.abs(weights[key]);
	}
	const trendScore = totalWeight > 0 ? clamp(weighted / totalWeight, -1, 1) : 0;
	const trend = {
		label: trendScore >= config.threshold ? "多头" : trendScore <= -config.threshold ? "空头" : "震荡",
		score: round(trendScore, 4),
		threshold: config.threshold,
		components: { ma: round(components.ma, 4), momentum: round(components.momentum, 4), range: round(components.range, 4) }
	};
	const kdj = kdjSnapshot(highSeries, lowSeries, closes);
	const cci = cciValue(highSeries, lowSeries, closes);
	const williamsR = williamsRValue(highSeries, lowSeries, closes);
	const adx = adxSnapshot(highSeries, lowSeries, closes, config.adxPeriod);
	const volume = volumeStats(volumeSeries, config);
	const obv = volumeSeries ? obvSlopePct(volumeSeries, closes) : null;
	const breakout = breakoutState(highSeries, lowSeries, closes, config.breakoutDays);
	const highLow = highLowStats(highSeries, lowSeries, closes);
	const bandwidthPct = bollMiddle > 0 ? ((bollUpper - bollLower) / bollMiddle) * 100 : null;
	const bandwidthHistory = bandwidthSeries(closes, config).slice(-PERCENTILE_WINDOW).filter((value) => value !== null);
	const bandwidthPercentile = percentileRank(bandwidthHistory, bandwidthPct);
	const atrHistory = atrValues ? atrValues.slice(-PERCENTILE_WINDOW).filter((value) => value !== null) : [];
	const atrPercentile = percentileRank(atrHistory, atr);
	const macdCross = macdCrossValue(macd);
	const divergence = rsiDivergence(highSeries, lowSeries, closes, rsiValues);
	const candle = candlePattern(highSeries, lowSeries, closes);
	return {
		price, bars, maFast, maSlow, maFastPrev, maSlowPrev, rsi, rsiPrev,
		macd: { line: macd.line, signal: macd.signal, hist: macd.hist, prevHist: macd.prevHist },
		boll: { upper: bollUpper, middle: bollMiddle, lower: bollLower, percentB },
		atr, atrPct, change5dPct, change7dPct, change20dPct,
		rangePosition, swingHigh20, swingLow20, trend,
		values: { rsi, macdHist: macd.hist, atrPct, percentB },
		// ---- 0.6.0 additions ----
		maLong, maLongPrev,
		maLongSlopePct: round(maLongSlopePct, 3),
		priceVsMaSlowPct: round(priceVsMaSlowPct, 3),
		priceVsMaLongPct: round(priceVsMaLongPct, 3),
		maAlignment,
		kdj,
		cci,
		williamsR,
		adx,
		volumeRatio: volume.volumeRatio,
		volumeTrend: volume.volumeTrend,
		obvSlopePct: obv,
		breakout20: breakout.breakout20,
		breakdown20: breakout.breakdown20,
		high60: round(highLow.high60, 6),
		low60: round(highLow.low60, 6),
		distanceHigh60Pct: highLow.distanceHigh60Pct,
		distanceLow60Pct: highLow.distanceLow60Pct,
		bandwidthPct: round(bandwidthPct, 3),
		bandwidthPercentile,
		atrPercentile,
		macdCross,
		rsiDivergence: divergence,
		candle
	};
}

function formatPrice(value) {
	if (!Number.isFinite(value)) return "—";
	const absolute = Math.abs(value);
	let text;
	if (absolute >= 1000) text = String(Math.round(value));
	else if (absolute >= 0.01) text = String(Number(value.toFixed(2)));
	else text = String(Number(value.toPrecision(4)));
	const negative = text.startsWith("-");
	const [integer, fraction = ""] = (negative ? text.slice(1) : text).split(".");
	const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return `${negative ? "-" : ""}${grouped}${fraction ? `.${fraction}` : ""}`;
}

// Deterministic rule-based readout. base = trend.score * 60 then a style
// adjustment; action thresholds are 45/20/-20/-45. "买入" is downgraded when
// RSI > 75 (extremely overbought).
export function evaluateStrategy(input = {}) {
	const indicators = input?.indicators;
	if (!indicators || !indicators.trend) return null;
	const config = normalizeTaConfig(input?.config);
	const price = finiteOrNull(input?.price) ?? finiteOrNull(indicators.price);
	if (price === null || !(price > 0)) return null;
	const trend = indicators.trend;
	const rsi = finiteOrNull(indicators.rsi);
	const hist = finiteOrNull(indicators.macd?.hist);
	// MACD hist sign drives several rules; treat float noise around zero
	// (|hist| <= price * 1e-9) as neutral instead of a bullish/bearish vote.
	const histSign = hist === null || Math.abs(hist) <= price * 1e-9 ? 0 : hist > 0 ? 1 : -1;
	const percentB = finiteOrNull(indicators.boll?.percentB);
	const maFast = finiteOrNull(indicators.maFast);
	const maSlow = finiteOrNull(indicators.maSlow);
	const reasons = [];
	let score = trend.score * 60;
	if (config.style === "meanrev") {
		// Extreme RSI + %B replaces the muted trend base; the deep-oversold
		// bonus only applies outside that branch to avoid double counting.
		if (rsi !== null && percentB !== null && rsi < 30 && percentB < 0.15) {
			score = 35;
			reasons.push(`RSI(${config.rsiPeriod}) ${rsi.toFixed(1)} 低于 30 且 %B ${percentB.toFixed(2)} 低于 0.15，超跌关注反弹`);
		} else if (rsi !== null && percentB !== null && rsi > 70 && percentB > 0.85) {
			score = -35;
			reasons.push(`RSI(${config.rsiPeriod}) ${rsi.toFixed(1)} 高于 70 且 %B ${percentB.toFixed(2)} 高于 0.85，短线过热`);
		} else {
			score = trend.score * 60 * 0.35;
			if (rsi !== null && rsi < 25) score += 10;
		}
	} else if (config.style === "trend") {
		const alignedBull = histSign > 0 && maFast !== null && maSlow !== null && price > maFast && price > maSlow && maFast > maSlow;
		const alignedBear = histSign < 0 && maFast !== null && maSlow !== null && price < maFast && price < maSlow && maFast < maSlow;
		if (alignedBull) score += 10;
		else if (alignedBear) score -= 10;
		if (rsi !== null && rsi > 75) score -= 15;
	} else if (config.style === "momentum") {
		if (hist !== null) score += histSign * 10;
		if (rsi !== null && rsi > 75) score -= 15;
		else if (rsi !== null && rsi < 30) score -= 5;
	} else {
		if (rsi !== null) {
			if (rsi > 70) score -= 10;
			else if (rsi < 30) score += 10;
		}
		if (hist !== null) score += histSign * 8;
	}
	const finalScore = Math.round(clamp(score, -100, 100) * 10) / 10;
	let action = finalScore >= 45 ? "buy" : finalScore >= 20 ? "add" : finalScore <= -45 ? "reduce" : finalScore <= -20 ? "watch" : "hold";
	if (action === "buy" && rsi !== null && rsi > 75) action = finalScore >= 20 ? "add" : "hold";
	reasons.push(config.style === "meanrev" ? `均值回归评分 ${trend.score.toFixed(2)}` : `趋势${trend.label}，评分 ${trend.score.toFixed(2)}`);
	if (maSlow !== null) reasons.push(`价格 ${formatPrice(price)} ${price >= maSlow ? "高于" : "低于"} MA${config.maSlow} ${formatPrice(maSlow)}`);
	if (rsi !== null) reasons.push(`RSI(${config.rsiPeriod}) ${rsi.toFixed(1)}${rsi >= 70 ? "，超买" : rsi <= 30 ? "，超卖" : "，中性"}`);
	if (hist !== null) reasons.push(`MACD 柱 ${hist.toFixed(2)}，${histSign > 0 ? "多头动能" : histSign < 0 ? "空头动能" : "动能持平"}`);
	const atr = finiteOrNull(indicators.atr);
	const swingHigh = finiteOrNull(indicators.swingHigh20);
	const swingLow = finiteOrNull(indicators.swingLow20);
	let levels = null;
	if (atr !== null && atr > 0 && swingHigh !== null && swingLow !== null) {
		const stopLong = price - 2 * atr;
		const targetLong = price + 3 * atr;
		const riskPct = ((price - stopLong) / price) * 100;
		const rewardPct = ((targetLong - price) / price) * 100;
		levels = {
			support: Math.min(swingLow, stopLong),
			resistance: Math.max(swingHigh, targetLong),
			stopLong, targetLong, riskPct, rewardPct,
			rr: riskPct > 0 ? Math.round((rewardPct / riskPct) * 10) / 10 : null
		};
	}
	return { action, label: ACTION_LABELS[action], score: finalScore, reasons: reasons.slice(0, 4), levels };
}

