import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { TA_DEFAULTS, normalizeTaConfig, computeIndicators, evaluateStrategy } from "./indicators.js";

const PLUGIN_ID = "dsh-crypto-us-stock-monitor";
const PLUGIN_VERSION = "0.14.0";
const API_PREFIX = `/plugins/${PLUGIN_ID}/api`;
const STATE_DIR = process.env.DSH_MONITOR_STATE_DIR || path.join(os.homedir(), ".dsh", "storages", PLUGIN_ID);
const STATE_FILE = path.join(STATE_DIR, "state.json");
const MAX_STATE_BODY = 64 * 1024;
const BINANCE_TICKERS = "https://data-api.binance.vision/api/v3/ticker/24hr";
const BINANCE_KLINES = "https://data-api.binance.vision/api/v3/klines";
const BITGET_TICKERS = "https://api.bitget.com/api/v3/market/tickers";
const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart/";
const YAHOO_SEARCH = "https://query1.finance.yahoo.com/v1/finance/search";
const USER_AGENT = "Mozilla/5.0";
const REQUEST_TIMEOUT_MS = 8000;

const SYMBOL_RE = /^[A-Z0-9]{5,20}$/;
const STOCK_RE = /^[A-Z][A-Z0-9.\-]{0,9}$/;
const STABLE_QUOTES = ["USDT", "USDC", "FDUSD"];
const MAX_SYMBOLS = 30;
const MAX_STOCKS = 12;
const MAX_TREND_SYMBOLS = 30;
const MAX_QUERY_LENGTH = 24;
const MIN_BARS = 61;
const MAX_BARS = 300;
const DEFAULT_SEARCH_LIMIT = 8;
const MAX_SEARCH_LIMIT = 12;
const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
const DEFAULT_STOCKS = ["SPY", "QQQ", "DIA", "IWM", "NVDA", "AAPL"];
const STABLE_BASES = new Set(["USDC", "FDUSD", "TUSD", "DAI", "BUSD", "USDP", "EUR", "GBP", "AEUR", "XUSD", "USD1"]);
const MARKET_INDEXES = [["^GSPC", "标普500"], ["^IXIC", "纳斯达克"], ["^DJI", "道琼斯"], ["^RUT", "罗素2000"]];
const MARKET_SECTORS = [
	["XLK", "科技"], ["XLF", "金融"], ["XLE", "能源"], ["XLV", "医疗"], ["XLY", "可选消费"],
	["XLP", "必需消费"], ["XLI", "工业"], ["XLB", "材料"], ["XLU", "公用事业"], ["XLRE", "房地产"], ["XLC", "通信"],
];
const VIX_ZONES = [15, 20, 25, 30];
const VXN_ZONES = [18, 23, 28, 35];

const TTL = {
	binanceTickers: 10 * 60 * 1000,
	binanceQuotes: 10 * 1000,
	bitgetTickers: 10 * 60 * 1000,
	bitgetTicker: 10 * 1000,
	binanceKlines: 5 * 60 * 1000,
	yahooChart: 60 * 1000,
	yahooSearch: 5 * 60 * 1000,
	searchResults: 30 * 1000,
	market: 60 * 1000,
	fearGreed: 5 * 60 * 1000,
	derivatives: 60 * 1000,
	history: 6 * 60 * 60 * 1000
};

const COIN_NAMES = {
	BTC: "Bitcoin", ETH: "Ethereum", SOL: "Solana", XRP: "XRP", BNB: "BNB",
	DOGE: "Dogecoin", ADA: "Cardano", AVAX: "Avalanche", LINK: "Chainlink", DOT: "Polkadot",
	LTC: "Litecoin", BCH: "Bitcoin Cash", TRX: "TRON", TON: "Toncoin", SUI: "Sui",
	APT: "Aptos", ARB: "Arbitrum", OP: "Optimism", ATOM: "Cosmos", NEAR: "NEAR Protocol",
	FIL: "Filecoin", UNI: "Uniswap", AAVE: "Aave", INJ: "Injective", SEI: "Sei",
	TIA: "Celestia", PEPE: "Pepe", SHIB: "Shiba Inu", WIF: "dogwifhat", BONK: "Bonk",
	ETC: "Ethereum Classic", XLM: "Stellar", ALGO: "Algorand", VET: "VeChain", ICP: "Internet Computer",
	RENDER: "Render", FET: "Artificial Superintelligence Alliance", HBAR: "Hedera", STX: "Stacks", IMX: "Immutable",
	GRT: "The Graph", JUP: "Jupiter", PYTH: "Pyth Network", WLD: "Worldcoin", ENA: "Ethena",
	ONDO: "Ondo", POL: "Polygon Ecosystem Token", MATIC: "Polygon", ARK: "Ark", GALA: "Gala"
};

const STOCK_CATALOG = {
	AAPL: { name: "Apple Inc.", exchange: "NASDAQ" },
	MSFT: { name: "Microsoft Corporation", exchange: "NASDAQ" },
	NVDA: { name: "NVIDIA Corporation", exchange: "NASDAQ" },
	TSLA: { name: "Tesla, Inc.", exchange: "NASDAQ" },
	AMZN: { name: "Amazon.com, Inc.", exchange: "NASDAQ" },
	GOOGL: { name: "Alphabet Inc.", exchange: "NASDAQ" },
	GOOG: { name: "Alphabet Inc.", exchange: "NASDAQ" },
	META: { name: "Meta Platforms, Inc.", exchange: "NASDAQ" },
	AVGO: { name: "Broadcom Inc.", exchange: "NASDAQ" },
	AMD: { name: "Advanced Micro Devices, Inc.", exchange: "NASDAQ" },
	NFLX: { name: "Netflix, Inc.", exchange: "NASDAQ" },
	COST: { name: "Costco Wholesale Corporation", exchange: "NASDAQ" },
	ADBE: { name: "Adobe Inc.", exchange: "NASDAQ" },
	CRM: { name: "Salesforce, Inc.", exchange: "NYSE" },
	ORCL: { name: "Oracle Corporation", exchange: "NYSE" },
	INTC: { name: "Intel Corporation", exchange: "NASDAQ" },
	MU: { name: "Micron Technology, Inc.", exchange: "NASDAQ" },
	QCOM: { name: "Qualcomm Incorporated", exchange: "NASDAQ" },
	PLTR: { name: "Palantir Technologies Inc.", exchange: "NASDAQ" },
	COIN: { name: "Coinbase Global, Inc.", exchange: "NASDAQ" },
	MSTR: { name: "Strategy Inc.", exchange: "NASDAQ" },
	UBER: { name: "Uber Technologies, Inc.", exchange: "NYSE" },
	BABA: { name: "Alibaba Group Holding Limited", exchange: "NYSE" },
	JPM: { name: "JPMorgan Chase & Co.", exchange: "NYSE" },
	V: { name: "Visa Inc.", exchange: "NYSE" },
	MA: { name: "Mastercard Incorporated", exchange: "NYSE" },
	DIS: { name: "The Walt Disney Company", exchange: "NYSE" },
	BA: { name: "The Boeing Company", exchange: "NYSE" },
	CAT: { name: "Caterpillar Inc.", exchange: "NYSE" },
	XOM: { name: "Exxon Mobil Corporation", exchange: "NYSE" },
	KO: { name: "The Coca-Cola Company", exchange: "NYSE" },
	PEP: { name: "PepsiCo, Inc.", exchange: "NASDAQ" },
	WMT: { name: "Walmart Inc.", exchange: "NYSE" },
	PG: { name: "The Procter & Gamble Company", exchange: "NYSE" },
	HD: { name: "The Home Depot, Inc.", exchange: "NYSE" },
	SPY: { name: "SPDR S&P 500 ETF Trust", exchange: "NYSEArca" },
	QQQ: { name: "Invesco QQQ Trust", exchange: "NASDAQ" },
	DIA: { name: "SPDR Dow Jones Industrial Average ETF Trust", exchange: "NYSEArca" },
	IWM: { name: "iShares Russell 2000 ETF", exchange: "NYSEArca" },
	VOO: { name: "Vanguard S&P 500 ETF", exchange: "NYSEArca" },
	VTI: { name: "Vanguard Total Stock Market ETF", exchange: "NYSEArca" },
	GLD: { name: "SPDR Gold Shares", exchange: "NYSEArca" },
	SLV: { name: "iShares Silver Trust", exchange: "NYSEArca" },
	TLT: { name: "iShares 20+ Year Treasury Bond ETF", exchange: "NASDAQ" },
	ARKK: { name: "ARK Innovation ETF", exchange: "NYSEArca" },
	SMH: { name: "VanEck Semiconductor ETF", exchange: "NASDAQ" },
	SOXX: { name: "iShares Semiconductor ETF", exchange: "NASDAQ" },
	XLE: { name: "Energy Select Sector SPDR Fund", exchange: "NYSEArca" },
	XLF: { name: "Financial Select Sector SPDR Fund", exchange: "NYSEArca" }
};

export const name = PLUGIN_ID;
export const inject = ["webServer"];

function json(res, status, payload) {
	res.statusCode = status;
	res.setHeader?.("Content-Type", "application/json; charset=utf-8");
	res.end(JSON.stringify(payload));
}

function numberOrNull(value) {
	if (value === null || value === undefined || value === "") return null;
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

function finiteOrNull(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function round(value, digits) {
	if (!Number.isFinite(value)) return null;
	const factor = 10 ** digits;
	return Math.round(value * factor) / factor;
}

function roundPrice(value) {
	if (!Number.isFinite(value)) return null;
	const absolute = Math.abs(value);
	if (absolute >= 1000) return round(value, 2);
	if (absolute >= 1) return round(value, 3);
	return Number(value.toPrecision(6));
}

function average(values) {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function lastOf(values) {
	return values.length > 0 ? values[values.length - 1] : null;
}

function errorText(error) {
	return String(error?.message ?? error ?? "unknown-error").slice(0, 160);
}

async function getJson(url, extraHeaders = {}) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: { accept: "application/json", "user-agent": USER_AGENT, ...extraHeaders }
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return await response.json();
	} finally {
		clearTimeout(timer);
	}
}

function createLimiter(limit) {
	let active = 0;
	const queue = [];
	function pump() {
		while (active < limit && queue.length > 0) {
			const job = queue.shift();
			active += 1;
			Promise.resolve().then(job.task).then(job.resolve, job.reject).finally(() => {
				active -= 1;
				pump();
			});
		}
	}
	return (task) => new Promise((resolve, reject) => {
		queue.push({ task, resolve, reject });
		pump();
	});
}

const limitRequest = createLimiter(6);
const cache = new Map();
const CACHE_LIMIT = 400;
const STALE_RETRY_MS = 15000;
const health = new Map();

function reportHealth(key, error) {
	if (error) health.set(key, errorText(error));
	else health.delete(key);
}

function currentErrors() {
	const errors = {};
	for (const [key, message] of health) errors[key] = message;
	return errors;
}

function pruneCache() {
	if (cache.size <= CACHE_LIMIT) return;
	for (const [key, entry] of cache) {
		if (cache.size <= CACHE_LIMIT) break;
		if (!entry.pending) cache.delete(key);
	}
}

function cached(key, ttl, loader) {
	const entry = cache.get(key);
	const now = Date.now();
	if (entry && entry.expires > now) return Promise.resolve(entry.value);
	if (entry && entry.pending) return entry.value !== undefined ? Promise.resolve(entry.value) : entry.pending;
	const previous = entry ? entry.value : undefined;
	const pending = refresh(key, ttl, loader, previous);
	pending.catch(() => {});
	if (previous === undefined) {
		// Cold key: remember the in-flight promise so concurrent callers share one upstream call.
		cache.set(key, { value: undefined, expires: 0, pending });
		return pending;
	}
	cache.set(key, { value: previous, expires: now, pending });
	return Promise.resolve(previous);
}

function healthKeyForCacheKey(key) {
	if (key.startsWith("binance:klines:")) return "trend";
	if (key.startsWith("binance:")) return "binance";
	if (key.startsWith("bitget:")) return "bitget";
	if (key.startsWith("yahoo:chart:")) return "stocks";
	return null;
}

async function refresh(key, ttl, loader, previous) {
	try {
		const value = await loader();
		cache.set(key, { value, expires: Date.now() + ttl, pending: null });
		pruneCache();
		return value;
	} catch (error) {
		if (previous !== undefined) {
			// Keep serving the last good snapshot, but let the payload report which source is stale.
			const healthKey = healthKeyForCacheKey(key);
			if (healthKey) reportHealth(healthKey, error);
			cache.set(key, { value: previous, expires: Date.now() + Math.min(ttl, STALE_RETRY_MS), pending: null });
			return previous;
		}
		cache.delete(key);
		throw error;
	}
}

function normalizeSymbols(raw) {
	const symbols = String(raw ?? "")
		.split(",")
		.map((symbol) => symbol.trim().toUpperCase())
		.filter((symbol) => SYMBOL_RE.test(symbol));
	return [...new Set(symbols)].slice(0, MAX_SYMBOLS);
}

function normalizeStocks(raw) {
	if (raw === null) return null;
	const stocks = String(raw)
		.split(",")
		.map((symbol) => symbol.trim().toUpperCase())
		.filter((symbol) => STOCK_RE.test(symbol));
	const unique = [...new Set(stocks)].slice(0, MAX_STOCKS);
	return unique.length > 0 ? unique : null;
}

function normalizeLimit(raw) {
	if (raw === null) return DEFAULT_SEARCH_LIMIT;
	const number = Number(raw);
	return Number.isFinite(number) ? clamp(Math.trunc(number), 1, MAX_SEARCH_LIMIT) : DEFAULT_SEARCH_LIMIT;
}

function defaultState() {
	return {
		initialized: false,
		revision: 0,
		updatedAt: null,
		watchlist: { crypto: [...DEFAULT_SYMBOLS], stocks: [...DEFAULT_STOCKS] },
		targets: {}
	};
}

function normalizeTargets(raw) {
	const out = {};
	if (!raw || typeof raw !== "object") return out;
	for (const [key, value] of Object.entries(raw)) {
		const match = /^(crypto|stock):([A-Z0-9.\-]{1,20})$/.exec(key);
		if (!match || !value || typeof value !== "object") continue;
		const price = Number(value.price ?? value.target);
		if (!Number.isFinite(price) || price <= 0) continue;
		const stop = Number(value.stop);
		const direction = value.direction === "below" ? "below" : "above";
		const note = String(value.note ?? "").slice(0, 200);
		out[key] = {
			price: roundPrice(price),
			direction,
			note,
			triggered: value.triggered === true,
			stop: Number.isFinite(stop) && stop > 0 ? roundPrice(stop) : null
		};
	}
	return out;
}

function normalizeState(raw) {
	const base = defaultState();
	const source = raw && typeof raw === "object" ? raw : {};
	const watchlist = source.watchlist && typeof source.watchlist === "object" ? source.watchlist : {};
	const crypto = normalizeSymbols(watchlist.crypto ?? watchlist.cryptoList ?? source.crypto);
	const stocks = normalizeStocks(watchlist.stocks ?? watchlist.stocksList ?? source.stocks) ?? [];
	return {
		initialized: source.initialized === true,
		revision: Number.isFinite(Number(source.revision)) ? Math.max(0, Math.trunc(Number(source.revision))) : 0,
		updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null,
		watchlist: { crypto: crypto.length ? crypto : base.watchlist.crypto, stocks: stocks.length ? stocks : base.watchlist.stocks },
		targets: normalizeTargets(source.targets)
	};
}

async function readState() {
	try {
		const text = await readFile(STATE_FILE, "utf8");
		const parsed = JSON.parse(text);
		return { ...normalizeState(parsed), initialized: true };
	} catch {
		return defaultState();
	}
}

async function writeState(state) {
	await mkdir(STATE_DIR, { recursive: true });
	const normalized = normalizeState({ ...state, initialized: true });
	normalized.revision = state.revision + 1;
	normalized.updatedAt = new Date().toISOString();
	const tmp = `${STATE_FILE}.${process.pid}.tmp`;
	await writeFile(tmp, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
	await rename(tmp, STATE_FILE);
	return { ...normalized, initialized: true };
}

async function readJsonBody(req) {
	const chunks = [];
	let total = 0;
	for await (const chunk of req) {
		total += chunk.length;
		if (total > MAX_STATE_BODY) {
			const error = new Error("body-too-large");
			error.statusCode = 413;
			throw error;
		}
		chunks.push(chunk);
	}
	if (!chunks.length) return {};
	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch {
		const error = new Error("invalid-json");
		error.statusCode = 400;
		throw error;
	}
}

function targetFromBody(body) {
	const kind = body.kind === "stock" ? "stock" : "crypto";
	const symbol = kind === "stock" ? normalizeStocks(body.symbol)?.[0] : normalizeSymbols(body.symbol)[0];
	if (!symbol) return null;
	return { kind, symbol, key: `${kind}:${symbol}` };
}

function stateResponse(res, state) {
	json(res, 200, { ok: true, ...state });
}

function stateRoute() {
	return {
		kind: "exact",
		path: `${API_PREFIX}/state`,
		handler: async (req, res) => {
			try {
				if (req.method === "GET") {
					stateResponse(res, await readState());
					return;
				}
				if (req.method === "PUT") {
					const body = await readJsonBody(req);
					const current = await readState();
					const merged = {
						...current,
						watchlist: body.watchlist !== undefined ? normalizeState({ watchlist: body.watchlist }).watchlist : current.watchlist,
						targets: body.targets !== undefined ? normalizeTargets(body.targets) : current.targets,
						initialized: true
					};
					stateResponse(res, await writeState(merged));
					return;
				}
				res.setHeader?.("Allow", "GET, PUT");
				json(res, 405, { ok: false, error: "method-not-allowed" });
			} catch (error) {
				json(res, error.statusCode ?? 500, { ok: false, error: error.message ?? String(error) });
			}
		}
	};
}

function watchlistRoute() {
	return {
		kind: "exact",
		path: `${API_PREFIX}/watchlist`,
		handler: async (req, res) => {
			try {
				if (req.method === "GET") {
					const state = await readState();
					stateResponse(res, { ...state, watchlist: state.watchlist });
					return;
				}
				if (req.method !== "POST") {
					res.setHeader?.("Allow", "GET, POST");
					json(res, 405, { ok: false, error: "method-not-allowed" });
					return;
				}
				const body = await readJsonBody(req);
				const target = targetFromBody(body);
				if (!target) {
					json(res, 400, { ok: false, error: "invalid-symbol" });
					return;
				}
				const state = await readState();
				const current = target.kind === "stock" ? [...state.watchlist.stocks] : [...state.watchlist.crypto];
				const next = body.action === "remove" ? current.filter((item) => item !== target.symbol) : [...new Set([...current, target.symbol])];
				const watchlist = { ...state.watchlist, [target.kind === "stock" ? "stocks" : "crypto"]: next };
				stateResponse(res, await writeState({ ...state, watchlist }));
			} catch (error) {
				json(res, error.statusCode ?? 500, { ok: false, error: error.message ?? String(error) });
			}
		}
	};
}

function targetsRoute() {
	return {
		kind: "exact",
		path: `${API_PREFIX}/targets`,
		handler: async (req, res) => {
			try {
				if (req.method === "GET") {
					const state = await readState();
					stateResponse(res, { ...state, targets: state.targets });
					return;
				}
				if (req.method === "PUT" || req.method === "POST") {
					const body = await readJsonBody(req);
					const target = targetFromBody(body);
					if (!target) {
						json(res, 400, { ok: false, error: "invalid-symbol" });
						return;
					}
					const state = await readState();
					const targets = { ...state.targets };
					const price = Number(body.price ?? body.target);
					if (body.remove === true || !Number.isFinite(price) || price <= 0) {
						delete targets[target.key];
					} else {
						const stop = Number(body.stop);
						targets[target.key] = {
							price: roundPrice(price),
							direction: body.direction === "below" ? "below" : "above",
							stop: Number.isFinite(stop) && stop > 0 ? roundPrice(stop) : null,
							note: String(body.note ?? "").slice(0, 200),
							triggered: false
						};
					}
					stateResponse(res, await writeState({ ...state, targets }));
					return;
				}
				if (req.method === "DELETE") {
					const url = new URL(req.url ?? "/", "http://dsh.local");
					const symbol = url.searchParams.get("symbol") ?? "";
					const kind = url.searchParams.get("kind") === "stock" ? "stock" : "crypto";
					const target = targetFromBody({ kind, symbol });
					if (!target) {
						json(res, 400, { ok: false, error: "invalid-symbol" });
						return;
					}
					const state = await readState();
					const targets = { ...state.targets };
					delete targets[target.key];
					stateResponse(res, await writeState({ ...state, targets }));
					return;
				}
				res.setHeader?.("Allow", "GET, PUT, POST, DELETE");
				json(res, 405, { ok: false, error: "method-not-allowed" });
			} catch (error) {
				json(res, error.statusCode ?? 500, { ok: false, error: error.message ?? String(error) });
			}
		}
	};
}

function normalizeBinanceRow(row) {
	return {
		price: numberOrNull(row.lastPrice),
		openPrice: numberOrNull(row.openPrice),
		highPrice: numberOrNull(row.highPrice),
		lowPrice: numberOrNull(row.lowPrice),
		changePct: round(numberOrNull(row.priceChangePercent), 3),
		volume: numberOrNull(row.quoteVolume),
		timestamp: numberOrNull(row.closeTime) ?? Date.now()
	};
}

function normalizeBitgetRow(row) {
	const changePct = numberOrNull(row.price24hPcnt);
	return {
		price: numberOrNull(row.lastPrice),
		openPrice: numberOrNull(row.openPrice24h),
		highPrice: numberOrNull(row.highPrice24h),
		lowPrice: numberOrNull(row.lowPrice24h),
		changePct: changePct === null ? null : round(changePct * 100, 3),
		volume: numberOrNull(row.turnover24h),
		timestamp: numberOrNull(row.ts) ?? Date.now()
	};
}

async function requestBinanceQuotes(symbols) {
	const url = new URL(BINANCE_TICKERS);
	url.searchParams.set("symbols", JSON.stringify(symbols));
	const data = await getJson(url);
	const rows = Array.isArray(data) ? data : [data];
	const map = new Map();
	for (const row of rows) {
		if (row && typeof row.symbol === "string") map.set(row.symbol, normalizeBinanceRow(row));
	}
	if (map.size === 0) throw new Error("binance-empty");
	return map;
}

async function fetchBinanceQuotes(symbols) {
	const key = `binance:quotes:${[...symbols].sort().join(",")}`;
	return cached(key, TTL.binanceQuotes, async () => {
		try {
			const map = await limitRequest(() => requestBinanceQuotes(symbols));
			reportHealth("binance", null);
			return map;
		} catch (error) {
			reportHealth("binance", error);
			// A single unknown symbol rejects the whole batch; fall back to the 10-minute snapshot.
			try {
				const all = await fetchBinanceTickers();
				const fallback = new Map();
				for (const symbol of symbols) {
					const row = all.get(symbol);
					if (row) fallback.set(symbol, row);
				}
				// Serving the 10-minute snapshot is degraded data, not a healthy source:
				// keep the error reported by the batch attempt above so the UI can flag it.
				if (fallback.size > 0) return fallback;
			} catch {}
			throw error;
		}
	});
}

function fetchBinanceTickers() {
	return cached("binance:all", TTL.binanceTickers, () => limitRequest(async () => {
		const data = await getJson(BINANCE_TICKERS);
		const rows = Array.isArray(data) ? data : [];
		const map = new Map();
		for (const row of rows) {
			if (row && typeof row.symbol === "string") map.set(row.symbol, normalizeBinanceRow(row));
		}
		return map;
	}));
}

async function requestBitgetTicker(symbol) {
	const url = new URL(BITGET_TICKERS);
	url.searchParams.set("category", "SPOT");
	url.searchParams.set("symbol", symbol);
	const payload = await getJson(url);
	const row = Array.isArray(payload?.data) ? payload.data.find((item) => item?.symbol === symbol) : null;
	return row ? normalizeBitgetRow(row) : null;
}

function fetchBitgetTicker(symbol) {
	return cached(`bitget:ticker:${symbol}`, TTL.bitgetTicker, () => limitRequest(() => requestBitgetTicker(symbol)));
}

function fetchBitgetTickers() {
	return cached("bitget:all", TTL.bitgetTickers, () => limitRequest(async () => {
		const url = new URL(BITGET_TICKERS);
		url.searchParams.set("category", "SPOT");
		const payload = await getJson(url);
		const rows = Array.isArray(payload?.data) ? payload.data : [];
		const map = new Map();
		for (const row of rows) {
			if (row && typeof row.symbol === "string") map.set(row.symbol, normalizeBitgetRow(row));
		}
		return map;
	}));
}

function numberOr(value, fallback) {
	if (value === null || value === undefined || value === "") return fallback;
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function parseCsvNumbers(raw) {
	return String(raw ?? "")
		.split(",")
		.map((item) => item.trim())
		.filter((item) => item !== "")
		.map((item) => Number(item))
		.filter((value) => Number.isFinite(value));
}

function taConfigFromQuery(query) {
	const ma = parseCsvNumbers(query.get("ma"));
	const macd = parseCsvNumbers(query.get("macd"));
	const boll = parseCsvNumbers(query.get("boll"));
	return normalizeTaConfig({
		maFast: ma[0],
		maSlow: ma[1],
		rsiPeriod: numberOr(query.get("rsi"), TA_DEFAULTS.rsiPeriod),
		macdFast: macd[0],
		macdSlow: macd[1],
		macdSignal: macd[2],
		bollPeriod: boll[0],
		bollMult: boll[1],
		atrPeriod: numberOr(query.get("atr"), TA_DEFAULTS.atrPeriod),
		maLong: numberOr(query.get("malong"), TA_DEFAULTS.maLong),
		adxPeriod: numberOr(query.get("adx"), TA_DEFAULTS.adxPeriod),
		breakoutDays: numberOr(query.get("breakout"), TA_DEFAULTS.breakoutDays),
		volumePeriod: numberOr(query.get("volp"), TA_DEFAULTS.volumePeriod),
		threshold: numberOr(query.get("th"), TA_DEFAULTS.threshold),
		style: query.get("style") ?? TA_DEFAULTS.style
	});
}

function barsLimit(config) {
	const needed = Math.max(
		config.maSlow + 10,
		config.maLong + 10,
		config.macdSlow + config.macdSignal + 10,
		config.bollPeriod + 10,
		config.rsiPeriod + 10,
		config.atrPeriod + 10,
		config.adxPeriod * 2 + 10,
		config.breakoutDays + 10,
		MIN_BARS
	);
	return clamp(Math.ceil(needed), MIN_BARS, MAX_BARS);
}

function chartRange(config) {
	return Math.max(config.maSlow, config.bollPeriod) > 120 ? "1y" : "6mo";
}

function sma(values, period) {
	if (!Array.isArray(values) || values.length < period) return null;
	let sum = 0;
	for (let index = values.length - period; index < values.length; index += 1) sum += values[index];
	return sum / period;
}

function withLivePrice(closes, price) {
	if (!Number.isFinite(price) || !Array.isArray(closes) || closes.length === 0) return closes;
	const copy = closes.slice();
	copy[copy.length - 1] = price;
	return copy;
}

function buildTechnical(bars, config, livePrice) {
	if (!bars) return null;
	const closes = withLivePrice(bars.closes, livePrice);
	const indicators = computeIndicators({ closes, highs: bars.highs, lows: bars.lows, volumes: bars.volumes, config });
	if (!indicators) return null;
	const signal = evaluateStrategy({ price: indicators.price, indicators, config });
	const levels = signal?.levels ?? null;
	const kdj = indicators.kdj ?? null;
	const adx = indicators.adx ?? null;
	return {
		bars: indicators.bars,
		price: roundPrice(indicators.price),
		maFast: roundPrice(indicators.maFast),
		maSlow: roundPrice(indicators.maSlow),
		maLong: roundPrice(indicators.maLong),
		maLongSlopePct: round(indicators.maLongSlopePct, 2),
		priceVsMaSlowPct: round(indicators.priceVsMaSlowPct, 2),
		priceVsMaLongPct: round(indicators.priceVsMaLongPct, 2),
		maAlignment: indicators.maAlignment ?? null,
		rsi: round(indicators.rsi, 2),
		kdj: kdj ? { k: round(kdj.k, 1), d: round(kdj.d, 1), j: round(kdj.j, 1) } : null,
		cci: round(indicators.cci, 1),
		williamsR: round(indicators.williamsR, 1),
		adx: adx ? { adx: round(adx.adx, 1), plusDi: round(adx.plusDi, 1), minusDi: round(adx.minusDi, 1) } : null,
		macd: {
			line: roundPrice(indicators.macd.line),
			signal: roundPrice(indicators.macd.signal),
			hist: roundPrice(indicators.macd.hist),
			prevHist: roundPrice(indicators.macd.prevHist)
		},
		macdCross: indicators.macdCross ?? null,
		boll: {
			upper: roundPrice(indicators.boll.upper),
			middle: roundPrice(indicators.boll.middle),
			lower: roundPrice(indicators.boll.lower),
			percentB: round(indicators.boll.percentB, 3),
			bandwidthPct: round(indicators.bandwidthPct, 2),
			bandwidthPercentile: round(indicators.bandwidthPercentile, 1)
		},
		atr: roundPrice(indicators.atr),
		atrPct: round(indicators.atrPct, 2),
		atrPercentile: round(indicators.atrPercentile, 1),
		volumeRatio: round(indicators.volumeRatio, 2),
		volumeTrend: round(indicators.volumeTrend, 2),
		obvSlopePct: round(indicators.obvSlopePct, 2),
		breakout20: indicators.breakout20 ?? null,
		breakdown20: indicators.breakdown20 ?? null,
		high60: roundPrice(indicators.high60),
		low60: roundPrice(indicators.low60),
		distanceHigh60Pct: round(indicators.distanceHigh60Pct, 2),
		distanceLow60Pct: round(indicators.distanceLow60Pct, 2),
		rsiDivergence: indicators.rsiDivergence ?? null,
		candle: indicators.candle ?? null,
		change5dPct: round(indicators.change5dPct, 2),
		change7dPct: round(indicators.change7dPct, 2),
		change20dPct: round(indicators.change20dPct, 2),
		rangePosition: round(indicators.rangePosition, 3),
		trend: {
			label: indicators.trend.label,
			score: round(indicators.trend.score, 3),
			threshold: indicators.trend.threshold
		},
		signal: signal
			? {
				action: signal.action,
				label: signal.label,
				score: signal.score,
				reasons: signal.reasons,
				levels: levels
					? {
						support: roundPrice(levels.support),
						resistance: roundPrice(levels.resistance),
						stopLong: roundPrice(levels.stopLong),
						targetLong: roundPrice(levels.targetLong),
						riskPct: round(levels.riskPct, 2),
						rewardPct: round(levels.rewardPct, 2),
						rr: levels.rr
					}
					: null
			}
			: null
	};
}

function legacyTrend(ta, bars, fallbackChange7d) {
	if (!ta) return null;
	const closes = bars?.closes ?? [];
	const ma5 = sma(closes, 5);
	const ma20 = sma(closes, 20);
	return {
		label: ta.trend.label,
		score: ta.trend.score,
		threshold: ta.trend.threshold,
		ma5: roundPrice(ma5),
		ma20: roundPrice(ma20),
		change5dPct: ta.change5dPct,
		change7dPct: Number.isFinite(ta.change7dPct) ? ta.change7dPct : fallbackChange7d,
		change20dPct: ta.change20dPct,
		rangePosition: ta.rangePosition
	};
}

async function fetchBinanceKlines(symbol, limit) {
	const url = new URL(BINANCE_KLINES);
	url.searchParams.set("symbol", symbol);
	url.searchParams.set("interval", "1d");
	url.searchParams.set("limit", String(limit));
	const rows = await getJson(url);
	const list = Array.isArray(rows) ? rows : [];
	const closes = [];
	const highs = [];
	const lows = [];
	const opens = [];
	const volumes = [];
	for (const row of list) {
		const open = numberOrNull(row?.[1]);
		const high = numberOrNull(row?.[2]);
		const low = numberOrNull(row?.[3]);
		const close = numberOrNull(row?.[4]);
		const volume = numberOrNull(row?.[5]);
		if (close === null || high === null || low === null) continue;
		opens.push(open);
		highs.push(high);
		lows.push(low);
		closes.push(close);
		volumes.push(volume);
	}
	if (closes.length === 0) throw new Error("klines-empty");
	return { closes, highs, lows, opens, volumes };
}

function fetchCryptoBars(symbol, limit) {
	return cached(`binance:klines:${symbol}:${limit}`, TTL.binanceKlines, () => limitRequest(() => fetchBinanceKlines(symbol, limit)));
}

async function fetchYahooChart(symbol, range = "6mo") {
	return cached(`yahoo:chart:${symbol}:${range}`, TTL.yahooChart, () => limitRequest(async () => {
		const url = new URL(`${YAHOO_CHART}${encodeURIComponent(symbol)}`);
		url.searchParams.set("range", range);
		url.searchParams.set("interval", "1d");
		const payload = await getJson(url);
		const result = payload?.chart?.result?.[0];
		const meta = result?.meta;
		if (!meta) throw new Error("yahoo-chart-empty");
		const quote = result?.indicators?.quote?.[0] ?? {};
		const rawCloses = Array.isArray(quote.close) ? quote.close : [];
		const closes = [];
		const highs = [];
		const lows = [];
		const opens = [];
		const volumes = [];
		for (let index = 0; index < rawCloses.length; index += 1) {
			const close = numberOrNull(rawCloses[index]);
			const high = numberOrNull(quote.high?.[index]);
			const low = numberOrNull(quote.low?.[index]);
			if (close === null || high === null || low === null) continue;
			closes.push(close);
			highs.push(high);
			lows.push(low);
			opens.push(numberOrNull(quote.open?.[index]));
			volumes.push(numberOrNull(quote.volume?.[index]));
		}
		return { meta, closes, opens, highs, lows, volumes };
	}));
}

function fetchYahooSearch(query) {
	return cached(`yahoo:search:${query.toLowerCase()}`, TTL.yahooSearch, () => limitRequest(async () => {
		const url = new URL(YAHOO_SEARCH);
		url.searchParams.set("q", query);
		url.searchParams.set("quotesCount", "10");
		url.searchParams.set("newsCount", "0");
		return getJson(url);
	}));
}

function positionInRange(price, low, high) {
	if (!Number.isFinite(price) || !Number.isFinite(low) || !Number.isFinite(high) || high <= low) return null;
	return clamp((price - low) / (high - low), 0, 1);
}

function relativeChange(current, closes, lookback) {
	if (!Number.isFinite(current) || closes.length < lookback) return null;
	const base = closes[closes.length - lookback];
	if (!Number.isFinite(base) || base === 0) return null;
	return ((current - base) / base) * 100;
}

function aggregateTrend(trends) {
	const rows = trends.filter(Boolean);
	if (rows.length === 0) return null;
	const mean = average(rows.map((row) => row.score));
	const positive = rows.filter((row) => row.score > 0).length;
	const negative = rows.filter((row) => row.score < 0).length;
	const breadth = (positive - negative) / rows.length;
	const score = round(clamp(0.75 * mean + 0.25 * breadth, -1, 1), 3);
	return {
		label: score >= 0.15 ? "偏多" : score <= -0.15 ? "偏空" : "震荡",
		score,
		bullProbability: Math.round(clamp(50 + score * 45, 5, 95)),
		count: rows.length,
		positive,
		negative,
		bull: rows.filter((row) => row.label === "多头").length,
		bear: rows.filter((row) => row.label === "空头").length,
		neutral: rows.filter((row) => row.label === "震荡").length
	};
}

function buildStockRow(symbol, chart, config) {
	const meta = chart.meta;
	const closes = chart.closes;
	const price = numberOrNull(meta.regularMarketPrice) ?? lastOf(closes);
	const marketChangePct = numberOrNull(meta.regularMarketChangePercent);
	const previousClose = price !== null && marketChangePct !== null && marketChangePct > -100
		? price / (1 + marketChangePct / 100)
		: (closes.length >= 2 ? closes[closes.length - 2] : null);
	const changePct = marketChangePct !== null
		? round(marketChangePct, 2)
		: (price !== null && Number.isFinite(previousClose) && previousClose !== 0 ? round(((price / previousClose) - 1) * 100, 2) : null);
	const dayHigh = numberOrNull(meta.regularMarketDayHigh);
	const dayLow = numberOrNull(meta.regularMarketDayLow);
	const ta = buildTechnical({ closes: chart.closes, highs: chart.highs, lows: chart.lows }, config, price);
	const trend = ta ? legacyTrend(ta, chart, null) : null;
	const marketTime = numberOrNull(meta.regularMarketTime);
	return {
		symbol,
		name: meta.longName ?? meta.shortName ?? STOCK_CATALOG[symbol]?.name ?? symbol,
		price,
		previousClose: roundPrice(previousClose),
		changePct,
		dayHigh,
		dayLow,
		// Legacy aliases kept for the 0.2.x client.
		openPrice: lastOf(chart.opens),
		highPrice: dayHigh,
		lowPrice: dayLow,
		ma5: roundPrice(sma(closes, 5)),
		ma20: roundPrice(sma(closes, 20)),
		change5dPct: ta?.change5dPct ?? round(relativeChange(price, closes, 6), 2),
		change20dPct: ta?.change20dPct ?? round(relativeChange(price, closes, 21), 2),
		rangePosition: ta?.rangePosition ?? round(positionInRange(price, dayLow, dayHigh), 3),
		trend,
		ta,
		timestamp: marketTime === null ? Date.now() : marketTime * 1000
	};
}

async function collectBinanceQuotes(symbols) {
	if (symbols.length === 0) return new Map();
	try {
		return await fetchBinanceQuotes(symbols);
	} catch {
		return new Map();
	}
}

async function collectBitgetQuotes(symbols) {
	if (symbols.length === 0) return new Map();
	const settled = await Promise.allSettled(symbols.map((symbol) => fetchBitgetTicker(symbol)));
	const quotes = new Map();
	let firstError = null;
	settled.forEach((result, index) => {
		if (result.status === "fulfilled") {
			if (result.value) quotes.set(symbols[index], result.value);
		} else if (firstError === null) {
			firstError = result.reason;
		}
	});
	if (quotes.size > 0) reportHealth("bitget", null);
	else if (firstError !== null) reportHealth("bitget", firstError);
	return quotes;
}

async function collectStockQuotes(symbols, config) {
	if (symbols.length === 0) return [];
	const range = chartRange(config);
	const settled = await Promise.allSettled(symbols.map((symbol) => fetchYahooChart(symbol, range)));
	const rows = [];
	let firstError = null;
	settled.forEach((result, index) => {
		if (result.status === "fulfilled" && result.value) rows.push(buildStockRow(symbols[index], result.value, config));
		else if (result.status === "rejected" && firstError === null) firstError = result.reason;
	});
	if (rows.length === 0 && firstError !== null) reportHealth("stocks", firstError);
	else reportHealth("stocks", null);
	return rows;
}

async function collectCryptoBars(symbols, limit) {
	if (symbols.length === 0) return { map: new Map(), failures: 0, attempted: 0 };
	const settled = await Promise.allSettled(symbols.map((symbol) => fetchCryptoBars(symbol, limit)));
	const map = new Map();
	let failures = 0;
	let firstError = null;
	settled.forEach((result, index) => {
		if (result.status === "fulfilled" && result.value) map.set(symbols[index], result.value);
		else {
			failures += 1;
			if (firstError === null) firstError = result.reason;
		}
	});
	if (map.size === symbols.length) reportHealth("trend", null);
	else if (map.size === 0 && firstError !== null) reportHealth("trend", firstError);
	return { map, failures, attempted: symbols.length };
}

async function collectQuotes(symbols, stocks, config) {
	const trendSymbols = symbols.slice(0, MAX_TREND_SYMBOLS);
	const limit = barsLimit(config);
	const [binance, bitget, stockRows, bars] = await Promise.all([
		collectBinanceQuotes(symbols),
		collectBitgetQuotes(symbols),
		collectStockQuotes(stocks, config),
		collectCryptoBars(trendSymbols, limit)
	]);
	const quotes = symbols.map((symbol) => {
		const binanceQuote = binance.get(symbol) ?? null;
		const bitgetQuote = bitget.get(symbol) ?? null;
		const barsForSymbol = bars.map.get(symbol) ?? null;
		const price = binanceQuote?.price ?? bitgetQuote?.price ?? null;
		const ta = buildTechnical(barsForSymbol, config, price);
		const change7d = barsForSymbol ? relativeChange(price, barsForSymbol.closes, 8) : null;
		return {
			symbol,
			binance: binanceQuote,
			bitget: bitgetQuote,
			trend: ta ? legacyTrend(ta, barsForSymbol, change7d) : null,
			ta
		};
	});
	const errors = currentErrors();
	if (trendSymbols.length > 0 && quotes.every((row) => !row.ta) && bars.failures > 0) errors.trend = "trend-unavailable";
	return {
		ok: binance.size > 0 || bitget.size > 0 || stockRows.length > 0,
		ts: Date.now(),
		v: PLUGIN_VERSION,
		taConfig: config,
		errors,
		quotes,
		stocks: stockRows,
		trend: {
			crypto: aggregateTrend(quotes.map((row) => row.trend)),
			stock: aggregateTrend(stockRows.map((row) => row.trend))
		}
	};
}

function splitPair(symbol) {
	const upper = String(symbol ?? "").toUpperCase();
	for (const quote of STABLE_QUOTES) {
		if (upper.endsWith(quote) && upper.length > quote.length) {
			return { base: upper.slice(0, -quote.length), quote };
		}
	}
	return null;
}

function cryptoMatchTier(needle, symbol, base) {
	const lowered = symbol.toLowerCase();
	const loweredBase = base.toLowerCase();
	if (loweredBase === needle) return 0;
	if (lowered.startsWith(needle) || loweredBase.startsWith(needle)) return 1;
	if (lowered.includes(needle) || loweredBase.includes(needle)) return 2;
	return null;
}

function coinName(base) {
	return COIN_NAMES[base] ?? base;
}

async function searchCrypto(query, limit) {
	const needle = query.toLowerCase();
	const settled = await Promise.allSettled([fetchBinanceTickers(), fetchBitgetTickers()]);
	const candidates = new Map();
	for (const [venue, result] of [["binance", settled[0]], ["bitget", settled[1]]]) {
		if (result.status !== "fulfilled") continue;
		for (const [symbol, row] of result.value) {
			const pair = splitPair(symbol);
			if (!pair) continue;
			const tier = cryptoMatchTier(needle, symbol, pair.base);
			if (tier === null) continue;
			const existing = candidates.get(symbol);
			if (existing) {
				existing.venues.push(venue);
				existing.tier = Math.min(existing.tier, tier);
				if (existing.price === null) existing.price = row.price;
				if (existing.changePct === null) existing.changePct = row.changePct;
				if (existing.volume === null) existing.volume = row.volume;
				continue;
			}
			candidates.set(symbol, {
				symbol,
				kind: "crypto",
				base: pair.base,
				quote: pair.quote,
				name: coinName(pair.base),
				venues: [venue],
				price: row.price,
				changePct: row.changePct,
				volume: row.volume,
				tier
			});
		}
	}
	const matched = [...candidates.values()]
		.sort((left, right) => (left.tier - right.tier) || ((right.volume ?? 0) - (left.volume ?? 0)) || left.symbol.localeCompare(right.symbol))
		.slice(0, limit);
	return matched.map((row) => ({
		symbol: row.symbol,
		kind: row.kind,
		base: row.base,
		quote: row.quote,
		name: row.name,
		venues: [...new Set(row.venues)],
		price: row.price,
		changePct: row.changePct,
		volume: row.volume
	}));
}

function fallbackStockResults(query, limit) {
	const needle = query.toLowerCase();
	const matches = [];
	for (const [symbol, stock] of Object.entries(STOCK_CATALOG)) {
		let tier = null;
		const lowered = symbol.toLowerCase();
		if (lowered === needle) tier = 0;
		else if (lowered.startsWith(needle)) tier = 1;
		else if (stock.name.toLowerCase().includes(needle)) tier = 2;
		if (tier !== null) matches.push({ symbol, stock, tier });
	}
	matches.sort((left, right) => (left.tier - right.tier) || left.symbol.localeCompare(right.symbol));
	return matches.slice(0, limit).map(({ symbol, stock }) => ({
		symbol,
		kind: "stock",
		name: stock.name,
		exchange: stock.exchange,
		price: null,
		changePct: null
	}));
}

async function enrichStockRows(rows) {
	await Promise.all(rows.map(async (row) => {
		try {
			const chart = await fetchYahooChart(row.symbol);
			const price = numberOrNull(chart.meta.regularMarketPrice) ?? lastOf(chart.closes);
			if (price !== null) row.price = price;
			const changePct = numberOrNull(chart.meta.regularMarketChangePercent);
			if (changePct !== null) row.changePct = round(changePct, 2);
		} catch {}
	}));
	return rows;
}

async function searchStocks(query, limit) {
	let rows = [];
	try {
		const payload = await fetchYahooSearch(query);
		const quotes = Array.isArray(payload?.quotes) ? payload.quotes : [];
		rows = quotes
			.filter((row) => row && typeof row.symbol === "string" && !row.symbol.includes("."))
			.filter((row) => row.quoteType === "EQUITY" || row.quoteType === "ETF")
			.slice(0, limit)
			.map((row) => ({
				symbol: row.symbol,
				kind: "stock",
				name: row.longname ?? row.shortname ?? STOCK_CATALOG[row.symbol]?.name ?? row.symbol,
				exchange: row.exchDisp ?? row.exchange ?? null,
				price: numberOrNull(row.regularMarketPrice),
				changePct: numberOrNull(row.regularMarketChangePercent)
			}));
	} catch {
		rows = [];
	}
	if (rows.length === 0) return fallbackStockResults(query, limit);
	return enrichStockRows(rows);
}

function searchResults(query, limit) {
	return cached(`search:${query.toLowerCase()}:${limit}`, TTL.searchResults, async () => {
		const [crypto, stocks] = await Promise.all([searchCrypto(query, limit), searchStocks(query, limit)]);
		const needle = query.toLowerCase();
		// Relevance first, and stocks before crypto on ties, so a query like "aapl"
		// surfaces Apple instead of obscure AAPL-named crypto pairs.
		const tierOf = (row) => {
			const symbol = String(row.symbol ?? "").toLowerCase();
			const base = String(row.base ?? "").toLowerCase();
			const name = String(row.name ?? "").toLowerCase();
			if (symbol === needle || base === needle) return 0;
			if (symbol.startsWith(needle) || base.startsWith(needle) || name.startsWith(needle)) return 1;
			if (symbol.includes(needle) || name.includes(needle)) return 2;
			return 3;
		};
		return [...stocks, ...crypto]
			.map((row, index) => ({ row, index, tier: tierOf(row) }))
			.sort((left, right) => left.tier - right.tier || left.index - right.index)
			.map((item) => item.row);
	});
}

function marketLabel(score, threshold) {
	return score >= threshold ? "偏多" : score <= -threshold ? "偏空" : "震荡";
}

async function cryptoMarket(threshold) {
	return cached(`market:crypto:${threshold}`, TTL.market, async () => {
		const all = await fetchBinanceTickers();
		const changes = [];
		let up = 0;
		let down = 0;
		let flat = 0;
		let up3 = 0;
		let down3 = 0;
		let volume = 0;
		let weighted = 0;
		for (const [symbol, row] of all) {
			if (!symbol.endsWith("USDT")) continue;
			const base = symbol.slice(0, -4);
			if (STABLE_BASES.has(base)) continue;
			// Skip leveraged tokens such as BTCUP/BTCDOWN while keeping short names like JUP.
			if (base.length > 4 && /(UP|DOWN|BULL|BEAR)$/.test(base)) continue;
			if (!(row.volume >= 1000000) || !Number.isFinite(row.changePct)) continue;
			const change = row.changePct;
			changes.push(change);
			if (change > 0.05) up += 1;
			else if (change < -0.05) down += 1;
			else flat += 1;
			if (change >= 3) up3 += 1;
			if (change <= -3) down3 += 1;
			volume += row.volume;
			weighted += change * row.volume;
		}
		if (changes.length < 10) throw new Error("crypto-market-thin");
		changes.sort((left, right) => left - right);
		const median = changes[Math.floor(changes.length / 2)];
		const weightedChange = volume > 0 ? weighted / volume : median;
		const breadth = (up - down) / changes.length;
		const score = clamp(0.55 * Math.tanh(median / 3) + 0.25 * Math.tanh(weightedChange / 3) + 0.2 * breadth, -1, 1);
		const btc = all.get("BTCUSDT");
		const eth = all.get("ETHUSDT");
		return {
			label: marketLabel(score, threshold),
			score: round(score, 3),
			bullProbability: Math.round(clamp(50 + score * 45, 5, 95)),
			universe: changes.length,
			up,
			down,
			flat,
			up3,
			down3,
			medianChangePct: round(median, 2),
			weightedChangePct: round(weightedChange, 2),
			totalVolumeUsd: Math.round(volume),
			btcChangePct: btc?.changePct ?? null,
			ethChangePct: eth?.changePct ?? null,
			source: "binance-usdt-24h"
		};
	});
}

async function fetchMarketRow(symbol, name) {
	const chart = await fetchYahooChart(symbol, "6mo");
	const price = numberOrNull(chart.meta.regularMarketPrice) ?? lastOf(chart.closes);
	const changePct = numberOrNull(chart.meta.regularMarketChangePercent);
	const ma20 = sma(chart.closes, 20);
	return {
		symbol,
		name,
		price: roundPrice(price),
		changePct: changePct === null ? null : round(changePct, 2),
		ma20: roundPrice(ma20),
		aboveMa20: Number.isFinite(price) && Number.isFinite(ma20) ? price >= ma20 : null
	};
}

async function stockMarket(threshold) {
	return cached(`market:stock:${threshold}`, TTL.market, async () => {
		const settled = await Promise.allSettled([
			...MARKET_INDEXES.map(([symbol, name]) => fetchMarketRow(symbol, name)),
			...MARKET_SECTORS.map(([symbol, name]) => fetchMarketRow(symbol, name)),
			fetchMarketRow("^VIX", "VIX")
		]);
		const rows = settled.filter((result) => result.status === "fulfilled").map((result) => result.value);
		if (rows.length < 4) throw new Error("stock-market-thin");
		const indexes = rows.filter((row) => row.symbol.startsWith("^") && row.symbol !== "^VIX");
		const sectors = rows.filter((row) => !row.symbol.startsWith("^"));
		const vix = rows.find((row) => row.symbol === "^VIX") ?? null;
		const withChange = (list) => list.filter((row) => Number.isFinite(row.changePct));
		const indexChanges = withChange(indexes);
		const sectorChanges = withChange(sectors);
		const indexUp = indexChanges.filter((row) => row.changePct > 0).length;
		const sectorUp = sectorChanges.filter((row) => row.changePct > 0).length;
		const aboveRows = [...indexes, ...sectors].filter((row) => row.aboveMa20 !== null);
		const aboveMa20Count = aboveRows.filter((row) => row.aboveMa20).length;
		const avgIndexChangePct = indexChanges.length ? average(indexChanges.map((row) => row.changePct)) : 0;
		const avgSectorChangePct = sectorChanges.length ? average(sectorChanges.map((row) => row.changePct)) : 0;
		const sectorUpRatio = sectorChanges.length ? sectorUp / sectorChanges.length : 0.5;
		const aboveMa20Ratio = aboveRows.length ? aboveMa20Count / aboveRows.length : 0.5;
		const score = clamp(
			0.35 * Math.tanh(avgIndexChangePct / 1.2) +
			0.25 * Math.tanh(avgSectorChangePct / 1.2) +
			0.2 * (2 * sectorUpRatio - 1) +
			0.2 * (2 * aboveMa20Ratio - 1),
			-1,
			1
		);
		return {
			label: marketLabel(score, threshold),
			score: round(score, 3),
			bullProbability: Math.round(clamp(50 + score * 45, 5, 95)),
			indexes,
			sectors,
			indexUp,
			indexCount: indexChanges.length,
			sectorUp,
			sectorCount: sectorChanges.length,
			aboveMa20Count,
			aboveMa20Total: aboveRows.length,
			avgChangePct: round(avgIndexChangePct, 2),
			vix: vix ? { price: vix.price, changePct: vix.changePct } : null,
			source: "yahoo-index-sector"
		};
	});
}

function percentileOf(values, current) {
	if (!Array.isArray(values) || values.length === 0 || !Number.isFinite(current)) return null;
	let count = 0;
	for (const value of values) if (Number.isFinite(value) && value <= current) count += 1;
	return (count / values.length) * 100;
}

function zoneOf(price, zones) {
	if (!Number.isFinite(price)) return null;
	if (price < zones[0]) return "平静";
	if (price < zones[1]) return "正常";
	if (price < zones[2]) return "警惕";
	if (price < zones[3]) return "恐慌";
	return "极度恐慌";
}

function volatilityGauge(chart, zones) {
	const price = numberOrNull(chart.meta.regularMarketPrice) ?? lastOf(chart.closes);
	const changePct = numberOrNull(chart.meta.regularMarketChangePercent);
	return {
		price: roundPrice(price),
		changePct: round(changePct, 2),
		percentile: round(percentileOf(chart.closes, price), 1),
		zone: zoneOf(price, zones)
	};
}

function distributionFromValues(values, edges, labels, current, yearsOverride, exceedanceSpec) {
	const clean = (Array.isArray(values) ? values : []).filter((value) => Number.isFinite(value));
	if (clean.length < 300) return null;
	const counts = Array(edges.length + 1).fill(0);
	for (const value of clean) {
		let index = edges.findIndex((edge) => value < edge);
		if (index === -1) index = edges.length;
		counts[index] += 1;
	}
	const total = clean.length;
	const years = yearsOverride ?? total / 252;
	const exceedance = [];
	if (exceedanceSpec && typeof exceedanceSpec === "object") {
		for (const threshold of exceedanceSpec.gte ?? []) {
			if (!Number.isFinite(threshold)) continue;
			const days = clean.filter((value) => value >= threshold).length;
			exceedance.push({ label: `≥${threshold}`, days, pct: round((days / total) * 100, 1), perYear: Math.round(days / Math.max(0.5, years)) });
		}
		for (const threshold of exceedanceSpec.lte ?? []) {
			if (!Number.isFinite(threshold)) continue;
			const days = clean.filter((value) => value <= threshold).length;
			exceedance.push({ label: `≤${threshold}`, days, pct: round((days / total) * 100, 1), perYear: Math.round(days / Math.max(0.5, years)) });
		}
	}
	const currentIndex = Number.isFinite(current)
		? (() => { const index = edges.findIndex((edge) => current < edge); return index === -1 ? edges.length : index; })()
		: -1;
	const zones = counts.map((days, index) => ({
		label: labels[index],
		days,
		pct: round((days / total) * 100, 1),
		perYear: Math.round(days / Math.max(0.5, years)),
		current: index === currentIndex
	}));
	const currentZone = currentIndex >= 0 ? zones[currentIndex] : null;
	const modeIndex = zones.reduce((best, zone, index) => (zone.pct > zones[best].pct ? index : best), 0);
	const below = Number.isFinite(current) ? clean.filter((value) => value <= current).length : null;
	return {
		sampleDays: total,
		years: round(years, 1),
		zones,
		currentLabel: currentZone?.label ?? null,
		currentPct: currentZone?.pct ?? null,
		currentPerYear: currentZone?.perYear ?? null,
		historicalPercentile: below === null ? null : round((below / total) * 100, 1),
		exceedance,
		mode: {
			label: zones[modeIndex].label,
			pct: zones[modeIndex].pct,
			perYear: zones[modeIndex].perYear
		},
		frequency: currentZone ? (currentZone.pct >= 25 ? "常态" : currentZone.pct >= 10 ? "常见" : currentZone.pct >= 3 ? "少见" : "极端") : null
	};
}

function vixDistribution() {
	return cached("sentiment:vix-dist", TTL.history, async () => {
		const chart = await fetchYahooChart("^VIX", "10y");
		const current = numberOrNull(chart.meta.regularMarketPrice) ?? lastOf(chart.closes);
		return distributionFromValues(chart.closes, VIX_ZONES, ["<15", "15–20", "20–25", "25–30", "≥30"], current, undefined, { gte: [20, 25, 30, 35] });
	});
}

function vxnDistribution() {
	return cached("sentiment:vxn-dist", TTL.history, async () => {
		const chart = await fetchYahooChart("^VXN", "10y");
		const current = numberOrNull(chart.meta.regularMarketPrice) ?? lastOf(chart.closes);
		return distributionFromValues(chart.closes, VXN_ZONES, ["<18", "18–23", "23–28", "28–35", "≥35"], current, undefined, { gte: [23, 28, 35, 40] });
	});
}

function fngDistribution() {
	return cached("sentiment:fng-dist", TTL.history, async () => {
		const payload = await getJson("https://api.alternative.me/fng/?limit=0");
		const data = Array.isArray(payload?.data) ? payload.data : [];
		const rows = data
			.map((row) => ({ value: numberOrNull(row.value), ts: numberOrNull(row.timestamp) }))
			.filter((row) => row.value !== null);
		if (rows.length < 300) return null;
		const times = rows.map((row) => row.ts).filter(Number.isFinite);
		const first = times.length ? Math.min(...times) : 0;
		const last = times.length ? Math.max(...times) : 0;
		const years = last > first ? (last - first) / 86400 / 365.25 : rows.length / 365;
		return distributionFromValues(
			rows.map((row) => row.value),
			[26, 46, 56, 76],
			["0–25 极度恐惧", "26–45 恐惧", "46–55 中性", "56–75 贪婪", "76–100 极度贪婪"],
			rows[0]?.value,
			years,
			{ lte: [25, 45], gte: [55, 75] }
		);
	});
}

function vixGauge() {
	return cached("sentiment:vix", TTL.market, async () => volatilityGauge(await fetchYahooChart("^VIX", "1y"), VIX_ZONES));
}

function vxnGauge() {
	return cached("sentiment:vxn", TTL.market, async () => volatilityGauge(await fetchYahooChart("^VXN", "1y"), VXN_ZONES));
}

function cryptoFearGreed() {
	return cached("sentiment:fng", TTL.fearGreed, async () => {
		const payload = await getJson("https://api.alternative.me/fng/?limit=2");
		const data = Array.isArray(payload?.data) ? payload.data : [];
		if (data.length === 0) throw new Error("fng-empty");
		const latest = data[0];
		const previous = data[1];
		return {
			value: numberOrNull(latest.value),
			label: latest.value_classification ?? null,
			previous: numberOrNull(previous?.value),
			timestamp: numberOrNull(latest.timestamp)
		};
	});
}

function okxDerivatives() {
	return cached("sentiment:okx", TTL.derivatives, async () => {
		const [ratioPayload, oiPayload, fundingPayload] = await Promise.all([
			getJson("https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=BTC&period=1H"),
			getJson("https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP"),
			getJson("https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP")
		]);
		const latestRatio = Array.isArray(ratioPayload?.data) ? ratioPayload.data[0] : null;
		const ratio = numberOrNull(latestRatio?.[1]);
		const longPct = ratio === null ? null : (ratio / (1 + ratio)) * 100;
		const oiRow = Array.isArray(oiPayload?.data) ? oiPayload.data[0] : null;
		const fundingRow = Array.isArray(fundingPayload?.data) ? fundingPayload.data[0] : null;
		const funding = numberOrNull(fundingRow?.fundingRate);
		return {
			source: "okx-swap",
			symbol: "BTC-USDT-SWAP",
			longShortRatio: round(ratio, 2),
			longPct: round(longPct, 1),
			shortPct: round(longPct === null ? null : 100 - longPct, 1),
			openInterestUsd: numberOrNull(oiRow?.oiUsd),
			fundingRatePct: funding === null ? null : round(funding * 100, 4),
			nextFundingTime: numberOrNull(fundingRow?.nextFundingTime)
		};
	});
}

async function sentimentMarket() {
	const [vix, vxn, fearGreed, derivatives, vixDist, vxnDist, fngDist] = await Promise.allSettled([
		vixGauge(),
		vxnGauge(),
		cryptoFearGreed(),
		okxDerivatives(),
		vixDistribution(),
		vxnDistribution(),
		fngDistribution()
	]);
	const errors = {};
	const read = (result, key) => {
		if (result.status === "fulfilled") return result.value;
		errors[key] = errorText(result.reason);
		return null;
	};
	const sentiment = {
		vix: read(vix, "vix"),
		vxn: read(vxn, "vxn"),
		cryptoFearGreed: read(fearGreed, "fearGreed")
	};
	const vixValue = read(vixDist, "vixDistribution");
	const vxnValue = read(vxnDist, "vxnDistribution");
	const fngValue = read(fngDist, "fngDistribution");
	if (sentiment.vix && vixValue) sentiment.vix.distribution = vixValue;
	if (sentiment.vxn && vxnValue) sentiment.vxn.distribution = vxnValue;
	if (sentiment.cryptoFearGreed && fngValue) sentiment.cryptoFearGreed.distribution = fngValue;
	return {
		sentiment,
		derivatives: read(derivatives, "derivatives"),
		errors
	};
}

function marketRoute() {
	return {
		kind: "exact",
		path: `${API_PREFIX}/market`,
		handler: async (req, res) => {
			if (req.method !== "GET") {
				res.setHeader?.("Allow", "GET");
				json(res, 405, { ok: false, error: "method-not-allowed" });
				return;
			}
			const query = new URL(req.url ?? "/", "http://dsh.local").searchParams;
			const threshold = clamp(numberOr(query.get("th"), 0.15), 0.05, 0.6);
			const [crypto, stock, sentiment] = await Promise.allSettled([cryptoMarket(threshold), stockMarket(threshold), sentimentMarket()]);
			const errors = {};
			if (crypto.status === "rejected") errors.crypto = errorText(crypto.reason);
			if (stock.status === "rejected") errors.stock = errorText(stock.reason);
			const cryptoValue = crypto.status === "fulfilled" ? crypto.value : null;
			const stockValue = stock.status === "fulfilled" ? stock.value : null;
			const sentimentValue = sentiment.status === "fulfilled" ? sentiment.value : null;
			if (sentiment.status === "rejected") errors.sentiment = errorText(sentiment.reason);
			if (sentimentValue?.derivatives && cryptoValue) cryptoValue.derivatives = sentimentValue.derivatives;
			if (sentimentValue?.errors) Object.assign(errors, sentimentValue.errors);
			json(res, 200, {
				ok: Boolean(cryptoValue || stockValue),
				ts: Date.now(),
				th: threshold,
				crypto: cryptoValue,
				stock: stockValue,
				sentiment: sentimentValue?.sentiment ?? null,
				errors
			});
		}
	};
}

function quotesRoute() {
	return {
		kind: "exact",
		path: `${API_PREFIX}/quotes`,
		handler: async (req, res) => {
			if (req.method !== "GET") {
				res.setHeader?.("Allow", "GET");
				json(res, 405, { ok: false, error: "method-not-allowed" });
				return;
			}
			const query = new URL(req.url ?? "/", "http://dsh.local").searchParams;
			const symbols = normalizeSymbols(query.get("symbols"));
			const stocks = normalizeStocks(query.get("stocks"));
			const config = taConfigFromQuery(query);
			if (symbols.length === 0 && stocks === null) {
				json(res, 400, { ok: false, error: "symbols-required", symbols: DEFAULT_SYMBOLS });
				return;
			}
			try {
				json(res, 200, await collectQuotes(symbols, stocks ?? DEFAULT_STOCKS, config));
			} catch (error) {
				json(res, 200, {
					ok: false,
					ts: Date.now(),
					v: PLUGIN_VERSION,
					taConfig: config,
					errors: { route: errorText(error) },
					quotes: [],
					stocks: [],
					trend: { crypto: null, stock: null }
				});
			}
		}
	};
}

function searchRoute() {
	return {
		kind: "exact",
		path: `${API_PREFIX}/search`,
		handler: async (req, res) => {
			if (req.method !== "GET") {
				res.setHeader?.("Allow", "GET");
				json(res, 405, { ok: false, error: "method-not-allowed" });
				return;
			}
			const query = new URL(req.url ?? "/", "http://dsh.local").searchParams;
			const text = String(query.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
			const limit = normalizeLimit(query.get("limit"));
			if (text === "") {
				json(res, 200, { ok: true, query: "", results: [] });
				return;
			}
			try {
				json(res, 200, { ok: true, query: text, results: await searchResults(text, limit) });
			} catch (error) {
				json(res, 200, { ok: true, query: text, results: [], error: errorText(error) });
			}
		}
	};
}

export function apply(ctx) {
	ctx.effect(() => ctx.webServer.register(quotesRoute()), "dsh-crypto-us-stock-monitor: quotes route");
	ctx.effect(() => ctx.webServer.register(searchRoute()), "dsh-crypto-us-stock-monitor: search route");
	ctx.effect(() => ctx.webServer.register(marketRoute()), "dsh-crypto-us-stock-monitor: market route");
	ctx.effect(() => ctx.webServer.register(stateRoute()), "dsh-crypto-us-stock-monitor: state route");
	ctx.effect(() => ctx.webServer.register(watchlistRoute()), "dsh-crypto-us-stock-monitor: watchlist route");
	ctx.effect(() => ctx.webServer.register(targetsRoute()), "dsh-crypto-us-stock-monitor: targets route");
}











