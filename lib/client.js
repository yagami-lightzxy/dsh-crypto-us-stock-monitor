window.__ModuleLoader__.load({
	id: "dsh-crypto-us-stock-monitor",
	factory: (require) => {
		const module = { exports: {} };
		const exports = module.exports;

		const PLUGIN_ID = "dsh-crypto-us-stock-monitor";
		const API_PREFIX = "/plugins/" + PLUGIN_ID + "/api";
		const STATE_URL = API_PREFIX + "/state";
		const QUOTES_URL = API_PREFIX + "/quotes";
		const MARKET_URL = API_PREFIX + "/market";
		const SEARCH_URL = API_PREFIX + "/search";
		const SERIES_URL = API_PREFIX + "/series";

		const SETTINGS_KEY = "dsh.monitor.settings.v2";
		const LEGACY_SETTINGS_KEY = "dsh.binance-bitget.settings.v1";
		const PRESETS_KEY = "dsh.monitor.presets.v2";
		const LEGACY_PRESETS_KEY = "dsh.binance-bitget.presets.v1";
		const ALERTS_KEY = "dsh.monitor.alerts.v2";
		const LEGACY_ALERTS_KEY = "dsh.binance-bitget.alerts.v1";
		const VIEW_KEY = "dsh.monitor.view.v1";
		const FILTER_KEY = "dsh.monitor.filter.v1";

		const MAX_CRYPTO = 30;
		const MAX_STOCKS = 12;
		const CRYPTO_RE = /^[A-Z0-9]{5,20}$/;
		const STOCK_RE = /^[A-Z][A-Z0-9.\-]{0,9}$/;
		const DEFAULT_CRYPTO = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
		const DEFAULT_STOCKS = ["SPY", "QQQ", "NVDA", "AAPL"];
		const STABLE_QUOTES = ["USDT", "USDC", "FDUSD", "BUSD", "TUSD", "DAI", "BRL", "EUR", "TRY"];

		const CRYPTO_NAMES = {
			BTC: "比特币", ETH: "以太坊", SOL: "Solana", BNB: "BNB", XRP: "XRP", DOGE: "狗狗币",
			ADA: "Cardano", AVAX: "Avalanche", LINK: "Chainlink", TON: "Toncoin", SUI: "Sui",
			LTC: "莱特币", BCH: "比特币现金", DOT: "Polkadot", TRX: "波场", SHIB: "Shiba",
			PEPE: "Pepe", WIF: "dogwifhat", NEAR: "NEAR", APT: "Aptos", ARB: "Arbitrum",
			OP: "Optimism", UNI: "Uniswap", ATOM: "Cosmos", FIL: "Filecoin", INJ: "Injective",
			TIA: "Celestia", SEI: "Sei", HYPE: "Hyperliquid", ENA: "Ethena", ONDO: "Ondo",
			JUP: "Jupiter", WLD: "Worldcoin", AAVE: "Aave", MKR: "Maker", LDO: "Lido",
			CRV: "Curve", RUNE: "THORChain", FET: "Fetch.ai", RNDR: "Render", GRT: "The Graph",
			IMX: "Immutable", HBAR: "Hedera", VET: "VeChain", ALGO: "Algorand", ICP: "ICP",
			QNT: "Quant", EGLD: "MultiversX", SAND: "The Sandbox", MANA: "Decentraland",
			AXS: "Axie", GALA: "Gala", CHZ: "Chiliz", PYTH: "Pyth", BONK: "Bonk", FLOKI: "Floki"
		};
		const STOCK_NAMES = {
			SPY: "标普500 ETF", QQQ: "纳指100 ETF", DIA: "道指 ETF", IWM: "罗素2000 ETF",
			NVDA: "英伟达", AAPL: "苹果", MSFT: "微软", GOOGL: "谷歌", AMZN: "亚马逊",
			META: "Meta", TSLA: "特斯拉", AMD: "AMD", NFLX: "奈飞", AVGO: "博通",
			COST: "好市多", JPM: "摩根大通", V: "Visa", MA: "万事达", UNH: "联合健康",
			LLY: "礼来", XOM: "埃克森美孚", CVX: "雪佛龙", JNJ: "强生", PG: "宝洁",
			KO: "可口可乐", PEP: "百事", WMT: "沃尔玛", DIS: "迪士尼", BA: "波音",
			CAT: "卡特彼勒", GE: "通用电气", CRM: "Salesforce", ORCL: "甲骨文", ADBE: "Adobe",
			INTC: "英特尔", MU: "美光", QCOM: "高通", PLTR: "Palantir", COIN: "Coinbase",
			MSTR: "MicroStrategy", UBER: "优步", HIMS: "Hims", MRVL: "Marvell", LITE: "Lumentum",
			SHOP: "Shopify", SNOW: "Snowflake", CRWD: "CrowdStrike", SMCI: "超微", ARM: "Arm",
			TSM: "台积电", BABA: "阿里巴巴"
		};
		const STOCK_SUGGESTIONS = [
			["SPY", "标普500 ETF"], ["QQQ", "纳指100 ETF"], ["DIA", "道指 ETF"], ["IWM", "罗素2000 ETF"],
			["NVDA", "英伟达"], ["AAPL", "苹果"], ["MSFT", "微软"], ["GOOGL", "谷歌"], ["AMZN", "亚马逊"],
			["META", "Meta"], ["TSLA", "特斯拉"], ["AMD", "AMD"], ["NFLX", "奈飞"], ["AVGO", "博通"],
			["COST", "好市多"], ["JPM", "摩根大通"], ["UNH", "联合健康"], ["LLY", "礼来"], ["XOM", "埃克森美孚"],
			["JNJ", "强生"], ["PG", "宝洁"], ["KO", "可口可乐"], ["WMT", "沃尔玛"], ["DIS", "迪士尼"],
			["BA", "波音"], ["CAT", "卡特彼勒"], ["CRM", "Salesforce"], ["ORCL", "甲骨文"], ["ADBE", "Adobe"],
			["INTC", "英特尔"], ["MU", "美光"], ["QCOM", "高通"], ["PLTR", "Palantir"], ["COIN", "Coinbase"],
			["MSTR", "MicroStrategy"], ["UBER", "优步"], ["MRVL", "Marvell"], ["SHOP", "Shopify"],
			["SNOW", "Snowflake"], ["CRWD", "CrowdStrike"], ["ARM", "Arm"], ["TSM", "台积电"], ["BABA", "阿里巴巴"]
		].map((entry) => ({ symbol: entry[0], name: entry[1] }));

		const SETTING_OPTIONS = {
			interval: [2000, 3000, 5000, 10000, 20000],
			maFast: [3, 5, 8, 10, 13, 20, 30, 50],
			maSlow: [10, 20, 30, 50, 60, 100],
			maLong: [50, 100, 120, 150, 200],
			rsiPeriod: [6, 9, 14, 21],
			atrPeriod: [7, 10, 14, 21],
			adxPeriod: [7, 14, 21],
			breakoutDays: [10, 20, 30, 55],
			volumePeriod: [10, 20, 30, 55],
			style: ["balanced", "trend", "momentum", "meanrev"]
		};

		const PRESET_BASES = ["balanced", "momentum", "rebound", "trendPullback", "breakoutRetest", "squeeze", "divergence"];
		const PRESET_BASE_LABELS = {
			balanced: "综合",
			momentum: "动量突破",
			rebound: "低位反弹",
			trendPullback: "趋势回调",
			breakoutRetest: "突破回踩",
			squeeze: "布林收口",
			divergence: "量价背离"
		};
		const STYLE_LABELS = { balanced: "综合", trend: "趋势", momentum: "动量", meanrev: "均值回归" };
		const DEFAULT_THRESHOLDS = {
			rsiMin: 40, rsiMax: 70, adxMin: 0, volRatio: 0.8,
			percentBMax: 0.95, distHigh: -5, bbPctMax: 100, stopAtr: 2, rr: 1.5
		};
		const PRESET_BUILTINS = [
			{
				id: "balanced", name: "综合", base: "balanced", desc: "趋势 + 动量 + 区间综合判断",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "balanced" },
				thresholds: DEFAULT_THRESHOLDS
			},
			{
				id: "momentum", name: "动量突破", base: "momentum", desc: "放量突破 20 日高点 + 趋势向上",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "momentum" },
				thresholds: { rsiMin: 50, rsiMax: 78, adxMin: 20, volRatio: 1.3, percentBMax: 1, distHigh: -5, bbPctMax: 100, stopAtr: 2, rr: 2 }
			},
			{
				id: "rebound", name: "低位反弹", base: "rebound", desc: "超跌 + 布林下轨 + 动能改善",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.25, style: "meanrev" },
				thresholds: { rsiMin: 20, rsiMax: 35, adxMin: 0, volRatio: 0.8, percentBMax: 0.2, distHigh: -15, bbPctMax: 100, stopAtr: 1.5, rr: 2 }
			},
			{
				id: "trendPullback", name: "趋势回调", base: "trendPullback", desc: "长期趋势向上，回踩均线且未破位",
				params: { maFast: 10, maSlow: 30, maLong: 100, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "trend" },
				thresholds: { rsiMin: 38, rsiMax: 62, adxMin: 25, volRatio: 0.8, percentBMax: 0.8, distHigh: -3, bbPctMax: 100, stopAtr: 2, rr: 2 }
			},
			{
				id: "breakoutRetest", name: "突破回踩", base: "breakoutRetest", desc: "突破后缩量回踩，守住突破位",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "momentum" },
				thresholds: { rsiMin: 45, rsiMax: 70, adxMin: 15, volRatio: 1.2, percentBMax: 0.9, distHigh: -3, bbPctMax: 100, stopAtr: 1.5, rr: 2 }
			},
			{
				id: "squeeze", name: "布林收口", base: "squeeze", desc: "波动率压缩到低位，等待方向选择",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.15, style: "balanced" },
				thresholds: { rsiMin: 40, rsiMax: 65, adxMin: 0, volRatio: 0.8, percentBMax: 0.8, distHigh: -8, bbPctMax: 20, stopAtr: 1.5, rr: 2 }
			},
			{
				id: "divergence", name: "量价背离", base: "divergence", desc: "价格新低但 RSI 抬高，动能背离",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "meanrev" },
				thresholds: { rsiMin: 20, rsiMax: 45, adxMin: 0, volRatio: 0.8, percentBMax: 0.4, distHigh: -10, bbPctMax: 100, stopAtr: 1.5, rr: 2 }
			}
		];

		const DEFAULT_SETTINGS = {
			interval: 5000,
			maFast: 5, maSlow: 20, maLong: 50,
			rsiPeriod: 14, macd: "12,26,9", boll: "20,2",
			atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20,
			threshold: 0.2, style: "balanced", presetId: "balanced",
			showSignals: true, showMarket: true, showAlerts: true,
			notifyDesktop: false, onlyOpps: false, sort: "default"
		};

		// ---------------- storage ----------------

		function readJson(key) {
			try {
				const raw = window.localStorage.getItem(key);
				if (!raw) return null;
				return JSON.parse(raw);
			} catch (error) {
				return null;
			}
		}
		function writeJson(key, value) {
			try {
				window.localStorage.setItem(key, JSON.stringify(value));
			} catch (error) {
				// storage full or blocked: keep the in-memory value
			}
		}

		// ---------------- math / format ----------------

		function clamp(value, min, max) {
			const number = Number(value);
			if (!Number.isFinite(number)) return min;
			return Math.max(min, Math.min(max, number));
		}
		function isNum(value) {
			return Number.isFinite(Number(value)) && value !== null && value !== "";
		}
		function formatPrice(value) {
			if (!isNum(value)) return "--";
			const number = Number(value);
			if (Math.abs(number) >= 1000) return number.toLocaleString("zh-CN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
			if (Math.abs(number) >= 100) return number.toFixed(2);
			if (Math.abs(number) >= 1) return number.toFixed(number >= 100 ? 2 : 3).replace(/0+$/, "").replace(/\.$/, "");
			if (Math.abs(number) >= 0.01) return number.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
			return number.toPrecision(4);
		}
		function formatPct(value, digits) {
			if (!isNum(value)) return "--";
			const number = Number(value);
			const fixed = Number.isFinite(Number(digits)) ? Number(digits) : 2;
			return (number >= 0 ? "+" : "") + number.toFixed(fixed) + "%";
		}
		function formatNum(value, digits) {
			if (!isNum(value)) return "--";
			return Number(value).toFixed(Number.isFinite(Number(digits)) ? Number(digits) : 1);
		}
		function formatCompact(value) {
			if (!isNum(value)) return "--";
			const number = Math.abs(Number(value));
			if (number >= 1e12) return (Number(value) / 1e12).toFixed(2) + " 万亿";
			if (number >= 1e8) return (Number(value) / 1e8).toFixed(2) + " 亿";
			if (number >= 1e4) return (Number(value) / 1e4).toFixed(2) + " 万";
			return String(Math.round(Number(value)));
		}
		function formatClock(ts) {
			if (!Number.isFinite(Number(ts)) || Number(ts) <= 0) return "--:--:--";
			const date = new Date(Number(ts));
			return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0");
		}
		function formatAge(ts) {
			if (!Number.isFinite(Number(ts)) || Number(ts) <= 0) return "";
			const seconds = Math.max(0, Math.round((Date.now() - Number(ts)) / 1000));
			if (seconds < 5) return "刚刚";
			if (seconds < 60) return seconds + " 秒前";
			if (seconds < 3600) return Math.round(seconds / 60) + " 分钟前";
			return Math.round(seconds / 3600) + " 小时前";
		}
		function splitPair(symbol) {
			const upper = String(symbol || "").toUpperCase();
			for (const quote of STABLE_QUOTES) {
				if (upper.endsWith(quote) && upper.length > quote.length) return { base: upper.slice(0, -quote.length), quote: quote };
			}
			return { base: upper, quote: "" };
		}
		function displayCryptoSymbol(symbol) {
			return splitPair(symbol).base || String(symbol || "");
		}
		function cryptoName(symbol) {
			const base = splitPair(symbol).base;
			return CRYPTO_NAMES[base] || base || String(symbol || "");
		}
		function stockName(symbol, fallback) {
			if (fallback && String(fallback).trim()) return String(fallback).trim();
			return STOCK_NAMES[String(symbol || "").toUpperCase()] || String(symbol || "");
		}
		function changeTone(value) {
			if (!isNum(value)) return "flat";
			const number = Number(value);
			if (number > 0) return "up";
			if (number < 0) return "down";
			return "flat";
		}
		function trendTone(label) {
			if (label === "多头") return "up";
			if (label === "空头") return "down";
			return "warn";
		}
		function signalTone(tone) {
			if (tone === "buy") return "up";
			if (tone === "add") return "accent";
			if (tone === "watch") return "warn";
			return "muted";
		}
		function rangePosition(price, low, high) {
			const p = Number(price);
			const l = Number(low);
			const h = Number(high);
			if (!Number.isFinite(p) || !Number.isFinite(l) || !Number.isFinite(h) || h <= l) return null;
			return clamp((p - l) / (h - l), 0, 1);
		}
		function uniqueList(list, pattern, limit, extra) {
			const source = Array.isArray(list) ? list : [];
			const seen = new Set();
			const out = [];
			for (const item of source) {
				const symbol = String(item || "").toUpperCase();
				if (!pattern.test(symbol) || seen.has(symbol)) continue;
				seen.add(symbol);
				out.push(symbol);
				if (out.length >= limit) break;
			}
			for (const item of Array.isArray(extra) ? extra : []) {
				const symbol = String(item || "").toUpperCase();
				if (!pattern.test(symbol) || seen.has(symbol)) continue;
				seen.add(symbol);
				out.push(symbol);
				if (out.length >= limit) break;
			}
			return out;
		}

		// ---------------- settings ----------------

		function normalizeThresholds(raw) {
			const source = raw && typeof raw === "object" ? raw : {};
			const number = (value, fallback, min, max, digits) => {
				const parsed = Number(value);
				if (!Number.isFinite(parsed)) return fallback;
				const factor = Math.pow(10, Number.isFinite(Number(digits)) ? Number(digits) : 2);
				return clamp(Math.round(parsed * factor) / factor, min, max);
			};
			let rsiMin = number(source.rsiMin, DEFAULT_THRESHOLDS.rsiMin, 0, 100, 0);
			let rsiMax = number(source.rsiMax, DEFAULT_THRESHOLDS.rsiMax, 0, 100, 0);
			if (rsiMin >= rsiMax) {
				const swap = rsiMin;
				rsiMin = rsiMax;
				rsiMax = swap;
			}
			return {
				rsiMin: rsiMin,
				rsiMax: rsiMax,
				adxMin: number(source.adxMin, DEFAULT_THRESHOLDS.adxMin, 0, 60, 0),
				volRatio: number(source.volRatio, DEFAULT_THRESHOLDS.volRatio, 0.2, 5, 1),
				percentBMax: number(source.percentBMax, DEFAULT_THRESHOLDS.percentBMax, 0, 1.5, 2),
				distHigh: number(source.distHigh, DEFAULT_THRESHOLDS.distHigh, -60, 0, 0),
				bbPctMax: number(source.bbPctMax, DEFAULT_THRESHOLDS.bbPctMax, 0, 100, 0),
				stopAtr: number(source.stopAtr, DEFAULT_THRESHOLDS.stopAtr, 0.5, 5, 1),
				rr: number(source.rr, DEFAULT_THRESHOLDS.rr, 0.5, 5, 1)
			};
		}

		function normalizeSettings(raw) {
			const source = raw && typeof raw === "object" ? raw : {};
			const integer = (value, fallback, min, max) => {
				const parsed = Number(value);
				return Number.isFinite(parsed) ? clamp(Math.round(parsed), min, max) : fallback;
			};
			let maFast = integer(source.maFast, DEFAULT_SETTINGS.maFast, 3, 50);
			let maSlow = integer(source.maSlow, DEFAULT_SETTINGS.maSlow, 5, 200);
			if (maFast >= maSlow) {
				const swap = maFast;
				maFast = maSlow;
				maSlow = swap;
			}
			const interval = SETTING_OPTIONS.interval.indexOf(Number(source.interval)) >= 0 ? Number(source.interval) : DEFAULT_SETTINGS.interval;
			const macd = String(source.macd == null ? DEFAULT_SETTINGS.macd : source.macd);
			const macdParts = macd.split(",").map(Number);
			const macdValid = macdParts.length === 3 && macdParts.every((value) => Number.isFinite(value) && value >= 2 && value <= 100) && macdParts[0] < macdParts[1];
			const boll = String(source.boll == null ? DEFAULT_SETTINGS.boll : source.boll);
			const bollParts = boll.split(",").map(Number);
			const bollValid = bollParts.length === 2 && Number.isFinite(bollParts[0]) && bollParts[0] >= 5 && bollParts[0] <= 100 && Number.isFinite(bollParts[1]) && bollParts[1] >= 1 && bollParts[1] <= 4;
			const threshold = Number(source.threshold);
			return {
				interval: interval,
				maFast: maFast,
				maSlow: maSlow,
				maLong: integer(source.maLong, DEFAULT_SETTINGS.maLong, 10, 200),
				rsiPeriod: integer(source.rsiPeriod, DEFAULT_SETTINGS.rsiPeriod, 2, 50),
				macd: macdValid ? macdParts.join(",") : DEFAULT_SETTINGS.macd,
				boll: bollValid ? bollParts[0] + "," + bollParts[1] : DEFAULT_SETTINGS.boll,
				atrPeriod: integer(source.atrPeriod, DEFAULT_SETTINGS.atrPeriod, 2, 50),
				adxPeriod: integer(source.adxPeriod, DEFAULT_SETTINGS.adxPeriod, 5, 50),
				breakoutDays: integer(source.breakoutDays, DEFAULT_SETTINGS.breakoutDays, 5, 60),
				volumePeriod: integer(source.volumePeriod, DEFAULT_SETTINGS.volumePeriod, 5, 60),
				threshold: Number.isFinite(threshold) ? clamp(Math.round(threshold * 100) / 100, 0.05, 0.6) : DEFAULT_SETTINGS.threshold,
				style: SETTING_OPTIONS.style.indexOf(source.style) >= 0 ? source.style : DEFAULT_SETTINGS.style,
				presetId: typeof source.presetId === "string" && source.presetId ? source.presetId.slice(0, 48) : DEFAULT_SETTINGS.presetId,
				thresholds: normalizeThresholds(source.thresholds),
				showSignals: source.showSignals !== false,
				showMarket: source.showMarket !== false,
				showAlerts: source.showAlerts !== false,
				notifyDesktop: source.notifyDesktop === true,
				onlyOpps: source.onlyOpps === true,
				sort: ["default", "signal", "change"].indexOf(source.sort) >= 0 ? source.sort : "default"
			};
		}

		function presetParamsFromSettings(settings) {
			return {
				maFast: settings.maFast,
				maSlow: settings.maSlow,
				maLong: settings.maLong,
				rsiPeriod: settings.rsiPeriod,
				macd: settings.macd,
				boll: settings.boll,
				atrPeriod: settings.atrPeriod,
				adxPeriod: settings.adxPeriod,
				breakoutDays: settings.breakoutDays,
				volumePeriod: settings.volumePeriod,
				threshold: settings.threshold,
				style: settings.style
			};
		}

		function normalizePreset(item) {
			const raw = item && typeof item === "object" ? item : {};
			const params = normalizeSettings(Object.assign({}, DEFAULT_SETTINGS, raw.params && typeof raw.params === "object" ? raw.params : {}));
			return {
				id: typeof raw.id === "string" && /^[\w-]{1,48}$/.test(raw.id) ? raw.id : "custom-" + Date.now(),
				name: String(raw.name == null ? "自定义预设" : raw.name).trim().slice(0, 16) || "自定义预设",
				base: PRESET_BASES.indexOf(raw.base) >= 0 ? raw.base : "balanced",
				desc: String(raw.desc == null ? "" : raw.desc).trim().slice(0, 60),
				custom: true,
				params: presetParamsFromSettings(params),
				thresholds: normalizeThresholds(raw.thresholds)
			};
		}

		function loadCustomPresets() {
			const stored = readJson(PRESETS_KEY) || readJson(LEGACY_PRESETS_KEY);
			if (!Array.isArray(stored)) return [];
			const seen = new Set();
			const out = [];
			for (const item of stored) {
				const preset = normalizePreset(item);
				if (seen.has(preset.id)) continue;
				seen.add(preset.id);
				out.push(preset);
				if (out.length >= 20) break;
			}
			return out;
		}

		function loadSettings() {
			return normalizeSettings(readJson(SETTINGS_KEY) || readJson(LEGACY_SETTINGS_KEY));
		}

		function taQuery(settings) {
			return "&ma=" + settings.maFast + "," + settings.maSlow +
				"&malong=" + settings.maLong +
				"&rsi=" + settings.rsiPeriod +
				"&macd=" + settings.macd +
				"&boll=" + settings.boll +
				"&atr=" + settings.atrPeriod +
				"&adx=" + settings.adxPeriod +
				"&breakout=" + settings.breakoutDays +
				"&volp=" + settings.volumePeriod +
				"&th=" + settings.threshold +
				"&style=" + settings.style;
		}

		// ---------------- strategy engine ----------------

		function pushCheck(checks, label, pass, value) {
			checks.push({ label: label, pass: Boolean(pass), value: value === undefined || value === null ? null : value });
		}

		function presetChecks(ta, settings, preset) {
			const th = settings.thresholds;
			const checks = [];
			const rsi = ta ? ta.rsi : null;
			const percentB = ta && ta.boll ? ta.boll.percentB : null;
			const distHigh = ta ? ta.distanceHigh60Pct : null;
			const hist = ta && ta.macd ? ta.macd.hist : null;
			const prevHist = ta && ta.macd ? ta.macd.prevHist : null;
			const adx = ta && ta.adx ? ta.adx.adx : null;
			const volRatio = ta ? ta.volumeRatio : null;
			const trendBull = ta && ta.trend ? ta.trend.label === "多头" : false;
			const aboveSlow = ta && isNum(ta.price) && isNum(ta.maSlow) && Number(ta.price) >= Number(ta.maSlow);
			const aboveLong = ta && isNum(ta.price) && isNum(ta.maLong) && Number(ta.price) >= Number(ta.maLong);
			const base = preset.base;
			const breakoutOn = ta ? ta.breakout20 === true : false;
			const candleOk = ta ? ["bullish-engulfing", "hammer"].indexOf(ta.candle) >= 0 : false;
			if (base === "momentum") {
				pushCheck(checks, "趋势多头", trendBull, ta && ta.trend ? ta.trend.label : "--");
				pushCheck(checks, "突破 " + settings.breakoutDays + " 日高点", breakoutOn, breakoutOn ? "是" : "否");
				pushCheck(checks, "量比 ≥ " + th.volRatio, isNum(volRatio) && Number(volRatio) >= th.volRatio, isNum(volRatio) ? Number(volRatio).toFixed(2) : null);
				pushCheck(checks, "ADX ≥ " + th.adxMin, isNum(adx) && Number(adx) >= th.adxMin, isNum(adx) ? Number(adx).toFixed(0) : null);
				pushCheck(checks, "RSI " + th.rsiMin + "–" + th.rsiMax, isNum(rsi) && Number(rsi) >= th.rsiMin && Number(rsi) <= th.rsiMax, isNum(rsi) ? Number(rsi).toFixed(1) : null);
				pushCheck(checks, "距 60 日高 ≥ " + th.distHigh + "%", isNum(distHigh) && Number(distHigh) >= th.distHigh, isNum(distHigh) ? Number(distHigh).toFixed(1) + "%" : null);
			} else if (base === "rebound") {
				pushCheck(checks, "RSI ≤ " + th.rsiMax, isNum(rsi) && Number(rsi) <= th.rsiMax, isNum(rsi) ? Number(rsi).toFixed(1) : null);
				pushCheck(checks, "%B ≤ " + th.percentBMax, isNum(percentB) && Number(percentB) <= th.percentBMax, isNum(percentB) ? Number(percentB).toFixed(2) : null);
				pushCheck(checks, "距 60 日高 ≤ " + th.distHigh + "%", isNum(distHigh) && Number(distHigh) <= th.distHigh, isNum(distHigh) ? Number(distHigh).toFixed(1) + "%" : null);
				const improving = isNum(hist) && isNum(prevHist) ? Number(hist) > Number(prevHist) : Boolean(ta && ta.macdCross === "golden");
				pushCheck(checks, "MACD 柱改善/金叉", improving, ta && ta.macdCross ? ta.macdCross : (isNum(hist) ? formatPrice(hist) : null));
				const kdjLow = ta && ta.kdj && isNum(ta.kdj.j) && (Number(ta.kdj.j) < 20 || (isNum(ta.kdj.k) && Number(ta.kdj.k) < 25));
				pushCheck(checks, "KDJ 低位", kdjLow, ta && ta.kdj && isNum(ta.kdj.j) ? Number(ta.kdj.j).toFixed(0) : null);
				pushCheck(checks, "K 线止跌形态", candleOk, ta && ta.candle ? ta.candle : "");
			} else if (base === "trendPullback") {
				pushCheck(checks, "价格 > 长期均线", aboveLong, ta && isNum(ta.maLong) ? formatPrice(ta.maLong) : null);
				pushCheck(checks, "均线多头排列", Boolean(ta && ta.maAlignment === "bull"), ta && ta.maAlignment ? ta.maAlignment : "");
				pushCheck(checks, "ADX ≥ " + th.adxMin, isNum(adx) && Number(adx) >= th.adxMin, isNum(adx) ? Number(adx).toFixed(0) : null);
				pushCheck(checks, "RSI " + th.rsiMin + "–" + th.rsiMax, isNum(rsi) && Number(rsi) >= th.rsiMin && Number(rsi) <= th.rsiMax, isNum(rsi) ? Number(rsi).toFixed(1) : null);
				pushCheck(checks, "回踩慢线 ±3%", ta && isNum(ta.priceVsMaSlowPct) && Math.abs(Number(ta.priceVsMaSlowPct)) <= 3, ta && isNum(ta.priceVsMaSlowPct) ? Number(ta.priceVsMaSlowPct).toFixed(1) + "%" : null);
				pushCheck(checks, "MACD 柱 ≥ 0", isNum(hist) && Number(hist) >= 0, isNum(hist) ? formatPrice(hist) : null);
			} else if (base === "breakoutRetest") {
				pushCheck(checks, "价格 > 慢线", aboveSlow, ta && isNum(ta.maSlow) ? formatPrice(ta.maSlow) : null);
				pushCheck(checks, "距 60 日高 ≥ " + th.distHigh + "%", isNum(distHigh) && Number(distHigh) >= th.distHigh, isNum(distHigh) ? Number(distHigh).toFixed(1) + "%" : null);
				pushCheck(checks, "回踩缩量（量比 ≤ " + th.volRatio + "）", isNum(volRatio) && Number(volRatio) <= th.volRatio, isNum(volRatio) ? Number(volRatio).toFixed(2) : null);
				pushCheck(checks, "RSI " + th.rsiMin + "–" + th.rsiMax, isNum(rsi) && Number(rsi) >= th.rsiMin && Number(rsi) <= th.rsiMax, isNum(rsi) ? Number(rsi).toFixed(1) : null);
				pushCheck(checks, "MACD 柱 ≥ 0", isNum(hist) && Number(hist) >= 0, isNum(hist) ? formatPrice(hist) : null);
				pushCheck(checks, "守住突破位", ta && isNum(ta.priceVsMaSlowPct) && Number(ta.priceVsMaSlowPct) >= -1, ta && isNum(ta.priceVsMaSlowPct) ? Number(ta.priceVsMaSlowPct).toFixed(1) + "%" : null);
			} else if (base === "squeeze") {
				pushCheck(checks, "布林带宽分位 ≤ " + th.bbPctMax + "%", ta && ta.boll && isNum(ta.boll.bandwidthPercentile) && Number(ta.boll.bandwidthPercentile) <= th.bbPctMax, ta && ta.boll && isNum(ta.boll.bandwidthPercentile) ? Number(ta.boll.bandwidthPercentile).toFixed(0) + "%" : null);
				pushCheck(checks, "ATR 分位 ≤ 45%", ta && isNum(ta.atrPercentile) && Number(ta.atrPercentile) <= 45, ta && isNum(ta.atrPercentile) ? Number(ta.atrPercentile).toFixed(0) + "%" : null);
				pushCheck(checks, "价格贴近慢线 ±3%", ta && isNum(ta.priceVsMaSlowPct) && Math.abs(Number(ta.priceVsMaSlowPct)) <= 3, ta && isNum(ta.priceVsMaSlowPct) ? Number(ta.priceVsMaSlowPct).toFixed(1) + "%" : null);
				pushCheck(checks, "RSI " + th.rsiMin + "–" + th.rsiMax, isNum(rsi) && Number(rsi) >= th.rsiMin && Number(rsi) <= th.rsiMax, isNum(rsi) ? Number(rsi).toFixed(1) : null);
				pushCheck(checks, "MACD 柱 ≥ 0 或金叉", (isNum(hist) && Number(hist) >= 0) || Boolean(ta && ta.macdCross === "golden"), ta && ta.macdCross ? ta.macdCross : (isNum(hist) ? formatPrice(hist) : null));
				pushCheck(checks, "方向选择在即", breakoutOn || (isNum(percentB) && Number(percentB) > 0.55), isNum(percentB) ? Number(percentB).toFixed(2) : null);
			} else if (base === "divergence") {
				pushCheck(checks, "RSI 底背离", Boolean(ta && ta.rsiDivergence === "bullish"), ta && ta.rsiDivergence === "bullish" ? "是" : "否");
				pushCheck(checks, "RSI ≤ " + th.rsiMax, isNum(rsi) && Number(rsi) <= th.rsiMax, isNum(rsi) ? Number(rsi).toFixed(1) : null);
				pushCheck(checks, "距 60 日高 ≤ " + th.distHigh + "%", isNum(distHigh) && Number(distHigh) <= th.distHigh, isNum(distHigh) ? Number(distHigh).toFixed(1) + "%" : null);
				pushCheck(checks, "已脱离 60 日低点", ta && isNum(ta.distanceLow60Pct) && Number(ta.distanceLow60Pct) >= 1, ta && isNum(ta.distanceLow60Pct) ? Number(ta.distanceLow60Pct).toFixed(1) + "%" : null);
				pushCheck(checks, "MACD 柱改善", isNum(hist) && isNum(prevHist) ? Number(hist) > Number(prevHist) : false, isNum(hist) && isNum(prevHist) ? formatPrice(hist) : null);
				pushCheck(checks, "K 线止跌形态", candleOk, ta && ta.candle ? ta.candle : "");
			} else {
				pushCheck(checks, "趋势多头", trendBull, ta && ta.trend ? ta.trend.label : "--");
				pushCheck(checks, "价格 > 慢线", aboveSlow, ta && isNum(ta.maSlow) ? formatPrice(ta.maSlow) : null);
				pushCheck(checks, "MACD 柱 > 0", isNum(hist) && Number(hist) > 0, isNum(hist) ? formatPrice(hist) : null);
				pushCheck(checks, "RSI < 70", isNum(rsi) && Number(rsi) < 70, isNum(rsi) ? Number(rsi).toFixed(1) : null);
				pushCheck(checks, "%B < 0.9", isNum(percentB) && Number(percentB) < 0.9, isNum(percentB) ? Number(percentB).toFixed(2) : null);
			}
			return checks;
		}

		function presetLevels(ta, settings) {
			const price = Number(ta ? ta.price : NaN);
			const atr = Number(ta ? ta.atr : NaN);
			if (!Number.isFinite(price) || !Number.isFinite(atr) || atr <= 0) return null;
			const th = settings.thresholds;
			const stop = Math.max(0, price - th.stopAtr * atr);
			const target = price + th.rr * (price - stop);
			return {
				entry: price,
				stopLong: stop,
				targetLong: target,
				riskPct: ((price - stop) / price) * 100,
				rewardPct: ((target - price) / price) * 100,
				rr: th.rr,
				support: isNum(ta.low60) ? ta.low60 : stop,
				resistance: isNum(ta.high60) ? ta.high60 : target
			};
		}

		function evaluatePreset(ta, settings, preset) {
			if (!ta || !preset) return null;
			const checks = presetChecks(ta, settings, preset);
			const passed = checks.filter((check) => check.pass).length;
			const total = checks.length || 1;
			const ratio = passed / total;
			const labels = ratio >= 0.8 ? "买入" : ratio >= 0.6 ? "关注" : ratio >= 0.4 ? "等待" : "回避";
			const tones = ratio >= 0.8 ? "buy" : ratio >= 0.6 ? "add" : ratio >= 0.4 ? "watch" : "skip";
			const verdict = ratio >= 0.8
				? "条件充分，可按预设分批配置"
				: ratio >= 0.6
					? "接近条件，等确认后分批"
					: ratio >= 0.4
						? "部分满足，继续观察"
						: "条件不足，暂时回避";
			return {
				preset: preset,
				checks: checks,
				passed: passed,
				total: total,
				ratio: ratio,
				tone: tones,
				label: labels,
				verdict: verdict,
				levels: presetLevels(ta, settings)
			};
		}

		function allPresets(customPresets) {
			return PRESET_BUILTINS.concat(Array.isArray(customPresets) ? customPresets : []);
		}
		function findPreset(customPresets, id) {
			const list = allPresets(customPresets);
			return list.find((item) => item.id === id) || list[0];
		}

		const CSS = [
			"/* ---------- tokens ---------- */",
			".mn-root{--mn-bg:#f3f6fb;--mn-card:#ffffff;--mn-card-2:#f8fafd;--mn-card-3:#eff3f9;--mn-line:#e5eaf2;--mn-line-2:#eef2f8;--mn-fg:#0f1720;--mn-fg-2:#55677d;--mn-fg-3:#8a99ab;--mn-accent:#2c6ef2;--mn-accent-2:#eaf1ff;--mn-up:#0b9e6d;--mn-down:#e14b52;--mn-warn:#cf7a12;--mn-up-soft:#e7f7f1;--mn-down-soft:#fdeced;--mn-warn-soft:#fdf4e6;--mn-radius:16px;--mn-radius-s:11px;--mn-radius-xs:8px;--mn-shadow:0 1px 2px rgba(15,30,55,.05),0 18px 38px -30px rgba(15,30,55,.45);--mn-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;position:relative;height:100%;min-height:0;overflow:auto;background:var(--mn-bg);color:var(--mn-fg);font-family:Inter,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei\",system-ui,sans-serif;font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased;text-align:left;box-sizing:border-box}",
			".mn-root *,.mn-root *:before,.mn-root *:after{box-sizing:border-box}",
			".mn-root b,.mn-root strong{font-weight:650}",
			".mn-root button{font-family:inherit}",
			".mn-root ::-webkit-scrollbar{width:9px;height:9px}",
			".mn-root ::-webkit-scrollbar-thumb{background:#cdd7e4;border-radius:99px;border:2px solid var(--mn-bg)}",
			".mn-root ::-webkit-scrollbar-track{background:transparent}",
			"/* ---------- shell ---------- */",
			".mn-shell{max-width:1560px;margin:0 auto;padding:16px 20px 48px;display:flex;flex-direction:column;gap:14px}",
			"/* ---------- header ---------- */",
			".mn-head{display:flex;align-items:center;gap:18px;flex-wrap:wrap}",
			".mn-brand{display:flex;align-items:center;gap:11px;min-width:0}",
			".mn-logo{width:36px;height:36px;border-radius:11px;background:linear-gradient(140deg,#2c6ef2,#5b8bff 55%,#8a5cf6);color:#fff;display:grid;place-items:center;box-shadow:0 8px 18px -10px rgba(44,110,242,.9);flex:none}",
			".mn-brand-title{font-size:17px;font-weight:700;letter-spacing:.01em;line-height:1.25}",
			".mn-brand-sub{font-size:11.5px;color:var(--mn-fg-3);display:flex;align-items:center;gap:7px;margin-top:1px}",
			".mn-dot{width:6px;height:6px;border-radius:50%;background:var(--mn-up);box-shadow:0 0 0 3px rgba(11,158,109,.16);flex:none}",
			".mn-dot[data-state=warn]{background:var(--mn-warn);box-shadow:0 0 0 3px rgba(207,122,18,.16)}",
			".mn-dot[data-state=down]{background:var(--mn-down);box-shadow:0 0 0 3px rgba(225,75,82,.16)}",
			".mn-head-right{margin-left:auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
			".mn-tabs{display:flex;align-items:center;gap:2px;padding:3px;background:var(--mn-card);border:1px solid var(--mn-line);border-radius:99px;box-shadow:0 1px 2px rgba(15,30,55,.04)}",
			".mn-tab{border:0;background:transparent;color:var(--mn-fg-2);font-size:12.5px;padding:6px 14px;border-radius:99px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:color .15s,background .15s;white-space:nowrap}",
			".mn-tab:hover{color:var(--mn-fg);background:var(--mn-card-3)}",
			".mn-tab[data-active=true]{background:var(--mn-fg);color:#fff;box-shadow:0 4px 12px -6px rgba(15,23,32,.8)}",
			".mn-tab-count{font-size:10.5px;line-height:1;padding:2px 5px;border-radius:99px;background:rgba(44,110,242,.12);color:var(--mn-accent);font-variant-numeric:tabular-nums}",
			".mn-tab[data-active=true] .mn-tab-count{background:rgba(255,255,255,.2);color:#fff}",
			"/* ---------- buttons & inputs ---------- */",
			".mn-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--mn-line);background:var(--mn-card);color:var(--mn-fg);font-size:12.5px;padding:7px 13px;border-radius:10px;cursor:pointer;transition:background .15s,border-color .15s,transform .1s,color .15s;white-space:nowrap;line-height:1.2}",
			".mn-btn:hover{background:var(--mn-card-3);border-color:#d7dfea}",
			".mn-btn:active{transform:translateY(1px)}",
			".mn-btn[disabled]{opacity:.5;cursor:not-allowed}",
			".mn-btn[data-variant=primary]{background:var(--mn-accent);border-color:var(--mn-accent);color:#fff;box-shadow:0 8px 18px -12px rgba(44,110,242,.9)}",
			".mn-btn[data-variant=primary]:hover{background:#245fd6;border-color:#245fd6}",
			".mn-btn[data-variant=ghost]{background:transparent;border-color:transparent;color:var(--mn-fg-2)}",
			".mn-btn[data-variant=ghost]:hover{background:var(--mn-card-3);color:var(--mn-fg)}",
			".mn-btn[data-variant=danger]{color:var(--mn-down);border-color:#f3d4d6;background:#fff}",
			".mn-btn[data-variant=danger]:hover{background:var(--mn-down-soft)}",
			".mn-btn[data-size=sm]{padding:5px 9px;font-size:12px;border-radius:8px}",
			".mn-btn[data-size=icon]{width:32px;height:32px;padding:0;border-radius:9px}",
			".mn-input,.mn-select{width:100%;border:1px solid var(--mn-line);background:var(--mn-card);color:var(--mn-fg);font-size:12.5px;padding:8px 11px;border-radius:9px;outline:none;transition:border-color .15s,box-shadow .15s}",
			".mn-input:focus,.mn-select:focus{border-color:var(--mn-accent);box-shadow:0 0 0 3px rgba(44,110,242,.14)}",
			".mn-input::placeholder{color:var(--mn-fg-3)}",
			".mn-select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--mn-fg-3) 50%),linear-gradient(135deg,var(--mn-fg-3) 50%,transparent 50%);background-position:calc(100% - 15px) 50%,calc(100% - 10px) 50%;background-size:5px 5px,5px 5px;background-repeat:no-repeat;padding-right:26px;cursor:pointer}",
			".mn-range{width:100%;appearance:none;height:4px;border-radius:99px;background:var(--mn-line);outline:none}",
			".mn-range::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:var(--mn-accent);border:2px solid #fff;box-shadow:0 1px 4px rgba(15,30,55,.35);cursor:pointer}",
			"/* ---------- ticker ---------- */",
			".mn-ticker{display:flex;align-items:stretch;background:var(--mn-card);border:1px solid var(--mn-line);border-radius:var(--mn-radius);box-shadow:var(--mn-shadow);overflow:hidden;flex-wrap:wrap}",
			".mn-tk-group{display:flex;align-items:center;gap:16px;padding:11px 18px;border-right:1px solid var(--mn-line-2);min-width:0;flex-wrap:wrap}",
			".mn-tk-group:last-child{border-right:0}",
			".mn-tk-group-title{font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--mn-fg-3);text-transform:uppercase;flex:none;writing-mode:vertical-rl;transform:rotate(180deg);height:36px;display:flex;align-items:center;justify-content:center}",
			".mn-tk{display:flex;flex-direction:column;gap:1px;min-width:80px}",
			".mn-tk-name{font-size:11px;color:var(--mn-fg-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:96px}",
			".mn-tk-line{display:flex;align-items:baseline;gap:6px}",
			".mn-tk-price{font-size:13.5px;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.01em}",
			".mn-tk-chg{font-size:11.5px;font-weight:600;font-variant-numeric:tabular-nums}",
			".mn-tk-spark{width:54px;height:22px;flex:none;opacity:.95;margin-left:auto}",
			".mn-tk-status{margin-left:auto;display:flex;align-items:center;gap:16px;padding:11px 18px;background:linear-gradient(90deg,rgba(44,110,242,.03),rgba(44,110,242,.08));border-left:1px solid var(--mn-line-2)}",
			".mn-breadth{display:flex;flex-direction:column;gap:5px;min-width:140px}",
			".mn-breadth-bar{height:6px;border-radius:99px;overflow:hidden;display:flex;background:var(--mn-line-2)}",
			".mn-breadth-bar i{display:block;height:100%}",
			".mn-breadth-meta{display:flex;justify-content:space-between;font-size:10.5px;color:var(--mn-fg-3);font-variant-numeric:tabular-nums}",
			"/* ---------- card ---------- */",
			".mn-card{background:var(--mn-card);border:1px solid var(--mn-line);border-radius:var(--mn-radius);box-shadow:var(--mn-shadow);overflow:hidden;min-width:0}",
			".mn-card-head{display:flex;align-items:center;gap:10px;padding:12px 15px;border-bottom:1px solid var(--mn-line-2);min-height:46px}",
			".mn-card-title{font-size:13px;font-weight:650;display:flex;align-items:center;gap:7px;min-width:0}",
			".mn-card-note{font-size:11px;color:var(--mn-fg-3);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".mn-card-tools{margin-left:auto;display:flex;align-items:center;gap:6px;flex:none}",
			".mn-card-body{padding:14px 15px}",
			".mn-card-body[data-flush=true]{padding:0}",
			"/* ---------- board ---------- */",
			".mn-board{display:grid;grid-template-columns:322px minmax(0,1fr);gap:14px;align-items:start}",
			".mn-rail{display:flex;flex-direction:column;gap:14px;min-width:0}",
			"/* ---------- watchlist ---------- */",
			".mn-seg{display:flex;gap:2px;padding:3px;background:var(--mn-card-3);border-radius:9px}",
			".mn-seg button{border:0;background:transparent;color:var(--mn-fg-2);font-size:11.5px;padding:4px 10px;border-radius:7px;cursor:pointer;transition:background .15s,color .15s}",
			".mn-seg button[data-active=true]{background:var(--mn-card);color:var(--mn-fg);font-weight:600;box-shadow:0 1px 3px rgba(15,30,55,.12)}",
			".mn-search{position:relative;padding:10px 12px;border-bottom:1px solid var(--mn-line-2);background:var(--mn-card-2)}",
			".mn-search-row{display:flex;gap:6px}",
			".mn-search-results{position:absolute;left:12px;right:12px;top:calc(100% - 4px);z-index:40;background:var(--mn-card);border:1px solid var(--mn-line);border-radius:11px;box-shadow:0 20px 40px -18px rgba(15,30,55,.5);overflow:hidden;max-height:320px;overflow-y:auto}",
			".mn-result{display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;text-align:left;padding:9px 12px;cursor:pointer;border-bottom:1px solid var(--mn-line-2)}",
			".mn-result:last-child{border-bottom:0}",
			".mn-result:hover{background:var(--mn-accent-2)}",
			".mn-result-main{flex:1;min-width:0;display:flex;flex-direction:column}",
			".mn-result-name{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".mn-result-meta{font-size:10.5px;color:var(--mn-fg-3)}",
			".mn-wl{display:flex;flex-direction:column}",
			".mn-wl-row{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:8px;row-gap:1px;padding:9px 30px 9px 15px;border-bottom:1px solid var(--mn-line-2);cursor:pointer;transition:background .12s}",
			".mn-wl-row:last-child{border-bottom:0}",
			".mn-wl-row:hover{background:var(--mn-card-2)}",
			".mn-wl-row[data-active=true]{background:var(--mn-accent-2)}",
			".mn-wl-row[data-active=true]:before{content:\"\";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--mn-accent);border-radius:0 3px 3px 0}",
			".mn-wl-sym{display:flex;align-items:center;gap:6px;min-width:0}",
			".mn-wl-sym b{font-size:12.5px;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".mn-wl-name{font-size:10.5px;color:var(--mn-fg-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;grid-row:2;grid-column:1}",
			".mn-wl-price{font-size:12.5px;font-weight:650;font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}",
			".mn-wl-chg{font-size:11.5px;font-weight:600;font-variant-numeric:tabular-nums;text-align:right;grid-row:2;grid-column:2;white-space:nowrap}",
			".mn-wl-del{position:absolute;right:5px;top:50%;transform:translateY(-50%);width:21px;height:21px;border:0;border-radius:6px;background:var(--mn-card);color:var(--mn-fg-3);cursor:pointer;opacity:0;transition:opacity .12s,color .12s;font-size:14px;line-height:1;display:grid;place-items:center;box-shadow:0 1px 4px rgba(15,30,55,.18)}",
			".mn-wl-row:hover .mn-wl-del{opacity:1}",
			".mn-wl-del:hover{color:var(--mn-down)}",
			".mn-wl-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 13px;background:var(--mn-card-2);border-top:1px solid var(--mn-line-2);font-size:11px;color:var(--mn-fg-3)}",
			".mn-mini-spark{width:46px;height:18px;flex:none}",
			"/* ---------- detail ---------- */",
			".mn-detail-head{display:flex;align-items:flex-start;gap:14px;padding:15px 16px 13px;flex-wrap:wrap}",
			".mn-detail-id{display:flex;flex-direction:column;gap:3px;min-width:0}",
			".mn-detail-sym{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:700;letter-spacing:-.01em;line-height:1.2}",
			".mn-detail-name{font-size:11.5px;color:var(--mn-fg-3)}",
			".mn-price-box{margin-left:auto;text-align:right;display:flex;flex-direction:column;gap:2px}",
			".mn-price{font-size:29px;font-weight:700;letter-spacing:-.02em;line-height:1.1;font-variant-numeric:tabular-nums}",
			".mn-price-sub{display:flex;align-items:center;gap:8px;justify-content:flex-end;font-size:12px;font-variant-numeric:tabular-nums}",
			".mn-chart{position:relative;border-top:1px solid var(--mn-line-2);border-bottom:1px solid var(--mn-line-2);background:linear-gradient(180deg,var(--mn-card),var(--mn-card-2))}",
			".mn-chart svg{display:block;width:100%;height:auto}",
			".mn-chart-legend{position:absolute;left:14px;top:9px;display:flex;gap:12px;font-size:10.5px;color:var(--mn-fg-3)}",
			".mn-chart-legend i{display:inline-block;width:8px;height:2px;vertical-align:middle;margin-right:4px;border-radius:2px}",
			".mn-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:1px;background:var(--mn-line-2)}",
			".mn-metric{background:var(--mn-card);padding:10px 12px;display:flex;flex-direction:column;gap:2px;min-width:0}",
			".mn-metric-label{font-size:10.5px;color:var(--mn-fg-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".mn-metric-value{font-size:13px;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.01em}",
			".mn-metric-note{font-size:10px;color:var(--mn-fg-3)}",
			".mn-section{padding:14px 16px;border-top:1px solid var(--mn-line-2)}",
			".mn-section:first-child{border-top:0}",
			".mn-section-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}",
			".mn-section-title{font-size:12px;font-weight:650;letter-spacing:.02em}",
			".mn-section-note{margin-left:auto;font-size:10.5px;color:var(--mn-fg-3)}",
			"/* ---------- chips ---------- */",
			".mn-chip{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:600;line-height:1;padding:4px 7px;border-radius:6px;background:var(--mn-card-3);color:var(--mn-fg-2);white-space:nowrap}",
			".mn-chip[data-tone=up]{background:var(--mn-up-soft);color:var(--mn-up)}",
			".mn-chip[data-tone=down]{background:var(--mn-down-soft);color:var(--mn-down)}",
			".mn-chip[data-tone=warn]{background:var(--mn-warn-soft);color:var(--mn-warn)}",
			".mn-chip[data-tone=accent]{background:var(--mn-accent-2);color:var(--mn-accent)}",
			".mn-chip[data-tone=muted]{background:var(--mn-card-3);color:var(--mn-fg-3)}",
			".mn-up{color:var(--mn-up)}",
			".mn-down{color:var(--mn-down)}",
			".mn-flat{color:var(--mn-fg-3)}",
			".mn-mono{font-variant-numeric:tabular-nums;font-family:var(--mn-mono);letter-spacing:-.02em}",
			"/* ---------- strategy ---------- */",
			".mn-strategy-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap}",
			".mn-score{position:relative;width:50px;height:50px;border-radius:50%;flex:none;display:grid;place-items:center;background:conic-gradient(var(--mn-score-color) calc(var(--mn-score) * 1%),var(--mn-line) 0)}",
			".mn-score:after{content:\"\";position:absolute;inset:4px;border-radius:50%;background:var(--mn-card)}",
			".mn-score span{position:relative;z-index:1;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em}",
			".mn-score[data-tone=buy]{--mn-score-color:var(--mn-up)}",
			".mn-score[data-tone=add]{--mn-score-color:var(--mn-accent)}",
			".mn-score[data-tone=watch]{--mn-score-color:var(--mn-warn)}",
			".mn-score[data-tone=skip]{--mn-score-color:#b9c4d2}",
			".mn-strategy-main{display:flex;flex-direction:column;gap:2px;min-width:0}",
			".mn-strategy-name{font-size:13px;font-weight:650;display:flex;align-items:center;gap:7px}",
			".mn-strategy-desc{font-size:11px;color:var(--mn-fg-3)}",
			".mn-checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(196px,1fr));gap:3px 14px;margin-top:11px}",
			".mn-check{display:flex;align-items:center;gap:7px;font-size:12px;padding:3px 0;min-width:0}",
			".mn-check-icon{width:15px;height:15px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:9px;font-weight:700;background:var(--mn-card-3);color:var(--mn-fg-3)}",
			".mn-check[data-pass=true] .mn-check-icon{background:var(--mn-up-soft);color:var(--mn-up)}",
			".mn-check[data-pass=false] .mn-check-icon{background:var(--mn-down-soft);color:var(--mn-down)}",
			".mn-check-label{color:var(--mn-fg-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".mn-check[data-pass=true] .mn-check-label{color:var(--mn-fg)}",
			".mn-check-value{margin-left:auto;color:var(--mn-fg-3);font-variant-numeric:tabular-nums;font-size:11px;white-space:nowrap}",
			".mn-verdict{margin-top:10px;padding:8px 11px;border-radius:9px;font-size:11.5px;background:var(--mn-card-3);color:var(--mn-fg-2);display:flex;align-items:center;gap:7px}",
			".mn-verdict[data-tone=buy]{background:var(--mn-up-soft);color:#0a7d56}",
			".mn-verdict[data-tone=add]{background:var(--mn-accent-2);color:#1f57c4}",
			".mn-verdict[data-tone=watch]{background:var(--mn-warn-soft);color:#a05f0c}",
			".mn-levels{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:11px}",
			".mn-level{background:var(--mn-card-2);border:1px solid var(--mn-line-2);border-radius:9px;padding:7px 9px;display:flex;flex-direction:column;gap:1px;min-width:0}",
			".mn-level span{font-size:10px;color:var(--mn-fg-3)}",
			".mn-level b{font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			"/* ---------- target ---------- */",
			".mn-target-grid{display:grid;grid-template-columns:minmax(0,1fr) 92px minmax(0,1fr);gap:8px}",
			".mn-target-actions{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap}",
			".mn-target-current{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--mn-fg-2);margin-bottom:9px;flex-wrap:wrap}",
			"/* ---------- gauges & distribution ---------- */",
			".mn-gauge{display:flex;flex-direction:column;gap:7px;padding:11px 0;border-bottom:1px dashed var(--mn-line-2)}",
			".mn-gauge:last-child{border-bottom:0;padding-bottom:0}",
			".mn-gauge-top{display:flex;align-items:baseline;gap:8px}",
			".mn-gauge-name{font-size:11px;color:var(--mn-fg-3);font-weight:600;letter-spacing:.02em}",
			".mn-gauge-value{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em;line-height:1}",
			".mn-gauge-meta{margin-left:auto;font-size:10.5px;color:var(--mn-fg-3);text-align:right}",
			".mn-gauge-track{height:6px;border-radius:99px;background:var(--mn-line-2);overflow:hidden}",
			".mn-gauge-fill{height:100%;border-radius:99px;transition:width .4s ease}",
			".mn-gauge[data-tone=calm] .mn-gauge-fill{background:linear-gradient(90deg,#5cc9a7,#0b9e6d)}",
			".mn-gauge[data-tone=alert] .mn-gauge-fill{background:linear-gradient(90deg,#f0c274,#cf7a12)}",
			".mn-gauge[data-tone=fear] .mn-gauge-fill{background:linear-gradient(90deg,#f09a9f,#e14b52)}",
			".mn-gauge[data-tone=neutral] .mn-gauge-fill{background:linear-gradient(90deg,#9db4d6,#5b7fb8)}",
			".mn-dist{display:flex;flex-direction:column;gap:6px;padding:9px 0;border-bottom:1px dashed var(--mn-line-2)}",
			".mn-dist:last-child{border-bottom:0;padding-bottom:0}",
			".mn-dist-top{display:flex;align-items:baseline;gap:8px;font-size:11.5px}",
			".mn-dist-top b{font-variant-numeric:tabular-nums}",
			".mn-dist-top span{color:var(--mn-fg-3);font-size:10.5px;margin-left:auto}",
			".mn-dist-bar{display:flex;height:9px;border-radius:99px;overflow:hidden;background:var(--mn-line-2);gap:1px}",
			".mn-dist-seg{height:100%;min-width:2px;transition:opacity .2s;opacity:.55}",
			".mn-dist-seg[data-tone=calm]{background:#79c9b0}",
			".mn-dist-seg[data-tone=neutral]{background:#a9bcd8}",
			".mn-dist-seg[data-tone=alert]{background:#e9bf7c}",
			".mn-dist-seg[data-tone=fear]{background:#e39a9f}",
			".mn-dist-seg[data-current=true]{opacity:1;box-shadow:inset 0 0 0 1.5px rgba(15,23,32,.55)}",
			".mn-dist-meta{display:flex;justify-content:space-between;gap:8px;font-size:10px;color:var(--mn-fg-3);font-variant-numeric:tabular-nums}",
			"/* ---------- rows ---------- */",
			".mn-rows{display:flex;flex-direction:column}",
			".mn-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--mn-line-2);font-size:12px}",
			".mn-row:last-child{border-bottom:0}",
			".mn-row-name{min-width:0;flex:1;display:flex;align-items:center;gap:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
			".mn-row-bar{width:60px;height:5px;border-radius:99px;background:var(--mn-line-2);overflow:hidden;flex:none}",
			".mn-row-bar i{display:block;height:100%;border-radius:99px}",
			".mn-row-value{font-variant-numeric:tabular-nums;font-weight:600;min-width:58px;text-align:right;font-size:11.5px}",
			"/* ---------- mood ---------- */",
			".mn-mood-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:start}",
			".mn-kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:10px}",
			".mn-kv-item{display:flex;flex-direction:column;gap:2px}",
			".mn-kv-item span{font-size:10.5px;color:var(--mn-fg-3)}",
			".mn-kv-item b{font-size:13px;font-variant-numeric:tabular-nums}",
			"/* ---------- signals ---------- */",
			".mn-opp{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--mn-line-2);cursor:pointer}",
			".mn-opp:last-child{border-bottom:0}",
			".mn-opp:hover .mn-opp-sym{color:var(--mn-accent)}",
			".mn-opp-sym{font-weight:650;font-size:12.5px;min-width:74px}",
			".mn-opp-bar{flex:1;height:6px;border-radius:99px;background:var(--mn-line-2);overflow:hidden;max-width:220px}",
			".mn-opp-bar i{display:block;height:100%;border-radius:99px}",
			".mn-opp-count{font-size:11px;color:var(--mn-fg-3);font-variant-numeric:tabular-nums;min-width:46px;text-align:right}",
			".mn-alert{display:flex;align-items:flex-start;gap:9px;padding:9px 0;border-bottom:1px solid var(--mn-line-2)}",
			".mn-alert:last-child{border-bottom:0}",
			".mn-alert-icon{width:24px;height:24px;border-radius:8px;background:var(--mn-accent-2);color:var(--mn-accent);display:grid;place-items:center;flex:none}",
			".mn-alert-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}",
			".mn-alert-title{font-size:12px;font-weight:600}",
			".mn-alert-sub{font-size:10.5px;color:var(--mn-fg-3)}",
			".mn-alert-time{font-size:10.5px;color:var(--mn-fg-3);font-variant-numeric:tabular-nums;flex:none}",
			"/* ---------- settings ---------- */",
			".mn-settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(268px,1fr));gap:14px;align-items:start}",
			".mn-field{display:flex;flex-direction:column;gap:4px;margin-bottom:11px}",
			".mn-field:last-child{margin-bottom:0}",
			".mn-field-label{font-size:11px;color:var(--mn-fg-2);display:flex;align-items:center;gap:6px}",
			".mn-field-label em{font-style:normal;color:var(--mn-fg-3);font-size:10px;margin-left:auto;font-variant-numeric:tabular-nums}",
			".mn-field-2{display:grid;grid-template-columns:1fr 1fr;gap:9px}",
			".mn-field-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px}",
			".mn-switch{display:flex;align-items:center;gap:9px;padding:7px 0;cursor:pointer;font-size:12px;color:var(--mn-fg-2)}",
			".mn-switch input{appearance:none;width:32px;height:18px;border-radius:99px;background:var(--mn-line);position:relative;cursor:pointer;transition:background .18s;flex:none;margin:0}",
			".mn-switch input:checked{background:var(--mn-accent)}",
			".mn-switch input:after{content:\"\";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(15,30,55,.3);transition:transform .18s}",
			".mn-switch input:checked:after{transform:translateX(14px)}",
			"/* ---------- misc ---------- */",
			".mn-empty{padding:34px 18px;text-align:center;color:var(--mn-fg-3);font-size:12px;display:flex;flex-direction:column;align-items:center;gap:8px}",
			".mn-empty b{color:var(--mn-fg-2);font-size:12.5px;font-weight:600}",
			".mn-loading{display:flex;flex-direction:column;gap:8px}",
			".mn-skel{height:13px;border-radius:6px;background:linear-gradient(90deg,var(--mn-line-2),var(--mn-card-3),var(--mn-line-2));background-size:220% 100%;animation:mn-sheen 1.4s infinite linear}",
			"@keyframes mn-sheen{0%{background-position:120% 0}100%{background-position:-120% 0}}",
			".mn-error{display:flex;align-items:center;gap:8px;padding:9px 13px;border-radius:10px;background:var(--mn-down-soft);color:#a32d33;font-size:12px;border:1px solid #f6d5d7}",
			".mn-toast{position:fixed;right:20px;bottom:20px;z-index:2147483000;max-width:340px;background:#0f1720;color:#fff;font-size:12px;padding:10px 14px;border-radius:11px;box-shadow:0 18px 40px -14px rgba(15,23,32,.8);display:flex;align-items:center;gap:8px;animation:mn-rise .22s ease}",
			"@keyframes mn-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
			"@keyframes mn-fade{from{opacity:0}to{opacity:1}}",
			".mn-fade{animation:mn-fade .18s ease}",
			".mn-hint{font-size:10.5px;color:var(--mn-fg-3);line-height:1.5}",
			".mn-split{height:1px;background:var(--mn-line-2);margin:12px 0}",
			"/* ---------- responsive ---------- */",
			"@media (max-width:1180px){.mn-board{grid-template-columns:290px minmax(0,1fr)}.mn-tk-group{padding:10px 14px;gap:12px}.mn-shell{padding:14px 14px 40px}}",
			"@media (max-width:940px){.mn-board{grid-template-columns:minmax(0,1fr)}.mn-head-right{width:100%;margin-left:0}.mn-tk-status{margin-left:0;border-left:0;border-top:1px solid var(--mn-line-2);width:100%;justify-content:space-between}}",
			"@media (max-width:640px){.mn-shell{padding:10px 10px 32px}.mn-price{font-size:24px}.mn-tk-group-title{writing-mode:horizontal-tb;transform:none;height:auto}.mn-tk{min-width:64px}}",
			"/* ---------- dark ---------- */",
			".mn-root[data-theme=dark]{--mn-bg:#0c1219;--mn-card:#131c26;--mn-card-2:#17212c;--mn-card-3:#1c2733;--mn-line:#24303d;--mn-line-2:#1d2833;--mn-fg:#e8eff8;--mn-fg-2:#9fb0c3;--mn-fg-3:#71829a;--mn-accent:#5b8fff;--mn-accent-2:#1a2a45;--mn-up:#2ecf9a;--mn-down:#ff6b73;--mn-warn:#e9a94a;--mn-up-soft:#122e26;--mn-down-soft:#331a1d;--mn-warn-soft:#33260f;--mn-shadow:0 1px 2px rgba(0,0,0,.5),0 18px 38px -30px rgba(0,0,0,.9)}",
			".mn-root[data-theme=dark] ::-webkit-scrollbar-thumb{background:#2a3746;border-color:var(--mn-bg)}",
			".mn-root[data-theme=dark] .mn-toast{background:#e8eff8;color:#0c1219}",
			".mn-root[data-theme=dark] .mn-tab[data-active=true]{background:#e8eff8;color:#0c1219}",
			".mn-root[data-theme=dark] .mn-dist-seg[data-current=true]{box-shadow:inset 0 0 0 1.5px rgba(232,239,248,.75)}",
			".mn-root[data-theme=dark] .mn-select{background-image:linear-gradient(45deg,transparent 50%,#71829a 50%),linear-gradient(135deg,#71829a 50%,transparent 50%)}",
			".mn-root[data-theme=dark] .mn-btn[data-variant=primary]{color:#08111f}",
			".mn-tk-row{display:flex;align-items:stretch;flex-wrap:wrap;width:100%}",
			".mn-tk-row[data-sub=true]{border-top:1px solid var(--mn-line-2);background:var(--mn-card-2)}",
			".mn-tk-group{border-right:1px solid var(--mn-line-2)}",
			".mn-tk-group:last-child{border-right:0}",
			".mn-tk-group[data-grow=true]{flex:1 1 auto}",
			".mn-tk-group-title{writing-mode:horizontal-tb;transform:none;height:auto;font-size:10px;letter-spacing:.14em;color:var(--mn-fg-3);font-weight:700;align-self:center;padding-right:10px;margin-right:2px;border-right:1px solid var(--mn-line-2);line-height:1.2}",
			".mn-tk-spark{margin-left:4px;align-self:center}",
			".mn-tk-meta{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:2px;padding:9px 16px;font-size:10.5px;color:var(--mn-fg-3);min-width:132px}",
			".mn-mini-row{display:flex;align-items:center;gap:18px;flex-wrap:wrap}",
			".mn-mini-stat{display:flex;flex-direction:column;gap:3px;min-width:74px}",
			".mn-mini-stat span{font-size:10px;color:var(--mn-fg-3)}",
			".mn-mini-stat b{font-size:12px;font-variant-numeric:tabular-nums;font-weight:650}",
			".mn-mini-stat i{display:block;height:3px;border-radius:99px;background:var(--mn-line);overflow:hidden;width:100%}",
			".mn-mini-stat i em{display:block;height:100%;background:var(--mn-accent);border-radius:99px}",
			".mn-metrics{grid-template-columns:repeat(6,minmax(0,1fr))}",
			"@media (max-width:1180px){.mn-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}}",
			"@media (max-width:700px){.mn-tk-meta{width:100%;align-items:flex-start;border-top:1px solid var(--mn-line-2)}}",
			".mn-gauge-fill{display:block;height:100%}",
			".mn-gauge-track{height:8px;background:var(--mn-card-3)}",
			".mn-gauge[data-tone=neutral] .mn-gauge-fill{background:linear-gradient(90deg,#9db9ea,#2c6ef2)}",
			".mn-gauge[data-tone=calm] .mn-gauge-fill{background:linear-gradient(90deg,#63d6ae,#0b9e6d)}",
			".mn-gauge[data-tone=alert] .mn-gauge-fill{background:linear-gradient(90deg,#f3cd8a,#cf7a12)}",
			".mn-gauge[data-tone=fear] .mn-gauge-fill{background:linear-gradient(90deg,#f4acb0,#e14b52)}",
			".mn-mini-stat i{display:block;height:3px;border-radius:99px;background:var(--mn-line);overflow:hidden;width:100%}",
			".mn-mini-stat i em{display:block;height:100%;background:var(--mn-accent);border-radius:99px}",
			".mn-levels{grid-template-columns:repeat(3,minmax(0,1fr))}",
			".mn-level b{white-space:nowrap;overflow:visible;text-overflow:clip;font-size:11.5px}",
			".mn-kv{grid-template-columns:repeat(4,minmax(0,1fr))}",
			"@media (max-width:760px){.mn-levels{grid-template-columns:repeat(2,minmax(0,1fr))}.mn-kv{grid-template-columns:repeat(2,minmax(0,1fr))}}",
			".mn-mood-cols{display:block;column-count:2;column-gap:14px}",
			".mn-mood-cols > .mn-card{break-inside:avoid;page-break-inside:avoid;-webkit-column-break-inside:avoid;display:inline-block;width:100%;margin:0 0 14px;vertical-align:top}",
			"@media (max-width:980px){.mn-mood-cols{column-count:1}}",
		].join("\n");


		// ---------------- UI ----------------

		function createUI(React) {
			const h = React.createElement;
			const useState = React.useState;
			const useEffect = React.useEffect;
			const useMemo = React.useMemo;
			const useRef = React.useRef;
			const useCallback = React.useCallback;

			function cx() {
				const out = [];
				for (let index = 0; index < arguments.length; index += 1) {
					const item = arguments[index];
					if (item) out.push(item);
				}
				return out.join(" ");
			}

			const ICONS = {
				pulse: ["M3 12h4l2.5-7 4 14L16 12h5"],
				refresh: ["M20 11a8 8 0 1 0-2.3 5.7", "M20 4v7h-7"],
				trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 13h10l1-13", "M10 11v5", "M14 11v5"],
				search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.3-4.3"],
				plus: ["M12 5v14", "M5 12h14"],
				x: ["M6 6l12 12", "M18 6L6 18"],
				check: ["M4 12.5l5 5L20 6.5"],
				minus: ["M5 12h14"],
				settings: ["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.06-.06A2 2 0 1 1 8.57 5.2l.06.06a1.7 1.7 0 0 0 2.9-1.2V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0 1.2 2.9h.1a2 2 0 1 1 0 4h-.1"],
				bell: ["M18 8a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 14 18 8", "M10.3 21a2 2 0 0 0 3.4 0"],
				arrow: ["M7 17L17 7", "M8 7h9v9"],
				trendUp: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
				trendDown: ["M3 7l6 6 4-4 8 8", "M15 17h6v-6"],
				target: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z", "M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"],
				layers: ["M12 3l9 5-9 5-9-5 9-5z", "M3 13l9 5 9-5"],
				coin: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v10", "M14.5 9.5a2.5 2.5 0 0 0-5 0c0 3 5 1.5 5 4.5a2.5 2.5 0 0 1-5 0"],
				sliders: ["M4 6h10", "M18 6h2", "M4 12h4", "M12 12h8", "M4 18h10", "M18 18h2", "M16 4v4", "M8 10v4", "M16 16v4"],
				inbox: ["M4 13l2-8h12l2 8v6H4v-6z", "M4 13h5l1 2h4l1-2h5"],
				warn: ["M12 4l9 16H3l9-16z", "M12 10v4", "M12 17.2v.1"]
			};

			function Icon(props) {
				const size = props.size || 16;
				const name = props.name;
				const paths = ICONS[name] || ICONS.pulse;
				return h("svg", {
					viewBox: "0 0 24 24",
					width: size,
					height: size,
					fill: "none",
					stroke: "currentColor",
					strokeWidth: props.stroke || 1.7,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					"aria-hidden": "true",
					style: { display: "block", flex: "none" }
				}, paths.map((d, index) => h("path", { key: index, d: d })));
			}

			function Chip(props) {
				return h("span", { className: cx("mn-chip", props.className), "data-tone": props.tone || "muted", title: props.title }, props.children);
			}

			function Card(props) {
				return h("section", { className: cx("mn-card", props.className), style: props.style },
					props.title || props.tools
						? h("div", { className: "mn-card-head" },
							props.title ? h("div", { className: "mn-card-title" }, props.icon ? h(Icon, { name: props.icon, size: 14 }) : null, props.title) : null,
							props.note ? h("span", { className: "mn-card-note" }, props.note) : null,
							props.tools ? h("div", { className: "mn-card-tools" }, props.tools) : null)
						: null,
					h("div", { className: "mn-card-body", "data-flush": props.flush ? "true" : "false" }, props.children));
			}

			function Sparkline(props) {
				const points = Array.isArray(props.points) ? props.points.filter((value) => Number.isFinite(Number(value))).map(Number) : [];
				const width = props.width || 54;
				const height = props.height || 22;
				const idRef = useRef(null);
				if (idRef.current === null) {
					idRef.current = "mn-sp-" + Math.random().toString(36).slice(2, 9);
				}
				if (points.length < 2) {
					return h("svg", { width: width, height: height, viewBox: "0 0 " + width + " " + height, "aria-hidden": "true", className: props.className });
				}
				const min = Math.min.apply(null, points);
				const max = Math.max.apply(null, points);
				const span = max - min || 1;
				const stepX = width / (points.length - 1);
				const pad = 2;
				const usable = height - pad * 2;
				const coords = points.map((value, index) => [index * stepX, pad + usable - ((value - min) / span) * usable]);
				const line = coords.map((pair, index) => (index === 0 ? "M" : "L") + pair[0].toFixed(2) + " " + pair[1].toFixed(2)).join(" ");
				const area = line + " L" + width + " " + height + " L0 " + height + " Z";
				const up = points[points.length - 1] >= points[0];
				const color = up ? "var(--mn-up)" : "var(--mn-down)";
				return h("svg", {
					width: width,
					height: height,
					viewBox: "0 0 " + width + " " + height,
					className: props.className,
					"aria-hidden": "true",
					preserveAspectRatio: "none"
				},
					h("defs", null,
						h("linearGradient", { id: idRef.current, x1: "0", y1: "0", x2: "0", y2: "1" },
							h("stop", { offset: "0%", stopColor: color, stopOpacity: "0.28" }),
							h("stop", { offset: "100%", stopColor: color, stopOpacity: "0" }))),
					h("path", { d: area, fill: "url(#" + idRef.current + ")", stroke: "none" }),
					h("path", { d: line, fill: "none", stroke: color, strokeWidth: props.strokeWidth || 1.4, strokeLinejoin: "round", strokeLinecap: "round" })
				);
			}

			function DetailChart(props) {
				const points = Array.isArray(props.points) ? props.points.filter((value) => Number.isFinite(Number(value))).map(Number) : [];
				const ma = Array.isArray(props.ma) ? props.ma : [];
				const width = 720;
				const height = 168;
				const padY = 14;
				if (points.length < 3) {
					return h("div", { className: "mn-empty", style: { padding: "28px 16px" } },
						h(Icon, { name: "pulse", size: 18 }),
						h("span", null, "走势数据加载中"));
				}
				const all = points.concat(ma.filter((value) => Number.isFinite(Number(value))));
				const min = Math.min.apply(null, all);
				const max = Math.max.apply(null, all);
				const span = max - min || 1;
				const x = (index) => (index / (points.length - 1)) * width;
				const y = (value) => padY + (height - padY * 2) - ((value - min) / span) * (height - padY * 2);
				const line = points.map((value, index) => (index === 0 ? "M" : "L") + x(index).toFixed(1) + " " + y(value).toFixed(1)).join(" ");
				const area = line + " L" + width + " " + height + " L0 " + height + " Z";
				const maLine = ma.length > 1 ? ma.map((value, index) => (index === 0 ? "M" : "L") + x(index + (points.length - ma.length)).toFixed(1) + " " + y(value).toFixed(1)).join(" ") : "";
				const up = points[points.length - 1] >= points[0];
				const color = up ? "var(--mn-up)" : "var(--mn-down)";
				return h("div", { className: "mn-chart" },
					h("div", { className: "mn-chart-legend" },
						h("span", null, h("i", { style: { background: color } }), "收盘"),
						maLine ? h("span", null, h("i", { style: { background: "var(--mn-warn)", opacity: 0.8 } }), "MA20") : null),
					h("svg", { viewBox: "0 0 " + width + " " + height, preserveAspectRatio: "none", style: { height: 168 } },
						h("defs", null,
							h("linearGradient", { id: "mn-chart-fill", x1: "0", y1: "0", x2: "0", y2: "1" },
								h("stop", { offset: "0%", stopColor: color, stopOpacity: "0.2" }),
								h("stop", { offset: "100%", stopColor: color, stopOpacity: "0" }))),
						h("path", { d: area, fill: "url(#mn-chart-fill)", stroke: "none" }),
						maLine ? h("path", { d: maLine, fill: "none", stroke: "var(--mn-warn)", strokeWidth: "1.2", strokeDasharray: "4 3", opacity: "0.85" }) : null,
						h("path", { d: line, fill: "none", stroke: color, strokeWidth: "1.8", strokeLinejoin: "round", strokeLinecap: "round" })));
			}

			function Empty(props) {
				return h("div", { className: "mn-empty" },
					h(Icon, { name: props.icon || "inbox", size: 22 }),
					h("b", null, props.title || "暂无数据"),
					props.hint ? h("span", { className: "mn-hint" }, props.hint) : null,
					props.children || null);
			}

			// ---------------- ticker ----------------

			function TickerCell(props) {
				const tone = changeTone(props.change);
				return h("div", { className: "mn-tk", title: props.title || "" },
					h("span", { className: "mn-tk-name" }, props.name),
					h("span", { className: "mn-tk-line" },
						h("b", { className: "mn-tk-price" }, props.price),
						Number.isFinite(Number(props.change))
							? h("span", { className: "mn-tk-chg " + (tone === "up" ? "mn-up" : tone === "down" ? "mn-down" : "mn-flat") }, formatPct(props.change, 2))
							: null,
						props.spark && props.spark.length > 1
							? h(Sparkline, { points: props.spark, className: "mn-tk-spark", width: 46, height: 16 })
							: null));
			}

			function TickerBar(props) {
				const market = props.market || null;
				const crypto = market ? market.crypto : null;
				const stock = market ? market.stock : null;
				const sentiment = market ? market.sentiment : null;
				const series = props.series || {};
				const closesOf = (key) => (series[key] && Array.isArray(series[key].closes) ? series[key].closes : null);
				const indexRows = stock && Array.isArray(stock.indexes) ? stock.indexes : [];
				const btc = props.cryptoRows.find((row) => row.symbol === "BTCUSDT") || null;
				const eth = props.cryptoRows.find((row) => row.symbol === "ETHUSDT") || null;
				const btcChange = crypto && Number.isFinite(Number(crypto.btcChangePct)) ? crypto.btcChangePct : btc ? btc.change : null;
				const ethChange = crypto && Number.isFinite(Number(crypto.ethChangePct)) ? crypto.ethChangePct : eth ? eth.change : null;
				const vix = sentiment ? sentiment.vix : null;
				const vxn = sentiment ? sentiment.vxn : null;
				const fng = sentiment ? sentiment.cryptoFearGreed : null;
				const state = props.error ? "warn" : props.busy ? "warn" : "ok";
				const miniStat = (label, value, width) => h("div", { className: "mn-mini-stat" },
					h("span", null, label),
					h("b", null, value),
					width === undefined || width === null
						? null
						: h("i", null, h("em", { style: { width: Math.max(3, Math.min(100, width)) + "%" } })));
				return h("div", { className: "mn-ticker" },
					h("div", { className: "mn-tk-row" },
						h("div", { className: "mn-tk-group" },
							h("span", { className: "mn-tk-group-title" }, "美股"),
							indexRows.length
								? indexRows.map((row) => h(TickerCell, {
									key: row.symbol,
									name: row.name || row.symbol,
									price: formatPrice(row.price),
									change: row.changePct,
									title: (row.name || row.symbol) + " · " + (row.aboveMa20 ? "MA20 上方" : "MA20 下方")
								}))
								: h("span", { className: "mn-hint" }, "指数加载中…")),
						h("div", { className: "mn-tk-group", "data-grow": "true" },
							h("span", { className: "mn-tk-group-title" }, "加密"),
							h(TickerCell, {
								name: "BTC",
								price: btc ? formatPrice(btc.price) : "--",
								change: btcChange,
								spark: closesOf("crypto:BTCUSDT"),
								title: "比特币 / USDT"
							}),
							h(TickerCell, {
								name: "ETH",
								price: eth ? formatPrice(eth.price) : "--",
								change: ethChange,
								spark: closesOf("crypto:ETHUSDT"),
								title: "以太坊 / USDT"
							}),
							crypto
								? h("div", { className: "mn-breadth" },
									h("span", { style: { fontSize: "10.5px", color: "var(--mn-fg-3)" } }, "全市场 " + crypto.universe + " 对"),
									h("div", { className: "mn-breadth-bar" },
										h("i", { style: { width: (crypto.up / Math.max(1, crypto.up + crypto.down)) * 100 + "%", background: "var(--mn-up)" } }),
										h("i", { style: { width: (crypto.down / Math.max(1, crypto.up + crypto.down)) * 100 + "%", background: "var(--mn-down)" } })),
									h("span", { className: "mn-breadth-meta" },
										h("span", { className: "mn-up" }, "涨 " + crypto.up),
										h("span", null, "中位 " + formatPct(crypto.medianChangePct, 2)),
										h("span", { className: "mn-down" }, "跌 " + crypto.down)))
								: null,
							crypto
								? h("div", { className: "mn-mini-row" },
									miniStat("24h 成交额", "$" + formatCompact(crypto.totalVolumeUsd)),
									miniStat("涨超 3%", crypto.up3 + " 个"),
									miniStat("跌超 3%", crypto.down3 + " 个"))
								: null)),
					h("div", { className: "mn-tk-row", "data-sub": "true" },
						h("div", { className: "mn-tk-group" },
							h("span", { className: "mn-tk-group-title" }, "情绪"),
							h(TickerCell, {
								name: "VIX 美股恐慌",
								price: vix && Number.isFinite(Number(vix.price)) ? formatNum(vix.price, 2) : "--",
								change: vix ? vix.changePct : null,
								title: vix ? "区间 " + vix.zone + " · 1 年分位 " + Math.round(vix.percentile || 0) + "%" : ""
							}),
							h(TickerCell, {
								name: "VXN 科技恐慌",
								price: vxn && Number.isFinite(Number(vxn.price)) ? formatNum(vxn.price, 2) : "--",
								change: vxn ? vxn.changePct : null,
								title: vxn ? "区间 " + vxn.zone + " · 1 年分位 " + Math.round(vxn.percentile || 0) + "%" : ""
							}),
							h("div", { className: "mn-tk", title: fng ? "恐惧贪婪指数 · 昨日 " + (fng.previous == null ? "--" : fng.previous) : "" },
								h("span", { className: "mn-tk-name" }, "加密 F&G"),
								h("span", { className: "mn-tk-line" },
									h("b", { className: "mn-tk-price" }, fng && Number.isFinite(Number(fng.value)) ? String(fng.value) : "--"),
									h("span", { className: "mn-tk-chg " + (fng && Number(fng.value) <= 45 ? "mn-down" : fng && Number(fng.value) >= 55 ? "mn-up" : "mn-flat") }, fng ? String(fng.label || "") : "")))),
						h("div", { className: "mn-tk-group", "data-grow": "true" },
							h("span", { className: "mn-tk-group-title" }, "盘面"),
							stock
								? h("div", { className: "mn-mini-row" },
									miniStat("板块上涨", stock.sectorUp + "/" + stock.sectorCount, (stock.sectorUp / Math.max(1, stock.sectorCount)) * 100),
									miniStat("指数上涨", stock.indexUp + "/" + stock.indexCount, (stock.indexUp / Math.max(1, stock.indexCount)) * 100),
									miniStat("MA20 上方", stock.aboveMa20Count + "/" + stock.aboveMa20Total, (stock.aboveMa20Count / Math.max(1, stock.aboveMa20Total)) * 100),
									miniStat("平均涨幅", formatPct(stock.avgChangePct, 2), Math.min(100, Math.abs(Number(stock.avgChangePct) || 0) * 25)))
								: h("span", { className: "mn-hint" }, "盘面数据加载中…")),
						h("div", { className: "mn-tk-meta" },
							h("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" } },
								h("i", { className: "mn-dot", "data-state": state }),
								props.updatedAt ? formatClock(props.updatedAt) + " 更新" : "连接中"),
							h("span", null, props.busy ? "刷新中…" : "每 " + Math.round((props.interval || 5000) / 1000) + " 秒自动刷新"))));
			}


			// ---------------- watchlist ----------------

			function WatchRow(props) {
				const row = props.row;
				const tone = changeTone(row.change);
				return h("div", {
					className: "mn-wl-row",
					"data-active": props.active ? "true" : "false",
					role: "button",
					tabIndex: 0,
					title: row.title + " · " + (row.sub || ""),
					onClick: props.onSelect,
					onKeyDown: (event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							props.onSelect();
						}
					}
				},
					h("span", { className: "mn-wl-sym" },
						h("b", null, row.title),
						props.showSignals && row.analysis
							? h("i", {
								className: "mn-chip",
								"data-tone": signalTone(row.analysis.tone),
								style: { fontSize: "9.5px", padding: "2px 5px" },
								title: row.analysis.preset.name + " " + row.analysis.passed + "/" + row.analysis.total
							}, row.analysis.label)
							: null),
					h("span", { className: "mn-wl-name" }, row.sub),
					h("span", { className: "mn-wl-price" }, formatPrice(row.price)),
					h("span", { className: "mn-wl-chg " + (tone === "up" ? "mn-up" : tone === "down" ? "mn-down" : "mn-flat") }, formatPct(row.change, 2)),
					h("button", {
						type: "button",
						className: "mn-wl-del",
						title: "移除 " + row.title,
						"aria-label": "移除 " + row.title,
						onClick: (event) => {
							event.stopPropagation();
							props.onRemove();
						}
					}, h(Icon, { name: "x", size: 11 })));
			}

			function Watchlist(props) {
				const rows = props.rows;
				const groups = [
					{ kind: "crypto", label: "加密", count: rows.filter((row) => row.kind === "crypto").length },
					{ kind: "stock", label: "美股", count: rows.filter((row) => row.kind === "stock").length }
				];
				const visible = rows.filter((row) => props.filter === "all" || row.kind === props.filter);
				const groupHead = (label, count) => h("div", {
					key: "g-" + label,
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "7px 15px 5px",
						fontSize: "10.5px",
						fontWeight: 700,
						letterSpacing: ".08em",
						color: "var(--mn-fg-3)",
						background: "var(--mn-card-2)",
						borderBottom: "1px solid var(--mn-line-2)",
						borderTop: "1px solid var(--mn-line-2)"
					}
				}, h("span", null, label), h("span", null, count + " 个"));
				const body = [];
				for (const group of groups) {
					if (props.filter !== "all" && props.filter !== group.kind) continue;
					const items = visible.filter((row) => row.kind === group.kind);
					if (!items.length) continue;
					body.push(groupHead(group.label, items.length));
					for (const row of items) {
						body.push(h(WatchRow, {
							key: row.key,
							row: row,
							active: props.selectedKey === row.key,
							showSignals: props.showSignals,
							onSelect: () => props.onSelect(row.key),
							onRemove: () => props.onRemove(row)
						}));
					}
				}
				return h("section", { className: "mn-card" },
					h("div", { className: "mn-card-head" },
						h("div", { className: "mn-card-title" }, h(Icon, { name: "layers", size: 14 }), "自选"),
						h("span", { className: "mn-card-note" }, rows.length + " 个 · 点击查看"),
						h("div", { className: "mn-card-tools" },
							h("div", { className: "mn-seg" },
								[["all", "全部"], ["crypto", "加密"], ["stock", "美股"]].map((pair) => h("button", {
									key: pair[0],
									type: "button",
									"data-active": props.filter === pair[0] ? "true" : "false",
									onClick: () => props.setFilter(pair[0])
								}, pair[1]))))),
					h("div", { className: "mn-search" },
						h("div", { className: "mn-search-row" },
							h("input", {
								className: "mn-input",
								value: props.query,
								placeholder: "搜索代码或名称，如 NVDA / BTC",
								"aria-label": "搜索并加入自选",
								onChange: (event) => props.onQuery(event.target.value),
								onKeyDown: (event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										props.onCommit();
									}
									if (event.key === "Escape") props.onQuery("");
								}
							}),
							h("button", {
								type: "button",
								className: "mn-btn",
								"data-size": "icon",
								title: "添加到自选",
								disabled: !props.query.trim(),
								onClick: props.onCommit
							}, h(Icon, { name: "plus", size: 14 }))),
						props.results.length
							? h("div", { className: "mn-search-results" },
								props.results.map((item) => {
									const exists = rows.some((row) => row.kind === (item.kind === "stock" ? "stock" : "crypto") && row.symbol === item.symbol);
									return h("button", {
										key: "r-" + item.kind + "-" + item.symbol,
										type: "button",
										className: "mn-result",
										disabled: exists,
										onClick: () => props.onAdd(item)
									},
										h("span", { className: "mn-result-main" },
											h("span", { className: "mn-result-name" }, item.name || item.symbol),
											h("span", { className: "mn-result-meta" }, (item.kind === "stock" ? "美股 · " : "加密 · ") + item.symbol + (isNum(item.price) ? " · " + formatPrice(item.price) : ""))),
										h("span", { className: "mn-chip", "data-tone": exists ? "muted" : "accent" }, exists ? "已在自选" : "添加"));
								}))
							: null),
					h("div", { className: "mn-wl" }, body.length ? body : h(Empty, {
						icon: "search",
						title: "自选为空",
						hint: "在上方搜索代码或名称加入自选"
					})),
					h("div", { className: "mn-wl-foot" },
						h("span", null, rows.length ? "共 " + rows.length + " 个标的" : "等待添加"),
						h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
							h("label", { style: { display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" } },
								h("input", {
									type: "checkbox",
									checked: props.onlyOpps,
									onChange: (event) => props.setOnlyOpps(event.target.checked),
									style: { margin: 0, accentColor: "var(--mn-accent)" }
								}),
								"只看信号"),
							h("select", {
								className: "mn-select",
								style: { width: "auto", padding: "4px 24px 4px 8px", fontSize: "11px", borderRadius: "7px" },
								value: props.sort,
								"aria-label": "排序方式",
								onChange: (event) => props.setSort(event.target.value)
							},
								h("option", { value: "default" }, "默认"),
								h("option", { value: "change" }, "涨幅"),
								h("option", { value: "signal" }, "信号")))));
			}


			// ---------------- detail ----------------

			function Metric(props) {
				return h("div", { className: "mn-metric" },
					h("span", { className: "mn-metric-label" }, props.label),
					h("b", { className: "mn-metric-value " + (props.tone ? "mn-" + props.tone : "") }, props.value),
					props.note ? h("span", { className: "mn-metric-note" }, props.note) : null);
			}

			function CheckRow(props) {
				const check = props.check;
				return h("div", { className: "mn-check", "data-pass": check.pass ? "true" : "false" },
					h("i", { className: "mn-check-icon" }, check.pass ? h(Icon, { name: "check", size: 9, stroke: 3 }) : h(Icon, { name: "minus", size: 9, stroke: 3 })),
					h("span", { className: "mn-check-label" }, check.label),
					check.value === null || check.value === undefined || check.value === ""
						? null
						: h("span", { className: "mn-check-value" }, String(check.value)));
			}

			function LevelCell(props) {
				return h("div", { className: "mn-level" }, h("span", null, props.label), h("b", { className: props.tone ? "mn-" + props.tone : "" }, props.value));
			}

			function DetailView(props) {
				const row = props.row;
				const [targetPrice, setTargetPrice] = useState("");
				const [targetStop, setTargetStop] = useState("");
				const [targetNote, setTargetNote] = useState("");
				const [direction, setDirection] = useState("above");
				const [showAll, setShowAll] = useState(false);
				const target = props.target || null;
				const targetKey = target ? String(target.price) + "|" + String(target.direction) + "|" + String(target.stop) + "|" + String(target.note) : "";

				useEffect(() => {
					setTargetPrice(target && isNum(target.price) ? String(target.price) : "");
					setTargetStop(target && isNum(target.stop) ? String(target.stop) : "");
					setTargetNote(target && target.note ? String(target.note) : "");
					setDirection(target && target.direction === "below" ? "below" : "above");
				}, [row ? row.key : "", targetKey]);

				if (!row) {
					return h("section", { className: "mn-card" }, h(Empty, {
						icon: "pulse",
						title: "选择左侧标的自选",
						hint: "详情包含走势、技术指标、预设评分与目标价"
					}));
				}

				const ta = row.ta || null;
				const analysis = row.analysis || null;
				const tone = changeTone(row.change);
				const closes = props.series && Array.isArray(props.series.closes)
					? props.series.closes.filter((value) => Number.isFinite(Number(value))).map(Number)
					: [];
				const ma20 = [];
				if (closes.length >= 20) {
					for (let index = 19; index < closes.length; index += 1) {
						let sum = 0;
						for (let offset = index - 19; offset <= index; offset += 1) sum += Number(closes[offset]);
						ma20.push(sum / 20);
					}
				}
				const targetTone = target && Number.isFinite(Number(target.price))
					? Math.abs(Number(target.price) - Number(row.price)) / (Number(row.price) || 1) < 0.005 ? "warn" : "accent"
					: "muted";
				const trendLabel = ta && ta.trend ? ta.trend.label : "--";
				const maState = ta && ta.maAlignment === "bull" ? "多头排列" : ta && ta.maAlignment === "bear" ? "空头排列" : "均线交织";
				const indicators = [];
				if (isNum(ta && ta.kdj)) indicators.push(["KDJ", formatNum(ta.kdj.k, 0) + " / " + formatNum(ta.kdj.d, 0) + " / " + formatNum(ta.kdj.j, 0)]);
				if (isNum(ta && ta.boll && ta.boll.percentB)) indicators.push(["布林 %B", formatNum(ta.boll.percentB, 2)]);
				if (isNum(ta && ta.boll && ta.boll.bandwidthPercentile)) indicators.push(["布林带宽分位", formatNum(ta.boll.bandwidthPercentile, 0) + "%"]);
				if (isNum(ta && ta.cci)) indicators.push(["CCI", formatNum(ta.cci, 1)]);
				if (isNum(ta && ta.williamsR)) indicators.push(["威廉 %R", formatNum(ta.williamsR, 1)]);
				if (isNum(ta && ta.obvSlopePct)) indicators.push(["OBV 斜率", formatPct(ta.obvSlopePct, 1)]);
				if (isNum(ta && ta.atrPercentile)) indicators.push(["ATR 分位", formatNum(ta.atrPercentile, 0) + "%"]);
				if (isNum(ta && ta.rangePosition)) indicators.push(["区间位置", formatNum(ta.rangePosition * 100, 0) + "%"]);
				if (isNum(ta && ta.change5dPct)) indicators.push(["5 日涨跌", formatPct(ta.change5dPct, 2)]);
				if (isNum(ta && ta.change20dPct)) indicators.push(["20 日涨跌", formatPct(ta.change20dPct, 2)]);
				if (ta && ta.rsiDivergence) indicators.push(["RSI 背离", ta.rsiDivergence === "bullish" ? "底背离" : "顶背离"]);
				if (ta && ta.candle) indicators.push(["K 线形态", ta.candle]);
				if (ta && ta.macdCross) indicators.push(["MACD 交叉", ta.macdCross === "golden" ? "金叉" : "死叉"]);
				if (ta && ta.breakout20 === true) indicators.push(["20 日突破", "是"]);
				if (ta && ta.breakdown20 === true) indicators.push(["20 日跌破", "是"]);
				if (isNum(ta && ta.maLongSlopePct)) indicators.push(["长均线斜率", formatPct(ta.maLongSlopePct, 2)]);
				if (isNum(ta && ta.volumeTrend)) indicators.push(["量能趋势", formatPct(ta.volumeTrend, 1)]);

				return h("section", { className: "mn-card" },
					h("div", { className: "mn-detail-head" },
						h("div", { className: "mn-detail-id" },
							h("div", { className: "mn-detail-sym" },
								row.title,
								h(Chip, { tone: "accent" }, row.kind === "stock" ? "美股" : "加密"),
								h(Chip, { tone: trendTone(trendLabel) }, trendLabel),
								row.analysis ? h(Chip, { tone: signalTone(row.analysis.tone), title: row.analysis.passed + "/" + row.analysis.total + " 条件满足" }, row.analysis.label) : null),
							h("div", { className: "mn-detail-name" }, row.sub || "")),
						h("div", { className: "mn-price-box" },
							h("b", { className: "mn-price" }, formatPrice(row.price)),
							h("span", { className: "mn-price-sub" },
								h("b", { className: tone === "up" ? "mn-up" : tone === "down" ? "mn-down" : "mn-flat" }, formatPct(row.change, 2)),
								row.dayLow && row.dayHigh
									? h("span", { className: "mn-hint" }, "日内 " + formatPrice(row.dayLow) + " – " + formatPrice(row.dayHigh))
									: null,
								h("span", { className: "mn-hint" }, formatAge(row.timestamp || props.updatedAt)))),
						h("div", { style: { display: "flex", gap: "6px", marginLeft: "4px" } },
							h("button", {
								type: "button",
								className: "mn-btn",
								"data-variant": "ghost",
								"data-size": "icon",
								title: "移除自选",
								onClick: props.onRemove
							}, h(Icon, { name: "trash", size: 14 })))),
					h(DetailChart, { points: closes, ma: ma20 }),
					h("div", { className: "mn-metrics" },
						h(Metric, {
							label: "RSI " + (props.settings ? props.settings.rsiPeriod : 14),
							value: formatNum(ta && ta.rsi, 1),
							note: ta && isNum(ta.rsi) ? (Number(ta.rsi) >= 70 ? "超买" : Number(ta.rsi) <= 30 ? "超卖" : "中性") : "",
							tone: ta && isNum(ta.rsi) ? (Number(ta.rsi) >= 70 || Number(ta.rsi) <= 30 ? "down" : "flat") : ""
						}),
						h(Metric, {
							label: "MACD 柱",
							value: formatNum(ta && ta.macd && ta.macd.hist, 2),
							note: ta && ta.macd && isNum(ta.macd.hist) && isNum(ta.macd.prevHist)
								? (Number(ta.macd.hist) > Number(ta.macd.prevHist) ? "动能改善" : "动能走弱")
								: "",
							tone: ta && ta.macd && isNum(ta.macd.hist) ? (Number(ta.macd.hist) >= 0 ? "up" : "down") : ""
						}),
						h(Metric, {
							label: "ADX",
							value: formatNum(ta && ta.adx && ta.adx.adx, 1),
							note: ta && ta.adx && isNum(ta.adx.adx) ? (Number(ta.adx.adx) >= 25 ? "趋势明确" : "趋势偏弱") : ""
						}),
						h(Metric, {
							label: "ATR%",
							value: isNum(ta && ta.atrPct) ? formatNum(ta.atrPct, 2) + "%" : "--",
							note: isNum(ta && ta.atrPercentile) ? "分位 " + formatNum(ta.atrPercentile, 0) + "%" : ""
						}),
						h(Metric, {
							label: "量比",
							value: formatNum(ta && ta.volumeRatio, 2),
							note: isNum(ta && ta.volumeRatio) ? (Number(ta.volumeRatio) >= 1.2 ? "放量" : Number(ta.volumeRatio) <= 0.8 ? "缩量" : "平稳") : ""
						}),
						h(Metric, {
							label: "距 60 日高",
							value: isNum(ta && ta.distanceHigh60Pct) ? formatPct(ta.distanceHigh60Pct, 1) : "--",
							note: maState,
							tone: isNum(ta && ta.distanceHigh60Pct) ? (Number(ta.distanceHigh60Pct) >= -3 ? "up" : "flat") : ""
						})),
					h("div", { className: "mn-section" },
						h("div", { className: "mn-section-head" },
							h("span", { className: "mn-section-title" }, "预设评分"),
							h("span", { className: "mn-section-note" }, analysis ? analysis.preset.name + " · 止损 " + (props.settings ? props.settings.thresholds.stopAtr : 2) + "×ATR · 盈亏比 " + (props.settings ? props.settings.thresholds.rr : 1.5) : "等待指标")),
						analysis
							? h("div", null,
								h("div", { className: "mn-strategy-head" },
									h("div", {
										className: "mn-score",
										"data-tone": analysis.tone,
										style: { "--mn-score": Math.round(analysis.ratio * 100) }
									}, h("span", null, analysis.passed + "/" + analysis.total)),
									h("div", { className: "mn-strategy-main" },
										h("span", { className: "mn-strategy-name" },
											analysis.preset.name,
											h(Chip, { tone: signalTone(analysis.tone) }, analysis.label)),
										h("span", { className: "mn-strategy-desc" }, analysis.preset.desc || PRESET_BASE_LABELS[analysis.preset.base] || ""))),
								h("div", { className: "mn-checks" }, analysis.checks.map((check, index) => h(CheckRow, { key: index, check: check }))),
								h("div", { className: "mn-verdict", "data-tone": analysis.tone },
									h(Icon, { name: analysis.tone === "buy" ? "check" : "warn", size: 13 }),
									analysis.verdict),
								analysis.levels
									? h("div", { className: "mn-levels" },
										h(LevelCell, { label: "入场", value: formatPrice(analysis.levels.entry) }),
										h(LevelCell, { label: "止损", value: formatPrice(analysis.levels.stopLong) + " (" + formatPct(-analysis.levels.riskPct, 1) + ")", tone: "down" }),
										h(LevelCell, { label: "目标", value: formatPrice(analysis.levels.targetLong) + " (" + formatPct(analysis.levels.rewardPct, 1) + ")", tone: "up" }),
										h(LevelCell, { label: "盈亏比", value: formatNum(analysis.levels.rr, 1) + " : 1" }),
										h(LevelCell, { label: "支撑", value: formatPrice(analysis.levels.support) }),
										h(LevelCell, { label: "压力", value: formatPrice(analysis.levels.resistance) }))
									: null)
							: h("div", { className: "mn-empty" }, h("span", { className: "mn-hint" }, "指标计算中，稍后显示预设评分"))),
					h("div", { className: "mn-section" },
						h("div", { className: "mn-section-head" },
							h("span", { className: "mn-section-title" }, "目标价提醒"),
							target ? h(Chip, { tone: targetTone }, (target.direction === "below" ? "下破 " : "上破 ") + formatPrice(target.price)) : h("span", { className: "mn-section-note" }, "未设置")),
						target && target.note ? h("div", { className: "mn-target-current" }, "备注：" + target.note) : null,
						h("div", { className: "mn-target-grid" },
							h("input", {
								className: "mn-input",
								type: "number",
								min: "0",
								step: "any",
								value: targetPrice,
								placeholder: "目标价",
								"aria-label": "目标价",
								onChange: (event) => setTargetPrice(event.target.value)
							}),
							h("select", {
								className: "mn-select",
								value: direction,
								"aria-label": "触发方向",
								onChange: (event) => setDirection(event.target.value)
							}, h("option", { value: "above" }, "上破"), h("option", { value: "below" }, "下破")),
							h("input", {
								className: "mn-input",
								type: "number",
								min: "0",
								step: "any",
								value: targetStop,
								placeholder: "止损价（可选）",
								"aria-label": "止损价",
								onChange: (event) => setTargetStop(event.target.value)
							})),
						h("div", { className: "mn-target-grid", style: { marginTop: "8px" } },
							h("input", {
								className: "mn-input",
								value: targetNote,
								placeholder: "备注（可选，如 突破后目标）",
								maxLength: 60,
								"aria-label": "备注",
								onChange: (event) => setTargetNote(event.target.value)
							})),
						h("div", { className: "mn-target-actions" },
							h("button", {
								type: "button",
								className: "mn-btn",
								"data-variant": "primary",
								onClick: () => props.onSaveTarget(row, targetPrice, direction, targetStop, targetNote)
							}, h(Icon, { name: "target", size: 13 }), "保存目标"),
							target ? h("button", {
								type: "button",
								className: "mn-btn",
								"data-variant": "danger",
								onClick: () => props.onDeleteTarget(row)
							}, "清除目标") : null,
							h("span", { className: "mn-hint", style: { marginLeft: "auto", alignSelf: "center" } }, "达到目标或触发条件时会写入提醒"))),
					h("div", { className: "mn-section" },
						h("div", { className: "mn-section-head" },
							h("span", { className: "mn-section-title" }, "全部指标"),
							h("button", {
								type: "button",
								className: "mn-btn",
								"data-size": "sm",
								"data-variant": "ghost",
								style: { marginLeft: "auto" },
								onClick: () => setShowAll(!showAll)
							}, showAll ? "收起" : "展开")),
						showAll
							? h("div", { className: "mn-kv" }, indicators.length
								? indicators.map((pair, index) => h("div", { className: "mn-kv-item", key: index },
									h("span", null, pair[0]),
									h("b", null, pair[1])))
								: h("span", { className: "mn-hint" }, "暂无更多指标"))
							: h("div", { className: "mn-kv" },
								indicators.slice(0, 8).map((pair, index) => h("div", { className: "mn-kv-item", key: index },
									h("span", null, pair[0]),
									h("b", null, pair[1]))))));
			}


			// ---------------- mood ----------------

			const FNG_LABELS = {
				"Extreme Fear": "极度恐惧",
				Fear: "恐惧",
				Neutral: "中性",
				Greed: "贪婪",
				"Extreme Greed": "极度贪婪"
			};

			function gaugeTone(kind, gauge) {
				if (!gauge) return "neutral";
				if (kind === "fng") {
					const value = Number(gauge.value);
					if (!Number.isFinite(value)) return "neutral";
					if (value <= 25) return "fear";
					if (value <= 45) return "alert";
					if (value >= 75) return "calm";
					return "neutral";
				}
				if (gauge.zone === "极度恐慌" || gauge.zone === "恐慌") return "fear";
				if (gauge.zone === "警惕") return "alert";
				if (gauge.zone === "平静") return "calm";
				return "neutral";
			}

			function Gauge(props) {
				const pct = clamp(props.percent, 0, 100);
				return h("div", { className: "mn-gauge", "data-tone": props.tone || "neutral" },
					h("div", { className: "mn-gauge-top" },
						h("span", { className: "mn-gauge-name" }, props.name),
						h("b", { className: "mn-gauge-value" }, props.value),
						props.zone ? h(Chip, { tone: props.tone === "fear" ? "down" : props.tone === "alert" ? "warn" : props.tone === "calm" ? "up" : "muted" }, props.zone) : null,
						h("span", { className: "mn-gauge-meta" }, props.meta || "")),
					h("div", { className: "mn-gauge-track" },
						h("i", { className: "mn-gauge-fill", style: { width: pct + "%" } })));
			}

			function DistRow(props) {
				const item = props.item;
				if (!item || !Array.isArray(item.zones) || !item.zones.length) return null;
				const flip = props.flip === true;
				const toneOf = (index) => {
					if (flip) return index <= 1 ? "fear" : index === 2 ? "neutral" : "calm";
					return index <= 1 ? "calm" : index === 2 ? "neutral" : "fear";
				};
				const current = item.zones.find((zone) => zone.current) || null;
				const exceed = (item.exceedance || []).map((row) => row.label + " " + row.perYear + " 天/年").join(" · ");
				return h("div", { className: "mn-dist" },
					h("div", { className: "mn-dist-top" },
						h("span", { style: { fontSize: "11.5px", fontWeight: 600, color: "var(--mn-fg)" } }, props.title),
						h("b", null, current ? current.label : "--"),
						h("span", null, current ? current.perYear + " 天/年 · 高于 " + Math.round(item.historicalPercentile || 0) + "% 交易日" : "")),
					h("div", { className: "mn-dist-bar" },
						item.zones.map((zone, index) => h("i", {
							key: index,
							className: "mn-dist-seg",
							"data-tone": toneOf(index),
							"data-current": zone.current ? "true" : "false",
							style: { width: Math.max(2, Number(zone.pct) || 2) + "%" },
							title: zone.label + " · " + zone.pct + "% · 每年约 " + zone.perYear + " 天"
						}))),
					h("div", { className: "mn-dist-meta" },
						h("span", null, "样本 " + (item.years || "--") + " 年 · 常态 " + (item.mode ? item.mode.label : "--")),
						exceed ? h("span", { title: "每年 ≥/≤ 该值的交易日数" }, exceed) : null));
			}

			function MoodView(props) {
				const market = props.market || null;
				const sentiment = market ? market.sentiment : null;
				const crypto = market ? market.crypto : null;
				const stock = market ? market.stock : null;
				const derivatives = crypto ? crypto.derivatives : null;
				const vix = sentiment ? sentiment.vix : null;
				const vxn = sentiment ? sentiment.vxn : null;
				const fng = sentiment ? sentiment.cryptoFearGreed : null;
				const indexes = stock && Array.isArray(stock.indexes) ? stock.indexes : [];
				const sectors = stock && Array.isArray(stock.sectors) ? stock.sectors.slice().sort((left, right) => Number(right.changePct) - Number(left.changePct)) : [];
				const maxSector = sectors.reduce((best, row) => Math.max(best, Math.abs(Number(row.changePct) || 0)), 0.01);
				return h("div", { className: "mn-mood-cols" },
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "pulse", size: 14 }), "情绪仪表"),
							h("span", { className: "mn-card-note" }, "波动率分位 + 恐惧贪婪")),
						h("div", { className: "mn-card-body", style: { paddingTop: "4px" } },
							h(Gauge, {
								name: "VIX 美股恐慌",
								value: vix && isNum(vix.price) ? formatNum(vix.price, 2) : "--",
								zone: vix ? vix.zone : "",
								tone: gaugeTone("vix", vix),
								percent: vix ? vix.percentile : 0,
								meta: vix ? "1 年分位 " + Math.round(vix.percentile || 0) + "% · " + formatPct(vix.changePct, 2) : "等待数据"
							}),
							h(Gauge, {
								name: "VXN 科技恐慌",
								value: vxn && isNum(vxn.price) ? formatNum(vxn.price, 2) : "--",
								zone: vxn ? vxn.zone : "",
								tone: gaugeTone("vxn", vxn),
								percent: vxn ? vxn.percentile : 0,
								meta: vxn ? "1 年分位 " + Math.round(vxn.percentile || 0) + "% · " + formatPct(vxn.changePct, 2) : "等待数据"
							}),
							h(Gauge, {
								name: "加密恐惧贪婪",
								value: fng && isNum(fng.value) ? String(fng.value) : "--",
								zone: fng ? (FNG_LABELS[fng.label] || fng.label || "") : "",
								tone: gaugeTone("fng", fng),
								percent: fng ? fng.value : 0,
								meta: fng && fng.previous != null ? "昨日 " + fng.previous + " · 0 极度恐惧 / 100 极度贪婪" : "等待数据"
							}))),
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "layers", size: 14 }), "历史分布"),
							h("span", { className: "mn-card-note" }, "条宽 = 历史占比 · 高亮 = 当前区间")),
						h("div", { className: "mn-card-body", style: { paddingTop: "4px" } },
							h(DistRow, { title: "VIX", item: vix ? vix.distribution : null }),
							h(DistRow, { title: "VXN", item: vxn ? vxn.distribution : null }),
							h(DistRow, { title: "加密 F&G", item: fng ? fng.distribution : null, flip: true }))),
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "coin", size: 14 }), "加密盘面"),
							h("span", { className: "mn-card-note" }, crypto ? crypto.source : "")),
						h("div", { className: "mn-card-body" },
							crypto
								? h("div", null,
									h("div", { className: "mn-kv" },
										h("div", { className: "mn-kv-item" }, h("span", null, "上涨 / 下跌"), h("b", null, h("span", { className: "mn-up" }, crypto.up), " / ", h("span", { className: "mn-down" }, crypto.down))),
										h("div", { className: "mn-kv-item" }, h("span", null, "中位涨幅"), h("b", { className: changeTone(crypto.medianChangePct) === "up" ? "mn-up" : "mn-down" }, formatPct(crypto.medianChangePct, 2))),
										h("div", { className: "mn-kv-item" }, h("span", null, "成交额加权"), h("b", null, formatPct(crypto.weightedChangePct, 2))),
										h("div", { className: "mn-kv-item" }, h("span", null, "24h 成交额"), h("b", null, "$" + formatCompact(crypto.totalVolumeUsd))),
										h("div", { className: "mn-kv-item" }, h("span", null, "涨超 3% / 跌超 3%"), h("b", null, crypto.up3 + " / " + crypto.down3)),
										h("div", { className: "mn-kv-item" }, h("span", null, "市场判定"), h("b", null, crypto.label + " · 多 " + crypto.bullProbability + "%"))),
									h("div", { className: "mn-split" }),
									h("div", { className: "mn-kv" },
										h("div", { className: "mn-kv-item" }, h("span", null, "多空账户比"), h("b", null, derivatives && isNum(derivatives.longShortRatio) ? formatNum(derivatives.longShortRatio, 2) : "--")),
										h("div", { className: "mn-kv-item" }, h("span", null, "多头占比"), h("b", null, derivatives && isNum(derivatives.longPct) ? formatNum(derivatives.longPct, 1) + "%" : "--")),
										h("div", { className: "mn-kv-item" }, h("span", null, "未平仓 OI"), h("b", null, derivatives && isNum(derivatives.openInterestUsd) ? "$" + formatCompact(derivatives.openInterestUsd) : "--")),
										h("div", { className: "mn-kv-item" }, h("span", null, "资金费率"), h("b", { className: derivatives && Number(derivatives.fundingRatePct) >= 0 ? "mn-up" : "mn-down" }, derivatives && isNum(derivatives.fundingRatePct) ? formatNum(derivatives.fundingRatePct, 4) + "%" : "--")))) : null,
							h("span", { className: "mn-hint" }, derivatives ? "OKX BTC 永续：账户多空比 / 未平仓名义价值 / 当前资金费率" : "衍生品数据暂不可用"))),
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "trendUp", size: 14 }), "美股板块"),
							h("span", { className: "mn-card-note" }, stock ? stock.sectorUp + "/" + stock.sectorCount + " 上涨" : "")),
						h("div", { className: "mn-card-body", "data-flush": "true" },
							h("div", { style: { padding: "10px 15px 4px" } },
								sectors.length
									? h("div", { className: "mn-rows" }, sectors.map((row) => {
										const tone = changeTone(row.changePct);
										const width = Math.max(4, (Math.abs(Number(row.changePct) || 0) / maxSector) * 100);
										return h("div", { className: "mn-row", key: row.symbol },
											h("span", { className: "mn-row-name" }, row.name || row.symbol, h("span", { className: "mn-hint" }, row.symbol)),
											h("span", { className: "mn-row-bar" }, h("i", { style: { width: width + "%", background: tone === "up" ? "var(--mn-up)" : "var(--mn-down)" } })),
											h("span", { className: "mn-row-value " + (tone === "up" ? "mn-up" : tone === "down" ? "mn-down" : "mn-flat") }, formatPct(row.changePct, 2)));
									}))
									: h("span", { className: "mn-hint" }, "板块数据加载中…")))),
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "trendUp", size: 14 }), "美股指数"),
							h("span", { className: "mn-card-note" }, stock ? stock.indexUp + "/" + stock.indexCount + " 上涨 · 平均 " + formatPct(stock.avgChangePct, 2) : "")),
						h("div", { className: "mn-card-body" },
							indexes.length
								? h("div", { className: "mn-rows" }, indexes.map((row) => {
									const tone = changeTone(row.changePct);
									return h("div", { className: "mn-row", key: row.symbol },
										h("span", { className: "mn-row-name" }, row.name || row.symbol),
										row.aboveMa20 === true ? h(Chip, { tone: "up" }, "MA20 上方") : row.aboveMa20 === false ? h(Chip, { tone: "down" }, "MA20 下方") : null,
										h("span", { className: "mn-row-value", style: { minWidth: "76px" } }, formatPrice(row.price)),
										h("span", { className: "mn-row-value " + (tone === "up" ? "mn-up" : tone === "down" ? "mn-down" : "mn-flat"), style: { minWidth: "64px" } }, formatPct(row.changePct, 2)));
								}))
								: h("span", { className: "mn-hint" }, "指数数据加载中…"))),
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "pulse", size: 14 }), "盘面提示"),
							h("span", { className: "mn-card-note" }, "按情绪与宽度自动生成")),
						h("div", { className: "mn-card-body" }, props.advice
							? props.advice.map((line, index) => h("div", { key: index, style: { display: "flex", gap: "8px", padding: "5px 0", fontSize: "12px", color: "var(--mn-fg-2)" } },
								h(Icon, { name: "warn", size: 13 }),
								h("span", null, line)))
							: h("span", { className: "mn-hint" }, "暂无风险提示"))));
			}


			// ---------------- signals ----------------

			function SignalsView(props) {
				const rows = props.rows.slice().sort((left, right) => {
					const a = left.analysis ? left.analysis.ratio : -1;
					const b = right.analysis ? right.analysis.ratio : -1;
					return b - a;
				});
				const preset = props.preset;
				const thresholds = props.settings.thresholds;
				return h("div", { className: "mn-mood-grid" },
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "target", size: 14 }), "机会扫描"),
							h("span", { className: "mn-card-note" }, "按预设条件满足度排序")),
						h("div", { className: "mn-card-body", "data-flush": "true" },
							h("div", { style: { padding: "6px 15px 12px" } },
								rows.length
									? rows.map((row) => {
										const analysis = row.analysis;
										const ratio = analysis ? analysis.ratio : 0;
										const tone = analysis ? analysis.tone : "skip";
										return h("div", {
											key: row.key,
											className: "mn-opp",
											role: "button",
											tabIndex: 0,
											onClick: () => props.onOpen(row.key),
											onKeyDown: (event) => {
												if (event.key === "Enter") props.onOpen(row.key);
											}
										},
											h("span", { className: "mn-opp-sym" }, row.title),
											h("span", { className: "mn-opp-bar" }, h("i", {
												style: {
													width: Math.round(ratio * 100) + "%",
													background: tone === "buy" ? "var(--mn-up)" : tone === "add" ? "var(--mn-accent)" : tone === "watch" ? "var(--mn-warn)" : "#b9c4d2"
												}
											})),
											h("span", { className: "mn-opp-count" }, analysis ? analysis.passed + "/" + analysis.total : "--"),
											h(Chip, { tone: signalTone(tone) }, analysis ? analysis.label : "无数据"),
											h("span", { className: "mn-hint", style: { minWidth: "58px", textAlign: "right" } }, formatPct(row.change, 2)));
									})
									: h(Empty, { icon: "target", title: "暂无自选", hint: "先在看板添加标的" })))),
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "sliders", size: 14 }), "当前预设"),
							h("span", { className: "mn-card-note" }, preset.name)),
						h("div", { className: "mn-card-body" },
							h("div", { className: "mn-hint", style: { marginBottom: "10px" } }, preset.desc || "—"),
							h("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" } },
								h(Chip, null, "RSI " + thresholds.rsiMin + "–" + thresholds.rsiMax),
								h(Chip, null, "ADX ≥ " + thresholds.adxMin),
								h(Chip, null, "量比 ≥ " + thresholds.volRatio),
								h(Chip, null, "%B ≤ " + thresholds.percentBMax),
								h(Chip, null, "距高 ≤ " + thresholds.distHigh + "%"),
								h(Chip, null, "布林分位 ≤ " + thresholds.bbPctMax + "%"),
								h(Chip, null, "止损 " + thresholds.stopAtr + "×ATR"),
								h(Chip, null, "盈亏比 " + thresholds.rr)),
							h("div", { className: "mn-split" }),
							h("div", { className: "mn-kv" },
								h("div", { className: "mn-kv-item" }, h("span", null, "买入阈值"), h("b", null, "80% 条件")),
								h("div", { className: "mn-kv-item" }, h("span", null, "关注阈值"), h("b", null, "60% 条件")),
								h("div", { className: "mn-kv-item" }, h("span", null, "扫描标的"), h("b", null, rows.length + " 个")),
								h("div", { className: "mn-kv-item" }, h("span", null, "自动提醒"), h("b", null, props.settings.showAlerts ? "已开启" : "已关闭"))),
							h("div", { className: "mn-split" }),
							h("label", { className: "mn-switch" },
								h("input", {
									type: "checkbox",
									checked: props.settings.showAlerts,
									onChange: (event) => props.onPatch({ showAlerts: event.target.checked })
								}),
								"启用信号扫描"),
							h("label", { className: "mn-switch" },
								h("input", {
									type: "checkbox",
									checked: props.settings.notifyDesktop,
									onChange: (event) => {
										if (event.target.checked) props.onRequestNotify();
										props.onPatch({ notifyDesktop: event.target.checked });
									}
								}),
								"桌面通知（需浏览器授权）"))),
					h("section", { className: "mn-card", style: { gridColumn: "1 / -1" } },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "bell", size: 14 }), "提醒记录"),
							h("span", { className: "mn-card-note" }, props.alerts.length + " 条"),
							h("div", { className: "mn-card-tools" },
								h("button", {
									type: "button",
									className: "mn-btn",
									"data-size": "sm",
									"data-variant": "ghost",
									disabled: !props.alerts.length,
									onClick: props.onClear
								}, "清空"))),
						h("div", { className: "mn-card-body", "data-flush": "true" },
							h("div", { style: { padding: "4px 15px 12px" } },
								props.alerts.length
									? props.alerts.map((item, index) => h("div", { className: "mn-alert", key: index },
										h("div", { className: "mn-alert-icon" }, h(Icon, { name: "bell", size: 13 })),
										h("div", { className: "mn-alert-main" },
											h("span", { className: "mn-alert-title" }, item.name + " · " + item.label),
											h("span", { className: "mn-alert-sub" }, item.preset + " " + item.passed + "/" + item.total + " 条件满足")),
										h("span", { className: "mn-alert-time" }, formatClock(item.ts))))
									: h(Empty, { icon: "bell", title: "暂无提醒", hint: "自选标的满足买入条件或触及目标价时会记录在这里" })))));
			}

			// ---------------- settings ----------------

			function SettingsView(props) {
				const settings = props.settings;
				const preset = props.preset;
				const thresholds = settings.thresholds;
				const [presetName, setPresetName] = useState("");
				const numberField = (label, key, options, hint) => h("label", { className: "mn-field" },
					h("span", { className: "mn-field-label" }, label, hint ? h("em", null, hint) : null),
					h("select", {
						className: "mn-select",
						value: String(settings[key]),
						onChange: (event) => props.onPatch({ [key]: Number(event.target.value) })
					}, options.map((value) => h("option", { key: value, value: String(value) }, String(value)))));
				const thresholdField = (label, key, step, min, max) => h("label", { className: "mn-field" },
					h("span", { className: "mn-field-label" }, label),
					h("input", {
						className: "mn-input",
						type: "number",
						step: step,
						min: min,
						max: max,
						value: String(thresholds[key]),
						onChange: (event) => props.onThreshold(key, event.target.value)
					}));
				return h("div", { className: "mn-settings-grid" },
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" }, h("div", { className: "mn-card-title" }, h(Icon, { name: "refresh", size: 14 }), "行情与刷新")),
						h("div", { className: "mn-card-body" },
							h("label", { className: "mn-field" },
								h("span", { className: "mn-field-label" }, "自动刷新间隔"),
								h("select", {
									className: "mn-select",
									value: String(settings.interval),
									onChange: (event) => props.onPatch({ interval: Number(event.target.value) })
								}, SETTING_OPTIONS.interval.map((value) => h("option", { key: value, value: String(value) }, value / 1000 + " 秒")))),
							h("label", { className: "mn-field" },
								h("span", { className: "mn-field-label" }, "策略风格"),
								h("select", {
									className: "mn-select",
									value: settings.style,
									onChange: (event) => props.onPatch({ style: event.target.value })
								}, SETTING_OPTIONS.style.map((value) => h("option", { key: value, value: value }, STYLE_LABELS[value] || value)))),
							h("label", { className: "mn-switch" },
								h("input", { type: "checkbox", checked: settings.showSignals, onChange: (event) => props.onPatch({ showSignals: event.target.checked }) }),
								"在看板显示信号标签"),
							h("label", { className: "mn-switch" },
								h("input", { type: "checkbox", checked: settings.onlyOpps, onChange: (event) => props.onPatch({ onlyOpps: event.target.checked }) }),
								"默认只看有信号的标的"),
							h("div", { className: "mn-split" }),
							h("label", { className: "mn-switch" },
								h("input", { type: "checkbox", checked: settings.showAlerts, onChange: (event) => props.onPatch({ showAlerts: event.target.checked }) }),
								"启用信号扫描"),
							h("label", { className: "mn-switch" },
								h("input", {
									type: "checkbox",
									checked: settings.notifyDesktop,
									onChange: (event) => {
										if (event.target.checked) props.onRequestNotify();
										props.onPatch({ notifyDesktop: event.target.checked });
									}
								}),
								"桌面通知"),
							h("div", { className: "mn-split" }),
							h("button", { type: "button", className: "mn-btn", onClick: props.onReset }, "恢复默认参数"))),
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "sliders", size: 14 }), "指标参数"),
							h("span", { className: "mn-card-note" }, "修改后自动重新拉取")),
						h("div", { className: "mn-card-body" },
							h("div", { className: "mn-field-3" },
								numberField("快线", "maFast", SETTING_OPTIONS.maFast),
								numberField("慢线", "maSlow", SETTING_OPTIONS.maSlow),
								numberField("长线", "maLong", SETTING_OPTIONS.maLong)),
							h("div", { className: "mn-field-3" },
								numberField("RSI", "rsiPeriod", SETTING_OPTIONS.rsiPeriod),
								numberField("ATR", "atrPeriod", SETTING_OPTIONS.atrPeriod),
								numberField("ADX", "adxPeriod", SETTING_OPTIONS.adxPeriod)),
							h("div", { className: "mn-field-2" },
								numberField("突破天数", "breakoutDays", SETTING_OPTIONS.breakoutDays),
								numberField("量能周期", "volumePeriod", SETTING_OPTIONS.volumePeriod)),
							h("div", { className: "mn-field-2" },
								h("label", { className: "mn-field" },
									h("span", { className: "mn-field-label" }, "MACD", h("em", null, settings.macd)),
									h("input", {
										className: "mn-input",
										value: settings.macd,
										placeholder: "12,26,9",
										onChange: (event) => props.onPatch({ macd: event.target.value })
									})),
								h("label", { className: "mn-field" },
									h("span", { className: "mn-field-label" }, "BOLL", h("em", null, settings.boll)),
									h("input", {
										className: "mn-input",
										value: settings.boll,
										placeholder: "20,2",
										onChange: (event) => props.onPatch({ boll: event.target.value })
									}))),
							h("label", { className: "mn-field" },
								h("span", { className: "mn-field-label" }, "趋势判定阈值", h("em", null, formatNum(settings.threshold, 2))),
								h("input", {
									className: "mn-range",
									type: "range",
									min: "0.05",
									max: "0.6",
									step: "0.01",
									value: settings.threshold,
									onChange: (event) => props.onPatch({ threshold: Number(event.target.value) })
								})))),
					h("section", { className: "mn-card" },
						h("div", { className: "mn-card-head" },
							h("div", { className: "mn-card-title" }, h(Icon, { name: "target", size: 14 }), "预设策略"),
							h("span", { className: "mn-card-note" }, PRESET_BASE_LABELS[preset.base] || "")),
						h("div", { className: "mn-card-body" },
							h("label", { className: "mn-field" },
								h("span", { className: "mn-field-label" }, "当前预设"),
								h("select", {
									className: "mn-select",
									value: settings.presetId,
									onChange: (event) => props.onPresetSelect(event.target.value)
								}, props.presets.map((item) => h("option", { key: item.id, value: item.id }, item.name + (item.custom ? " · 自定义" : ""))))),
							h("div", { className: "mn-field-2" },
								thresholdField("RSI 下限", "rsiMin", 1, 0, 100),
								thresholdField("RSI 上限", "rsiMax", 1, 0, 100)),
							h("div", { className: "mn-field-2" },
								thresholdField("ADX 下限", "adxMin", 1, 0, 60),
								thresholdField("量比", "volRatio", 0.1, 0.2, 5)),
							h("div", { className: "mn-field-2" },
								thresholdField("%B 上限", "percentBMax", 0.05, 0, 1.5),
								thresholdField("距高上限 %", "distHigh", 1, -60, 0)),
							h("div", { className: "mn-field-3" },
								thresholdField("布林分位", "bbPctMax", 5, 0, 100),
								thresholdField("止损 ATR", "stopAtr", 0.5, 0.5, 5),
								thresholdField("盈亏比", "rr", 0.5, 0.5, 5)),
							h("div", { className: "mn-split" }),
							h("div", { className: "mn-field-2" },
								h("label", { className: "mn-field" },
									h("span", { className: "mn-field-label" }, "保存为自定义预设"),
									h("input", {
										className: "mn-input",
										value: presetName,
										placeholder: "预设名称，如 我的动量",
										maxLength: 16,
										onChange: (event) => setPresetName(event.target.value)
									})),
								h("div", { style: { display: "flex", alignItems: "flex-end", gap: "7px", paddingBottom: "11px" } },
									h("button", {
										type: "button",
										className: "mn-btn",
										"data-variant": "primary",
										disabled: !presetName.trim(),
										onClick: () => {
											props.onSavePreset(presetName.trim());
											setPresetName("");
										}
									}, "保存"),
									preset.custom
										? h("button", { type: "button", className: "mn-btn", "data-variant": "danger", onClick: props.onDeletePreset }, "删除")
										: null)))));
			}

			// ---------------- dashboard ----------------

			function marketAdvice(sentiment) {
				const out = [];
				if (!sentiment) return out;
				const vix = sentiment.vix ? Number(sentiment.vix.price) : NaN;
				const vxn = sentiment.vxn ? Number(sentiment.vxn.price) : NaN;
				const fng = sentiment.cryptoFearGreed ? Number(sentiment.cryptoFearGreed.value) : NaN;
				if (Number.isFinite(vix)) {
					if (vix >= 30) out.push("VIX " + vix.toFixed(0) + " 极度恐慌：分批观察，避免一次性建仓");
					else if (vix >= 25) out.push("VIX " + vix.toFixed(0) + " 恐慌：轻仓观察，等待回落到 20 以下");
					else if (vix >= 20) out.push("VIX " + vix.toFixed(0) + " 警惕：避免追高，新仓减半");
					else if (vix < 15) out.push("VIX " + vix.toFixed(0) + " 平静：按预设观察");
					else out.push("VIX " + vix.toFixed(0) + " 正常：按预设信号观察");
				}
				if (Number.isFinite(vxn)) {
					if (vxn >= 35) out.push("科技 VXN " + vxn.toFixed(0) + " 极高：等待科技股企稳");
					else if (vxn >= 28) out.push("科技 VXN " + vxn.toFixed(0) + " 偏高：控制科技仓位");
				}
				if (Number.isFinite(fng)) {
					if (fng <= 25) out.push("加密 F&G " + fng + " 极度恐惧：分批观察，避免重仓");
					else if (fng <= 45) out.push("加密 F&G " + fng + " 恐惧：分批观察");
					else if (fng >= 75) out.push("加密 F&G " + fng + " 过热：适度减仓");
				}
				return out;
			}

			function detectTheme() {
				try {
					const html = document.documentElement;
					const body = document.body;
					const attr = String((html && html.getAttribute("data-theme")) || (body && body.getAttribute("data-theme")) || "").toLowerCase();
					if (attr.indexOf("dark") >= 0) return "dark";
					if (attr.indexOf("light") >= 0) return "light";
					const cls = String((html && html.className) || "") + " " + String((body && body.className) || "");
					if (cls.toLowerCase().indexOf("dark") >= 0) return "dark";
					if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
				} catch (error) {
					// ignore
				}
				return "light";
			}

			function Dashboard() {
				const [settings, setSettings] = useState(loadSettings);
				const [customPresets, setCustomPresets] = useState(loadCustomPresets);
				const [serverState, setServerState] = useState({
					revision: 0,
					updatedAt: null,
					watchlist: { crypto: DEFAULT_CRYPTO.slice(), stocks: DEFAULT_STOCKS.slice() },
					targets: {}
				});
				const [quotes, setQuotes] = useState({ crypto: [], stocks: [], ts: 0, errors: {} });
				const [market, setMarket] = useState(null);
				const [series, setSeries] = useState({});
				const [alerts, setAlerts] = useState(() => {
					const stored = readJson(ALERTS_KEY) || readJson(LEGACY_ALERTS_KEY);
					return Array.isArray(stored) ? stored.slice(0, 50) : [];
				});
				const [view, setView] = useState(() => {
					const stored = readJson(VIEW_KEY);
					return ["board", "mood", "signals", "settings"].indexOf(stored) >= 0 ? stored : "board";
				});
				const [filter, setFilter] = useState(() => {
					const stored = readJson(FILTER_KEY);
					return ["all", "crypto", "stock"].indexOf(stored) >= 0 ? stored : "all";
				});
				const [selectedKey, setSelectedKey] = useState(null);
				const [query, setQuery] = useState("");
				const [results, setResults] = useState([]);
				const [busy, setBusy] = useState(false);
				const [error, setError] = useState("");
				const [toast, setToast] = useState("");
				const [theme, setTheme] = useState(detectTheme);

				const alive = useRef(true);
				const settingsRef = useRef(settings);
				const lastMarket = useRef(0);
				const lastSeries = useRef(0);
				const alertState = useRef(new Map());
				const alertReady = useRef(false);
				const lastAlertAt = useRef(new Map());
				const hitTargets = useRef(new Set());
				const toastTimer = useRef(0);
				const firstSettingsRun = useRef(true);

				settingsRef.current = settings;

				const showToast = useCallback((text) => {
					setToast(text);
					window.clearTimeout(toastTimer.current);
					toastTimer.current = window.setTimeout(() => setToast(""), 4200);
				}, []);

				const persistSettings = useCallback((next) => {
					writeJson(SETTINGS_KEY, next);
				}, []);

				const load = useCallback(async (manual) => {
					if (manual) setBusy(true);
					const current = settingsRef.current;
					try {
						const stateResponse = await fetch(STATE_URL, { cache: "no-store" });
						const statePayload = await stateResponse.json();
						if (!alive.current) return;
						const watchlist = statePayload && statePayload.watchlist
							? {
								crypto: (statePayload.watchlist.crypto || []).slice(0, MAX_CRYPTO),
								stocks: (statePayload.watchlist.stocks || []).slice(0, MAX_STOCKS)
							}
							: { crypto: DEFAULT_CRYPTO.slice(), stocks: DEFAULT_STOCKS.slice() };
						const params = new URLSearchParams();
						if (watchlist.crypto.length) params.set("symbols", watchlist.crypto.join(","));
						if (watchlist.stocks.length) params.set("stocks", watchlist.stocks.join(","));
						const quotesResponse = await fetch(QUOTES_URL + "?" + params.toString() + taQuery(current), { cache: "no-store" });
						const quotesPayload = await quotesResponse.json();
						if (!alive.current) return;
						let nextMarket = null;
						if (Date.now() - lastMarket.current > 30000) {
							try {
								const marketResponse = await fetch(MARKET_URL + "?th=" + current.threshold, { cache: "no-store" });
								const marketPayload = await marketResponse.json();
								if (marketPayload && marketPayload.ok) nextMarket = marketPayload;
								lastMarket.current = Date.now();
							} catch (marketError) {
								// keep previous market snapshot
							}
						}
						let nextSeries = null;
						if (Date.now() - lastSeries.current > 60000) {
							try {
								const seriesResponse = await fetch(SERIES_URL + "?" + params.toString() + "&limit=80", { cache: "no-store" });
								const seriesPayload = await seriesResponse.json();
								if (seriesPayload && seriesPayload.series) nextSeries = seriesPayload.series;
								lastSeries.current = Date.now();
							} catch (seriesError) {
								// keep previous series
							}
						}
						if (!alive.current) return;
						setServerState({
							revision: statePayload && statePayload.revision ? statePayload.revision : 0,
							updatedAt: statePayload ? statePayload.updatedAt : null,
							watchlist: watchlist,
							targets: statePayload && statePayload.targets ? statePayload.targets : {}
						});
						setQuotes({
							crypto: Array.isArray(quotesPayload && quotesPayload.quotes) ? quotesPayload.quotes : [],
							stocks: Array.isArray(quotesPayload && quotesPayload.stocks) ? quotesPayload.stocks : [],
							ts: quotesPayload && quotesPayload.ts ? quotesPayload.ts : Date.now(),
							errors: quotesPayload && quotesPayload.errors ? quotesPayload.errors : {}
						});
						if (nextMarket) setMarket(nextMarket);
						if (nextSeries) setSeries(nextSeries);
						setError("");
					} catch (loadError) {
						if (alive.current) setError(loadError && loadError.message ? loadError.message : "行情加载失败");
					} finally {
						if (alive.current) setBusy(false);
					}
				}, []);

				useEffect(() => {
					alive.current = true;
					void load(false);
					const timer = window.setInterval(() => {
						if (document.visibilityState === "visible") void load(false);
					}, settings.interval);
					const onVisible = () => {
						if (document.visibilityState === "visible") void load(false);
					};
					const onTheme = () => setTheme(detectTheme());
					document.addEventListener("visibilitychange", onVisible);
					window.addEventListener("focus", onVisible);
					if (window.matchMedia) {
						const query2 = window.matchMedia("(prefers-color-scheme: dark)");
						if (query2.addEventListener) query2.addEventListener("change", onTheme);
					}
					return () => {
						alive.current = false;
						window.clearInterval(timer);
						document.removeEventListener("visibilitychange", onVisible);
						window.removeEventListener("focus", onVisible);
						window.clearTimeout(toastTimer.current);
					};
				}, [settings.interval, load]);

				useEffect(() => {
					persistSettings(settings);
					if (firstSettingsRun.current) {
						firstSettingsRun.current = false;
						return;
					}
					void load(false);
				}, [JSON.stringify(settings), persistSettings, load]);

				useEffect(() => {
					const text = query.trim();
					if (!text) {
						setResults([]);
						return undefined;
					}
					let cancelled = false;
					const timer = window.setTimeout(async () => {
						try {
							const response = await fetch(SEARCH_URL + "?q=" + encodeURIComponent(text) + "&limit=8", { cache: "no-store" });
							const payload = await response.json();
							if (!cancelled) setResults(Array.isArray(payload && payload.results) ? payload.results : []);
						} catch (searchError) {
							if (!cancelled) setResults([]);
						}
					}, 240);
					return () => {
						cancelled = true;
						window.clearTimeout(timer);
					};
				}, [query]);

				useEffect(() => {
					writeJson(VIEW_KEY, view);
				}, [view]);
				useEffect(() => {
					writeJson(FILTER_KEY, filter);
				}, [filter]);

				const preset = findPreset(customPresets, settings.presetId);

				const cryptoRows = useMemo(() => quotes.crypto.map((row) => {
					const venue = row.binance && isNum(row.binance.price) ? row.binance : row.bitget && isNum(row.bitget.price) ? row.bitget : null;
					return {
						key: "crypto:" + row.symbol,
						kind: "crypto",
						symbol: row.symbol,
						title: displayCryptoSymbol(row.symbol),
						sub: cryptoName(row.symbol) + " / USDT",
						price: venue ? Number(venue.price) : null,
						change: venue ? venue.changePct : null,
						dayHigh: venue ? venue.highPrice : null,
						dayLow: venue ? venue.lowPrice : null,
						volume: venue ? venue.volume : null,
						timestamp: venue ? venue.timestamp : null,
						ta: row.ta || null,
						trend: row.trend || null,
						analysis: settings.showSignals ? evaluatePreset(row.ta, settings, preset) : null
					};
				}), [quotes.crypto, settings, preset]);

				const stockRows = useMemo(() => quotes.stocks.map((row) => ({
					key: "stock:" + row.symbol,
					kind: "stock",
					symbol: row.symbol,
					title: row.symbol,
					sub: stockName(row.symbol, row.name),
					price: isNum(row.price) ? Number(row.price) : null,
					change: isNum(row.changePct) ? Number(row.changePct) : null,
					dayHigh: row.dayHigh,
					dayLow: row.dayLow,
					volume: null,
					timestamp: row.timestamp,
					ta: row.ta || null,
					trend: row.trend || null,
					analysis: settings.showSignals ? evaluatePreset(row.ta, settings, preset) : null
				})), [quotes.stocks, settings, preset]);

				const allRows = useMemo(() => cryptoRows.concat(stockRows), [cryptoRows, stockRows]);

				const visibleRows = useMemo(() => {
					let rows = allRows;
					if (settings.onlyOpps) rows = rows.filter((row) => row.analysis && row.analysis.ratio >= 0.6);
					if (settings.sort === "change") {
						rows = rows.slice().sort((left, right) => Number(right.change || 0) - Number(left.change || 0));
					} else if (settings.sort === "signal") {
						rows = rows.slice().sort((left, right) => {
							const a = left.analysis ? left.analysis.ratio : -1;
							const b = right.analysis ? right.analysis.ratio : -1;
							return b - a;
						});
					}
					return rows;
				}, [allRows, settings.onlyOpps, settings.sort]);

				const selected = allRows.find((row) => row.key === selectedKey) || visibleRows[0] || allRows[0] || null;

				useEffect(() => {
					if (!selected && allRows.length) setSelectedKey(allRows[0].key);
				}, [selected, allRows]);

				const rowSignature = allRows.map((row) => row.key + ":" + (row.analysis ? row.analysis.passed + "/" + row.analysis.total : "-")).join("|");
				const targetSignature = JSON.stringify(serverState.targets || {});

				useEffect(() => {
					if (!settings.showAlerts) {
						alertReady.current = true;
						return;
					}
					const now = Date.now();
					const next = new Map();
					const triggered = [];
					for (const row of allRows) {
						if (!row.analysis) continue;
						const isBuy = row.analysis.ratio >= 0.8;
						next.set(row.key, isBuy);
						if (!alertReady.current || !isBuy || alertState.current.get(row.key) === true) continue;
						const last = lastAlertAt.current.get(row.key) || 0;
						if (now - last < 10 * 60 * 1000) continue;
						lastAlertAt.current.set(row.key, now);
						triggered.push({
							ts: now,
							key: row.key,
							symbol: row.symbol,
							name: row.title,
							preset: row.analysis.preset.name,
							passed: row.analysis.passed,
							total: row.analysis.total,
							label: row.analysis.label
						});
					}
					alertState.current = next;
					alertReady.current = true;
					if (!triggered.length) return;
					setAlerts((prev) => {
						const merged = triggered.concat(prev).slice(0, 50);
						writeJson(ALERTS_KEY, merged);
						return merged;
					});
					showToast("信号 " + triggered[0].name + " " + triggered[0].passed + "/" + triggered[0].total + " 条件满足");
					if (settings.notifyDesktop && typeof Notification !== "undefined" && Notification.permission === "granted") {
						try {
							new Notification(triggered[0].name + (triggered.length > 1 ? " 等 " + triggered.length + " 个" : "") + " · " + triggered[0].label, {
								body: triggered[0].preset + " " + triggered[0].passed + "/" + triggered[0].total + " 条件满足",
								tag: "dsh-monitor-alert"
							});
						} catch (notifyError) {
							// ignore notification failures
						}
					}
				}, [rowSignature, settings.showAlerts, settings.notifyDesktop, showToast]);

				useEffect(() => {
					const targets = serverState.targets || {};
					const hits = [];
					for (const row of allRows) {
						const target = targets[row.key];
						if (!target || !isNum(row.price) || !isNum(target.price)) continue;
						const price = Number(row.price);
						const limit = Number(target.price);
						const hit = target.direction === "below" ? price <= limit : price >= limit;
						const id = row.key + "@" + limit + target.direction;
						if (!hit || hitTargets.current.has(id)) continue;
						hitTargets.current.add(id);
						hits.push({
							ts: Date.now(),
							key: row.key,
							symbol: row.symbol,
							name: row.title,
							preset: "目标价",
							passed: 1,
							total: 1,
							label: (target.direction === "below" ? "下破 " : "上破 ") + formatPrice(limit)
						});
					}
					if (!hits.length) return;
					setAlerts((prev) => {
						const merged = hits.concat(prev).slice(0, 50);
						writeJson(ALERTS_KEY, merged);
						return merged;
					});
					showToast("目标价触发 " + hits[0].name + " " + hits[0].label);
				}, [targetSignature, rowSignature, showToast]);

				const mutate = useCallback(async (url, options) => {
					try {
						await fetch(url, options);
						await load(false);
					} catch (mutationError) {
						setError(mutationError && mutationError.message ? mutationError.message : "操作失败");
					}
				}, [load]);

				const addSymbol = useCallback((kind, symbol) => {
					void mutate(API_PREFIX + "/watchlist", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ kind: kind, symbol: symbol, action: "add" })
					});
					setSelectedKey(kind + ":" + symbol);
				}, [mutate]);

				const removeSymbol = useCallback((row) => {
					void mutate(API_PREFIX + "/watchlist", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ kind: row.kind, symbol: row.symbol, action: "remove" })
					});
					showToast("已移除 " + row.title);
				}, [mutate, showToast]);

				const commitSearch = useCallback(() => {
					const text = query.trim().toUpperCase();
					if (!text) return;
					const first = results.find((item) => item.symbol);
					if (first) {
						addSymbol(first.kind === "stock" ? "stock" : "crypto", first.symbol);
						setQuery("");
						setResults([]);
						return;
					}
					if (/^[A-Z0-9]{5,20}$/.test(text) && /USDT|USDC|FDUSD/.test(text)) {
						addSymbol("crypto", text);
						setQuery("");
						return;
					}
					if (/^[A-Z][A-Z0-9.\-]{0,9}$/.test(text)) {
						addSymbol("stock", text);
						setQuery("");
						return;
					}
					showToast("未能识别代码，请输入如 NVDA 或 BTCUSDT");
				}, [query, results, addSymbol, showToast]);

				const saveTarget = useCallback((row, price, direction, stop, note) => {
					const value = Number(price);
					if (!Number.isFinite(value) || value <= 0) {
						showToast("请输入有效目标价");
						return;
					}
					void mutate(API_PREFIX + "/targets", {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							kind: row.kind,
							symbol: row.symbol,
							price: value,
							direction: direction === "below" ? "below" : "above",
							stop: Number(stop) > 0 ? Number(stop) : null,
							note: String(note || "").slice(0, 60)
						})
					});
					showToast("目标价已保存");
				}, [mutate, showToast]);

				const deleteTarget = useCallback((row) => {
					void mutate(API_PREFIX + "/targets?symbol=" + encodeURIComponent(row.symbol) + "&kind=" + row.kind, { method: "DELETE" });
					showToast("已清除目标价");
				}, [mutate, showToast]);

				const patchSettings = useCallback((patch) => {
					setSettings((prev) => normalizeSettings(Object.assign({}, prev, patch)));
				}, []);

				const presetOptions = allPresets(customPresets);

				const selectPreset = useCallback((id) => {
					const next = findPreset(customPresets, id);
					setSettings((prev) => normalizeSettings(Object.assign({}, prev, next.params, { presetId: next.id, thresholds: next.thresholds })));
				}, [customPresets]);

				const updateThreshold = useCallback((key, value) => {
					setSettings((prev) => normalizeSettings(Object.assign({}, prev, { thresholds: Object.assign({}, prev.thresholds, { [key]: Number(value) }) })));
				}, []);

				const savePreset = useCallback((name) => {
					const id = "custom-" + Date.now().toString(36);
					const preset2 = normalizePreset({
						id: id,
						name: name,
						base: preset.base,
						desc: preset.name + " 的自定义参数",
						params: presetParamsFromSettings(settings),
						thresholds: settings.thresholds
					});
					setCustomPresets((prev) => {
						const next = prev.concat(preset2).slice(0, 20);
						writeJson(PRESETS_KEY, next);
						return next;
					});
					setSettings((prev) => normalizeSettings(Object.assign({}, prev, { presetId: id })));
					showToast("已保存预设 " + name);
				}, [preset, settings, showToast]);

				const deletePreset = useCallback(() => {
					setCustomPresets((prev) => {
						const next = prev.filter((item) => item.id !== settings.presetId);
						writeJson(PRESETS_KEY, next);
						return next;
					});
					setSettings((prev) => normalizeSettings(Object.assign({}, prev, { presetId: "balanced" })));
					showToast("已删除自定义预设");
				}, [settings.presetId, showToast]);

				const resetSettings = useCallback(() => {
					setSettings(normalizeSettings(DEFAULT_SETTINGS));
					showToast("已恢复默认参数");
				}, [showToast]);

				const requestNotify = useCallback(() => {
					if (typeof Notification === "undefined") {
						showToast("当前环境不支持桌面通知");
						return;
					}
					if (Notification.permission === "granted") return;
					Notification.requestPermission().catch(() => undefined);
				}, [showToast]);

				const clearAlerts = useCallback(() => {
					setAlerts([]);
					writeJson(ALERTS_KEY, []);
					showToast("已清空提醒");
				}, [showToast]);

				const advice = useMemo(() => marketAdvice(market ? market.sentiment : null), [market]);
				const activeAlerts = alerts.length;

				const tabs = [
					{ id: "board", label: "看板", count: allRows.length },
					{ id: "mood", label: "盘面", count: 0 },
					{ id: "signals", label: "信号", count: activeAlerts },
					{ id: "settings", label: "设置", count: 0 }
				];

				const header = h("div", { className: "mn-head" },
					h("div", { className: "mn-brand" },
						h("span", { className: "mn-logo" }, h(Icon, { name: "pulse", size: 19, stroke: 2 })),
						h("div", null,
							h("div", { className: "mn-brand-title" }, "加密美股监控"),
							h("div", { className: "mn-brand-sub" },
								h("i", { className: "mn-dot", "data-state": error ? "down" : busy ? "warn" : "ok" }),
								h("span", null, error ? "连接异常" : busy ? "刷新中" : "实时行情"),
								h("span", { style: { opacity: 0.6 } }, "·"),
								h("span", null, quotes.ts ? "更新于 " + formatClock(quotes.ts) : "正在连接"),
								h("span", { style: { opacity: 0.6 } }, "·"),
								h("span", null, "公共数据 · 不下单")))),
					h("div", { className: "mn-head-right" },
						h("div", { className: "mn-tabs", role: "tablist" },
							tabs.map((tab) => h("button", {
								key: tab.id,
								type: "button",
								role: "tab",
								className: "mn-tab",
								"data-active": view === tab.id ? "true" : "false",
								"aria-selected": view === tab.id ? "true" : "false",
								onClick: () => setView(tab.id)
							},
								tab.label,
								tab.count > 0 ? h("span", { className: "mn-tab-count" }, String(tab.count)) : null))),
						h("button", {
							type: "button",
							className: "mn-btn",
							"data-size": "icon",
							title: "立即刷新",
							disabled: busy,
							onClick: () => void load(true)
						}, h(Icon, { name: "refresh", size: 15 }))));

				let body = null;
				if (view === "board") {
					body = h("div", { className: "mn-board" },
						h(Watchlist, {
							rows: visibleRows,
							selectedKey: selected ? selected.key : null,
							filter: filter,
							setFilter: setFilter,
							sort: settings.sort,
							setSort: (value) => patchSettings({ sort: value }),
							onlyOpps: settings.onlyOpps,
							setOnlyOpps: (value) => patchSettings({ onlyOpps: value }),
							showSignals: settings.showSignals,
							query: query,
							onQuery: setQuery,
							results: results,
							onAdd: (item) => {
								addSymbol(item.kind === "stock" ? "stock" : "crypto", item.symbol);
								setQuery("");
								setResults([]);
							},
							onCommit: commitSearch,
							onSelect: setSelectedKey,
							onRemove: removeSymbol
						}),
						h(DetailView, {
							row: selected,
							target: selected ? serverState.targets[selected.key] : null,
							series: selected ? series[selected.key] : null,
							settings: settings,
							updatedAt: quotes.ts,
							onSaveTarget: saveTarget,
							onDeleteTarget: deleteTarget,
							onRemove: () => {
								if (selected) removeSymbol(selected);
							}
						}));
				} else if (view === "mood") {
					body = h(MoodView, { market: market, advice: advice });
				} else if (view === "signals") {
					body = h(SignalsView, {
						rows: allRows,
						alerts: alerts,
						settings: settings,
						preset: preset,
						onOpen: (key) => {
							setSelectedKey(key);
							setView("board");
						},
						onClear: clearAlerts,
						onPatch: patchSettings,
						onRequestNotify: requestNotify
					});
				} else {
					body = h(SettingsView, {
						settings: settings,
						preset: preset,
						presets: presetOptions,
						onPatch: patchSettings,
						onThreshold: updateThreshold,
						onPresetSelect: selectPreset,
						onSavePreset: savePreset,
						onDeletePreset: deletePreset,
						onReset: resetSettings,
						onRequestNotify: requestNotify
					});
				}

				return h("div", { className: "mn-root", "data-theme": theme },
					h("div", { className: "mn-shell" },
						header,
						h(TickerBar, {
							market: market,
							cryptoRows: cryptoRows,
							series: series,
							updatedAt: quotes.ts,
							busy: busy,
							error: error,
							interval: settings.interval
						}),
						error ? h("div", { className: "mn-error" }, h(Icon, { name: "warn", size: 14 }), "行情接口异常：" + error) : null,
						body,
						toast ? h("div", { className: "mn-toast" }, h(Icon, { name: "bell", size: 14 }), toast) : null));
			}

			function SidebarIcon(props) {
				const size = props.size || 18;
				return h("span", {
					className: "mn-root mn-rail",
					style: { height: "auto", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center" },
					title: "加密美股监控",
					"aria-label": "加密美股监控"
				}, h(Icon, { name: "pulse", size: size }));
			}

			return {
				Dashboard: Dashboard,
				SidebarIcon: SidebarIcon,
				TickerBar: TickerBar,
				Watchlist: Watchlist,
				DetailView: DetailView,
				MoodView: MoodView,
				SignalsView: SignalsView,
				SettingsView: SettingsView
			};
		}

		// ---------------- plugin entry ----------------

		function apply(ctx) {
			if (!document.querySelector("style[data-mn-monitor-style]")) {
				const style = document.createElement("style");
				style.dataset.mnMonitorStyle = "1";
				style.textContent = CSS;
				document.head.append(style);
				if (ctx && ctx.effect) ctx.effect(() => () => style.remove(), "dsh-crypto-us-stock-monitor: style");
			}
			const slots = ctx && ctx.slots;
			if (!slots || !slots.inject || !slots.register) return;
			const React = require("react");
			const UI = createUI(React);
			const panel = () => {
				const layout = (ctx && ctx.layout) || (ctx && ctx.get ? ctx.get("layout") : null);
				if (layout && layout.selectPanel) layout.selectPanel(PLUGIN_ID);
			};
			slots.inject("sidebar.panellist", () => slots.register({
				name: "sidebar.panellist",
				id: PLUGIN_ID,
				order: 22,
				label: "加密美股监控"
			}, UI.SidebarIcon));
			slots.inject("main", () => slots.register({
				name: "main",
				key: PLUGIN_ID
			}, UI.Dashboard));
			void panel;
		}

		exports.apply = apply;
		exports.inject = ["slots"];
		return module.exports;
	}
});
