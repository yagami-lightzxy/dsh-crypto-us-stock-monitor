window.__ModuleLoader__.load({
	id: "dsh-crypto-us-stock-monitor",
	factory: (require) => {
		const module = { exports: {} };
		const exports = module.exports;
		const PLUGIN_ID = "dsh-crypto-us-stock-monitor";

		const STORAGE_KEY = "dsh.binance-bitget.watchlist.v2";
		const LEGACY_KEY = "dsh.binance-bitget.watchlist.v1";
		const TARGETS_KEY = "dsh.binance-bitget.targets.v2";
		const LEGACY_TARGETS_KEY = "dsh.binance-bitget.targets.v1";
		const POSITION_KEY = "dsh.binance-bitget.position.v2";
		const LEGACY_POSITION_KEY = "dsh.binance-bitget.position.v1";
		const COLLAPSED_KEY = "dsh.binance-bitget.collapsed.v1";
		const QUOTES_URL = "/plugins/dsh-crypto-us-stock-monitor/api/quotes";
		const SEARCH_URL = "/plugins/dsh-crypto-us-stock-monitor/api/search";
		const MARKET_URL = "/plugins/dsh-crypto-us-stock-monitor/api/market";
		const STATE_URL = "/plugins/dsh-crypto-us-stock-monitor/api/state";
		const STATE_REV_KEY = "dsh.binance-bitget.stateRevision";
		const SETTINGS_KEY = "dsh.binance-bitget.settings.v1";
		const DEFAULT_SETTINGS = {
			interval: 3000,
			maFast: 5,
			maSlow: 20,
			maLong: 50,
			rsiPeriod: 14,
			macd: "12,26,9",
			boll: "20,2",
			atrPeriod: 14,
			adxPeriod: 14,
			breakoutDays: 20,
			volumePeriod: 20,
			threshold: 0.2,
			style: "balanced",
			presetId: "balanced",
			thresholds: { rsiMin: 40, rsiMax: 70, adxMin: 0, volRatio: 0.8, percentBMax: 0.95, distHigh: -5, bbPctMax: 100, stopAtr: 2, rr: 1.5 },
			showSignals: true,
			showMarket: true,
			showDashboard: true,
			showAlerts: true,
			notifyDesktop: false,
			onlyOpps: false,
			sort: "default",
			distOpen: true,
			tab: "watchlist",
		};
		const ALERTS_KEY = "dsh.binance-bitget.alerts.v1";
		const SETTING_OPTIONS = {
			interval: [2000, 3000, 5000, 10000],
			maFast: [3, 5, 8, 10, 13, 20],
			maSlow: [10, 20, 30, 50, 100, 200],
			maLong: [30, 50, 100, 200],
			rsiPeriod: [7, 14, 21],
			macd: ["12,26,9", "8,21,5", "5,35,5"],
			boll: ["20,2", "20,2.5", "26,2"],
			atrPeriod: [7, 14, 21],
			adxPeriod: [7, 14, 21],
			breakoutDays: [10, 20, 55],
			volumePeriod: [10, 20, 30],
			style: ["balanced", "trend", "momentum", "meanrev"],
		};
		const PRESETS_KEY = "dsh.binance-bitget.presets.v1";
		const PRESET_BASES = ["balanced", "momentum", "rebound", "trendPullback", "breakoutRetest", "squeeze", "divergence"];
		const PRESET_BASE_LABELS = {
			balanced: "综合",
			momentum: "动量突破",
			rebound: "低位反弹",
			trendPullback: "趋势回调",
			breakoutRetest: "突破回踩",
			squeeze: "布林收口",
			divergence: "量价背离",
		};
		const DEFAULT_THRESHOLDS = {
			rsiMin: 40,
			rsiMax: 70,
			adxMin: 0,
			volRatio: 0.8,
			percentBMax: 0.95,
			distHigh: -5,
			bbPctMax: 100,
			stopAtr: 2,
			rr: 1.5,
		};
		const PRESET_BUILTINS = [
			{
				id: "balanced",
				name: "综合",
				base: "balanced",
				desc: "趋势 + 动量 + 区间综合判断",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "balanced" },
				thresholds: { ...DEFAULT_THRESHOLDS },
			},
			{
				id: "momentum",
				name: "动量突破",
				base: "momentum",
				desc: "放量突破 20 日高点 + 趋势向上",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "momentum" },
				thresholds: { rsiMin: 50, rsiMax: 78, adxMin: 20, volRatio: 1.3, percentBMax: 1, distHigh: -5, bbPctMax: 100, stopAtr: 2, rr: 2 },
			},
			{
				id: "rebound",
				name: "低位反弹",
				base: "rebound",
				desc: "超跌 + 布林下轨 + 动能改善",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.25, style: "meanrev" },
				thresholds: { rsiMin: 20, rsiMax: 35, adxMin: 0, volRatio: 0.8, percentBMax: 0.2, distHigh: -15, bbPctMax: 100, stopAtr: 1.5, rr: 2 },
			},
			{
				id: "trendPullback",
				name: "趋势回调",
				base: "trendPullback",
				desc: "长期趋势向上，回踩均线且未破位",
				params: { maFast: 10, maSlow: 30, maLong: 100, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "trend" },
				thresholds: { rsiMin: 38, rsiMax: 62, adxMin: 25, volRatio: 0.8, percentBMax: 0.8, distHigh: -3, bbPctMax: 100, stopAtr: 2, rr: 2 },
			},
			{
				id: "breakoutRetest",
				name: "突破回踩",
				base: "breakoutRetest",
				desc: "突破后缩量回踩，守住突破位",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "momentum" },
				thresholds: { rsiMin: 45, rsiMax: 70, adxMin: 15, volRatio: 1.2, percentBMax: 0.9, distHigh: -3, bbPctMax: 100, stopAtr: 1.5, rr: 2 },
			},
			{
				id: "squeeze",
				name: "布林收口",
				base: "squeeze",
				desc: "波动率压缩到低位，等待方向选择",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.15, style: "balanced" },
				thresholds: { rsiMin: 40, rsiMax: 65, adxMin: 0, volRatio: 0.8, percentBMax: 0.8, distHigh: -8, bbPctMax: 20, stopAtr: 1.5, rr: 2 },
			},
			{
				id: "divergence",
				name: "量价背离",
				base: "divergence",
				desc: "价格新低但 RSI 抬高，动能背离",
				params: { maFast: 5, maSlow: 20, maLong: 50, rsiPeriod: 14, macd: "12,26,9", boll: "20,2", atrPeriod: 14, adxPeriod: 14, breakoutDays: 20, volumePeriod: 20, threshold: 0.2, style: "meanrev" },
				thresholds: { rsiMin: 20, rsiMax: 45, adxMin: 0, volRatio: 0.8, percentBMax: 0.4, distHigh: -10, bbPctMax: 100, stopAtr: 1.5, rr: 2 },
			},
		];
		const MAX_CRYPTO = 30;
		const MAX_STOCKS = 12;
		const DEFAULT_CRYPTO = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
		const DEFAULT_STOCKS = ["SPY", "QQQ", "NVDA", "AAPL"];
		const CRYPTO_RE = /^[A-Z0-9]{5,20}$/;
		const STOCK_RE = /^[A-Z][A-Z0-9.\-]{0,9}$/;
		const CRYPTO_QUOTES = ["USDT", "USDC", "FDUSD", "BUSD", "TUSD", "DAI", "BTC", "ETH", "BNB", "EUR", "TRY", "BRL"];
		const CRYPTO_BASES = [
			"BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "TRX", "AVAX", "LINK", "DOT", "MATIC", "POL",
			"TON", "SHIB", "LTC", "BCH", "UNI", "ATOM", "XLM", "ETC", "FIL", "APT", "ARB", "OP", "SUI",
			"NEAR", "INJ", "SEI", "TIA", "RUNE", "AAVE", "MKR", "LDO", "CRV", "PEPE", "WIF", "BONK", "FLOKI",
			"JUP", "PYTH", "WLD", "ENA", "ETHFI", "ONDO", "FET", "RNDR", "GRT", "IMX", "LPT", "HYPE",
			"HBAR", "VET", "ALGO", "ICP", "QNT", "EGLD", "FTM", "SAND", "MANA", "AXS", "GALA", "CHZ",
		];
		const STOCK_SUGGESTIONS = [
			["SPY", "SPDR S&P 500 ETF"], ["QQQ", "Invesco QQQ Trust"], ["DIA", "SPDR Dow Jones ETF"],
			["IWM", "iShares Russell 2000"], ["NVDA", "NVIDIA Corp"], ["AAPL", "Apple Inc."],
			["MSFT", "Microsoft Corp"], ["GOOGL", "Alphabet Inc. Class A"], ["AMZN", "Amazon.com Inc."],
			["META", "Meta Platforms Inc."], ["TSLA", "Tesla Inc."], ["AMD", "Advanced Micro Devices"],
			["NFLX", "Netflix Inc."], ["AVGO", "Broadcom Inc."], ["COST", "Costco Wholesale"],
			"JPM", "V", "MA", "UNH", "LLY", "XOM", "CVX", "JNJ", "PG", "KO", "PEP", "WMT", "DIS",
			"BA", "CAT", "GE", "CRM", "ORCL", "ADBE", "INTC", "MU", "QCOM", "PLTR", "COIN", "MSTR",
			"UBER", "HIMS", "MRVL", "LITE", "SHOP", "SNOW", "CRWD", "SMCI", "ARM", "TSM", "BABA",
		].map((entry) => (Array.isArray(entry) ? { symbol: entry[0], name: entry[1] } : { symbol: entry, name: entry }));

		const css = `
      [data-dsh-crypto-us-stock-monitor]{color:#1b2b41;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif;font-size:13px;line-height:1.45;text-align:left;contain:layout style}
      [data-dsh-crypto-us-stock-monitor].dbw-floating{position:fixed;left:12px;bottom:54px;width:560px;z-index:2147482000}
      [data-dsh-crypto-us-stock-monitor] *{box-sizing:border-box}
      [data-dsh-crypto-us-stock-monitor] .dbw-card{display:flex;flex-direction:column;max-height:calc(100vh - 100px);overflow:hidden;border:1px solid #d6e1f0;border-radius:12px;background:#fff;box-shadow:0 18px 48px rgba(42,76,121,.18),0 2px 6px rgba(42,76,121,.07)}
      [data-dsh-crypto-us-stock-monitor] .dbw-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 12px;border-bottom:1px solid #e7eef8;background:linear-gradient(180deg,#fff,#f8fbff);cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-head:active{cursor:grabbing}
      [data-dsh-crypto-us-stock-monitor] .dbw-headcopy{min-width:0}
      [data-dsh-crypto-us-stock-monitor] .dbw-kicker{color:#6b7f97;font-size:9px;font-weight:800;letter-spacing:.16em;line-height:1.2}
      [data-dsh-crypto-us-stock-monitor] .dbw-title{margin-top:2px;color:#1d3450;font-size:15px;font-weight:750;line-height:1.25}
      [data-dsh-crypto-us-stock-monitor] .dbw-title span{margin-left:6px;color:#8a9cb3;font-size:11px;font-weight:600}
      [data-dsh-crypto-us-stock-monitor] .dbw-head-actions{flex:none;display:flex;align-items:center;gap:4px}
      [data-dsh-crypto-us-stock-monitor] .dbw-icon{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:#7e93ab;font-family:inherit;font-size:16px;line-height:1;cursor:pointer}
      [data-dsh-crypto-us-stock-monitor] .dbw-icon:hover{background:#eaf2ff;color:#2b72da}
      [data-dsh-crypto-us-stock-monitor] .dbw-icon[data-active=true]{background:#eaf2ff;color:#2b72da}
      [data-dsh-crypto-us-stock-monitor] .dbw-mini{display:none;overflow:hidden;flex:1;min-width:0;color:#587da8;font-size:11px;font-weight:750;text-overflow:ellipsis;white-space:nowrap}
      [data-dsh-crypto-us-stock-monitor] .dbw-body{display:flex;flex-direction:column;min-height:0}
      [data-dsh-crypto-us-stock-monitor] .dbw-trends{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px 8px}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend{padding:8px 9px;border:1px solid #e2ebf6;border-radius:9px;background:#f9fbff}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend-top{display:flex;align-items:baseline;justify-content:space-between;gap:6px}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend-name{color:#5c718c;font-size:11px;font-weight:800;letter-spacing:.05em}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend-right{display:flex;align-items:baseline;gap:4px;white-space:nowrap}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend-label{font-size:13px;font-weight:800;font-style:normal}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend-prob{color:#8a9cb3;font-size:10px;font-weight:700;font-style:normal;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-bar{position:relative;height:6px;margin-top:7px;border-radius:99px;background:#e7eef7;overflow:hidden}
      [data-dsh-crypto-us-stock-monitor] .dbw-bar:before{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;background:#c6d4e5;z-index:2}
      [data-dsh-crypto-us-stock-monitor] .dbw-bar > i{position:absolute;top:0;bottom:0;left:50%;width:0;border-radius:99px;background:#9fb0c6;transition:left .35s ease,width .35s ease,background .2s ease}
      [data-dsh-crypto-us-stock-monitor] .dbw-bar[data-tone=bull] > i{background:linear-gradient(90deg,#38c99a,#109b74)}
      [data-dsh-crypto-us-stock-monitor] .dbw-bar[data-tone=bear] > i{background:linear-gradient(90deg,#f094a2,#dd4f67)}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend-meta{margin-top:6px;color:#8a9cb3;font-size:10px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend[data-tone=bull] .dbw-trend-label{color:#0f8a68}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend[data-tone=bear] .dbw-trend-label{color:#d24f66}
      [data-dsh-crypto-us-stock-monitor] .dbw-trend[data-tone=neutral] .dbw-trend-label{color:#7b8ea6}
      [data-dsh-crypto-us-stock-monitor] .dbw-search{flex:none;display:flex;align-items:center;gap:6px;padding:0 12px 6px}
      [data-dsh-crypto-us-stock-monitor] .dbw-search input{flex:1;min-width:0;height:38px;padding:0 11px;border:1px solid #cbd9ea;border-radius:7px;outline:0;background:#fff;color:#1d3450;font-family:inherit;font-size:12.5px;text-transform:uppercase}
      [data-dsh-crypto-us-stock-monitor] .dbw-search input::placeholder{color:#9aabbf;text-transform:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-search input:focus{border-color:#7daaf0;box-shadow:0 0 0 3px rgba(82,145,232,.14)}
      [data-dsh-crypto-us-stock-monitor] .dbw-refresh{flex:none;width:38px;height:38px;border:1px solid #cbd9ea;border-radius:7px;background:#fff;color:#5c86bb;font-family:inherit;font-size:16px;line-height:1;cursor:pointer}
      [data-dsh-crypto-us-stock-monitor] .dbw-tool{flex:none;width:38px;height:38px;border:1px solid #cbd9ea;border-radius:7px;background:#fff;color:#6d8199;font-family:inherit;font-size:15px;line-height:1;cursor:pointer}
      [data-dsh-crypto-us-stock-monitor] .dbw-tool:hover{background:#f0f6ff;color:#2b72da}
      [data-dsh-crypto-us-stock-monitor] .dbw-tool[data-active=true]{border-color:#8db6ee;background:#e8f2ff;color:#1f62b8}
      [data-dsh-crypto-us-stock-monitor] .dbw-refresh:hover{background:#eaf2ff;color:#2b72da}
      [data-dsh-crypto-us-stock-monitor] .dbw-refresh[data-busy=true]{color:#2b72da;background:#eaf2ff;animation:dbw-spin 1s linear infinite}
      @keyframes dbw-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      [data-dsh-crypto-us-stock-monitor] .dbw-results{flex:none;max-height:224px;overflow:auto;border-top:1px solid #e7eef8;border-bottom:1px solid #e7eef8;background:#fbfdff;overscroll-behavior:contain}
      [data-dsh-crypto-us-stock-monitor] .dbw-results[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-result{display:flex;align-items:center;gap:8px;padding:7px 12px;cursor:pointer}
      [data-dsh-crypto-us-stock-monitor] .dbw-result:hover,[data-dsh-crypto-us-stock-monitor] .dbw-result[data-active=true]{background:#eaf3ff}
      [data-dsh-crypto-us-stock-monitor] .dbw-result-kind{flex:none;width:26px;padding:1px 0;border-radius:4px;background:#e8f0fb;color:#4a76b0;font-size:9px;font-weight:800;text-align:center}
      [data-dsh-crypto-us-stock-monitor] .dbw-result-kind[data-kind=stock]{background:#eef7ef;color:#3d7f4c}
      [data-dsh-crypto-us-stock-monitor] .dbw-result-main{flex:1;min-width:0}
      [data-dsh-crypto-us-stock-monitor] .dbw-result-symbol{color:#1d3450;font-size:12px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-result-name{color:#8496ab;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-result-price{flex:none;text-align:right;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-result-price b{display:block;color:#33465f;font-size:11px;font-weight:700}
      [data-dsh-crypto-us-stock-monitor] .dbw-result-empty{padding:14px 12px;color:#8a9cb3;font-size:11px;text-align:center}
      [data-dsh-crypto-us-stock-monitor] .dbw-list{flex:1 1 auto;min-height:120px;max-height:min(62vh,660px);overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#c9d7e8 transparent}
      [data-dsh-crypto-us-stock-monitor] .dbw-list::-webkit-scrollbar{width:8px}
      [data-dsh-crypto-us-stock-monitor] .dbw-list::-webkit-scrollbar-thumb{border:2px solid #fff;border-radius:9px;background:#c9d7e8}
      [data-dsh-crypto-us-stock-monitor] .dbw-section-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:6px 14px;border-top:1px solid #e7eef8;border-bottom:1px solid #e7eef8;background:#f3f8fd;color:#6d8199;font-size:11px;font-weight:800;letter-spacing:.12em}
      [data-dsh-crypto-us-stock-monitor] .dbw-section:first-child .dbw-section-head{border-top:0}
      [data-dsh-crypto-us-stock-monitor] .dbw-section-head b{color:#4c7fb8;font-weight:800}
      [data-dsh-crypto-us-stock-monitor] .dbw-section-side{display:flex;align-items:center;gap:8px}
      [data-dsh-crypto-us-stock-monitor] .dbw-section-side em{font-style:normal;color:#8a9cb3;font-weight:600;letter-spacing:0;font-size:9px}
      [data-dsh-crypto-us-stock-monitor] .dbw-row{padding:10px 14px 11px;border-bottom:1px solid #eef3f9}
      [data-dsh-crypto-us-stock-monitor] .dbw-row:hover{background:#fafcff}
      [data-dsh-crypto-us-stock-monitor] .dbw-row:last-child{border-bottom:0}
      [data-dsh-crypto-us-stock-monitor] .dbw-row:hover{background:#fafdff}
      [data-dsh-crypto-us-stock-monitor] .dbw-row[data-flash=true]{animation:dbw-flash .9s ease}
      @keyframes dbw-flash{from{background:#e2efff}to{background:transparent}}
      [data-dsh-crypto-us-stock-monitor] .dbw-rowtop{display:flex;align-items:center;gap:6px;min-width:0}
      [data-dsh-crypto-us-stock-monitor] .dbw-symbol{flex:none;color:#1d3450;font-size:14px;font-weight:800;letter-spacing:.01em}
      [data-dsh-crypto-us-stock-monitor] .dbw-name{flex:1;min-width:0;color:#8496ab;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-spacer{flex:1}
      [data-dsh-crypto-us-stock-monitor] .dbw-badge{flex:none;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:800;line-height:1.5}
      [data-dsh-crypto-us-stock-monitor] .dbw-badge[data-tone=bull]{color:#0f7a5f;background:#e2f6ef}
      [data-dsh-crypto-us-stock-monitor] .dbw-badge[data-tone=bear]{color:#b53c52;background:#fde9ed}
      [data-dsh-crypto-us-stock-monitor] .dbw-badge[data-tone=neutral]{color:#6d8199;background:#edf2f9}
      [data-dsh-crypto-us-stock-monitor] .dbw-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:5px}
      [data-dsh-crypto-us-stock-monitor] .dbw-venue{min-width:0;padding:4px 6px;border-radius:6px;background:#f7fafd}
      [data-dsh-crypto-us-stock-monitor] .dbw-venue-top{display:flex;align-items:baseline;justify-content:space-between;gap:4px}
      [data-dsh-crypto-us-stock-monitor] .dbw-ex{color:#5d86bb;font-size:10px;font-weight:800;letter-spacing:.04em}
      [data-dsh-crypto-us-stock-monitor] .dbw-price{overflow:hidden;color:#22364f;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-bigprice{color:#22364f;font-size:19px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
      [data-dsh-crypto-us-stock-monitor] .dbw-stockline{display:flex;align-items:baseline;gap:8px;margin-top:3px}
      [data-dsh-crypto-us-stock-monitor] .dbw-change{font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-note{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px;color:#8a9cb3;font-size:11px;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-note > span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-target-label{flex:none;color:#7c93ae}
      [data-dsh-crypto-us-stock-monitor] .dbw-market{padding:8px 9px;border:1px solid #e2ebf6;border-radius:9px;background:#f9fbff}
      [data-dsh-crypto-us-stock-monitor] .dbw-market-top{display:flex;align-items:baseline;justify-content:space-between;gap:6px}
      [data-dsh-crypto-us-stock-monitor] .dbw-market-name{color:#5c718c;font-size:11px;font-weight:800;letter-spacing:.05em}
      [data-dsh-crypto-us-stock-monitor] .dbw-market-right{display:flex;align-items:baseline;gap:4px;white-space:nowrap}
      [data-dsh-crypto-us-stock-monitor] .dbw-market-label{font-size:13px;font-weight:800;font-style:normal}
      [data-dsh-crypto-us-stock-monitor] .dbw-market-prob{color:#8a9cb3;font-size:10px;font-weight:700;font-style:normal;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-market-meta{margin-top:6px;color:#8a9cb3;font-size:11px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-market[data-tone=bull] .dbw-market-label{color:#0f8a68}
      [data-dsh-crypto-us-stock-monitor] .dbw-market[data-tone=bear] .dbw-market-label{color:#d24f66}
      [data-dsh-crypto-us-stock-monitor] .dbw-market[data-tone=neutral] .dbw-market-label{color:#7b8ea6}
      [data-dsh-crypto-us-stock-monitor] .dbw-dash{flex:none;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 12px 0}
      [data-dsh-crypto-us-stock-monitor] .dbw-dash[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge{padding:6px 7px;border:1px solid #e2ebf6;border-radius:8px;background:#f9fbff}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge-top{display:flex;align-items:baseline;justify-content:space-between;gap:4px;color:#5c718c;font-size:10px;font-weight:700;white-space:nowrap}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge-top b{font-size:13px;color:#22364f;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge-bar{height:4px;margin-top:4px;border-radius:99px;background:#e7eef7;overflow:hidden}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge-bar i{display:block;height:100%;width:0;border-radius:99px;background:#9fb0c6;transition:width .35s ease,background .2s}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge[data-tone=calm] .dbw-gauge-bar i{background:#2fbf8f}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge[data-tone=neutral] .dbw-gauge-bar i{background:#7f9fc7}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge[data-tone=alert] .dbw-gauge-bar i{background:#e4a33d}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge[data-tone=fear] .dbw-gauge-bar i{background:#df5b70}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge[data-tone=fear] .dbw-gauge-top b{color:#c53f57}
      [data-dsh-crypto-us-stock-monitor] .dbw-gauge-meta{margin-top:3px;color:#8a9cb3;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-deriv{flex:none;display:flex;justify-content:space-between;gap:4px;margin:6px 12px 0;padding:4px 7px;border-radius:6px;background:#f4f8fd;color:#71859d;font-size:9px;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-deriv[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-deriv b{color:#33465f;font-weight:700}
      [data-dsh-crypto-us-stock-monitor] .dbw-advice{flex:none;display:flex;gap:6px;align-items:flex-start;margin:5px 12px 0;padding:5px 8px;border:1px solid #e2ebf6;border-left:3px solid #7f9fc7;border-radius:7px;background:#f7faff;color:#4b5f78;font-size:10px;line-height:1.4}
      [data-dsh-crypto-us-stock-monitor] .dbw-advice[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-advice b{flex:none;color:#3d5877;font-size:10px}
      [data-dsh-crypto-us-stock-monitor] .dbw-advice[data-tone=calm]{border-left-color:#2fbf8f;background:#f3fbf7}
      [data-dsh-crypto-us-stock-monitor] .dbw-advice[data-tone=alert]{border-left-color:#e4a33d;background:#fffaf0}
      [data-dsh-crypto-us-stock-monitor] .dbw-advice[data-tone=fear]{border-left-color:#df5b70;background:#fff5f6}
      [data-dsh-crypto-us-stock-monitor] .dbw-dist{flex:none;margin:5px 12px 0;padding:7px 9px;border:1px solid #e2ebf6;border-radius:8px;background:#fbfdff}
      [data-dsh-crypto-us-stock-monitor] .dbw-advanced{margin-top:10px}
      [data-dsh-crypto-us-stock-monitor] .dbw-dist[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-dist-head{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#5c718c;font-size:10.5px;font-weight:700;cursor:pointer}
      [data-dsh-crypto-us-stock-monitor] .dbw-dist-head b{color:#2b72da}
      [data-dsh-crypto-us-stock-monitor] .dbw-dist-head em{font-style:normal;margin-left:4px;color:#8a9cb3}
      [data-dsh-crypto-us-stock-monitor] .dbw-dist[data-open=false] .dbw-dist-grid,[data-dsh-crypto-us-stock-monitor] .dbw-dist[data-open=false] .dbw-dist-note{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-advanced summary{cursor:pointer;color:#3d5877;font-size:11px;font-weight:800;list-style:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-advanced summary::before{content:"▸ ";color:#8a9cb3}
      [data-dsh-crypto-us-stock-monitor] .dbw-advanced[open] summary::before{content:"▾ "}
      [data-dsh-crypto-us-stock-monitor] .dbw-dist-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist{min-width:0}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-top{display:flex;align-items:baseline;justify-content:space-between;gap:4px;color:#5c718c;font-size:10px;font-weight:700}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-top b{color:#22364f;font-size:12px;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-bar{display:flex;gap:1px;height:8px;margin-top:3px;border-radius:99px;overflow:hidden;background:#eef3f9}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-seg{display:block;height:100%;min-width:3px;background:#a9c8a0;opacity:.55}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-seg[data-tone=neutral]{background:#9fb0c6}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-seg[data-tone=alert]{background:#e4a33d}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-seg[data-tone=fear]{background:#df5b70}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-seg[data-current=true]{opacity:1;box-shadow:0 0 0 2px #fff,0 0 0 3px #2b72da;border-radius:2px}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-meta{margin-top:3px;color:#5b7597;font-size:9.5px;font-weight:700}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-normal{margin-top:1px;color:#8a9cb3;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-exceed{margin-top:2px;color:#5c86bb;font-size:8.5px;line-height:1.3}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-all{margin-top:5px}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-all summary{cursor:pointer;color:#8a9cb3;font-size:9.5px;list-style:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-all summary::before{content:"▸ ";color:#b6c4d6}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-all[open] summary::before{content:"▾ "}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-table{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:5px}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-table-col{min-width:0;color:#7b8ea6;font-size:9px;line-height:1.55}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-table-col b{display:block;color:#5c718c;font-size:9px}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-table-col span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-hist-table-col span[data-current=true]{color:#1f62b8;font-weight:700}
      [data-dsh-crypto-us-stock-monitor] .dbw-dist-note{margin-top:5px;padding-top:4px;border-top:1px dashed #dbe5f1;color:#5b7597;font-size:9.5px;line-height:1.4}
      [data-dsh-crypto-us-stock-monitor] .dbw-plan{margin-top:3px;color:#5b7597;font-size:10.5px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-dsh-crypto-us-stock-monitor] .dbw-plan[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-checklist{margin-top:5px;padding-top:4px;border-top:1px dashed #dbe5f1}
      [data-dsh-crypto-us-stock-monitor] .dbw-checklist-title{font-size:11px;font-weight:800;color:#3d5877}
      [data-dsh-crypto-us-stock-monitor] .dbw-checklist-row{display:flex;gap:5px;align-items:baseline;color:#5b6f88;font-size:11px;line-height:1.5}
      [data-dsh-crypto-us-stock-monitor] .dbw-checklist-verdict{margin-top:3px;font-size:11px;font-weight:800}
      [data-dsh-crypto-us-stock-monitor] .dbw-checklist-verdict[data-verdict=buy]{color:#0f8a68}
      [data-dsh-crypto-us-stock-monitor] .dbw-checklist-verdict[data-verdict=wait]{color:#a87a1f}
      [data-dsh-crypto-us-stock-monitor] .dbw-checklist-verdict[data-verdict=skip]{color:#b53c52}
      [data-dsh-crypto-us-stock-monitor] .dbw-signal{flex:none;padding:1px 5px;border:0;border-radius:4px;font-family:inherit;font-size:9px;font-weight:800;line-height:1.5;cursor:pointer;background:#eef3f9;color:#6d8199}
      [data-dsh-crypto-us-stock-monitor] .dbw-signal[data-tone=buy]{background:#d9f5e8;color:#0b6b4f}
      [data-dsh-crypto-us-stock-monitor] .dbw-signal[data-tone=add]{background:#e4f7ee;color:#12735a}
      [data-dsh-crypto-us-stock-monitor] .dbw-signal[data-tone=hold]{background:#e7f1fc;color:#2b6ba8}
      [data-dsh-crypto-us-stock-monitor] .dbw-signal[data-tone=watch]{background:#fdf3d9;color:#8a6a1f}
      [data-dsh-crypto-us-stock-monitor] .dbw-signal[data-tone=reduce]{background:#fde9ed;color:#b53c52}
      [data-dsh-crypto-us-stock-monitor] .dbw-signal[data-open=true]{box-shadow:0 0 0 2px rgba(76,143,233,.22)}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy{margin-top:6px;padding:8px 9px;border:1px solid #e2ebf6;border-radius:7px;background:#f9fbff;color:#4b5f78;font-size:11px;line-height:1.45}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy-head{display:flex;align-items:baseline;justify-content:space-between;gap:6px;font-size:12px;font-weight:800;color:#1d3450}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy-head em{font-style:normal;font-size:11px;color:#8a9cb3;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy-sub{margin-top:1px;color:#8a9cb3;font-size:10px}
      [data-dsh-crypto-us-stock-monitor] .dbw-checklist-row em{font-style:normal;color:#9aabbf;font-size:9.5px}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy ul{margin:4px 0 0;padding-left:14px;color:#5b6f88}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy li{margin:1px 0}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy-levels{margin-top:4px;color:#3d5877;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy-ind{margin-top:3px;color:#7b8ea6;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-strategy-note{margin-top:4px;color:#9aabbf;font-size:10px}
      [data-dsh-crypto-us-stock-monitor] .dbw-settings{flex:none;max-height:46vh;overflow:auto;padding:10px 14px;border-bottom:1px solid #e6edf6;background:#f7faff}
      [data-dsh-crypto-us-stock-monitor] .dbw-settings[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-set-head{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:800;color:#3d5877}
      [data-dsh-crypto-us-stock-monitor] .dbw-set-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}
      [data-dsh-crypto-us-stock-monitor] .dbw-set{display:flex;align-items:center;gap:5px;font-size:11px;color:#6d8199}
      [data-dsh-crypto-us-stock-monitor] .dbw-set select{flex:1;min-width:0;height:27px;padding:0 3px;border:1px solid #cad8e9;border-radius:5px;background:#fff;color:#24364d;font-family:inherit;font-size:11px}
      [data-dsh-crypto-us-stock-monitor] .dbw-set-row{display:flex;align-items:center;gap:8px;margin-top:7px;font-size:11px;color:#6d8199}
      [data-dsh-crypto-us-stock-monitor] .dbw-set-row input[type=range]{flex:1;min-width:0;accent-color:#4c8fe9}
      [data-dsh-crypto-us-stock-monitor] .dbw-set-row b{flex:none;color:#2b72da;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-set-toggles{display:flex;gap:14px;margin-top:8px;font-size:11px;color:#5b6f88}
      [data-dsh-crypto-us-stock-monitor] .dbw-set-toggles label{display:flex;align-items:center;gap:4px;cursor:pointer}
      [data-dsh-crypto-us-stock-monitor] .dbw-set-note{margin-top:6px;color:#9aabbf;font-size:10px;line-height:1.4}
      [data-dsh-crypto-us-stock-monitor] .dbw-set-title{margin-top:10px;color:#3d5877;font-size:11px;font-weight:800}
      [data-dsh-crypto-us-stock-monitor] .dbw-presets{flex:none;display:flex;gap:6px;padding:7px 12px 0;overflow-x:auto;scrollbar-width:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-presets::-webkit-scrollbar{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-preset{flex:none;padding:4px 10px;border:1px solid #d5e2f1;border-radius:999px;background:#fff;color:#5c718c;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}
      [data-dsh-crypto-us-stock-monitor] .dbw-preset:hover{background:#eef5ff;color:#2b72da}
      [data-dsh-crypto-us-stock-monitor] .dbw-preset[data-active=true]{background:#e8f2ff;border-color:#8db6ee;color:#1f62b8;box-shadow:inset 0 0 0 1px rgba(76,143,233,.25)}
      [data-dsh-crypto-us-stock-monitor] .dbw-preset[data-custom=true]::after{content:" ·自";font-size:8px;color:#8a9cb3}
      [data-dsh-crypto-us-stock-monitor] .dbw-preset-edit{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}
      [data-dsh-crypto-us-stock-monitor] .dbw-preset-edit .dbw-set input{flex:1;min-width:0;height:26px;padding:0 5px;border:1px solid #cad8e9;border-radius:5px;background:#fff;color:#24364d;font-family:inherit;font-size:11px}
      [data-dsh-crypto-us-stock-monitor] .dbw-preset-actions{display:flex;gap:6px;margin-top:7px;flex-wrap:wrap}
      [data-dsh-crypto-us-stock-monitor] .dbw-preset-actions .dbw-mini-btn{height:24px;font-size:10.5px}
      [data-dsh-crypto-us-stock-monitor] .dbw-bell{position:relative}
      [data-dsh-crypto-us-stock-monitor] .dbw-bell-count{position:absolute;top:0;right:1px;min-width:13px;height:13px;padding:0 3px;border-radius:99px;background:#df5b70;color:#fff;font-size:8px;font-weight:800;line-height:13px;text-align:center}
      [data-dsh-crypto-us-stock-monitor] .dbw-alert-panel{position:absolute;top:50px;right:8px;z-index:20;width:min(330px,calc(100% - 16px));max-height:320px;overflow:auto;padding:8px;border:1px solid #d6e1f0;border-radius:9px;background:#fff;box-shadow:0 12px 32px rgba(42,76,121,.18)}
      [data-dsh-crypto-us-stock-monitor] .dbw-alert-panel[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-alert-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:11px;font-weight:800;color:#3d5877}
      [data-dsh-crypto-us-stock-monitor] .dbw-alert-item{padding:5px 6px;border-bottom:1px solid #eef3f9;color:#5b6f88;font-size:10.5px;line-height:1.5}
      [data-dsh-crypto-us-stock-monitor] .dbw-alert-item b{color:#1d3450}
      [data-dsh-crypto-us-stock-monitor] .dbw-alert-item time{float:right;color:#9aabbf}
      [data-dsh-crypto-us-stock-monitor] .dbw-alert-empty{padding:14px 6px;color:#9aabbf;font-size:10.5px;text-align:center}
      [data-dsh-crypto-us-stock-monitor] .dbw-tabs{flex:none;display:flex;gap:4px;padding:8px 12px 6px;border-bottom:1px solid #e7eef8;background:#f9fbff}
      [data-dsh-crypto-us-stock-monitor] .dbw-tab{flex:1;height:30px;border:0;border-radius:7px;background:transparent;color:#6d8199;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer}
      [data-dsh-crypto-us-stock-monitor] .dbw-tab:hover{background:#eef5ff;color:#2b72da}
      [data-dsh-crypto-us-stock-monitor] .dbw-tab[data-active=true]{background:#e8f2ff;color:#1f62b8;box-shadow:inset 0 0 0 1px #b9d4f5}
      [data-dsh-crypto-us-stock-monitor] .dbw-tab b{margin-left:4px;color:#8a9cb3;font-size:9px;font-weight:700}
      [data-dsh-crypto-us-stock-monitor] .dbw-strip{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 14px;border-bottom:1px solid #eef3f8;background:#f7fbff;color:#5b7597;font-size:11px;font-variant-numeric:tabular-nums;cursor:pointer}
      [data-dsh-crypto-us-stock-monitor] .dbw-strip em{font-style:normal;color:#2b72da;font-weight:700}
      [data-dsh-crypto-us-stock-monitor] .dbw-signals{display:none;flex:1;min-height:0;flex-direction:column;padding:0 14px}
      [data-dsh-crypto-us-stock-monitor] .dbw-signals-head{display:flex;align-items:center;justify-content:space-between;padding:8px 0 6px;color:#3d5877;font-size:11px;font-weight:800}
      [data-dsh-crypto-us-stock-monitor] .dbw-signals-list{flex:1;min-height:0;overflow:auto}
      [data-dsh-crypto-us-stock-monitor] .dbw-signals-empty{padding:30px 10px;color:#9aabbf;font-size:11px;text-align:center}
      [data-dsh-crypto-us-stock-monitor][data-view=watchlist] .dbw-dash,[data-dsh-crypto-us-stock-monitor][data-view=watchlist] .dbw-deriv,[data-dsh-crypto-us-stock-monitor][data-view=watchlist] .dbw-advice,[data-dsh-crypto-us-stock-monitor][data-view=watchlist] .dbw-dist,[data-dsh-crypto-us-stock-monitor][data-view=watchlist] .dbw-trends,[data-dsh-crypto-us-stock-monitor][data-view=watchlist] .dbw-signals{display:none}
      [data-dsh-crypto-us-stock-monitor][data-view=market] .dbw-presets,[data-dsh-crypto-us-stock-monitor][data-view=market] .dbw-opps,[data-dsh-crypto-us-stock-monitor][data-view=market] .dbw-search,[data-dsh-crypto-us-stock-monitor][data-view=market] .dbw-results,[data-dsh-crypto-us-stock-monitor][data-view=market] .dbw-list,[data-dsh-crypto-us-stock-monitor][data-view=market] .dbw-empty,[data-dsh-crypto-us-stock-monitor][data-view=market] .dbw-strip,[data-dsh-crypto-us-stock-monitor][data-view=market] .dbw-signals{display:none}
      [data-dsh-crypto-us-stock-monitor][data-view=market] .dbw-body{overflow:auto}
      [data-dsh-crypto-us-stock-monitor][data-view=signals] .dbw-body > :not(.dbw-signals):not(.dbw-settings):not(.dbw-foot),[data-dsh-crypto-us-stock-monitor][data-view=signals] .dbw-strip{display:none}
      [data-dsh-crypto-us-stock-monitor][data-view=signals] .dbw-signals{display:flex}
      [data-dsh-crypto-us-stock-monitor] .dbw-opps{flex:none;display:flex;align-items:center;gap:6px;padding:6px 12px 0;font-size:10.5px}
      [data-dsh-crypto-us-stock-monitor] .dbw-opps[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-opps-label{color:#3d5877;font-weight:800}
      [data-dsh-crypto-us-stock-monitor] .dbw-opps-list{display:flex;flex:1;gap:4px;overflow-x:auto;scrollbar-width:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-opp-chip{flex:none;padding:2px 7px;border:1px solid #cfe0f2;border-radius:999px;background:#f4f9ff;color:#2b6ba8;font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap}
      [data-dsh-crypto-us-stock-monitor] .dbw-opp-chip:hover{background:#e6f1ff}
      [data-dsh-crypto-us-stock-monitor] .dbw-opps .dbw-mini-btn{height:22px;padding:0 7px;font-size:10px}
      [data-dsh-crypto-us-stock-monitor] .dbw-opps .dbw-mini-btn[data-active=true]{background:#e8f2ff;color:#1f62b8}
      [data-dsh-crypto-us-stock-monitor][data-overview=collapsed] .dbw-dash,[data-dsh-crypto-us-stock-monitor][data-overview=collapsed] .dbw-deriv,[data-dsh-crypto-us-stock-monitor][data-overview=collapsed] .dbw-advice,[data-dsh-crypto-us-stock-monitor][data-overview=collapsed] .dbw-dist,[data-dsh-crypto-us-stock-monitor][data-overview=collapsed] .dbw-presets,[data-dsh-crypto-us-stock-monitor][data-overview=collapsed] .dbw-opps,[data-dsh-crypto-us-stock-monitor][data-overview=collapsed] .dbw-trends{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-up{color:#109b74}
      [data-dsh-crypto-us-stock-monitor] .dbw-down{color:#db4d64}
      [data-dsh-crypto-us-stock-monitor] .dbw-flat{color:#8798ac}
      [data-dsh-crypto-us-stock-monitor] .dbw-target-form{display:flex;align-items:center;gap:5px;margin-top:6px;padding-top:6px;border-top:1px dashed #dbe5f1}
      [data-dsh-crypto-us-stock-monitor] .dbw-target-form[hidden]{display:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-target-form select,[data-dsh-crypto-us-stock-monitor] .dbw-target-form input{min-width:0;height:26px;padding:0 5px;border:1px solid #cad8e9;border-radius:5px;background:#fff;color:#24364d;font-family:inherit;font-size:11px}
      [data-dsh-crypto-us-stock-monitor] .dbw-target-form input{flex:1;text-transform:none}
      [data-dsh-crypto-us-stock-monitor] .dbw-mini-btn{height:26px;padding:0 8px;border:0;border-radius:5px;background:#eaf2ff;color:#2b72da;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer}
      [data-dsh-crypto-us-stock-monitor] .dbw-mini-btn:hover{background:#dbe9ff}
      [data-dsh-crypto-us-stock-monitor] .dbw-mini-btn.primary{background:#4c8fe9;color:#fff}
      [data-dsh-crypto-us-stock-monitor] .dbw-mini-btn.primary:hover{background:#3a7fda}
      [data-dsh-crypto-us-stock-monitor] .dbw-empty{padding:22px 14px;color:#8999ac;font-size:11px;text-align:center}
      [data-dsh-crypto-us-stock-monitor] .dbw-foot{position:sticky;bottom:0;z-index:2;flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 14px;border-top:1px solid #e7eef8;background:#f9fbff;color:#8496ab;font-size:11px;font-variant-numeric:tabular-nums}
      [data-dsh-crypto-us-stock-monitor] .dbw-status{display:inline-flex;align-items:center;min-width:0}
      [data-dsh-crypto-us-stock-monitor] .dbw-dot{display:inline-block;flex:none;width:6px;height:6px;margin-right:5px;border-radius:50%;background:#42b883}
      [data-dsh-crypto-us-stock-monitor] .dbw-dot[data-state=error]{background:#e77c8e}
      [data-dsh-crypto-us-stock-monitor] .dbw-dot[data-state=loading]{background:#e4b45d}
      [data-dsh-crypto-us-stock-monitor] .dbw-updated[data-stale=true]{color:#c98a2e}
      [data-dsh-crypto-us-stock-monitor] .dbw-updated[data-stale=error]{color:#d0536a}
      .dbw-toast{position:fixed;left:50%;bottom:24px;z-index:2147482600;transform:translateX(-50%);padding:9px 14px;border:1px solid #9fc2ef;border-radius:8px;background:#f4f8ff;color:#244b7d;box-shadow:0 8px 24px rgba(54,91,139,.2);font-family:"Segoe UI","Microsoft YaHei",sans-serif;font-size:12px;line-height:1.35;max-width:min(520px,80vw)}
      [data-dsh-crypto-us-stock-monitor][data-collapsed=true]{width:320px}
      [data-dsh-crypto-us-stock-monitor][data-collapsed=true] .dbw-card{max-height:none;border-radius:14px}
      [data-dsh-crypto-us-stock-monitor][data-collapsed=true] .dbw-head{padding:8px 10px 8px 12px}
      [data-dsh-crypto-us-stock-monitor][data-collapsed=true] .dbw-headcopy{display:none}
      [data-dsh-crypto-us-stock-monitor][data-collapsed=true] .dbw-body{display:none}
      [data-dsh-crypto-us-stock-monitor][data-collapsed=true] .dbw-tabs,[data-dsh-crypto-us-stock-monitor][data-collapsed=true] .dbw-strip{display:none}
      [data-dsh-crypto-us-stock-monitor][data-collapsed=true] .dbw-mini{display:block;font-size:11px}
      @media (max-width:700px){[data-dsh-crypto-us-stock-monitor].dbw-floating{left:6px;bottom:48px;width:min(560px,calc(100vw - 12px))}}
      [data-dsh-crypto-us-stock-monitor].dbw-embedded{position:static;width:min(760px,100%);height:100%;max-height:none;min-height:0;margin:0 auto;padding:12px 18px 16px;contain:layout style}
      [data-dsh-crypto-us-stock-monitor].dbw-embedded .dbw-card{max-height:none;height:100%;border:0;border-radius:0;box-shadow:none;background:transparent}
      [data-dsh-crypto-us-stock-monitor].dbw-embedded .dbw-head{cursor:default}
      [data-dsh-crypto-us-stock-monitor].dbw-embedded [data-action=collapse],[data-dsh-crypto-us-stock-monitor].dbw-embedded .dbw-mini{display:none}
      [data-dsh-crypto-us-stock-monitor].dbw-embedded .dbw-list{max-height:none;flex:1}
      .dbw-main-panel{display:flex;flex-direction:column;width:100%;height:100%;min-height:0;overflow:hidden;background:var(--dsw-alias-bg-base,#f6f8fc)}
      .dbw-main-panel > aside{flex:1;min-height:0}
      [data-dsh-crypto-us-stock-monitor].dbw-side{display:flex;flex-direction:column;gap:5px;width:100%;min-width:0;padding:2px 2px 4px;color:var(--dsw-alias-label-primary,#1b2b41);font-size:11px;line-height:1.35;contain:layout style}
      .dbw-side-head{display:flex;align-items:center;gap:6px;min-width:0;cursor:pointer;border:0;background:transparent;color:inherit;font:inherit;padding:0;text-align:left;width:100%}
      .dbw-side-head b{font-size:11.5px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dbw-side-head em{margin-left:auto;color:var(--dsw-alias-label-secondary,#6b7f97);font-style:normal;font-size:10px;white-space:nowrap}
      .dbw-side-dot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-idle-primary,#9aa8ba)}
      .dbw-side-dot[data-live=true]{background:var(--dsw-alias-state-success-primary,#34a853);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-success-primary,#34a853) 16%,transparent)}
      .dbw-side-market{display:flex;flex-wrap:wrap;gap:3px 7px;color:var(--dsw-alias-label-secondary,#6b7f97);font-size:10px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden}
      .dbw-side-market b{color:var(--dsw-alias-label-primary,#1b2b41);font-weight:700}
      .dbw-side-list{display:flex;flex-direction:column;min-width:0}
      .dbw-side-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:baseline;gap:5px;padding:3px 2px;border-top:1px solid var(--dsw-alias-border-l1,#e7eef8);border-radius:5px;cursor:pointer;background:transparent;border-left:0;border-right:0;border-bottom:0;font:inherit;color:inherit;text-align:left;font-variant-numeric:tabular-nums}
      .dbw-side-row:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#247bbf) 7%,transparent)}
      .dbw-side-row:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#247bbf);outline-offset:1px}
      .dbw-side-sym{font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dbw-side-price{font-weight:650;white-space:nowrap}
      .dbw-side-change{font-size:10px;font-weight:700;white-space:nowrap}
      .dbw-side-change[data-up=true]{color:var(--dsw-alias-state-success-primary,#1a9b62)}
      .dbw-side-change[data-up=false]{color:var(--dsw-alias-state-error-primary,#d0536a)}
      .dbw-side-tag{grid-column:2/4;font-size:9.5px;color:var(--dsw-alias-label-secondary,#7b8ea6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dbw-side-row[data-flash=up] .dbw-side-price{animation:dbwFlashUp .55s ease}
      .dbw-side-row[data-flash=down] .dbw-side-price{animation:dbwFlashDown .55s ease}
      @keyframes dbwFlashUp{0%{color:var(--dsw-alias-state-success-primary,#1a9b62);transform:translateY(-1px)}100%{color:inherit;transform:none}}
      @keyframes dbwFlashDown{0%{color:var(--dsw-alias-state-error-primary,#d0536a);transform:translateY(1px)}100%{color:inherit;transform:none}}
      .dbw-side-empty{padding:5px 2px;color:var(--dsw-alias-label-secondary,#7b8ea6);font-size:10px}
      [data-dsh-crypto-us-stock-monitor].dbw-side[data-compact=true] .dbw-side-market,[data-dsh-crypto-us-stock-monitor].dbw-side[data-compact=true] .dbw-side-tag{display:none}
      [data-dsh-crypto-us-stock-monitor].dbw-side[data-compact=true] .dbw-side-head em{display:none}
      .dbw-rail{position:relative;display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;min-width:0}
      .dbw-rail svg{display:block}
      .dbw-rail-change{position:absolute;right:-3px;bottom:-4px;padding:0 2px;border-radius:3px;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-secondary,#6b7f97);font:800 6.5px/1.2 Inter,"Segoe UI",sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none}
      .dbw-rail-change[data-up=true]{color:var(--dsw-alias-state-success-primary,#1a9b62)}
      .dbw-rail-change[data-up=false]{color:var(--dsw-alias-state-error-primary,#d0536a)}
    `;

		const dashboardCss = `
      .dbw-dash{display:flex;flex-direction:column;gap:14px;width:100%;height:100%;min-height:0;overflow:auto;box-sizing:border-box;padding:22px 26px 26px;color:var(--dsw-alias-label-primary,#1b2b41);background:var(--dsw-alias-bg-base,#f6f8fc);font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif;font-size:13px;line-height:1.5}
      .dbw-dash *{box-sizing:border-box}
      .dbw-dash-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
      .dbw-dash-head h1{margin:0;font-size:22px;line-height:1.2;letter-spacing:-.02em;font-weight:760}
      .dbw-dash-head p{margin:3px 0 0;color:var(--dsw-alias-label-secondary,#6b7f97);font-size:11.5px}
      .dbw-dash-tools{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
      .dbw-dash-btn{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 11px;border:1px solid var(--dsw-alias-border-l1,#dce6f2);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#1b2b41);font:inherit;font-size:12px;font-weight:650;cursor:pointer}
      .dbw-dash-btn:hover{border-color:var(--dsw-alias-brand-primary,#247bbf);color:var(--dsw-alias-brand-primary,#247bbf)}
      .dbw-dash-btn:disabled{opacity:.5;cursor:default}
      .dbw-dash-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      .dbw-dash-kpi{padding:12px 13px;border:1px solid var(--dsw-alias-border-l1,#dce6f2);border-radius:12px;background:var(--dsw-alias-bg-layer-1,#fff);min-width:0}
      .dbw-dash-kpi span{display:block;color:var(--dsw-alias-label-secondary,#6b7f97);font-size:10.5px;font-weight:650;margin-bottom:4px}
      .dbw-dash-kpi b{display:block;font-size:19px;line-height:1.15;font-weight:780;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dbw-dash-kpi small{display:block;margin-top:4px;color:var(--dsw-alias-label-secondary,#6b7f97);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dbw-dash-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(280px,.7fr);gap:14px;align-items:start}
      .dbw-dash-panel{border:1px solid var(--dsw-alias-border-l1,#dce6f2);border-radius:12px;background:var(--dsw-alias-bg-layer-1,#fff);overflow:hidden;min-width:0}
      .dbw-dash-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid var(--dsw-alias-border-l1,#e7eef8)}
      .dbw-dash-panel-head b{font-size:13px;font-weight:750}
      .dbw-dash-panel-head span{color:var(--dsw-alias-label-secondary,#6b7f97);font-size:10.5px}
      .dbw-dash-search{position:relative;display:flex;align-items:center;gap:6px;min-width:0}
      .dbw-dash-search input{width:180px;height:28px;padding:0 8px;border:1px solid var(--dsw-alias-border-l1,#dce6f2);border-radius:7px;background:var(--dsw-alias-bg-base,#f8fafc);color:inherit;font:inherit;font-size:11.5px;outline:none}
      .dbw-dash-search input:focus{border-color:var(--dsw-alias-brand-primary,#247bbf)}
      .dbw-dash-results{position:absolute;z-index:5;top:33px;right:0;width:270px;max-height:230px;overflow:auto;padding:4px;border:1px solid var(--dsw-alias-border-l1,#dce6f2);border-radius:9px;background:var(--dsw-alias-bg-overlay,#fff);box-shadow:0 12px 28px rgba(15,35,60,.16)}
      .dbw-dash-result{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;width:100%;padding:7px 8px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
      .dbw-dash-result:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#247bbf) 8%,transparent)}
      .dbw-dash-result b{font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dbw-dash-result small{color:var(--dsw-alias-label-secondary,#6b7f97);font-size:9.5px;white-space:nowrap}
      .dbw-dash-group{padding:8px 14px 4px;color:var(--dsw-alias-label-secondary,#6b7f97);font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;display:flex;justify-content:space-between}
      .dbw-dash-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto 24px;gap:9px;align-items:center;width:100%;padding:9px 14px;border:0;border-top:1px solid var(--dsw-alias-border-l1,#edf2f8);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
      .dbw-dash-row:hover,.dbw-dash-row[data-active=true]{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#247bbf) 6%,transparent)}
      .dbw-dash-row[data-active=true]{box-shadow:inset 3px 0 0 var(--dsw-alias-brand-primary,#247bbf)}
      .dbw-dash-name{display:flex;flex-direction:column;min-width:0;gap:1px}
      .dbw-dash-name b{font-size:12px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dbw-dash-name small{font-size:9.5px;color:var(--dsw-alias-label-secondary,#6b7f97);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dbw-dash-price{font-size:12px;font-weight:700;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
      .dbw-dash-change{font-size:10.5px;font-weight:750;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
      .dbw-dash-tag{justify-self:end;padding:2px 6px;border-radius:999px;background:var(--dsw-alias-bg-base,#f3f7fc);color:var(--dsw-alias-label-secondary,#6b7f97);font-size:9.5px;font-weight:700;white-space:nowrap}
      .dbw-dash-del{width:22px;height:22px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa8ba);font:inherit;font-size:14px;cursor:pointer;justify-self:end}
      .dbw-dash-del:hover{color:var(--dsw-alias-state-error-primary,#c4475d)}
      .dbw-dash-detail{padding:14px}
      .dbw-dash-detail-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}
      .dbw-dash-detail-top b{font-size:16px;font-weight:780}
      .dbw-dash-detail-top small{display:block;color:var(--dsw-alias-label-secondary,#6b7f97);font-size:10px;margin-top:1px}
      .dbw-dash-detail-price{text-align:right;font-variant-numeric:tabular-nums}
      .dbw-dash-detail-price b{display:block;font-size:17px;line-height:1.15}
      .dbw-dash-detail-price span{font-size:11px;font-weight:700}
      .dbw-dash-metrics{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin:11px 0;padding:10px 0;border-top:1px solid var(--dsw-alias-border-l1,#edf2f8);border-bottom:1px solid var(--dsw-alias-border-l1,#edf2f8)}
      .dbw-dash-metric{display:flex;justify-content:space-between;gap:6px;font-size:10.5px;min-width:0}
      .dbw-dash-metric span{color:var(--dsw-alias-label-secondary,#6b7f97);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dbw-dash-metric b{font-weight:650;font-variant-numeric:tabular-nums;white-space:nowrap}
      .dbw-dash-target{display:flex;flex-direction:column;gap:6px}
      .dbw-dash-target-label{display:flex;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-secondary,#6b7f97);font-size:10.5px}
      .dbw-dash-target-label b{color:var(--dsw-alias-label-primary,#1b2b41);font-variant-numeric:tabular-nums}
      .dbw-dash-target-row{display:flex;gap:5px;align-items:center}
      .dbw-dash-target-row input,.dbw-dash-target-row select{height:28px;border:1px solid var(--dsw-alias-border-l1,#dce6f2);border-radius:6px;background:var(--dsw-alias-bg-base,#f8fafc);color:inherit;font:inherit;font-size:11px;padding:0 6px;min-width:0}
      .dbw-dash-target-row input{flex:1}
      .dbw-dash-target-row select{width:54px;flex:none}
      .dbw-dash-primary{border:0;border-radius:6px;height:29px;padding:0 9px;background:var(--dsw-alias-brand-primary,#247bbf);color:#fff;font:inherit;font-size:11px;font-weight:750;cursor:pointer}
      .dbw-dash-secondary{border:1px solid var(--dsw-alias-border-l1,#dce6f2);border-radius:6px;height:29px;padding:0 9px;background:transparent;color:var(--dsw-alias-label-secondary,#6b7f97);font:inherit;font-size:11px;font-weight:650;cursor:pointer}
      .dbw-dash-empty{padding:20px 14px;color:var(--dsw-alias-label-secondary,#7b8ea6);font-size:11.5px;text-align:center}
      .dbw-adv{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base,#f6f8fc)}
      .dbw-adv-bar{display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#dce6f2);background:var(--dsw-alias-bg-layer-1,#fff);flex:none}
      .dbw-adv-bar > span{flex:1;color:var(--dsw-alias-label-secondary,#6b7f97);font-size:11px}
      .dbw-adv > .dbw-main-panel{flex:1;min-height:0}
      .dbw-dash-error{margin:0;padding:8px 10px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary,#c4475d) 30%,transparent);border-radius:7px;color:var(--dsw-alias-state-error-primary,#c4475d);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#c4475d) 6%,transparent);font-size:10.5px}
      .dbw-dash-dist{display:flex;flex-direction:column;gap:8px;padding:12px 14px 14px}
      .dbw-dash-dist-top{display:flex;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-secondary,#6b7f97);font-size:10.5px}
      .dbw-dash-dist-top b{color:var(--dsw-alias-label-primary,#1b2b41);font-variant-numeric:tabular-nums}
      .dbw-dash-dist-bar{display:flex;height:8px;border-radius:999px;overflow:hidden;background:var(--dsw-alias-bg-base,#f1f5fa)}
      .dbw-dash-dist-seg{height:100%;min-width:2px;background:var(--dsw-alias-brand-primary,#9bb8d8);opacity:.5}
      .dbw-dash-dist-seg[data-current=true]{opacity:1;background:var(--dsw-alias-brand-primary,#247bbf)}
      .dbw-dash-dist-meta{color:var(--dsw-alias-label-secondary,#7b8ea6);font-size:9.5px}
      .dbw-tone-up{color:var(--dsw-alias-state-success-primary,#14895a)!important}
      .dbw-tone-down{color:var(--dsw-alias-state-error-primary,#c4475d)!important}
      .dbw-tone-warn{color:var(--dsw-alias-state-warn-primary,#b7791f)!important}
      @media (max-width:1000px){.dbw-dash-kpis{grid-template-columns:1fr 1fr}.dbw-dash-grid{grid-template-columns:1fr}.dbw-dash{padding:16px}}
      @media (max-width:640px){.dbw-dash{padding:12px}.dbw-dash-kpis{grid-template-columns:1fr}.dbw-dash-row{grid-template-columns:minmax(0,1fr) auto auto 22px;gap:6px}.dbw-dash-tag{display:none}.dbw-dash-search input{width:130px}.dbw-dash-head h1{font-size:19px}}
    `;

		function readJson(key) {
			try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
		}

		function writeJson(key, value) {
			try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
		}

		function uniqueFilter(list, pattern, limit) {
			const source = Array.isArray(list) ? list : [];
			const seen = new Set();
			const out = [];
			for (const item of source) {
				const value = String(item ?? "").trim().toUpperCase();
				if (!value || seen.has(value) || !pattern.test(value)) continue;
				seen.add(value);
				out.push(value);
				if (out.length >= limit) break;
			}
			return out;
		}

		function loadWatchlist() {
			const stored = readJson(STORAGE_KEY);
			if (stored && typeof stored === "object") {
				return {
					crypto: uniqueFilter(stored.crypto, CRYPTO_RE, MAX_CRYPTO),
					stocks: uniqueFilter(stored.stocks, STOCK_RE, MAX_STOCKS),
				};
			}
			const legacy = readJson(LEGACY_KEY);
			const crypto = Array.isArray(legacy) && legacy.length > 0
				? uniqueFilter(legacy, CRYPTO_RE, MAX_CRYPTO)
				: DEFAULT_CRYPTO.slice();
			return { crypto, stocks: DEFAULT_STOCKS.slice() };
		}

		function saveWatchlist(state) {
			writeJson(STORAGE_KEY, { crypto: state.crypto, stocks: state.stocks });
		}

		function loadTargets() {
			const stored = readJson(TARGETS_KEY);
			if (stored && typeof stored === "object") return stored;
			const legacy = readJson(LEGACY_TARGETS_KEY);
			const out = {};
			if (legacy && typeof legacy === "object") {
				for (const [symbol, target] of Object.entries(legacy)) {
					if (!target || !Number.isFinite(Number(target.price))) continue;
					out[`crypto:${String(symbol).toUpperCase()}`] = target;
				}
			}
			return out;
		}

		function loadPosition() {
			const stored = readJson(POSITION_KEY) ?? readJson(LEGACY_POSITION_KEY);
			if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) return stored;
			return null;
		}

		function clamp(value, min, max) {
			return Math.max(min, Math.min(max, value));
		}

		function normalizeThresholds(raw) {
			const source = raw && typeof raw === "object" ? raw : {};
			const number = (value, fallback, min, max, digits = 2) => {
				const parsed = Number(value);
				if (!Number.isFinite(parsed)) return fallback;
				const factor = 10 ** digits;
				return clamp(Math.round(parsed * factor) / factor, min, max);
			};
			let rsiMin = number(source.rsiMin, DEFAULT_THRESHOLDS.rsiMin, 0, 100, 0);
			let rsiMax = number(source.rsiMax, DEFAULT_THRESHOLDS.rsiMax, 0, 100, 0);
			if (rsiMin >= rsiMax) [rsiMin, rsiMax] = [rsiMax, rsiMin];
			return {
				rsiMin,
				rsiMax,
				adxMin: number(source.adxMin, DEFAULT_THRESHOLDS.adxMin, 0, 60, 0),
				volRatio: number(source.volRatio, DEFAULT_THRESHOLDS.volRatio, 0.2, 5, 1),
				percentBMax: number(source.percentBMax, DEFAULT_THRESHOLDS.percentBMax, 0, 1.5, 2),
				distHigh: number(source.distHigh, DEFAULT_THRESHOLDS.distHigh, -60, 0, 0),
				bbPctMax: number(source.bbPctMax, DEFAULT_THRESHOLDS.bbPctMax, 0, 100, 0),
				stopAtr: number(source.stopAtr, DEFAULT_THRESHOLDS.stopAtr, 0.5, 5, 1),
				rr: number(source.rr, DEFAULT_THRESHOLDS.rr, 0.5, 5, 1),
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
			if (maFast >= maSlow) [maFast, maSlow] = [maSlow, maFast];
			const interval = SETTING_OPTIONS.interval.includes(Number(source.interval)) ? Number(source.interval) : DEFAULT_SETTINGS.interval;
			const macd = String(source.macd ?? DEFAULT_SETTINGS.macd);
			const macdParts = macd.split(",").map(Number);
			const macdValid = macdParts.length === 3 && macdParts.every((value) => Number.isFinite(value) && value >= 2 && value <= 100) && macdParts[0] < macdParts[1];
			const boll = String(source.boll ?? DEFAULT_SETTINGS.boll);
			const bollParts = boll.split(",").map(Number);
			const bollValid = bollParts.length === 2 && Number.isFinite(bollParts[0]) && bollParts[0] >= 5 && bollParts[0] <= 100 && Number.isFinite(bollParts[1]) && bollParts[1] >= 1 && bollParts[1] <= 4;
			const threshold = Number(source.threshold);
			return {
				interval,
				maFast,
				maSlow,
				maLong: integer(source.maLong, DEFAULT_SETTINGS.maLong, 10, 200),
				rsiPeriod: integer(source.rsiPeriod, DEFAULT_SETTINGS.rsiPeriod, 2, 50),
				macd: macdValid ? macdParts.join(",") : DEFAULT_SETTINGS.macd,
				boll: bollValid ? `${bollParts[0]},${bollParts[1]}` : DEFAULT_SETTINGS.boll,
				atrPeriod: integer(source.atrPeriod, DEFAULT_SETTINGS.atrPeriod, 2, 50),
				adxPeriod: integer(source.adxPeriod, DEFAULT_SETTINGS.adxPeriod, 5, 50),
				breakoutDays: integer(source.breakoutDays, DEFAULT_SETTINGS.breakoutDays, 5, 60),
				volumePeriod: integer(source.volumePeriod, DEFAULT_SETTINGS.volumePeriod, 5, 60),
				threshold: Number.isFinite(threshold) ? clamp(Math.round(threshold * 100) / 100, 0.05, 0.6) : DEFAULT_SETTINGS.threshold,
				style: SETTING_OPTIONS.style.includes(source.style) ? source.style : DEFAULT_SETTINGS.style,
				presetId: typeof source.presetId === "string" && source.presetId ? source.presetId.slice(0, 48) : DEFAULT_SETTINGS.presetId,
				thresholds: normalizeThresholds(source.thresholds),
				showSignals: source.showSignals !== false,
				showMarket: source.showMarket !== false,
				showDashboard: source.showDashboard !== false,
				showAlerts: source.showAlerts !== false,
				notifyDesktop: source.notifyDesktop === true,
				onlyOpps: source.onlyOpps === true,
				sort: ["default", "signal", "change"].includes(source.sort) ? source.sort : "default",
				distOpen: source.distOpen !== false,
				tab: ["watchlist", "market", "signals"].includes(source.tab) ? source.tab : "watchlist",
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
				style: settings.style,
			};
		}

		function normalizePreset(item) {
			const raw = item && typeof item === "object" ? item : {};
			const params = normalizeSettings({ ...DEFAULT_SETTINGS, ...(raw.params && typeof raw.params === "object" ? raw.params : {}) });
			return {
				id: typeof raw.id === "string" && /^[\w-]{1,48}$/.test(raw.id) ? raw.id : `custom-${Date.now()}`,
				name: String(raw.name ?? "自定义预设").trim().slice(0, 16) || "自定义预设",
				base: PRESET_BASES.includes(raw.base) ? raw.base : "balanced",
				desc: String(raw.desc ?? "").trim().slice(0, 60),
				custom: true,
				params: presetParamsFromSettings(params),
				thresholds: normalizeThresholds(raw.thresholds),
			};
		}

		function loadCustomPresets() {
			const stored = readJson(PRESETS_KEY);
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

		function saveCustomPresets(presets) {
			writeJson(PRESETS_KEY, presets);
		}

		function loadSettings() {
			return normalizeSettings(readJson(SETTINGS_KEY));
		}

		function saveSettings(settings) {
			writeJson(SETTINGS_KEY, settings);
		}

		function taQuery(settings) {
			return `&ma=${settings.maFast},${settings.maSlow}&malong=${settings.maLong}&rsi=${settings.rsiPeriod}&macd=${settings.macd}&boll=${settings.boll}&atr=${settings.atrPeriod}&adx=${settings.adxPeriod}&breakout=${settings.breakoutDays}&volp=${settings.volumePeriod}&th=${settings.threshold}&style=${settings.style}`;
		}

		function formatPrice(value) {
			if (!Number.isFinite(value)) return "--";
			const options = value >= 100
				? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
				: value >= 1
					? { maximumFractionDigits: 4 }
					: { maximumFractionDigits: 8 };
			return new Intl.NumberFormat("en-US", options).format(value);
		}

		function formatChange(value) {
			if (!Number.isFinite(value)) return "--";
			return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
		}

		function changeClass(value) {
			if (!Number.isFinite(value)) return "dbw-flat";
			return value > 0 ? "dbw-up" : value < 0 ? "dbw-down" : "dbw-flat";
		}

		function toneOf(label) {
			if (label === "多头" || label === "偏多") return "bull";
			if (label === "空头" || label === "偏空") return "bear";
			return "neutral";
		}

		function trendShort(prefix, trend) {
			if (!trend || !Number.isFinite(trend.score)) return `${prefix} --`;
			if (trend.label === "偏多") return `${prefix}多${trend.bullProbability}%`;
			if (trend.label === "偏空") return `${prefix}空${100 - trend.bullProbability}%`;
			return `${prefix}平`;
		}

		function escapeHtml(value) {
			return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
		}

		function displayCryptoSymbol(symbol) {
			for (const quote of CRYPTO_QUOTES) {
				if (symbol.length > quote.length && symbol.endsWith(quote)) return `${symbol.slice(0, -quote.length)}/${quote}`;
			}
			return symbol;
		}

		function rangePosition(price, low, high) {
			const p = Number(price), l = Number(low), h = Number(high);
			if (!Number.isFinite(p) || !Number.isFinite(l) || !Number.isFinite(h) || h <= l) return null;
			return clamp((p - l) / (h - l), 0, 1);
		}

		function fallbackLabel(score) {
			return score >= 0.2 ? "多头" : score <= -0.2 ? "空头" : "震荡";
		}

		function aggregateLabel(score) {
			return score >= 0.15 ? "偏多" : score <= -0.15 ? "偏空" : "震荡";
		}

		function cryptoTrend(row) {
			if (row?.ta?.trend?.label) return row.ta.trend;
			if (row?.trend && row.trend.label) return row.trend;
			const venues = [row?.binance, row?.bitget].filter((venue) => venue && Number.isFinite(venue.price));
			if (venues.length === 0) return null;
			const changes = venues.map((venue) => venue.changePct).filter(Number.isFinite);
			const change = changes.length ? changes.reduce((sum, value) => sum + value, 0) / changes.length : 0;
			const venue = venues.find((item) => rangePosition(item.price, item.lowPrice, item.highPrice) !== null);
			const position = venue ? rangePosition(venue.price, venue.lowPrice, venue.highPrice) : null;
			const score = clamp(0.65 * Math.tanh(change / 3) + 0.35 * (2 * (position ?? 0.5) - 1), -1, 1);
			return { label: fallbackLabel(score), score, rangePosition: position, change7dPct: null };
		}

		function stockTrend(row) {
			if (row?.ta?.trend?.label) return row.ta.trend;
			if (row?.trend && row.trend.label) return row.trend;
			if (!row || !Number.isFinite(row.price)) return null;
			const change = Number.isFinite(row.changePct) ? row.changePct : 0;
			const position = rangePosition(row.price, row.dayLow, row.dayHigh);
			const score = clamp(0.65 * Math.tanh(change / 2) + 0.35 * (2 * (position ?? 0.5) - 1), -1, 1);
			return { label: fallbackLabel(score), score, rangePosition: position };
		}

		function ensureStyle(ctx) {
			if (document.querySelector("style[data-dbw-style]")) return;
			const style = document.createElement("style");
			style.dataset.dbwStyle = "1";
			style.textContent = css;
			document.head.append(style);
			ctx?.effect?.(() => () => style.remove(), "dsh-crypto-us-stock-monitor: style");
		}

		function mountPanel(ctx, container = document.body) {
			if (container.querySelector("aside[data-dsh-crypto-us-stock-monitor]")) return () => {};
			const embedded = container !== document.body;

			const root = document.createElement("aside");
			root.dataset.dshCryptoUsStockMonitor = "1";
			root.className = embedded ? "dbw-embedded" : "dbw-floating";
			root.innerHTML = `
        <div class="dbw-card">
          <div class="dbw-head" data-drag-handle>
            <div class="dbw-headcopy"><div class="dbw-kicker">CRYPTO × US STOCKS</div><div class="dbw-title">加密美股监控<span data-rate>3s 自动</span></div></div>
            <div class="dbw-mini" data-mini>币 -- · 美 --</div>
            <div class="dbw-head-actions"><button class="dbw-icon dbw-bell" type="button" data-action="alerts" title="信号提醒" aria-label="信号提醒">🔔<span class="dbw-bell-count" data-alert-count hidden>0</span></button><button class="dbw-icon" type="button" data-action="settings" title="参数设置" aria-label="参数设置">⚙</button><button class="dbw-icon" type="button" data-action="collapse" title="收起 / 展开" aria-label="收起或展开">−</button></div>
          </div>
          <div class="dbw-tabs" data-tabs>
            <button class="dbw-tab" type="button" data-tab="watchlist" data-active="true">自选<b data-tab-count="watchlist">0</b></button>
            <button class="dbw-tab" type="button" data-tab="market">市场</button>
            <button class="dbw-tab" type="button" data-tab="signals">信号<b data-tab-count="signals" hidden>0</b></button>
          </div>
          <div class="dbw-strip" data-strip title="打开市场详情"><span data-strip-text>市场概览加载中…</span><em>详情 ›</em></div>
          <div class="dbw-body">
            <div class="dbw-signals" data-signals>
              <div class="dbw-signals-head"><span>信号提醒</span><button class="dbw-mini-btn" type="button" data-action="alerts-clear">清空</button></div>
              <div class="dbw-signals-list" data-signals-list></div>
            </div>
            <div class="dbw-settings" data-settings hidden>
              <div class="dbw-set-head"><span>参数与策略预设</span><button class="dbw-mini-btn" type="button" data-action="reset-settings">恢复默认</button></div>
              <div class="dbw-set-title">策略预设</div>
              <div class="dbw-set-grid">
                <label class="dbw-set"><span>预设</span><select data-preset-select></select></label>
                <label class="dbw-set"><span>类型</span><select data-preset-base></select></label>
              </div>
              <div class="dbw-preset-edit">
                <label class="dbw-set"><span>名称</span><input data-preset-name maxlength="16" /></label>
                <label class="dbw-set"><span>说明</span><input data-preset-desc maxlength="60" /></label>
              </div>
              <div class="dbw-preset-edit">
                <label class="dbw-set"><span>RSI 下限</span><input type="number" data-threshold="rsiMin" min="0" max="100" /></label>
                <label class="dbw-set"><span>RSI 上限</span><input type="number" data-threshold="rsiMax" min="0" max="100" /></label>
                <label class="dbw-set"><span>ADX 下限</span><input type="number" data-threshold="adxMin" min="0" max="60" /></label>
                <label class="dbw-set"><span>量比下限</span><input type="number" data-threshold="volRatio" min="0.2" max="5" step="0.1" /></label>
                <label class="dbw-set"><span>%B 上限</span><input type="number" data-threshold="percentBMax" min="0" max="1.5" step="0.05" /></label>
                <label class="dbw-set"><span>距高点≤</span><input type="number" data-threshold="distHigh" min="-60" max="0" step="1" /></label>
                <label class="dbw-set"><span>布林分位≤</span><input type="number" data-threshold="bbPctMax" min="0" max="100" step="1" /></label>
                <label class="dbw-set"><span>止损×ATR</span><input type="number" data-threshold="stopAtr" min="0.5" max="5" step="0.5" /></label>
                <label class="dbw-set"><span>盈亏比</span><input type="number" data-threshold="rr" min="0.5" max="5" step="0.5" /></label>
              </div>
              <div class="dbw-preset-actions"><button class="dbw-mini-btn" type="button" data-action="preset-new">新建副本</button><button class="dbw-mini-btn primary" type="button" data-action="preset-save">保存为自定义</button><button class="dbw-mini-btn" type="button" data-action="preset-delete">删除</button></div>
              <div class="dbw-set-title">指标参数</div>
              <details class="dbw-advanced"><summary>指标周期与刷新（高级）</summary>
                <div class="dbw-set-grid">
                  <label class="dbw-set"><span>刷新</span><select data-setting="interval"></select></label>
                  <label class="dbw-set"><span>趋势风格</span><select data-setting="style"></select></label>
                  <label class="dbw-set"><span>快线</span><select data-setting="maFast"></select></label>
                  <label class="dbw-set"><span>慢线</span><select data-setting="maSlow"></select></label>
                  <label class="dbw-set"><span>长线</span><select data-setting="maLong"></select></label>
                  <label class="dbw-set"><span>RSI</span><select data-setting="rsiPeriod"></select></label>
                  <label class="dbw-set"><span>ATR</span><select data-setting="atrPeriod"></select></label>
                  <label class="dbw-set"><span>ADX</span><select data-setting="adxPeriod"></select></label>
                  <label class="dbw-set"><span>突破天数</span><select data-setting="breakoutDays"></select></label>
                  <label class="dbw-set"><span>量能周期</span><select data-setting="volumePeriod"></select></label>
                  <label class="dbw-set"><span>MACD</span><select data-setting="macd"></select></label>
                  <label class="dbw-set"><span>BOLL</span><select data-setting="boll"></select></label>
                </div>
              </details>
              <div class="dbw-set-row"><span>趋势阈值</span><input type="range" min="0.05" max="0.6" step="0.01" data-setting="threshold" aria-label="趋势阈值" /><b data-threshold-value>0.20</b></div>
              <div class="dbw-set-toggles"><label><input type="checkbox" data-setting="showSignals" />显示技术信号</label><label><input type="checkbox" data-setting="showMarket" />显示市场宽度</label><label><input type="checkbox" data-setting="showDashboard" />显示仪表盘</label></div>
              <div class="dbw-set-toggles"><label><input type="checkbox" data-setting="showAlerts" />信号提醒</label><label><input type="checkbox" data-setting="notifyDesktop" />桌面通知</label><label><input type="checkbox" data-setting="onlyOpps" />只看机会</label></div>
              <div class="dbw-set-note">修改内置预设后会另存为自定义；信号按当前规则和参数计算。</div>
            </div>
            <div class="dbw-dash" data-dashboard hidden>
              <div class="dbw-gauge" data-gauge="vix" data-tone="neutral"><div class="dbw-gauge-top"><span>VIX 恐慌</span><b data-gauge-value>--</b></div><div class="dbw-gauge-bar" data-gauge-bar><i></i></div><div class="dbw-gauge-meta" data-gauge-meta>--</div></div>
              <div class="dbw-gauge" data-gauge="vxn" data-tone="neutral"><div class="dbw-gauge-top"><span>科技 VXN</span><b data-gauge-value>--</b></div><div class="dbw-gauge-bar" data-gauge-bar><i></i></div><div class="dbw-gauge-meta" data-gauge-meta>--</div></div>
              <div class="dbw-gauge" data-gauge="fng" data-tone="neutral"><div class="dbw-gauge-top"><span>加密 F&G</span><b data-gauge-value>--</b></div><div class="dbw-gauge-bar" data-gauge-bar><i></i></div><div class="dbw-gauge-meta" data-gauge-meta>--</div></div>
            </div>
            <div class="dbw-deriv" data-deriv hidden><span>BTC 多空 <b data-deriv-ratio>--</b></span><span>空头 <b data-deriv-short>--</b></span><span>OI <b data-deriv-oi>--</b></span><span>资费 <b data-deriv-funding>--</b></span></div>
            <div class="dbw-advice" data-advice hidden><b>现在该做什么</b><span data-advice-text>--</span></div>
            <div class="dbw-dist" data-dist hidden>
              <div class="dbw-dist-head" data-action="dist" role="button" title="展开 / 收起历史区间分布"><span>历史区间分布 · 近 <b data-dist-years>10</b> 年</span><span>每年约出现天数 · 占比 <em data-dist-toggle>▾</em></span></div>
              <div class="dbw-dist-grid" data-dist-grid></div>
              <details class="dbw-hist-all"><summary>查看各区间每年天数</summary><div class="dbw-hist-table" data-hist-table></div></details>
              <div class="dbw-dist-note" data-dist-note></div>
            </div>
            <div class="dbw-presets" data-presets></div>
            <div class="dbw-opps" data-opps hidden><span class="dbw-opps-label">机会</span><span class="dbw-opps-list" data-opps-list></span></div>
            <div class="dbw-trends" data-market-cards>
              <div class="dbw-market" data-market="crypto" data-tone="neutral">
                <div class="dbw-market-top"><span class="dbw-market-name">加密市场</span><span class="dbw-market-right"><b class="dbw-market-label" data-market-label>--</b><em class="dbw-market-prob" data-market-prob></em></span></div>
                <div class="dbw-bar" data-market-bar data-tone="neutral"><i></i></div>
                <div class="dbw-market-meta" data-market-meta>等待行情</div>
              </div>
              <div class="dbw-market" data-market="stock" data-tone="neutral">
                <div class="dbw-market-top"><span class="dbw-market-name">美股市场</span><span class="dbw-market-right"><b class="dbw-market-label" data-market-label>--</b><em class="dbw-market-prob" data-market-prob></em></span></div>
                <div class="dbw-bar" data-market-bar data-tone="neutral"><i></i></div>
                <div class="dbw-market-meta" data-market-meta>等待行情</div>
              </div>
            </div>
            <div class="dbw-search">
              <input type="text" data-search placeholder="搜索币种 / 美股代码，如 BTC、AAPL" autocomplete="off" spellcheck="false" aria-label="搜索并加入自选" />
              <button class="dbw-tool" type="button" data-action="filter-opps" title="只看机会（通过率≥60%）" aria-label="只看机会">◉</button>
              <button class="dbw-tool" type="button" data-action="sort" title="切换排序：默认 / 信号 / 涨跌" aria-label="切换排序">⇅</button>
              <button class="dbw-refresh" type="button" data-action="refresh" title="立即刷新行情">↻</button>
            </div>
            <div class="dbw-results" data-results hidden></div>
            <div class="dbw-list" data-list>
              <div class="dbw-section" data-section="crypto">
                <div class="dbw-section-head"><span>加密</span><span class="dbw-section-side"><em data-section-breadth="crypto"></em><b data-count="crypto">0</b></span></div>
                <div data-rows="crypto"></div>
              </div>
              <div class="dbw-section" data-section="stock">
                <div class="dbw-section-head"><span>美股</span><span class="dbw-section-side"><em data-section-breadth="stock"></em><b data-count="stock">0</b></span></div>
                <div data-rows="stock"></div>
              </div>
              <div class="dbw-empty" data-empty hidden>自选为空 · 在上方搜索添加</div>
            </div>
            <div class="dbw-foot">
              <span class="dbw-status"><i class="dbw-dot" data-status-dot></i><span data-status>正在连接</span></span>
              <span class="dbw-updated" data-updated title="每 3 秒自动刷新；窗口切到后台时暂停">--</span>
            </div>
          </div>
        </div>`;
			container.append(root);

			const list = root.querySelector("[data-list]");
			const head = root.querySelector("[data-drag-handle]");
			const input = root.querySelector("[data-search]");
			const resultsEl = root.querySelector("[data-results]");
			const statusText = root.querySelector("[data-status]");
			const statusDot = root.querySelector("[data-status-dot]");
			const updatedEl = root.querySelector("[data-updated]");
			const refreshBtn = root.querySelector('[data-action="refresh"]');
			const collapseBtn = root.querySelector('[data-action="collapse"]');
			const mini = root.querySelector("[data-mini]");
			const emptyEl = root.querySelector("[data-empty]");
			const countEls = { crypto: root.querySelector('[data-count="crypto"]'), stock: root.querySelector('[data-count="stock"]') };
			const sectionEls = { crypto: root.querySelector('[data-section="crypto"]'), stock: root.querySelector('[data-section="stock"]') };
			const rowContainers = { crypto: root.querySelector('[data-rows="crypto"]'), stock: root.querySelector('[data-rows="stock"]') };
			const sectionBreadthEls = { crypto: root.querySelector('[data-section-breadth="crypto"]'), stock: root.querySelector('[data-section-breadth="stock"]') };
			const marketEls = { crypto: root.querySelector('[data-market="crypto"]'), stock: root.querySelector('[data-market="stock"]') };
			const dashboardEl = root.querySelector("[data-dashboard]");
			const derivEl = root.querySelector("[data-deriv]");
			const presetChipsEl = root.querySelector("[data-presets]");
			const presetSelectEl = root.querySelector("[data-preset-select]");
			const presetBaseEl = root.querySelector("[data-preset-base]");
			const presetNameEl = root.querySelector("[data-preset-name]");
			const presetDescEl = root.querySelector("[data-preset-desc]");
			const settingsEl = root.querySelector("[data-settings]");
			const signalsList = root.querySelector("[data-signals-list]");
			const alertCount = root.querySelector("[data-alert-count]");
			const tabEls = [...root.querySelectorAll("[data-tab]")];
			const tabCounts = {
				watchlist: root.querySelector('[data-tab-count="watchlist"]'),
				signals: root.querySelector('[data-tab-count="signals"]')
			};
			const stripEl = root.querySelector("[data-strip]");
			const stripText = root.querySelector("[data-strip-text]");
			const oppsEl = root.querySelector("[data-opps]");
			const oppsList = root.querySelector("[data-opps-list]");
			const adviceEl = root.querySelector("[data-advice]");
			const adviceTextEl = root.querySelector("[data-advice-text]");
			const distEl = root.querySelector("[data-dist]");
			const distGrid = root.querySelector("[data-dist-grid]");
			const distYears = root.querySelector("[data-dist-years]");
			const distNote = root.querySelector("[data-dist-note]");
			const histTable = root.querySelector("[data-hist-table]");
			const settingsBtn = root.querySelector('[data-action="settings"]');
			const rateEl = root.querySelector("[data-rate]");
			const thresholdValueEl = root.querySelector("[data-threshold-value]");

			const state = loadWatchlist();
			let settings = loadSettings();
			let customPresets = loadCustomPresets();
			let alerts = loadAlerts();
			let alertStates = new Map();
			let alertScanReady = false;
			let lastAlertAt = new Map();
			let alertUnread = 0;
			const targets = loadTargets();
			let stateRevision = Number(readJson(STATE_REV_KEY) ?? 0) || 0;
			let statePushTimer = 0;

		function queueStatePush() {
			window.clearTimeout(statePushTimer);
			statePushTimer = window.setTimeout(() => { void pushState(); }, 400);
		}

		function applyRemoteTargets(raw) {
			for (const key of Object.keys(targets)) delete targets[key];
			if (raw && typeof raw === "object") {
				for (const [key, value] of Object.entries(raw)) {
					if (!value || !Number.isFinite(Number(value.price))) continue;
					targets[key] = {
						price: Number(value.price),
						direction: value.direction === "below" ? "below" : "above",
						stop: Number.isFinite(Number(value.stop)) ? Number(value.stop) : null,
						note: String(value.note ?? ""),
						triggered: value.triggered === true
					};
				}
			}
			writeJson(TARGETS_KEY, targets);
		}

		function applyRemoteState(data) {
			applyRemoteTargets(data.targets);
			if (data.watchlist && typeof data.watchlist === "object") {
				const crypto = Array.isArray(data.watchlist.crypto) ? data.watchlist.crypto : state.crypto;
				const stocks = Array.isArray(data.watchlist.stocks) ? data.watchlist.stocks : state.stocks;
				state.crypto = crypto.slice(0, MAX_CRYPTO);
				state.stocks = stocks.slice(0, MAX_STOCKS);
				saveWatchlist(state);
			}
			stateRevision = Number(data.revision) || stateRevision;
			writeJson(STATE_REV_KEY, stateRevision);
			syncRows(true);
		}

		async function pushState() {
			try {
				const response = await fetch(STATE_URL, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						watchlist: { crypto: state.crypto, stocks: state.stocks },
						targets
					}),
					cache: "no-store"
				});
				const data = await response.json();
				if (data?.ok && Number.isFinite(Number(data.revision))) {
					stateRevision = Number(data.revision);
					writeJson(STATE_REV_KEY, stateRevision);
				}
			} catch {
				// 本地状态仍然可用；服务端恢复后由 syncRemoteState 合并
			}
		}

		async function syncRemoteState(initial = false) {
			if (disposed) return;
			try {
				const response = await fetch(STATE_URL, { cache: "no-store" });
				const data = await response.json();
				if (!data?.ok) return;
				if (!data.initialized) {
					if (initial) await pushState();
					return;
				}
				if (initial && stateRevision === 0) {
					const localHasWatchlist = state.crypto.length > 0 || state.stocks.length > 0;
					applyRemoteTargets(data.targets);
					if (localHasWatchlist) {
						await pushState();
					} else {
						applyRemoteState(data);
					}
					return;
				}
				if (Number(data.revision) <= stateRevision) return;
				applyRemoteState(data);
			} catch {
				// 服务端不可用时退回 localStorage
			}
		}

			const drafts = new Map();
			const editorOpen = new Set();
			const openStrategy = new Set();
			const rowRefs = new Map();
			let quotes = new Map();
			let stockQuotes = new Map();
			let market = { crypto: null, stock: null };
			let sentiment = null;
			let aggregate = { crypto: null, stock: null };
			let renderedKeys = "";
			let lastUpdate = 0;
			let lastError = "";
			let inFlight = false;
			let queued = false;
			let disposed = false;
			let pollTimer = 0;
			let marketTimer = 0;
			let marketInFlight = false;
			let ageTimer = 0;
			let stateTimer = 0;
			let toastTimer = 0;
			let searchTimer = 0;
			let searchToken = 0;
			let searchAbort = null;
			let searchResults = [];
			let activeIndex = -1;
			let searchDegraded = false;
			let dragMoved = false;
			let drag = null;

			const storedPosition = loadPosition();
			if (storedPosition) {
				root.style.left = `${storedPosition.x}px`;
				root.style.top = `${storedPosition.y}px`;
				root.style.bottom = "auto";
			}
			const storedCollapsed = readJson(COLLAPSED_KEY);
			if (!embedded && storedCollapsed === true) root.dataset.collapsed = "true";
			collapseBtn.textContent = root.dataset.collapsed === "true" ? "+" : "−";

			function splitKey(key) {
				const index = key.indexOf(":");
				return [key.slice(0, index), key.slice(index + 1)];
			}

			function rowKey(kind, symbol) {
				return `${kind}:${symbol}`;
			}

			function setStatus(text, tone = "ok") {
				statusText.textContent = text;
				statusDot.dataset.state = tone;
			}

			function showToast(text) {
				const old = document.querySelector(".dbw-toast");
				if (old) old.remove();
				const toast = document.createElement("div");
				toast.className = "dbw-toast";
				toast.textContent = text;
				document.body.append(toast);
				clearTimeout(toastTimer);
				toastTimer = window.setTimeout(() => toast.remove(), 4200);
			}

			// ---------- trend & breadth ----------

			function computeAggregate(kind) {
				const scores = [];
				let positive = 0;
				let negative = 0;
				let bull = 0;
				let bear = 0;
				let neutral = 0;
				const symbols = kind === "crypto" ? state.crypto : state.stocks;
				for (const symbol of symbols) {
					const trend = kind === "crypto" ? cryptoTrend(quotes.get(symbol)) : stockTrend(stockQuotes.get(symbol));
					if (!trend || !Number.isFinite(trend.score)) continue;
					scores.push(trend.score);
					if (trend.score > 0) positive += 1;
					if (trend.score < 0) negative += 1;
					if (trend.label === "多头") bull += 1;
					else if (trend.label === "空头") bear += 1;
					else neutral += 1;
				}
				if (scores.length === 0) return null;
				const mean = scores.reduce((sum, value) => sum + value, 0) / scores.length;
				const breadth = (positive - negative) / scores.length;
				const score = clamp(0.7 * mean + 0.3 * breadth, -1, 1);
				return {
					label: aggregateLabel(score),
					score,
					bullProbability: Math.round(clamp(50 + score * 45, 5, 95)),
					count: scores.length,
					positive,
					negative,
					bull,
					bear,
					neutral,
				};
			}

			function renderMarketCard(kind, data, fallback) {
				const el = marketEls[kind];
				if (!el) return;
				const labelEl = el.querySelector("[data-market-label]");
				const probEl = el.querySelector("[data-market-prob]");
				const bar = el.querySelector("[data-market-bar]");
				const fill = bar?.querySelector("i");
				const metaEl = el.querySelector("[data-market-meta]");
				const label = data?.label ?? fallback?.label ?? "--";
				const probability = data?.bullProbability ?? fallback?.bullProbability;
				const tone = data || fallback ? toneOf(label) : "neutral";
				el.dataset.tone = tone;
				el.dataset.fallback = data ? "false" : fallback ? "true" : "false";
				labelEl.textContent = label;
				probEl.textContent = Number.isFinite(probability) ? `${probability}%` : "";
				if (bar) bar.dataset.tone = tone;
				if (fill) {
					if (Number.isFinite(probability)) {
						fill.style.left = `${Math.min(50, probability)}%`;
						fill.style.width = `${Math.abs(probability - 50)}%`;
					} else {
						fill.style.left = "50%";
						fill.style.width = "0%";
					}
				}
				if (metaEl) {
					if (data && kind === "crypto") {
						metaEl.textContent = `涨 ${data.up} · 跌 ${data.down} · 中位 ${formatChange(data.medianChangePct)}`;
					} else if (data) {
						const vix = data.vix && Number.isFinite(data.vix.price) ? ` · VIX ${formatPrice(data.vix.price)}` : "";
						metaEl.textContent = `板块 ${data.sectorUp}/${data.sectorCount} · 指数 ${data.indexUp}/${data.indexCount}${vix}`;
					} else if (fallback) {
						metaEl.textContent = `自选 ${fallback.bull} 多 · ${fallback.bear} 空 · ${fallback.neutral} 平`;
					} else {
						metaEl.textContent = "等待市场数据";
					}
				}
				if (data && kind === "crypto") {
					el.title = `${data.universe} 个 USDT 交易对；24h 成交额 ${(data.totalVolumeUsd / 1e8).toFixed(1)} 亿；BTC ${formatChange(data.btcChangePct)} · ETH ${formatChange(data.ethChangePct)}`;
				} else if (data) {
					el.title = `${data.aboveMa20Count}/${data.aboveMa20Total} 个指数/板块在 MA20 上方；平均 ${formatChange(data.avgChangePct)}`;
				} else if (fallback) {
					el.title = "市场数据加载中，暂显示自选聚合";
				} else {
					el.title = "等待市场数据";
				}
			}

			function updateSectionBreadth() {
				for (const kind of ["crypto", "stock"]) {
					const el = sectionBreadthEls[kind];
					if (!el) continue;
					const aggregate = computeAggregate(kind);
					el.textContent = aggregate ? `多${aggregate.bull} 空${aggregate.bear}` : "";
				}
			}

			function updateMarketCards() {
				const cryptoFallback = state.crypto.length > 0 ? (aggregate.crypto ?? computeAggregate("crypto")) : null;
				const stockFallback = state.stocks.length > 0 ? (aggregate.stock ?? computeAggregate("stock")) : null;
				renderMarketCard("crypto", market.crypto, cryptoFallback);
				renderMarketCard("stock", market.stock, stockFallback);
				const crypto = market.crypto ?? cryptoFallback;
				const stock = market.stock ?? stockFallback;
				mini.textContent = `${trendShort("币", crypto)} · ${trendShort("美", stock)}`;
				updateSectionBreadth();
			}

			// ---------- settings & market ----------

			function settingLabel(key, value) {
				if (key === "interval") return `${Number(value) / 1000} 秒`;
				if (key === "style") return { balanced: "综合", trend: "趋势", momentum: "动量", meanrev: "均值回归" }[value] ?? String(value);
				if (key === "macd" || key === "boll") return String(value).replace(/,/g, " · ");
				return String(value);
			}

			function fillSettingOptions() {
				for (const select of settingsEl.querySelectorAll("select[data-setting]")) {
					const key = select.dataset.setting;
					const options = SETTING_OPTIONS[key];
					if (!options) continue;
					select.replaceChildren();
					for (const value of options) {
						const option = document.createElement("option");
						option.value = String(value);
						option.textContent = settingLabel(key, value);
						select.append(option);
					}
				}
			}

			function syncSettingsUI() {
				for (const select of settingsEl.querySelectorAll("select[data-setting]")) select.value = String(settings[select.dataset.setting]);
				const range = settingsEl.querySelector('[data-setting="threshold"]');
				if (range) range.value = String(settings.threshold);
				thresholdValueEl.textContent = settings.threshold.toFixed(2);
				const signalsToggle = settingsEl.querySelector('[data-setting="showSignals"]');
				if (signalsToggle) signalsToggle.checked = settings.showSignals;
				const marketToggle = settingsEl.querySelector('[data-setting="showMarket"]');
				if (marketToggle) marketToggle.checked = settings.showMarket;
				const dashboardToggle = settingsEl.querySelector('[data-setting="showDashboard"]');
				if (dashboardToggle) dashboardToggle.checked = settings.showDashboard;
				rateEl.textContent = `${Math.round(settings.interval / 1000)}s 自动`;
				updatedEl.title = `每 ${Math.round(settings.interval / 1000)} 秒自动刷新；窗口切到后台时暂停`;
				const cards = root.querySelector("[data-market-cards]");
				if (cards) cards.hidden = !settings.showMarket;
			}

			function readSettingsUI() {
				const read = (key) => settingsEl.querySelector(`[data-setting="${key}"]`)?.value;
				const readChecked = (key) => settingsEl.querySelector(`[data-setting="${key}"]`)?.checked !== false;
				return normalizeSettings({
					...settings,
					interval: Number(read("interval")),
					maFast: Number(read("maFast")),
					maSlow: Number(read("maSlow")),
					maLong: Number(read("maLong")),
					rsiPeriod: Number(read("rsiPeriod")),
					atrPeriod: Number(read("atrPeriod")),
					adxPeriod: Number(read("adxPeriod")),
					breakoutDays: Number(read("breakoutDays")),
					volumePeriod: Number(read("volumePeriod")),
					macd: read("macd"),
					boll: read("boll"),
					threshold: Number(read("threshold")),
					style: read("style"),
					thresholds: readThresholdsUI(),
					showSignals: readChecked("showSignals"),
					showMarket: readChecked("showMarket"),
					showDashboard: readChecked("showDashboard"),
					showAlerts: readChecked("showAlerts"),
					notifyDesktop: readChecked("notifyDesktop"),
					onlyOpps: readChecked("onlyOpps"),
				});
			}

			function persistAndRefresh(reloadMarket = true) {
				saveSettings(settings);
				syncSettingsUI();
				renderPresetChips();
				syncPresetEditor();
				renderSentiment();
				applyTab();
				applyDistributionState();
				applyRowOrder();
				if (settings.notifyDesktop) requestNotifications();
				syncRows();
				void refresh(true);
				if (reloadMarket) void refreshMarket();
				schedulePoll();
				scheduleMarket();
			}

			function applySettings(next, options = {}) {
				settings = next;
				persistAndRefresh(options.market !== false);
			}

			function expandIfCollapsed() {
				if (root.dataset.collapsed !== "true") return false;
				root.dataset.collapsed = "false";
				collapseBtn.textContent = "−";
				writeJson(COLLAPSED_KEY, false);
				requestAnimationFrame(clampPosition);
				return true;
			}

			function toggleSettings() {
				const wasCollapsed = expandIfCollapsed();
				const open = settingsEl.hidden || wasCollapsed;
				settingsEl.hidden = !open;
				settingsBtn.dataset.active = String(open);
			}

			function resetSettings() {
				settings = normalizeSettings({ ...DEFAULT_SETTINGS, presetId: "balanced" });
				persistAndRefresh();
				showToast("已恢复默认参数");
			}

			function onSettingsChange(event) {
				if (!settingsEl.contains(event.target)) return;
				const threshold = event.target.closest("[data-threshold]");
				if (threshold) {
					settings = normalizeSettings({ ...settings, thresholds: readThresholdsUI() });
					commitPresetEdit();
					persistAndRefresh(false);
					return;
				}
				const presetField = event.target.closest("[data-preset-base],[data-preset-name],[data-preset-desc]");
				if (presetField) {
					const active = activePreset();
					commitPresetEdit({
						name: presetNameEl.value.trim() || (active.custom ? active.name : `${active.name} 自定义`),
						base: presetBaseEl.value,
						desc: presetDescEl.value.trim(),
					});
					persistAndRefresh(false);
					return;
				}
				const presetSelect = event.target.closest("[data-preset-select]");
				if (presetSelect) {
					applyPresetById(presetSelect.value);
					return;
				}
				const control = event.target.closest("[data-setting]");
				if (!control) return;
				const paramKeys = new Set(["maFast", "maSlow", "maLong", "rsiPeriod", "macd", "boll", "atrPeriod", "adxPeriod", "breakoutDays", "volumePeriod", "threshold", "style"]);
				settings = readSettingsUI();
				saveSettings(settings);
				if (paramKeys.has(control.dataset.setting)) commitPresetEdit();
				persistAndRefresh(false);
			}

			function onSettingsInput(event) {
				const control = event.target.closest('[data-setting="threshold"]');
				if (!control) return;
				thresholdValueEl.textContent = Number(control.value).toFixed(2);
			}

			async function refreshMarket() {
				if (disposed || marketInFlight) return;
				marketInFlight = true;
				try {
					const response = await fetch(`${MARKET_URL}?th=${settings.threshold}`, { cache: "no-store" });
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					const payload = await response.json();
					if (!payload || payload.ok === false) throw new Error(payload?.error ?? "market");
					market = { crypto: payload.crypto ?? null, stock: payload.stock ?? null };
					sentiment = payload.sentiment ?? null;
					updateMarketCards();
					renderSentiment();
				} catch {
					// Keep the previous snapshot; cards fall back to the watchlist aggregate.
				} finally {
					marketInFlight = false;
				}
			}

			function scheduleMarket() {
				window.clearTimeout(marketTimer);
				if (disposed || document.hidden) return;
				marketTimer = window.setTimeout(async () => {
					await refreshMarket();
					scheduleMarket();
				}, 30000);
			}

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

			function volAction(kind, price) {
				if (!Number.isFinite(price)) return "";
				if (kind === "vxn") {
					if (price < 18) return "平静 · 观察持有";
					if (price < 23) return "正常 · 按信号";
					if (price < 28) return "警惕 · 科技仓位谨慎";
					if (price < 35) return "偏高 · 控制科技仓位";
					return "极高 · 等待企稳";
				}
				if (price < 15) return "平静 · 按预设观察";
				if (price < 20) return "正常 · 按信号";
				if (price < 25) return "警惕 · 避免追高";
				if (price < 30) return "恐慌 · 轻仓观察";
				return "极度恐慌 · 分批观察";
			}

			function fngAction(value) {
				if (!Number.isFinite(value)) return "";
				if (value <= 25) return "极度恐惧 · 分批观察";
				if (value <= 45) return "恐惧 · 分批观察";
				if (value <= 55) return "中性 · 观察持有";
				if (value <= 75) return "贪婪 · 避免追高";
				return "过热 · 适度减仓";
			}

			function marketAdvice() {
				const vix = sentiment?.vix?.price;
				const vxn = sentiment?.vxn?.price;
				const fng = sentiment?.cryptoFearGreed?.value;
				const notes = [];
				let tone = "neutral";
				if (Number.isFinite(vix)) {
					if (vix >= 30) {
						tone = "fear";
						notes.push(`VIX ${vix.toFixed(0)} 极度恐慌：分批观察，避免一次性建仓`);
					} else if (vix >= 25) {
						tone = "alert";
						notes.push(`VIX ${vix.toFixed(0)} 恐慌：轻仓观察，等待回落到 20 以下`);
					} else if (vix >= 20) {
						tone = "alert";
						notes.push(`VIX ${vix.toFixed(0)} 警惕：避免追高，新仓减半`);
					} else if (vix < 15) {
						tone = "calm";
						notes.push(`VIX ${vix.toFixed(0)} 平静：按预设观察`);
					} else {
						notes.push(`VIX ${vix.toFixed(0)} 正常：按预设信号观察`);
					}
				}
				if (Number.isFinite(vxn)) {
					if (vxn >= 35) notes.push(`科技 VXN ${vxn.toFixed(0)} 极高：等待科技股企稳`);
					else if (vxn >= 28) notes.push(`科技 VXN ${vxn.toFixed(0)} 偏高：控制科技仓位`);
				}
				if (Number.isFinite(fng)) {
					if (fng <= 25) notes.push(`加密 F&G ${fng} 极度恐惧：分批观察，避免重仓`);
					else if (fng <= 45) notes.push(`加密 F&G ${fng} 恐惧：分批观察`);
					else if (fng >= 75) notes.push(`加密 F&G ${fng} 过热：适度减仓`);
				}
				return notes.length ? { tone, text: notes.join("；") } : null;
			}

			function setGauge(kind, gauge) {
				const el = root.querySelector(`[data-gauge="${kind}"]`);
				if (!el) return;
				const valueEl = el.querySelector("[data-gauge-value]");
				const metaEl = el.querySelector("[data-gauge-meta]");
				const fill = el.querySelector("[data-gauge-bar] i");
				el.dataset.tone = gaugeTone(kind, gauge);
				if (kind === "fng") {
					valueEl.textContent = Number.isFinite(gauge?.value) ? String(gauge.value) : "--";
					const labelMap = { "Extreme Fear": "极度恐惧", "Fear": "恐惧", "Neutral": "中性", "Greed": "贪婪", "Extreme Greed": "极度贪婪" };
					const label = labelMap[gauge?.label] ?? gauge?.label ?? "--";
					metaEl.textContent = gauge ? fngAction(gauge.value) : "暂无数据";
					if (fill) fill.style.width = Number.isFinite(gauge?.value) ? `${clamp(gauge.value, 0, 100)}%` : "0%";
					el.title = `${label}（${gauge?.value ?? "--"}）· 昨日 ${gauge?.previous ?? "--"} · 0=极度恐惧 100=极度贪婪`;
				} else {
					valueEl.textContent = Number.isFinite(gauge?.price) ? formatPrice(gauge.price) : "--";
					metaEl.textContent = gauge ? volAction(kind, gauge.price) : "暂无数据";
					if (fill) fill.style.width = Number.isFinite(gauge?.percentile) ? `${clamp(gauge.percentile, 0, 100)}%` : "0%";
					const name = kind === "vix" ? "VIX（美股恐慌）" : "VXN（科技股恐慌）";
					el.title = `${name} ${gauge?.price ?? "--"} · 1 年分位 ${Math.round(gauge?.percentile ?? 0)}% · 区间：${gauge?.zone ?? "--"}`;
				}
				const frequency = gauge?.distribution?.frequency;
				if (frequency) metaEl.textContent += ` · ${frequency}`;
			}

			function renderDistribution() {
				if (!distEl || !distGrid) return;
				const items = [
					{ name: "VIX", gauge: sentiment?.vix, kind: "vix", short: ["极低", "偏低", "正常", "偏高", "极恐"] },
					{ name: "VXN", gauge: sentiment?.vxn, kind: "vxn", short: ["极低", "偏低", "正常", "偏高", "极恐"] },
					{ name: "加密 F&G", gauge: sentiment?.cryptoFearGreed, kind: "fng", short: ["极恐", "恐惧", "中性", "贪婪", "极贪"] }
				].filter((item) => item.gauge?.distribution?.zones?.length === 5);
				distEl.hidden = !(settings.showDashboard && items.length > 0);
				if (!items.length) return;
				const years = Math.max(...items.map((item) => Number(item.gauge.distribution.years) || 0));
				distYears.textContent = years > 0 ? String(years) : "--";
				distGrid.innerHTML = items.map((item) => {
					const distribution = item.gauge.distribution;
					const zones = distribution.zones;
					const mode = distribution.mode ?? zones.reduce((best, zone) => (zone.pct > best.pct ? zone : best), zones[0]);
					const current = zones.findIndex((zone) => zone.current);
					const percentile = distribution.historicalPercentile;
					const segments = zones.map((zone, index) => `<i class="dbw-hist-seg" data-current="${index === current}" data-tone="${index >= 3 ? "fear" : index === 2 ? "alert" : "calm"}" style="flex-grow:${Math.max(2, zone.pct)}" title="${escapeHtml(zone.label)} · 每年约 ${zone.perYear} 天（${zone.pct}%）"></i>`).join("");
					const meta = `${distribution.frequency ?? "--"} · ${distribution.currentPerYear ?? "--"} 天/年`;
					const normal = `常态 ${escapeHtml(mode.label)}（${mode.pct}%）${Number.isFinite(percentile) ? ` · 高于 ${Math.round(percentile)}% 的交易日` : ""}`;
					const exceed = (distribution.exceedance ?? []).map((item) => `${item.label} ${item.perYear}天`).join(" · ");
					return `<div class="dbw-hist" data-hist="${item.kind}"><div class="dbw-hist-top"><span>${item.name}</span><b>${item.kind === "fng" ? item.gauge.value : formatPrice(item.gauge.price)}</b></div><div class="dbw-hist-bar" aria-hidden="true">${segments}</div><div class="dbw-hist-meta">${escapeHtml(meta)}</div><div class="dbw-hist-normal" title="${escapeHtml(normal)}">${normal}</div>${exceed ? `<div class="dbw-hist-exceed" title="每年 ≥/≤ 该值的交易日数">${escapeHtml(exceed)}</div>` : ""}</div>`;
				}).join("");
				if (histTable) {
					histTable.innerHTML = items.map((item) => {
						const distribution = item.gauge.distribution;
						const rows = distribution.zones.map((zone) => `<span data-current="${Boolean(zone.current)}" title="${escapeHtml(zone.label)} · 占比 ${zone.pct}%">${escapeHtml(zone.label)} · ${zone.perYear}天</span>`).join("");
						return `<div class="dbw-hist-table-col"><b>${item.name}</b>${rows}</div>`;
					}).join("");
				}
				distNote.textContent = "条宽＝历史占比 · 高亮＝当前区间 · 常态＝最常出现的区间";
				applyDistributionState();
			}
			function applyDistributionState() {
				if (!distEl) return;
				distEl.dataset.open = String(settings.distOpen !== false);
				const toggle = root.querySelector("[data-dist-toggle]");
				if (toggle) toggle.textContent = settings.distOpen === false ? "▸" : "▾";
			}

			function renderSentiment() {
				if (!dashboardEl) return;
				const available = Boolean(sentiment && (sentiment.vix || sentiment.vxn || sentiment.cryptoFearGreed));
				dashboardEl.hidden = !(settings.showDashboard && available);
				if (available) {
					setGauge("vix", sentiment.vix);
					setGauge("vxn", sentiment.vxn);
					setGauge("fng", sentiment.cryptoFearGreed);
				}
				renderDistribution();
				const advice = available ? marketAdvice() : null;
				if (adviceEl) {
					adviceEl.hidden = !(settings.showDashboard && advice);
					if (advice) {
						adviceEl.dataset.tone = advice.tone;
						adviceTextEl.textContent = advice.text;
					}
				}
				renderStrip();
				const derivatives = market.crypto?.derivatives ?? null;
				if (!derivEl) return;
				derivEl.hidden = !(settings.showDashboard && derivatives);
				if (!derivatives) return;
				const ratio = derivEl.querySelector("[data-deriv-ratio]");
				const shortEl = derivEl.querySelector("[data-deriv-short]");
				const oi = derivEl.querySelector("[data-deriv-oi]");
				const funding = derivEl.querySelector("[data-deriv-funding]");
				if (ratio) ratio.textContent = Number.isFinite(derivatives.longShortRatio) ? derivatives.longShortRatio.toFixed(2) : "--";
				if (shortEl) shortEl.textContent = Number.isFinite(derivatives.shortPct) ? `${derivatives.shortPct.toFixed(1)}%` : "--";
				if (oi) oi.textContent = Number.isFinite(derivatives.openInterestUsd) ? `$${(derivatives.openInterestUsd / 1e9).toFixed(2)}B` : "--";
				if (funding) funding.textContent = Number.isFinite(derivatives.fundingRatePct) ? `${derivatives.fundingRatePct > 0 ? "+" : ""}${derivatives.fundingRatePct.toFixed(4)}%` : "--";
				derivEl.title = "OKX BTC 永续：多空账户比 / 空头账户占比 / 未平仓名义价值 / 当前资金费率";
			}

			function loadAlerts() {
				const raw = readJson(ALERTS_KEY);
				if (!Array.isArray(raw)) return [];
				return raw.filter((item) => item && typeof item.ts === "number" && typeof item.symbol === "string" && typeof item.name === "string").slice(0, 50);
			}

			function saveAlerts() {
				writeJson(ALERTS_KEY, alerts.slice(0, 50));
			}

			function renderAlerts() {
				if (!signalsList) return;
				alertCount.hidden = alertUnread <= 0;
				alertCount.textContent = String(alertUnread);
				if (tabCounts.signals) {
					tabCounts.signals.hidden = alertUnread <= 0;
					tabCounts.signals.textContent = String(alertUnread);
				}
				signalsList.innerHTML = alerts.length
					? alerts.map((item) => `<div class="dbw-alert-item"><b>${escapeHtml(item.name)}</b> · ${escapeHtml(item.preset)} ${item.passed}/${item.total} · ${escapeHtml(item.label)} <time>${new Date(item.ts).toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit" })}</time></div>`).join("")
					: `<div class="dbw-signals-empty">暂无信号<br><span>自选标的满足「买入」条件后会显示在这里</span></div>`;
			}

			function pushAlert(entry) {
				alerts.unshift(entry);
				alerts = alerts.slice(0, 50);
				saveAlerts();
				if (settings.tab !== "signals") alertUnread += 1;
				renderAlerts();
			}

			function announceAlerts(entries) {
				if (!entries.length) return;
				if (entries.length === 1) {
					showToast(`🔔 ${entries[0].name} · ${entries[0].preset} ${entries[0].passed}/${entries[0].total}`);
				} else {
					showToast(`🔔 ${entries.length} 个信号触发`);
				}
				if (settings.notifyDesktop && "Notification" in window && Notification.permission === "granted") {
					try {
						const first = entries[0];
						new Notification(`${first.name}${entries.length > 1 ? ` 等 ${entries.length} 个` : ""} · ${first.label}`, { body: `${first.preset} ${first.passed}/${first.total} 条件满足`, tag: "dsh-watchlist-alert" });
					} catch {
						// ignore notification failures
					}
				}
			}

			function scanAlerts(rows) {
				if (!settings.showAlerts) {
					alertScanReady = true;
					return;
				}
				const now = Date.now();
				const next = new Map();
				const triggered = [];
				for (const item of rows) {
					if (!item.ta) continue;
					const analysis = presetAnalysis(item.ta);
					if (!analysis) continue;
					const key = `${settings.presetId}:${item.symbol}`;
					const isBuy = analysis.ratio >= 0.8;
					next.set(key, isBuy);
					if (!alertScanReady || !isBuy || alertStates.get(key) === true) continue;
					const last = lastAlertAt.get(item.symbol) ?? 0;
					if (now - last < 10 * 60 * 1000) continue;
					lastAlertAt.set(item.symbol, now);
					const entry = { ts: now, symbol: item.symbol, name: item.symbol, preset: analysis.preset.name, passed: analysis.passed, total: analysis.total, label: analysis.label };
					pushAlert(entry);
					triggered.push(entry);
				}
				alertStates = next;
				alertScanReady = true;
				announceAlerts(triggered);
			}

			function toggleAlertsPanel() {
				expandIfCollapsed();
				setTab("signals");
			}

			function clearAlerts() {
				alerts = [];
				alertUnread = 0;
				saveAlerts();
				renderAlerts();
				showToast("已清空提醒");
			}

			function updateOpps(rows) {
				if (!oppsEl || !oppsList) return;
				const ranked = rows
					.map((item) => ({ ...item, analysis: item.ta ? presetAnalysis(item.ta) : null }))
					.filter((item) => item.analysis && item.analysis.ratio >= 0.6)
					.sort((a, b) => b.analysis.ratio - a.analysis.ratio)
					.slice(0, 3);
				oppsEl.hidden = ranked.length === 0;
				oppsList.innerHTML = ranked.map((item) => `<button class="dbw-opp-chip" type="button" data-opp="${escapeHtml(item.key)}">${escapeHtml(item.symbol)} ${item.analysis.passed}/${item.analysis.total} ${item.analysis.label}</button>`).join("");
			}

			function applyRowOrder() {
				const sortMode = settings.sort;
				const list = root.querySelector("[data-list]");
				if (!list) return;
				const editing = Boolean(document.activeElement?.closest?.(".dbw-row"));
				for (const section of list.querySelectorAll(".dbw-section")) {
					const rows = [...section.querySelectorAll(".dbw-row")];
					const value = (row) => (sortMode === "signal" ? Number(row.dataset.ratio ?? 0) : Number(row.dataset.change ?? 0));
					if (sortMode !== "default") rows.sort((a, b) => value(b) - value(a));
					else rows.sort((a, b) => Number(a.dataset.order ?? 0) - Number(b.dataset.order ?? 0));
					const current = [...section.querySelectorAll(".dbw-row")];
					const changed = rows.some((row, index) => row !== current[index]);
					if (changed && !editing) for (const row of rows) section.appendChild(row);
					let visible = 0;
					for (const row of rows) {
						const ratio = Number(row.dataset.ratio);
						const hide = settings.onlyOpps && Number.isFinite(ratio) && ratio < 0.6;
						row.hidden = hide;
						if (!hide) visible += 1;
					}
					section.hidden = settings.onlyOpps && visible === 0;
				}
				const sortBtn = root.querySelector('[data-action="sort"]');
				if (sortBtn) {
					sortBtn.dataset.sort = sortMode;
					sortBtn.dataset.active = String(sortMode !== "default");
					sortBtn.title = `排序：${sortMode === "signal" ? "信号强度" : sortMode === "change" ? "涨跌幅" : "默认"}（点击切换）`;
				}
				const filterBtn = root.querySelector('[data-action="filter-opps"]');
				if (filterBtn) {
					filterBtn.dataset.active = String(settings.onlyOpps);
					filterBtn.title = settings.onlyOpps ? "显示全部标的" : "只看机会（通过率≥60%）";
				}
			}

			function renderStrip() {
				if (!stripText) return;
				const parts = [];
				if (Number.isFinite(sentiment?.vix?.price)) parts.push(`VIX ${formatPrice(sentiment.vix.price)} ${volAction("vix", sentiment.vix.price).split(" · ")[0]}`);
				if (Number.isFinite(sentiment?.cryptoFearGreed?.value)) parts.push(`F&G ${sentiment.cryptoFearGreed.value} ${fngAction(sentiment.cryptoFearGreed.value).split(" · ")[0]}`);
				if (market?.crypto?.label) parts.push(`币${market.crypto.label}`);
				if (market?.stock?.label) parts.push(`美${market.stock.label}`);
				stripText.textContent = parts.length ? parts.join(" · ") : "市场概览加载中…";
			}

			function applyTab() {
				const tab = ["watchlist", "market", "signals"].includes(settings.tab) ? settings.tab : "watchlist";
				root.dataset.view = tab;
				for (const el of tabEls) el.dataset.active = String(el.dataset.tab === tab);
				if (tab === "signals") alertUnread = 0;
				renderStrip();
				renderAlerts();
			}

			function setTab(tab) {
				expandIfCollapsed();
				settings.tab = tab;
				saveSettings(settings);
				applyTab();
			}

			// ---------- presets ----------

			function allPresets() {
				return [...PRESET_BUILTINS, ...customPresets];
			}

			function findPreset(id) {
				return allPresets().find((preset) => preset.id === id) ?? null;
			}

			function activePreset() {
				return findPreset(settings.presetId) ?? PRESET_BUILTINS[0];
			}

			function renderPresetChips() {
				if (!presetChipsEl) return;
				const active = activePreset();
				presetChipsEl.innerHTML = allPresets().map((preset) => `<button class="dbw-preset" type="button" data-preset="${escapeHtml(preset.id)}" data-active="${preset.id === active.id}" data-custom="${Boolean(preset.custom)}" title="${escapeHtml(preset.desc || PRESET_BASE_LABELS[preset.base])}">${escapeHtml(preset.name)}</button>`).join("");
			}

			function fillPresetOptions() {
				if (!presetSelectEl) return;
				presetSelectEl.innerHTML = allPresets().map((preset) => `<option value="${escapeHtml(preset.id)}">${escapeHtml(preset.name)}${preset.custom ? " · 自定义" : ""}</option>`).join("");
				presetBaseEl.innerHTML = PRESET_BASES.map((base) => `<option value="${base}">${escapeHtml(PRESET_BASE_LABELS[base])}</option>`).join("");
			}

			function syncPresetEditor() {
				if (!presetSelectEl) return;
				fillPresetOptions();
				const preset = activePreset();
				presetSelectEl.value = preset.id;
				presetBaseEl.value = preset.base;
				presetNameEl.value = preset.name;
				presetDescEl.value = preset.desc || "";
				const disabled = !preset.custom;
				presetBaseEl.disabled = disabled;
				presetNameEl.disabled = disabled;
				presetDescEl.disabled = disabled;
				for (const input of settingsEl.querySelectorAll("[data-threshold]")) {
					const key = input.dataset.threshold;
					const value = settings.thresholds[key];
					input.value = Number.isFinite(value) ? String(value) : "";
				}
			}

			function readThresholdsUI() {
				const raw = {};
				for (const input of settingsEl.querySelectorAll("[data-threshold]")) {
					raw[input.dataset.threshold] = Number(input.value);
				}
				return normalizeThresholds(raw);
			}

			function applyPresetById(id) {
				const preset = findPreset(id);
				if (!preset) return;
				settings = normalizeSettings({ ...settings, ...preset.params, thresholds: preset.thresholds, presetId: preset.id });
				saveSettings(settings);
				syncSettingsUI();
				renderPresetChips();
				syncPresetEditor();
				syncRows();
				void refresh(true);
			}

			function commitPresetEdit(options = {}) {
				const active = activePreset();
				if (!active) return;
				const params = presetParamsFromSettings(settings);
				if (active.custom) {
					const index = customPresets.findIndex((preset) => preset.id === active.id);
					if (index >= 0) {
						customPresets[index] = normalizePreset({
							...customPresets[index],
							name: options.name ?? active.name,
							base: options.base ?? active.base,
							desc: options.desc ?? active.desc,
							params,
							thresholds: settings.thresholds,
						});
						saveCustomPresets(customPresets);
					}
					renderPresetChips();
					syncPresetEditor();
					return active.id;
				}
				const copy = normalizePreset({
					id: `custom-${Date.now().toString(36)}`,
					name: options.name ?? `${active.name} 自定义`,
					base: options.base ?? active.base,
					desc: options.desc ?? active.desc,
					params,
					thresholds: settings.thresholds,
				});
				customPresets.push(copy);
				saveCustomPresets(customPresets);
				settings = normalizeSettings({ ...settings, presetId: copy.id });
				saveSettings(settings);
				renderPresetChips();
				syncPresetEditor();
				showToast(`已另存为「${copy.name}」`);
				return copy.id;
			}

			function newPresetCopy() {
				const active = activePreset();
				const copy = normalizePreset({
					id: `custom-${Date.now().toString(36)}`,
					name: `${active.name} 副本`.slice(0, 16),
					base: active.base,
					desc: active.desc,
					params: presetParamsFromSettings(settings),
					thresholds: settings.thresholds,
				});
				customPresets.push(copy);
				saveCustomPresets(customPresets);
				settings = normalizeSettings({ ...settings, presetId: copy.id });
				saveSettings(settings);
				renderPresetChips();
				syncPresetEditor();
				showToast(`已新建「${copy.name}」`);
			}

			function deletePreset() {
				const active = activePreset();
				if (!active.custom) {
					showToast("内置预设不可删除，可保存为自定义后修改");
					return;
				}
				customPresets = customPresets.filter((preset) => preset.id !== active.id);
				saveCustomPresets(customPresets);
				settings = normalizeSettings({ ...settings, ...PRESET_BUILTINS[0].params, thresholds: PRESET_BUILTINS[0].thresholds, presetId: PRESET_BUILTINS[0].id });
				saveSettings(settings);
				renderPresetChips();
				syncPresetEditor();
				syncRows();
				void refresh(true);
				showToast(`已删除「${active.name}」`);
			}

			function pushCheck(checks, label, pass, value) {
				checks.push({ label, pass: Boolean(pass), value: value === undefined || value === null ? null : value });
			}

			function presetChecks(ta) {
				const preset = activePreset();
				const th = settings.thresholds;
				const checks = [];
				const rsi = ta?.rsi;
				const percentB = ta?.boll?.percentB;
				const distHigh = ta?.distanceHigh60Pct;
				const hist = ta?.macd?.hist;
				const prevHist = ta?.macd?.prevHist;
				const adx = ta?.adx?.adx;
				const volRatio = ta?.volumeRatio;
				const trendBull = ta?.trend?.label === "多头";
				const aboveSlow = Number.isFinite(ta?.price) && Number.isFinite(ta?.maSlow) && ta.price >= ta.maSlow;
				const aboveLong = Number.isFinite(ta?.price) && Number.isFinite(ta?.maLong) && ta.price >= ta.maLong;
				const base = preset.base;
				if (base === "momentum") {
					pushCheck(checks, "趋势多头", trendBull, ta?.trend?.label ?? "--");
					pushCheck(checks, `突破 ${settings.breakoutDays} 日高点`, ta?.breakout20 === true, ta?.breakout20 ? "是" : "否");
					pushCheck(checks, `量比 ≥ ${th.volRatio}`, Number.isFinite(volRatio) && volRatio >= th.volRatio, Number.isFinite(volRatio) ? volRatio.toFixed(2) : null);
					pushCheck(checks, `ADX ≥ ${th.adxMin}`, Number.isFinite(adx) && adx >= th.adxMin, Number.isFinite(adx) ? adx.toFixed(0) : null);
					pushCheck(checks, `RSI ${th.rsiMin}–${th.rsiMax}`, Number.isFinite(rsi) && rsi >= th.rsiMin && rsi <= th.rsiMax, Number.isFinite(rsi) ? rsi.toFixed(1) : null);
					pushCheck(checks, `距 60 日高 ≥ ${th.distHigh}%`, Number.isFinite(distHigh) && distHigh >= th.distHigh, Number.isFinite(distHigh) ? `${distHigh.toFixed(1)}%` : null);
				} else if (base === "rebound") {
					pushCheck(checks, `RSI ≤ ${th.rsiMax}`, Number.isFinite(rsi) && rsi <= th.rsiMax, Number.isFinite(rsi) ? rsi.toFixed(1) : null);
					pushCheck(checks, `%B ≤ ${th.percentBMax}`, Number.isFinite(percentB) && percentB <= th.percentBMax, Number.isFinite(percentB) ? percentB.toFixed(2) : null);
					pushCheck(checks, `距 60 日高 ≤ ${th.distHigh}%`, Number.isFinite(distHigh) && distHigh <= th.distHigh, Number.isFinite(distHigh) ? `${distHigh.toFixed(1)}%` : null);
					const improving = Number.isFinite(hist) && Number.isFinite(prevHist) ? hist > prevHist : ta?.macdCross === "golden";
					pushCheck(checks, "MACD 柱改善/金叉", improving, ta?.macdCross ?? (Number.isFinite(hist) ? formatPrice(hist) : null));
					const kdjLow = Number.isFinite(ta?.kdj?.j) && (ta.kdj.j < 20 || (Number.isFinite(ta.kdj.k) && ta.kdj.k < 25));
					pushCheck(checks, "KDJ 低位", kdjLow, Number.isFinite(ta?.kdj?.j) ? ta.kdj.j.toFixed(0) : null);
					pushCheck(checks, "K 线止跌形态", ["bullish-engulfing", "hammer"].includes(ta?.candle), ta?.candle ?? "");
				} else if (base === "trendPullback") {
					pushCheck(checks, "价格 > 长期均线", aboveLong, Number.isFinite(ta?.maLong) ? formatPrice(ta.maLong) : null);
					pushCheck(checks, "均线多头排列", ta?.maAlignment === "bull", ta?.maAlignment ?? "");
					pushCheck(checks, `ADX ≥ ${th.adxMin}`, Number.isFinite(adx) && adx >= th.adxMin, Number.isFinite(adx) ? adx.toFixed(0) : null);
					pushCheck(checks, `RSI ${th.rsiMin}–${th.rsiMax}`, Number.isFinite(rsi) && rsi >= th.rsiMin && rsi <= th.rsiMax, Number.isFinite(rsi) ? rsi.toFixed(1) : null);
					pushCheck(checks, "回踩慢线 ±3%", Number.isFinite(ta?.priceVsMaSlowPct) && Math.abs(ta.priceVsMaSlowPct) <= 3, Number.isFinite(ta?.priceVsMaSlowPct) ? `${ta.priceVsMaSlowPct.toFixed(1)}%` : null);
					pushCheck(checks, "MACD 柱 ≥ 0", Number.isFinite(hist) && hist >= 0, Number.isFinite(hist) ? formatPrice(hist) : null);
				} else if (base === "breakoutRetest") {
					pushCheck(checks, "价格 > 慢线", aboveSlow, Number.isFinite(ta?.maSlow) ? formatPrice(ta.maSlow) : null);
					pushCheck(checks, `距 60 日高 ≥ ${th.distHigh}%`, Number.isFinite(distHigh) && distHigh >= th.distHigh, Number.isFinite(distHigh) ? `${distHigh.toFixed(1)}%` : null);
					pushCheck(checks, `回踩缩量（量比 ≤ ${th.volRatio}）`, Number.isFinite(volRatio) && volRatio <= th.volRatio, Number.isFinite(volRatio) ? volRatio.toFixed(2) : null);
					pushCheck(checks, `RSI ${th.rsiMin}–${th.rsiMax}`, Number.isFinite(rsi) && rsi >= th.rsiMin && rsi <= th.rsiMax, Number.isFinite(rsi) ? rsi.toFixed(1) : null);
					pushCheck(checks, "MACD 柱 ≥ 0", Number.isFinite(hist) && hist >= 0, Number.isFinite(hist) ? formatPrice(hist) : null);
					pushCheck(checks, "守住突破位", Number.isFinite(ta?.priceVsMaSlowPct) && ta.priceVsMaSlowPct >= -1, Number.isFinite(ta?.priceVsMaSlowPct) ? `${ta.priceVsMaSlowPct.toFixed(1)}%` : null);
				} else if (base === "squeeze") {
					pushCheck(checks, `布林带宽分位 ≤ ${th.bbPctMax}%`, Number.isFinite(ta?.boll?.bandwidthPercentile) && ta.boll.bandwidthPercentile <= th.bbPctMax, Number.isFinite(ta?.boll?.bandwidthPercentile) ? `${ta.boll.bandwidthPercentile.toFixed(0)}%` : null);
					pushCheck(checks, "ATR 分位 ≤ 45%", Number.isFinite(ta?.atrPercentile) && ta.atrPercentile <= 45, Number.isFinite(ta?.atrPercentile) ? `${ta.atrPercentile.toFixed(0)}%` : null);
					pushCheck(checks, "价格贴近慢线 ±3%", Number.isFinite(ta?.priceVsMaSlowPct) && Math.abs(ta.priceVsMaSlowPct) <= 3, Number.isFinite(ta?.priceVsMaSlowPct) ? `${ta.priceVsMaSlowPct.toFixed(1)}%` : null);
					pushCheck(checks, `RSI ${th.rsiMin}–${th.rsiMax}`, Number.isFinite(rsi) && rsi >= th.rsiMin && rsi <= th.rsiMax, Number.isFinite(rsi) ? rsi.toFixed(1) : null);
					pushCheck(checks, "MACD 柱 ≥ 0 或金叉", (Number.isFinite(hist) && hist >= 0) || ta?.macdCross === "golden", ta?.macdCross ?? (Number.isFinite(hist) ? formatPrice(hist) : null));
					pushCheck(checks, "方向选择在即", ta?.breakout20 === true || (Number.isFinite(percentB) && percentB > 0.55), Number.isFinite(percentB) ? percentB.toFixed(2) : null);
				} else if (base === "divergence") {
					pushCheck(checks, "RSI 底背离", ta?.rsiDivergence === "bullish", ta?.rsiDivergence === "bullish" ? "是" : "否");
					pushCheck(checks, `RSI ≤ ${th.rsiMax}`, Number.isFinite(rsi) && rsi <= th.rsiMax, Number.isFinite(rsi) ? rsi.toFixed(1) : null);
					pushCheck(checks, `距 60 日高 ≤ ${th.distHigh}%`, Number.isFinite(distHigh) && distHigh <= th.distHigh, Number.isFinite(distHigh) ? `${distHigh.toFixed(1)}%` : null);
					pushCheck(checks, "已脱离 60 日低点", Number.isFinite(ta?.distanceLow60Pct) && ta.distanceLow60Pct >= 1, Number.isFinite(ta?.distanceLow60Pct) ? `${ta.distanceLow60Pct.toFixed(1)}%` : null);
					pushCheck(checks, "MACD 柱改善", Number.isFinite(hist) && Number.isFinite(prevHist) ? hist > prevHist : false, Number.isFinite(hist) && Number.isFinite(prevHist) ? formatPrice(hist) : null);
					pushCheck(checks, "K 线止跌形态", ["bullish-engulfing", "hammer"].includes(ta?.candle), ta?.candle ?? "");
				} else {
					pushCheck(checks, "趋势多头", trendBull, ta?.trend?.label ?? "--");
					pushCheck(checks, "价格 > 慢线", aboveSlow, Number.isFinite(ta?.maSlow) ? formatPrice(ta.maSlow) : null);
					pushCheck(checks, "MACD 柱 > 0", Number.isFinite(hist) && hist > 0, Number.isFinite(hist) ? formatPrice(hist) : null);
					pushCheck(checks, "RSI < 70", Number.isFinite(rsi) && rsi < 70, Number.isFinite(rsi) ? rsi.toFixed(1) : null);
					pushCheck(checks, "%B < 0.9", Number.isFinite(percentB) && percentB < 0.9, Number.isFinite(percentB) ? percentB.toFixed(2) : null);
				}
				return checks;
			}

			function presetLevels(ta) {
				const price = Number(ta?.price);
				const atr = Number(ta?.atr);
				if (!Number.isFinite(price) || !Number.isFinite(atr) || atr <= 0) return null;
				const th = settings.thresholds;
				const stop = Math.max(0, price - th.stopAtr * atr);
				const target = price + th.rr * (price - stop);
				const riskPct = ((price - stop) / price) * 100;
				const rewardPct = ((target - price) / price) * 100;
				return {
					stopLong: stop,
					targetLong: target,
					riskPct,
					rewardPct,
					rr: th.rr,
					support: Number.isFinite(ta.low60) ? ta.low60 : stop,
					resistance: Number.isFinite(ta.high60) ? ta.high60 : target,
				};
			}

			function presetAnalysis(ta) {
				const preset = activePreset();
				if (!ta || !preset) return null;
				const checks = presetChecks(ta);
				const passed = checks.filter((check) => check.pass).length;
				const total = checks.length || 1;
				const ratio = passed / total;
				const tone = ratio >= 0.8 ? "buy" : ratio >= 0.6 ? "add" : ratio >= 0.4 ? "watch" : "skip";
				const label = ratio >= 0.8 ? "买入" : ratio >= 0.6 ? "关注" : ratio >= 0.4 ? "等待" : "回避";
				const verdictText = ratio >= 0.8
					? `条件充分（${passed}/${total}），可按预设分批配置`
					: ratio >= 0.6
						? `接近（${passed}/${total}），等确认后分批`
						: ratio >= 0.4
							? `部分满足（${passed}/${total}），继续观察`
							: `不满足（${passed}/${total}），回避`;
				return { preset, checks, passed, total, ratio, tone, label, verdictText, levels: presetLevels(ta) };
			}

			// ---------- rows ----------

			function targetLabel(key) {
				const target = targets[key];
				if (!target || !Number.isFinite(Number(target.price))) return "";
				return `${target.direction === "below" ? "≤" : "≥"} ${formatPrice(Number(target.price))}${target.triggered ? " · 已触发" : ""}`;
			}

			function targetFormHtml(key) {
				const target = targets[key];
				const direction = target?.direction === "below" ? "below" : "above";
				return `<div class="dbw-target-form" data-target-form hidden>
          <select data-target-direction aria-label="触发方向"><option value="above"${direction === "above" ? " selected" : ""}>上破</option><option value="below"${direction === "below" ? " selected" : ""}>下破</option></select>
          <input data-target-price type="number" min="0" step="any" placeholder="目标价" aria-label="目标价" value="${Number.isFinite(Number(target?.price)) ? escapeHtml(target.price) : ""}" />
          <button class="dbw-mini-btn primary" type="button" data-target-save>保存</button>
          <button class="dbw-mini-btn" type="button" data-target-clear>清除</button>
        </div>`;
			}

			function buildCryptoRow(symbol) {
				const key = rowKey("crypto", symbol);
				const row = document.createElement("div");
				row.className = "dbw-row";
				row.dataset.key = key;
				row.dataset.kind = "crypto";
				row.dataset.symbol = symbol;
				row.innerHTML = `<div class="dbw-rowtop"><span class="dbw-symbol">${escapeHtml(displayCryptoSymbol(symbol))}</span><span class="dbw-badge" data-badge data-tone="neutral">--</span><button class="dbw-signal" type="button" data-signal-toggle data-tone="watch" hidden>--</button><span class="dbw-spacer"></span><button class="dbw-icon" type="button" data-target-toggle title="设置目标价" aria-label="设置目标价">⌖</button><button class="dbw-icon" type="button" data-remove="${escapeHtml(key)}" title="从自选移除" aria-label="从自选移除">×</button></div>
          <div class="dbw-grid">
            <div class="dbw-venue"><div class="dbw-venue-top"><span class="dbw-ex">Binance</span><span class="dbw-change" data-bn-change>--</span></div><div class="dbw-price" data-bn-price>--</div></div>
            <div class="dbw-venue"><div class="dbw-venue-top"><span class="dbw-ex">Bitget</span><span class="dbw-change" data-bg-change>--</span></div><div class="dbw-price" data-bg-price>--</div></div>
          </div>
          <div class="dbw-note"><span data-note>等待行情</span><span class="dbw-target-label" data-target-label></span></div>
          <div class="dbw-plan" data-plan hidden></div>
          <div class="dbw-strategy" data-strategy hidden></div>
          ${targetFormHtml(key)}`;
				rowRefs.set(key, {
					row,
					badge: row.querySelector("[data-badge]"),
					signal: row.querySelector("[data-signal-toggle]"),
					strategy: row.querySelector("[data-strategy]"),
					plan: row.querySelector("[data-plan]"),
					bnPrice: row.querySelector("[data-bn-price]"),
					bnChange: row.querySelector("[data-bn-change]"),
					bgPrice: row.querySelector("[data-bg-price]"),
					bgChange: row.querySelector("[data-bg-change]"),
					note: row.querySelector("[data-note]"),
					targetLabel: row.querySelector("[data-target-label]"),
					editor: row.querySelector("[data-target-form]"),
				});
				return row;
			}

			function buildStockRow(symbol) {
				const key = rowKey("stock", symbol);
				const row = document.createElement("div");
				row.className = "dbw-row";
				row.dataset.key = key;
				row.dataset.kind = "stock";
				row.dataset.symbol = symbol;
				row.innerHTML = `<div class="dbw-rowtop"><span class="dbw-symbol">${escapeHtml(symbol)}</span><span class="dbw-name" data-name>${escapeHtml(suggestedStockName(symbol))}</span><span class="dbw-badge" data-badge data-tone="neutral">--</span><button class="dbw-signal" type="button" data-signal-toggle data-tone="watch" hidden>--</button><button class="dbw-icon" type="button" data-target-toggle title="设置目标价" aria-label="设置目标价">⌖</button><button class="dbw-icon" type="button" data-remove="${escapeHtml(key)}" title="从自选移除" aria-label="从自选移除">×</button></div>
          <div class="dbw-stockline"><span class="dbw-bigprice" data-price>--</span><span class="dbw-change" data-change>--</span></div>
          <div class="dbw-note"><span data-note>等待行情</span><span class="dbw-target-label" data-target-label></span></div>
          <div class="dbw-plan" data-plan hidden></div>
          <div class="dbw-strategy" data-strategy hidden></div>
          ${targetFormHtml(key)}`;
				rowRefs.set(key, {
					row,
					badge: row.querySelector("[data-badge]"),
					signal: row.querySelector("[data-signal-toggle]"),
					strategy: row.querySelector("[data-strategy]"),
					plan: row.querySelector("[data-plan]"),
					name: row.querySelector("[data-name]"),
					price: row.querySelector("[data-price]"),
					change: row.querySelector("[data-change]"),
					note: row.querySelector("[data-note]"),
					targetLabel: row.querySelector("[data-target-label]"),
					editor: row.querySelector("[data-target-form]"),
				});
				return row;
			}

			function suggestedStockName(symbol) {
				const found = STOCK_SUGGESTIONS.find((item) => item.symbol === symbol);
				return found ? found.name : symbol;
			}

			function setPrice(el, value) {
				el.textContent = formatPrice(value);
			}

			function setChange(el, value) {
				el.textContent = formatChange(value);
				el.className = `dbw-change ${changeClass(value)}`;
			}

			function setBadge(el, label) {
				el.textContent = label ?? "--";
				el.dataset.tone = toneOf(label);
			}

			function renderStrategy(el, ta, kind, symbol) {
				const analysis = presetAnalysis(ta);
				if (!analysis) {
					el.hidden = true;
					el.replaceChildren();
					return;
				}
				const label = kind === "crypto" ? displayCryptoSymbol(symbol) : symbol;
				const levels = analysis.levels;
				const indicators = [];
				if (Number.isFinite(ta?.rsi)) indicators.push(`RSI${settings.rsiPeriod} ${ta.rsi.toFixed(1)}`);
				if (Number.isFinite(ta?.kdj?.k)) indicators.push(`KDJ ${ta.kdj.k.toFixed(0)}/${ta.kdj.d.toFixed(0)}`);
				if (Number.isFinite(ta?.adx?.adx)) indicators.push(`ADX ${ta.adx.adx.toFixed(0)}`);
				if (Number.isFinite(ta?.macd?.hist)) indicators.push(`MACD柱 ${formatPrice(ta.macd.hist)}`);
				if (Number.isFinite(ta?.boll?.percentB)) indicators.push(`%B ${ta.boll.percentB.toFixed(2)}`);
				if (Number.isFinite(ta?.volumeRatio)) indicators.push(`量比 ${ta.volumeRatio.toFixed(2)}`);
				if (Number.isFinite(ta?.distanceHigh60Pct)) indicators.push(`距高 ${ta.distanceHigh60Pct.toFixed(1)}%`);
				if (Number.isFinite(ta?.boll?.bandwidthPercentile)) indicators.push(`布林分位 ${ta.boll.bandwidthPercentile.toFixed(0)}%`);
				if (Number.isFinite(ta?.atrPercentile)) indicators.push(`ATR分位 ${ta.atrPercentile.toFixed(0)}%`);
				if (ta?.rsiDivergence) indicators.push(`背离 ${ta.rsiDivergence === "bullish" ? "底" : "顶"}`);
				if (ta?.candle) indicators.push(`形态 ${ta.candle}`);
				const checks = analysis.checks.map((check) => `<div class="dbw-checklist-row">${check.pass ? "✅" : "❌"} ${escapeHtml(check.label)}${check.value === null ? "" : ` <em>${escapeHtml(String(check.value))}</em>`}</div>`).join("");
				el.innerHTML = `<div class="dbw-strategy-head"><span>${escapeHtml(analysis.preset.name)} · ${escapeHtml(analysis.label)}</span><em>${analysis.passed}/${analysis.total}</em></div>`
					+ `<div class="dbw-strategy-sub">${escapeHtml(label)} · ${escapeHtml(analysis.preset.desc || PRESET_BASE_LABELS[analysis.preset.base])}</div>`
					+ `<div class="dbw-checklist"><div class="dbw-checklist-title">预设条件 ${analysis.passed}/${analysis.total}</div>${checks}<div class="dbw-checklist-verdict" data-verdict="${analysis.tone}">${escapeHtml(analysis.verdictText)}</div></div>`
					+ (levels ? `<div class="dbw-strategy-levels">入场 ${formatPrice(ta.price)} · 止损 ${formatPrice(levels.stopLong)} (−${levels.riskPct.toFixed(1)}%) · 目标 ${formatPrice(levels.targetLong)} (+${levels.rewardPct.toFixed(1)}%) · 盈亏比 ${levels.rr.toFixed(1)}<br>支撑 ${formatPrice(levels.support)} · 压力 ${formatPrice(levels.resistance)}</div>` : "")
					+ (indicators.length ? `<div class="dbw-strategy-ind">${escapeHtml(indicators.join(" · "))}</div>` : "")
					+ `<div class="dbw-strategy-note">按预设条件计算；止损=${settings.thresholds.stopAtr}×ATR，目标=${settings.thresholds.rr}×风险。</div>`;
			}

			function updateSignalAndStrategy(refs, key, kind, symbol, ta) {
				const analysis = settings.showSignals && ta ? presetAnalysis(ta) : null;
				if (refs.row) {
					refs.row.dataset.ratio = analysis ? analysis.ratio.toFixed(3) : "";
					refs.row.dataset.sig = analysis?.label ?? "";
				}
				if (refs.signal) {
					refs.signal.hidden = !analysis;
					if (analysis) {
						refs.signal.textContent = analysis.label;
						refs.signal.dataset.tone = analysis.tone === "skip" ? "reduce" : analysis.tone;
						refs.signal.title = `${analysis.preset.name}：${analysis.passed}/${analysis.total} 条件满足 · 点击查看依据`;
					}
				}
				if (refs.strategy) {
					const open = Boolean(analysis) && openStrategy.has(key);
					if (!open) {
						refs.strategy.hidden = true;
					} else {
						renderStrategy(refs.strategy, ta, kind, symbol);
						refs.strategy.hidden = false;
					}
				}
				if (refs.signal) refs.signal.dataset.open = String(Boolean(analysis) && openStrategy.has(key));
				if (refs.plan) {
					const levels = analysis?.levels;
					const showPlan = Boolean(analysis && levels);
					refs.plan.hidden = !showPlan;
					if (showPlan) {
						const reward = Number.isFinite(levels.rewardPct) ? `+${levels.rewardPct.toFixed(1)}%` : "--";
						const risk = Number.isFinite(levels.riskPct) ? `-${levels.riskPct.toFixed(1)}%` : "--";
						refs.plan.textContent = `目标 ${formatPrice(levels.targetLong)} (${reward}) · 止损 ${formatPrice(levels.stopLong)} (${risk}) · 盈亏比 ${levels.rr.toFixed(1)}`;
					}
				}
			}

			function toggleStrategy(row) {
				const key = row?.dataset.key;
				if (!key) return;
				const panel = row.querySelector("[data-strategy]");
				if (!panel) return;
				const [kind, symbol] = splitKey(key);
				const ta = kind === "crypto" ? quotes.get(symbol)?.ta : stockQuotes.get(symbol)?.ta;
				const willOpen = panel.hidden;
				if (!willOpen) {
					openStrategy.delete(key);
					panel.hidden = true;
					const btn = row.querySelector("[data-signal-toggle]");
					if (btn) btn.dataset.open = "false";
					return;
				}
				openStrategy.add(key);
				const analysis = ta ? presetAnalysis(ta) : null;
				if (analysis) {
					renderStrategy(panel, ta, kind, symbol);
					panel.hidden = false;
				}
				const btn = row.querySelector("[data-signal-toggle]");
				if (btn) btn.dataset.open = String(Boolean(analysis));
			}

			function updateCryptoRow(key, row) {
				const refs = rowRefs.get(key);
				if (!refs) return;
				const binance = row?.binance;
				const bitget = row?.bitget;
				setPrice(refs.bnPrice, binance?.price);
				setChange(refs.bnChange, binance?.changePct);
				setPrice(refs.bgPrice, bitget?.price);
				setChange(refs.bgChange, bitget?.changePct);
				if (refs.row) refs.row.dataset.change = String(Number.isFinite(binance?.changePct) ? binance.changePct : 0);
				const trend = cryptoTrend(row);
				setBadge(refs.badge, trend?.label);
				const ta = row?.ta ?? null;
				updateSignalAndStrategy(refs, key, "crypto", splitKey(key)[1], ta);
				const parts = [];
				const change7d = Number.isFinite(ta?.change7dPct) ? ta.change7dPct : trend?.change7dPct;
				if (Number.isFinite(change7d)) parts.push(`7d ${formatChange(change7d)}`);
				const position = Number.isFinite(ta?.rangePosition)
					? ta.rangePosition
					: Number.isFinite(trend?.rangePosition)
						? trend.rangePosition
						: rangePosition(binance?.price, binance?.lowPrice, binance?.highPrice) ?? rangePosition(bitget?.price, bitget?.lowPrice, bitget?.highPrice);
				if (Number.isFinite(position)) parts.push(`区间 ${Math.round(position * 100)}%`);
				if (!row) parts.length = 0;
				refs.note.textContent = parts.length ? parts.join(" · ") : "等待行情";
				refs.targetLabel.textContent = targetLabel(key);
			}

			function updateStockRow(key, row) {
				const refs = rowRefs.get(key);
				if (!refs) return;
				const trend = stockTrend(row);
				setBadge(refs.badge, trend?.label);
				setPrice(refs.price, row?.price);
				setChange(refs.change, row?.changePct);
				if (refs.row) refs.row.dataset.change = String(Number.isFinite(row?.changePct) ? row.changePct : 0);
				if (row?.name) refs.name.textContent = row.name;
				const ta = row?.ta ?? null;
				updateSignalAndStrategy(refs, key, "stock", splitKey(key)[1], ta);
				const parts = [];
				const slowMa = Number.isFinite(ta?.maSlow) ? ta.maSlow : row?.ma20;
				if (Number.isFinite(slowMa)) parts.push(`MA${settings.maSlow} ${formatPrice(slowMa)}`);
				const change5d = Number.isFinite(ta?.change5dPct) ? ta.change5dPct : row?.change5dPct;
				if (Number.isFinite(change5d)) parts.push(`5d ${formatChange(change5d)}`);
				else if (Number.isFinite(row?.change20dPct)) parts.push(`20d ${formatChange(row.change20dPct)}`);
				if (!row) parts.length = 0;
				refs.note.textContent = parts.length ? parts.join(" · ") : "等待行情";
				refs.targetLabel.textContent = targetLabel(key);
			}

			function updateRow(key) {
				const [kind, symbol] = splitKey(key);
				if (kind === "crypto") updateCryptoRow(key, quotes.get(symbol));
				else updateStockRow(key, stockQuotes.get(symbol));
				const refs = rowRefs.get(key);
				if (refs && editorOpen.has(key)) refs.editor.hidden = false;
			}

			function rebuildRows() {
				const scrollTop = list.scrollTop;
				for (const refs of rowRefs.values()) drafts.set(refs.row.dataset.key, readDraft(refs.row));
				rowContainers.crypto.replaceChildren();
				rowContainers.stock.replaceChildren();
				rowRefs.clear();
				for (const symbol of state.crypto) rowContainers.crypto.append(buildCryptoRow(symbol));
				for (const symbol of state.stocks) rowContainers.stock.append(buildStockRow(symbol));
				for (const [key, refs] of rowRefs) {
					const draft = drafts.get(key);
					if (draft) restoreDraft(refs.row, draft);
					if (editorOpen.has(key)) refs.editor.hidden = false;
				}
				requestAnimationFrame(() => {
					list.scrollTop = scrollTop;
					clampPosition();
				});
			}

			function readDraft(row) {
				const editor = row.querySelector("[data-target-form]");
				if (!editor || editor.hidden) return null;
				return {
					price: editor.querySelector("[data-target-price]")?.value ?? "",
					direction: editor.querySelector("[data-target-direction]")?.value ?? "above",
				};
			}

			function restoreDraft(row, draft) {
				const editor = row.querySelector("[data-target-form]");
				if (!editor) return;
				const priceInput = editor.querySelector("[data-target-price]");
				const direction = editor.querySelector("[data-target-direction]");
				if (priceInput && draft.price) priceInput.value = draft.price;
				if (direction && draft.direction) direction.value = draft.direction;
			}

			function syncRows(force = false) {
				const keys = [...state.crypto.map((symbol) => rowKey("crypto", symbol)), ...state.stocks.map((symbol) => rowKey("stock", symbol))];
				const signature = keys.join("|");
				if (force || signature !== renderedKeys) {
					rebuildRows();
					renderedKeys = signature;
				}
				for (const key of keys) updateRow(key);
				countEls.crypto.textContent = String(state.crypto.length);
				countEls.stock.textContent = String(state.stocks.length);
				sectionEls.crypto.hidden = state.crypto.length === 0;
				sectionEls.stock.hidden = state.stocks.length === 0;
				emptyEl.hidden = keys.length > 0;
				if (tabCounts.watchlist) tabCounts.watchlist.textContent = String(keys.length);
				for (const section of list.querySelectorAll(".dbw-section")) {
					[...section.querySelectorAll(".dbw-row")].forEach((row, index) => { row.dataset.order = String(index); });
				}
				applyRowOrder();
			}

			function flashRow(key, scroll = false) {
				const refs = rowRefs.get(key);
				if (!refs) return;
				refs.row.dataset.flash = "true";
				if (scroll) refs.row.scrollIntoView({ block: "nearest" });
				window.setTimeout(() => { delete refs.row.dataset.flash; }, 1000);
			}

			// ---------- quotes ----------

			function priceFor(key) {
				const [kind, symbol] = splitKey(key);
				if (kind === "crypto") {
					const row = quotes.get(symbol);
					const price = [row?.binance?.price, row?.bitget?.price].find(Number.isFinite);
					return Number.isFinite(price) ? price : null;
				}
				const row = stockQuotes.get(symbol);
				return Number.isFinite(row?.price) ? row.price : null;
			}

			function checkTargets() {
				let changed = false;
				for (const [key, target] of Object.entries(targets)) {
					if (!target || target.triggered || !Number.isFinite(Number(target.price))) continue;
					const price = priceFor(key);
					if (!Number.isFinite(price)) continue;
					const hit = target.direction === "below" ? price <= Number(target.price) : price >= Number(target.price);
					if (!hit) continue;
					target.triggered = true;
					changed = true;
					const symbol = splitKey(key)[1];
					const direction = target.direction === "below" ? "下破" : "上破";
					const text = `${symbol} ${direction} ${formatPrice(Number(target.price))}，现价 ${formatPrice(price)}`;
					showToast(`目标价触发 · ${text}`);
					notifyTarget(key, text);
					updateRow(key);
				}
				if (changed) writeJson(TARGETS_KEY, targets);
			}

			function notifyTarget(key, text) {
				try {
					if ("Notification" in window && Notification.permission === "granted") {
						new Notification("DSH 自选提醒", { body: text, tag: `dsh-target-${key}` });
					}
				} catch {}
			}

			function requestNotifications() {
				try {
					if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
				} catch {}
			}

			function updateAge() {
				if (!lastUpdate) {
					updatedEl.textContent = "等待数据";
					updatedEl.dataset.stale = "false";
					return;
				}
				const age = Math.max(0, Math.round((Date.now() - lastUpdate) / 1000));
				if (lastError) {
					updatedEl.textContent = `离线 ${age}s`;
					updatedEl.dataset.stale = "error";
					return;
				}
				updatedEl.textContent = age <= 1 ? "刚刚更新" : `更新于 ${age}s 前`;
				updatedEl.dataset.stale = age > 12 ? "true" : "false";
			}

			async function refresh(manual = false) {
				if (disposed) return;
				void syncRemoteState(false);
				if (inFlight) {
					if (manual) queued = true;
					return;
				}
				inFlight = true;
				refreshBtn.dataset.busy = "true";
				setStatus("更新中", "loading");
				const symbols = state.crypto.length > 0 ? state.crypto : [DEFAULT_CRYPTO[0]];
				const controller = new AbortController();
				const timer = window.setTimeout(() => controller.abort(), 15000);
				try {
					const url = `${QUOTES_URL}?symbols=${encodeURIComponent(symbols.join(","))}&stocks=${encodeURIComponent(state.stocks.join(","))}${taQuery(settings)}`;
					const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
					const payload = await response.json().catch(() => null);
					if (!response.ok || !payload) throw new Error(payload?.error ?? `HTTP ${response.status}`);
					quotes = new Map((Array.isArray(payload.quotes) ? payload.quotes : []).map((row) => [row.symbol, row]));
					stockQuotes = new Map((Array.isArray(payload.stocks) ? payload.stocks : []).map((row) => [row.symbol, row]));
					aggregate = { crypto: payload.trend?.crypto ?? null, stock: payload.trend?.stock ?? null };
					const errors = payload.errors && typeof payload.errors === "object" ? Object.keys(payload.errors) : [];
					lastError = errors.join("/");
					lastUpdate = Date.now();
					syncRows();
					updateSectionBreadth();
					updateMarketCards();
					checkTargets();
					updateAge();
					setStatus(errors.length ? `${errors.join("/")}异常` : "已连接", errors.length ? "error" : "ok");
					const rows = [];
					for (const [symbol, row] of quotes) rows.push({ key: `crypto:${symbol}`, symbol, name: displayCryptoSymbol(symbol), ta: row.ta ?? null });
					for (const [symbol, row] of stockQuotes) rows.push({ key: `stock:${symbol}`, symbol, name: row.name || symbol, ta: row.ta ?? null });
					scanAlerts(rows);
					updateOpps(rows);
					applyRowOrder();
				} catch (error) {
					lastError = "网络";
					setStatus("连接失败", "error");
					updateAge();
				} finally {
					window.clearTimeout(timer);
					inFlight = false;
					delete refreshBtn.dataset.busy;
					if (queued && !disposed) {
						queued = false;
						void refresh(false);
					}
				}
			}

			function schedulePoll() {
				window.clearTimeout(pollTimer);
				if (disposed || document.hidden) return;
				pollTimer = window.setTimeout(async () => {
					await refresh(false);
					schedulePoll();
				}, settings.interval);
			}

			function onVisibilityChange() {
				if (document.hidden) {
					window.clearTimeout(pollTimer);
					window.clearTimeout(marketTimer);
					pollTimer = 0;
					marketTimer = 0;
					return;
				}
				void refresh(false);
				void refreshMarket();
				schedulePoll();
				scheduleMarket();
			}

			// ---------- search ----------

			function hideResults() {
				searchToken += 1;
				searchAbort?.abort();
				resultsEl.hidden = true;
				resultsEl.replaceChildren();
				searchResults = [];
				activeIndex = -1;
			}

			function showSearchLoading() {
				resultsEl.hidden = false;
				resultsEl.innerHTML = `<div class="dbw-result-empty">搜索中…</div>`;
			}

			function setResults(items) {
				searchResults = Array.isArray(items) ? items.slice(0, 12) : [];
				activeIndex = searchResults.length > 0 ? 0 : -1;
				renderResults();
			}

			function renderResults() {
				resultsEl.hidden = false;
				if (searchResults.length === 0) {
					resultsEl.innerHTML = `<div class="dbw-result-empty">没有匹配项 · 直接输入完整代码试试</div>`;
					return;
				}
				resultsEl.innerHTML = searchResults.map((item, index) => {
					const kindLabel = item.kind === "stock" ? "美" : "币";
					const symbol = item.kind === "crypto" ? displayCryptoSymbol(item.symbol) : item.symbol;
					const venueText = item.kind === "crypto"
						? (Array.isArray(item.venues) && item.venues.length ? item.venues.map((venue) => venue === "binance" ? "Binance" : venue === "bitget" ? "Bitget" : venue).join(" · ") : "加密")
						: (item.name || item.exchange || "美股");
					const priceHtml = Number.isFinite(item.price)
						? `<b>${formatPrice(item.price)}</b><span class="dbw-change ${changeClass(item.changePct)}">${formatChange(item.changePct)}</span>`
						: `<b>+ 加入</b>`;
					return `<div class="dbw-result" data-add="${escapeHtml(`${item.kind}:${item.symbol}`)}" data-active="${index === activeIndex}"><span class="dbw-result-kind" data-kind="${item.kind === "stock" ? "stock" : "crypto"}">${kindLabel}</span><div class="dbw-result-main"><div class="dbw-result-symbol">${escapeHtml(symbol)}</div><div class="dbw-result-name">${escapeHtml(venueText)}</div></div><div class="dbw-result-price">${priceHtml}</div></div>`;
				}).join("");
			}

			function moveActive(delta) {
				if (searchResults.length === 0) return;
				activeIndex = (activeIndex + delta + searchResults.length) % searchResults.length;
				const nodes = resultsEl.querySelectorAll(".dbw-result");
				nodes.forEach((node, index) => { node.dataset.active = String(index === activeIndex); });
				nodes[activeIndex]?.scrollIntoView({ block: "nearest" });
			}

			function localSearch(query) {
				const needle = query.toUpperCase();
				const items = [];
				for (const base of CRYPTO_BASES) {
					if (!base.startsWith(needle)) continue;
					items.push({ kind: "crypto", symbol: `${base}USDT`, base, quote: "USDT", venues: ["binance", "bitget"], price: null, changePct: null });
				}
				for (const item of STOCK_SUGGESTIONS) {
					if (!item.symbol.startsWith(needle) && !item.name.toUpperCase().includes(needle)) continue;
					items.push({ kind: "stock", symbol: item.symbol, name: item.name, venues: [], price: null, changePct: null });
				}
				return items.slice(0, 10);
			}

			async function runSearch(rawQuery) {
				const query = rawQuery.trim();
				if (!query) {
					hideResults();
					return;
				}
				const token = ++searchToken;
				searchAbort?.abort();
				const controller = new AbortController();
				searchAbort = controller;
				showSearchLoading();
				try {
					const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=8`, { signal: controller.signal, cache: "no-store" });
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					const payload = await response.json();
					if (token !== searchToken) return;
					searchDegraded = false;
					setResults(Array.isArray(payload.results) ? payload.results : []);
				} catch (error) {
					if (controller.signal.aborted || token !== searchToken) return;
					searchDegraded = true;
					setResults(localSearch(query));
				}
			}

			function directAdd() {
				const raw = input.value.trim().toUpperCase();
				if (!raw) return;
				if (CRYPTO_RE.test(raw) && CRYPTO_QUOTES.some((quote) => raw.endsWith(quote) && raw.length > quote.length)) {
					addEntry("crypto", raw);
					return;
				}
				if (CRYPTO_BASES.includes(raw)) {
					addEntry("crypto", `${raw}USDT`);
					return;
				}
				if (STOCK_SUGGESTIONS.some((item) => item.symbol === raw)) {
					addEntry("stock", raw);
					return;
				}
				showToast(searchDegraded ? "搜索数据暂不可用，可输入完整交易对（如 BTCUSDT）" : "没有匹配项，换个关键词试试");
			}

			function addEntry(kind, rawSymbol) {
				const symbol = String(rawSymbol ?? "").trim().toUpperCase();
				if (!symbol) return;
				if (kind === "crypto" && !CRYPTO_RE.test(symbol)) {
					showToast("无效交易对，示例 BTCUSDT");
					return;
				}
				if (kind === "stock" && !STOCK_RE.test(symbol)) {
					showToast("无效美股代码，示例 AAPL");
					return;
				}
				const listRef = kind === "crypto" ? state.crypto : state.stocks;
				if (listRef.includes(symbol)) {
					showToast(`${symbol} 已在自选中`);
					flashRow(rowKey(kind, symbol), true);
					input.value = "";
					hideResults();
					return;
				}
				if (listRef.length >= (kind === "crypto" ? MAX_CRYPTO : MAX_STOCKS)) {
					showToast(kind === "crypto" ? `加密自选最多 ${MAX_CRYPTO} 个` : `美股自选最多 ${MAX_STOCKS} 个`);
					return;
				}
				listRef.push(symbol);
				saveWatchlist(state);
				queueStatePush();
				syncRows(true);
				flashRow(rowKey(kind, symbol), true);
				input.value = "";
				hideResults();
				showToast(`已加入 ${symbol}`);
				void refresh(false);
			}

			function removeEntry(key) {
				const [kind, symbol] = splitKey(key);
				if (kind === "crypto") state.crypto = state.crypto.filter((item) => item !== symbol);
				else state.stocks = state.stocks.filter((item) => item !== symbol);
				delete targets[key];
				editorOpen.delete(key);
				drafts.delete(key);
				saveWatchlist(state);
				writeJson(TARGETS_KEY, targets);
				queueStatePush();
				syncRows(true);
				showToast(`已移除 ${symbol}`);
				void refresh(false);
			}

			// ---------- target editor ----------

			function toggleTargetEditor(row) {
				const key = row?.dataset.key;
				if (!key) return;
				const editor = row.querySelector("[data-target-form]");
				if (!editor) return;
				const willOpen = editor.hidden;
				editor.hidden = !willOpen;
				if (willOpen) {
					editorOpen.add(key);
					const priceInput = editor.querySelector("[data-target-price]");
					priceInput?.focus();
					priceInput?.select();
				} else {
					editorOpen.delete(key);
				}
			}

			function saveTarget(row) {
				const key = row?.dataset.key;
				if (!key) return;
				const [, symbol] = splitKey(key);
				const editor = row.querySelector("[data-target-form]");
				const price = Number(editor?.querySelector("[data-target-price]")?.value);
				const direction = editor?.querySelector("[data-target-direction]")?.value === "below" ? "below" : "above";
				if (!Number.isFinite(price) || price <= 0) {
					showToast("请输入有效目标价");
					return;
				}
				targets[key] = { price, direction, triggered: false };
				writeJson(TARGETS_KEY, targets);
				queueStatePush();
				editor.hidden = true;
				editorOpen.delete(key);
				updateRow(key);
				requestNotifications();
				showToast(`${symbol} 目标 ${direction === "below" ? "≤" : "≥"} ${formatPrice(price)}`);
			}

			function clearTarget(row) {
				const key = row?.dataset.key;
				if (!key) return;
				delete targets[key];
				writeJson(TARGETS_KEY, targets);
				queueStatePush();
				const editor = row.querySelector("[data-target-form]");
				if (editor) {
					editor.hidden = true;
					const priceInput = editor.querySelector("[data-target-price]");
					if (priceInput) priceInput.value = "";
				}
				editorOpen.delete(key);
				updateRow(key);
				showToast("已清除目标价");
			}

			// ---------- drag ----------

			function savePosition() {
				if (!root.style.top) return;
				writeJson(POSITION_KEY, { x: root.offsetLeft, y: root.offsetTop });
			}

			function clampPosition() {
				if (embedded || !root.style.top) return;
				const rect = root.getBoundingClientRect();
				const maxX = Math.max(4, window.innerWidth - rect.width - 4);
				const maxY = Math.max(4, window.innerHeight - rect.height - 4);
				const x = clamp(rect.left, 4, maxX);
				const y = clamp(rect.top, 4, maxY);
				if (Math.abs(x - rect.left) > 0.5 || Math.abs(y - rect.top) > 0.5) {
					root.style.left = `${x}px`;
					root.style.top = `${y}px`;
					savePosition();
				}
			}

			function onPointerDown(event) {
				if (embedded) return;
				if (event.button !== 0 && event.pointerType === "mouse") return;
				if (event.target.closest("button,input,select,a")) return;
				const rect = root.getBoundingClientRect();
				drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top, moved: false };
				head.setPointerCapture?.(event.pointerId);
			}

			function onPointerMove(event) {
				if (!drag || event.pointerId !== drag.pointerId) return;
				const dx = event.clientX - drag.startX;
				const dy = event.clientY - drag.startY;
				if (!drag.moved) {
					if (Math.hypot(dx, dy) < 4) return;
					drag.moved = true;
					root.style.bottom = "auto";
					root.style.top = `${drag.top}px`;
					root.style.left = `${drag.left}px`;
					document.body.style.userSelect = "none";
				}
				dragMoved = true;
				const width = root.offsetWidth;
				const height = root.offsetHeight;
				const x = clamp(drag.left + dx, 4, Math.max(4, window.innerWidth - width - 4));
				const y = clamp(drag.top + dy, 4, Math.max(4, window.innerHeight - height - 4));
				root.style.left = `${x}px`;
				root.style.top = `${y}px`;
			}

			function onPointerUp(event) {
				if (!drag) return;
				if (event && event.pointerId !== undefined && event.pointerId !== drag.pointerId) return;
				const moved = drag.moved;
				drag = null;
				document.body.style.userSelect = "";
				if (moved) {
					savePosition();
					window.setTimeout(() => { dragMoved = false; }, 0);
				}
			}

			// ---------- events ----------

			function toggleCollapse() {
				if (embedded) return;
				const collapsed = root.dataset.collapsed === "true";
				root.dataset.collapsed = collapsed ? "false" : "true";
				collapseBtn.textContent = collapsed ? "−" : "+";
				writeJson(COLLAPSED_KEY, !collapsed);
				requestAnimationFrame(clampPosition);
			}

			function onClick(event) {
				if (dragMoved) {
					dragMoved = false;
					return;
				}
				const target = event.target;
				const tabBtn = target.closest(".dbw-tab");
				if (tabBtn) { setTab(tabBtn.dataset.tab); return; }
				if (target.closest("[data-strip]")) { setTab("market"); return; }
				const action = target.closest("[data-action]")?.dataset.action;
				if (action === "settings") { toggleSettings(); return; }
				if (action === "reset-settings") { resetSettings(); return; }
				if (action === "alerts") { toggleAlertsPanel(); return; }
				if (action === "alerts-clear") { clearAlerts(); return; }
				if (action === "filter-opps") {
					settings.onlyOpps = !settings.onlyOpps;
					saveSettings(settings);
					syncSettingsUI();
					applyRowOrder();
					return;
				}
				if (action === "sort") {
					const order = ["default", "signal", "change"];
					settings.sort = order[(order.indexOf(settings.sort) + 1) % order.length];
					saveSettings(settings);
					applyRowOrder();
					return;
				}
				if (action === "dist") {
					settings.distOpen = settings.distOpen === false;
					saveSettings(settings);
					applyDistributionState();
					return;
				}
				const oppChip = target.closest("[data-opp]");
				if (oppChip) { flashRow(oppChip.dataset.opp, true); return; }
				if (action === "preset-new") { newPresetCopy(); return; }
				if (action === "preset-save") { commitPresetEdit(); showToast("已保存自定义预设"); return; }
				if (action === "preset-delete") { deletePreset(); return; }
				const presetChip = target.closest("[data-preset]");
				if (presetChip) { applyPresetById(presetChip.dataset.preset); return; }
				if (action === "collapse") { toggleCollapse(); return; }
				if (action === "refresh") { void refresh(true); void refreshMarket(); return; }
				const add = target.closest("[data-add]");
				if (add) {
					const [kind, symbol] = splitKey(add.dataset.add ?? "");
					addEntry(kind, symbol);
					return;
				}
				const row = target.closest(".dbw-row");
				if (!row) return;
				const remove = target.closest("[data-remove]");
				if (remove) { removeEntry(remove.dataset.remove); return; }
				if (target.closest("[data-signal-toggle]")) { toggleStrategy(row); return; }
				if (target.closest("[data-target-toggle]")) { toggleTargetEditor(row); return; }
				if (target.closest("[data-target-save]")) { saveTarget(row); return; }
				if (target.closest("[data-target-clear]")) { clearTarget(row); return; }
			}

			function onInputChange() {
				const row = document.activeElement?.closest?.(".dbw-row");
				if (!row) return;
				const draft = readDraft(row);
				if (draft) drafts.set(row.dataset.key, draft);
			}

			function onSearchInput() {
				window.clearTimeout(searchTimer);
				const query = input.value.trim();
				if (!query) {
					hideResults();
					return;
				}
				searchTimer = window.setTimeout(() => { void runSearch(query); }, 180);
			}

			function onSearchKeyDown(event) {
				if (event.key === "ArrowDown") {
					event.preventDefault();
					moveActive(1);
					return;
				}
				if (event.key === "ArrowUp") {
					event.preventDefault();
					moveActive(-1);
					return;
				}
				if (event.key === "Enter") {
					event.preventDefault();
					const raw = input.value.trim().toUpperCase();
					const exact = searchResults.find((item) => item.symbol === raw || (item.kind === "crypto" && item.base === raw));
					const item = exact ?? searchResults[activeIndex] ?? searchResults[0];
					if (item) addEntry(item.kind, item.symbol);
					else directAdd();
					return;
				}
				if (event.key === "Escape") {
					event.preventDefault();
					hideResults();
					input.blur();
				}
			}

			function onDocumentClick(event) {
				if (!resultsEl.hidden && !event.target.closest(".dbw-search, [data-results]")) hideResults();
			}

			head.addEventListener("pointerdown", onPointerDown);
			head.addEventListener("dblclick", (event) => {
				if (event.target.closest("button")) return;
				toggleCollapse();
			});
			window.addEventListener("pointermove", onPointerMove);
			window.addEventListener("pointerup", onPointerUp);
			window.addEventListener("pointercancel", onPointerUp);
			window.addEventListener("resize", clampPosition);
			window.addEventListener("blur", onPointerUp);
			document.addEventListener("visibilitychange", onVisibilityChange);
			document.addEventListener("click", onDocumentClick);
			root.addEventListener("click", onClick);
			root.addEventListener("input", onInputChange);
			root.addEventListener("input", onSettingsInput);
			root.addEventListener("change", onSettingsChange);
			input.addEventListener("input", onSearchInput);
			input.addEventListener("keydown", onSearchKeyDown);

			fillSettingOptions();
			syncSettingsUI();
			renderPresetChips();
			syncPresetEditor();
			renderAlerts();
			applyTab();
			applyDistributionState();
			syncRows(true);
			void syncRemoteState(true);
			requestAnimationFrame(clampPosition);
			updateMarketCards();
			void refresh(false);
			void refreshMarket();
			schedulePoll();
			scheduleMarket();
			ageTimer = window.setInterval(updateAge, 1000);
			stateTimer = window.setInterval(() => { void syncRemoteState(false); }, 20000);

			const dispose = () => {
				disposed = true;
				window.clearTimeout(pollTimer);
				window.clearTimeout(marketTimer);
				window.clearInterval(ageTimer);
				window.clearInterval(stateTimer);
				window.clearTimeout(statePushTimer);
				window.clearTimeout(toastTimer);
				window.clearTimeout(searchTimer);
				searchAbort?.abort();
				head.removeEventListener("pointerdown", onPointerDown);
				window.removeEventListener("pointermove", onPointerMove);
				window.removeEventListener("pointerup", onPointerUp);
				window.removeEventListener("pointercancel", onPointerUp);
				window.removeEventListener("resize", clampPosition);
				window.removeEventListener("blur", onPointerUp);
				document.removeEventListener("visibilitychange", onVisibilityChange);
				document.removeEventListener("click", onDocumentClick);
				document.body.style.userSelect = "";
				root.remove();
				document.querySelector(".dbw-toast")?.remove();
			};
			if (!embedded) ctx.effect(() => dispose, "dsh-crypto-us-stock-monitor: ui");
			return dispose;
		}

		function apply(ctx) {
			ensureStyle(ctx);
			if (!document.querySelector("style[data-dbw-dashboard-style]")) {
				const dashStyle = document.createElement("style");
				dashStyle.dataset.dbwDashboardStyle = "1";
				dashStyle.textContent = dashboardCss;
				document.head.append(dashStyle);
				ctx?.effect?.(() => () => dashStyle.remove(), "dsh-crypto-us-stock-monitor: dashboard style");
			}
			const slots = ctx.slots;
			if (!slots?.inject || !slots?.register) {
				// 仅本地 UI 测试允许悬浮回退；真实 DSH 永远不渲染悬浮窗
				if (window.__DBW_TEST_FALLBACK__ === true) mountPanel(ctx, document.body);
				return;
			}
			const React = require("react");
			const h = React.createElement;
			const panel = () => {
				const layout = ctx.layout ?? ctx.get?.("layout");
				layout?.selectPanel?.(PLUGIN_ID);
			};

			function SidebarIcon({ size = 18 } = {}) {
				const [tip, setTip] = React.useState("加密美股监控");
				const [change, setChange] = React.useState(null);
				const stopped = React.useRef(false);
				React.useEffect(() => {
					stopped.current = false;
					const load = async () => {
						if (document.visibilityState !== "visible") return;
						try {
							const stateResponse = await fetch(STATE_URL, { cache: "no-store" });
							const state = await stateResponse.json().catch(() => null);
							const crypto = (state?.watchlist?.crypto ?? DEFAULT_CRYPTO).slice(0, 5);
							const stocks = (state?.watchlist?.stocks ?? DEFAULT_STOCKS).slice(0, 5);
							const query = new URLSearchParams();
							if (crypto.length) query.set("symbols", crypto.join(","));
							if (stocks.length) query.set("stocks", stocks.join(","));
							const [quotesResponse, marketResponse] = await Promise.all([
								fetch(`${QUOTES_URL}?${query}`, { cache: "no-store" }),
								fetch(MARKET_URL, { cache: "no-store" })
							]);
							const quotes = await quotesResponse.json().catch(() => null);
							const market = await marketResponse.json().catch(() => null);
							if (stopped.current) return;
							const parts = [];
							let primary = null;
							for (const row of Array.isArray(quotes?.quotes) ? quotes.quotes : []) {
								const price = Number(row.binance?.price ?? row.bitget?.price);
								const pct = Number(row.binance?.changePct ?? row.bitget?.changePct);
								if (!Number.isFinite(price)) continue;
								if (primary === null) primary = Number.isFinite(pct) ? pct : null;
								parts.push(`${displayCryptoSymbol(row.symbol)} ${formatPrice(price)} ${Number.isFinite(pct) ? formatChange(pct) : ""}`.trim());
							}
							for (const row of Array.isArray(quotes?.stocks) ? quotes.stocks : []) {
								if (!Number.isFinite(Number(row.price))) continue;
								parts.push(`${row.symbol} ${formatPrice(row.price)} ${Number.isFinite(Number(row.changePct)) ? formatChange(row.changePct) : ""}`.trim());
							}
							const vix = Number(market?.sentiment?.vix?.price);
							if (Number.isFinite(vix)) parts.push(`VIX ${vix.toFixed(1)}`);
							setChange(primary);
							setTip(parts.length ? `加密美股监控 · ${parts.join(" · ")}` : "加密美股监控");
						} catch {
							// 静默失败，保留上次提示
						}
					};
					void load();
					const timer = window.setInterval(() => { void load(); }, 8000);
					const onVisible = () => { if (document.visibilityState === "visible") void load(); };
					document.addEventListener("visibilitychange", onVisible);
					return () => {
						stopped.current = true;
						window.clearInterval(timer);
						document.removeEventListener("visibilitychange", onVisible);
					};
				}, []);
				return h("span", { className: "dbw-rail", title: tip, "aria-label": tip },
					h("svg", {
						viewBox: "0 0 24 24", width: size, height: size, fill: "none",
						stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
						"aria-hidden": true
					},
					h("path", { d: "M3 17.5 8 12l3.5 3.5L21 6" }),
					h("path", { d: "M15.5 6H21v5.5" })),
					Number.isFinite(change) ? h("i", {
						className: "dbw-rail-change",
						"data-up": change >= 0 ? "true" : "false"
					}, `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`) : null);
			}

function Dashboard() {
	const [data, setData] = React.useState({ watchlist: { crypto: [], stocks: [] }, targets: {}, quotes: [], stocks: [], market: null, at: 0 });
	const [selectedKey, setSelectedKey] = React.useState(null);
	const [query, setQuery] = React.useState("");
	const [results, setResults] = React.useState([]);
	const [busy, setBusy] = React.useState(false);
	const [advanced, setAdvanced] = React.useState(false);
	const [error, setError] = React.useState("");
	const [targetPrice, setTargetPrice] = React.useState("");
	const [targetDirection, setTargetDirection] = React.useState("above");
	const [targetStop, setTargetStop] = React.useState("");
	const watch = React.useRef({ crypto: DEFAULT_CRYPTO.slice(0, 6), stocks: DEFAULT_STOCKS.slice(0, 6) });
	const lastMarket = React.useRef(0);
	const alive = React.useRef(true);
	const api = "/plugins/dsh-crypto-us-stock-monitor/api";

	const load = async (manual) => {
		if (manual) setBusy(true);
		try {
			const stateResponse = await fetch(STATE_URL, { cache: "no-store" });
			const state = await stateResponse.json();
			if (!alive.current) return;
			if (state && state.watchlist) {
				watch.current = {
					crypto: (state.watchlist.crypto || []).slice(0, 30),
					stocks: (state.watchlist.stocks || []).slice(0, 12)
				};
			}
			const params = new URLSearchParams();
			if (watch.current.crypto.length) params.set("symbols", watch.current.crypto.join(","));
			if (watch.current.stocks.length) params.set("stocks", watch.current.stocks.join(","));
			const quotesResponse = await fetch(QUOTES_URL + "?" + params.toString(), { cache: "no-store" });
			const quotes = await quotesResponse.json();
			let market = null;
			if (Date.now() - lastMarket.current > 30000) {
				try {
					const marketResponse = await fetch(MARKET_URL, { cache: "no-store" });
					const payload = await marketResponse.json();
					if (payload && payload.ok) market = payload;
					lastMarket.current = Date.now();
				} catch {}
			}
			if (!alive.current) return;
			setData((current) => ({
				watchlist: state && state.watchlist ? state.watchlist : current.watchlist,
				targets: state && state.targets ? state.targets : current.targets,
				quotes: Array.isArray(quotes && quotes.quotes) ? quotes.quotes : [],
				stocks: Array.isArray(quotes && quotes.stocks) ? quotes.stocks : [],
				market: market || current.market,
				at: Date.now()
			}));
			setError("");
		} catch (loadError) {
			if (alive.current) setError(loadError && loadError.message ? loadError.message : "行情加载失败");
		} finally {
			if (alive.current) setBusy(false);
		}
	};

	React.useEffect(() => {
		alive.current = true;
		void load();
		const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 6000);
		const onVisible = () => { if (document.visibilityState === "visible") void load(); };
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			alive.current = false;
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, []);

	React.useEffect(() => {
		const text = query.trim();
		if (!text) { setResults([]); return undefined; }
		let cancelled = false;
		const timer = window.setTimeout(async () => {
			try {
				const response = await fetch(SEARCH_URL + "?q=" + encodeURIComponent(text) + "&limit=8", { cache: "no-store" });
				const payload = await response.json();
				if (!cancelled) setResults(Array.isArray(payload && payload.results) ? payload.results : []);
			} catch {
				if (!cancelled) setResults([]);
			}
		}, 240);
		return () => { cancelled = true; window.clearTimeout(timer); };
	}, [query]);

	const cryptoRows = data.quotes.map((row) => ({
		key: "crypto:" + row.symbol, kind: "crypto", symbol: row.symbol,
		title: displayCryptoSymbol(row.symbol), sub: "加密现货",
		price: Number(row.binance && row.binance.price != null ? row.binance.price : row.bitget && row.bitget.price),
		change: Number(row.binance && row.binance.changePct != null ? row.binance.changePct : row.bitget && row.bitget.changePct),
		ta: row.ta, trend: row.trend
	}));
	const stockRows = data.stocks.map((row) => ({
		key: "stock:" + row.symbol, kind: "stock", symbol: row.symbol,
		title: row.symbol, sub: row.name || row.symbol,
		price: Number(row.price), change: Number(row.changePct), ta: row.ta, trend: row.trend
	}));
	const rows = cryptoRows.concat(stockRows);
	const selected = rows.find((row) => row.key === selectedKey) || rows[0] || null;
	const selectedTarget = selected ? data.targets[selected.key] : null;
	const market = data.market;
	const sentiment = market && market.sentiment;
	const tone = (label) => label === "偏多" ? "dbw-tone-up" : label === "偏空" ? "dbw-tone-down" : "dbw-tone-warn";

	React.useEffect(() => {
		if (!selected) return;
		setTargetPrice(selectedTarget && selectedTarget.price != null ? String(selectedTarget.price) : "");
		setTargetDirection(selectedTarget && selectedTarget.direction === "below" ? "below" : "above");
		setTargetStop(selectedTarget && selectedTarget.stop != null ? String(selectedTarget.stop) : "");
	}, [selectedKey, selectedTarget && selectedTarget.price, selectedTarget && selectedTarget.direction, selectedTarget && selectedTarget.stop]);

	const signal = (row) => {
		const ta = row && row.ta;
		if (!ta) return { label: "—", cls: "dbw-tone-warn" };
		let score = 0;
		if (ta.trend && ta.trend.label === "多头") score += 2;
		if (Number(ta.maSlow) && ta.price >= ta.maSlow) score += 1;
		if (Number(ta.macd && ta.macd.hist) > 0) score += 1;
		if (Number(ta.rsi) >= 40 && Number(ta.rsi) <= 70) score += 1;
		if (Number(ta.adx && ta.adx.adx) >= 18) score += 1;
		if (score >= 5) return { label: "偏多", cls: "dbw-tone-up" };
		if (score <= 2) return { label: "偏空", cls: "dbw-tone-down" };
		return { label: "观望", cls: "dbw-tone-warn" };
	};

	const mutateWatchlist = async (kind, symbol, action) => {
		try {
			await fetch(api + "/watchlist", {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ kind: kind, symbol: symbol, action: action })
			});
			await load();
		} catch (mutationError) {
			setError(mutationError && mutationError.message ? mutationError.message : "自选更新失败");
		}
	};

	const saveTarget = async () => {
		if (!selected) return;
		const price = Number(targetPrice);
		if (!Number.isFinite(price) || price <= 0) { setError("请输入有效目标价"); return; }
		try {
			await fetch(api + "/targets", {
				method: "PUT", headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					kind: selected.kind, symbol: selected.symbol, price: price,
					direction: targetDirection,
					stop: Number(targetStop) > 0 ? Number(targetStop) : null
				})
			});
			await load();
		} catch (mutationError) {
			setError(mutationError && mutationError.message ? mutationError.message : "目标价保存失败");
		}
	};

	const deleteTarget = async () => {
		if (!selected) return;
		try {
			await fetch(api + "/targets?symbol=" + encodeURIComponent(selected.symbol) + "&kind=" + selected.kind, { method: "DELETE" });
			await load();
		} catch (mutationError) {
			setError(mutationError && mutationError.message ? mutationError.message : "目标价清除失败");
		}
	};

	const fmtPct = (value, digits) => Number.isFinite(Number(value)) ? (Number(value) >= 0 ? "+" : "") + Number(value).toFixed(digits == null ? 1 : digits) + "%" : "--";
	const fmtNum = (value, digits) => Number.isFinite(Number(value)) ? Number(value).toFixed(digits == null ? 1 : digits) : "--";

	const addButton = (item) => h("button", {
		key: item.kind + ":" + item.symbol, type: "button", className: "dbw-dash-result",
		onClick: () => { setQuery(""); setResults([]); void mutateWatchlist(item.kind === "stock" ? "stock" : "crypto", item.symbol, "add"); }
	},
		h("b", null, item.name || item.symbol),
		h("small", null, (item.kind === "stock" ? "美股" : "加密") + " · " + item.symbol + (Number.isFinite(Number(item.price)) ? " · " + formatPrice(item.price) : ""))
	);

	const rowView = (row) => h("div", {
		key: row.key, className: "dbw-dash-row", role: "button", tabIndex: 0,
		"data-active": selected && selected.key === row.key ? "true" : "false",
		onClick: () => setSelectedKey(row.key),
		onKeyDown: (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedKey(row.key); } }
	},
		h("div", { className: "dbw-dash-name" }, h("b", null, row.title), h("small", null, row.sub)),
		h("div", { className: "dbw-dash-price" }, Number.isFinite(row.price) ? formatPrice(row.price) : "--"),
		h("div", { className: "dbw-dash-change " + ((row.change >= 0) ? "dbw-tone-up" : "dbw-tone-down") }, fmtPct(row.change)),
		h("div", { className: "dbw-dash-tag" }, signal(row).label),
		h("button", {
			type: "button", className: "dbw-dash-del", title: "移除", "aria-label": "移除 " + row.symbol,
			onClick: (event) => { event.stopPropagation(); void mutateWatchlist(row.kind, row.symbol, "remove"); }
		}, "×")
	);

	const kpi = (label, value, note, cls) => h("div", { className: "dbw-dash-kpi", key: label },
		h("span", null, label),
		h("b", { className: cls || "" }, value),
		h("small", null, note)
	);

	const kpis = h("div", { className: "dbw-dash-kpis" }, [
		kpi("加密货币", market && market.crypto ? market.crypto.label : "--", market && market.crypto ? "涨 " + market.crypto.up + " · 跌 " + market.crypto.down + " · 中位 " + fmtPct(market.crypto.medianChangePct, 2) : "等待宽度", market && market.crypto ? tone(market.crypto.label) : ""),
		kpi("美股", market && market.stock ? market.stock.label : "--", market && market.stock ? "板块 " + market.stock.sectorUp + "/" + market.stock.sectorCount + " · 指数 " + market.stock.indexUp + "/" + market.stock.indexCount : "等待宽度", market && market.stock ? tone(market.stock.label) : ""),
		kpi("VIX", sentiment && sentiment.vix ? fmtNum(sentiment.vix.price, 2) : "--", sentiment && sentiment.vix ? "高于 " + Math.round(sentiment.vix.historicalPercentile) + "% 交易日 · " + sentiment.vix.zone : "等待情绪", ""),
		kpi("加密 F&G", sentiment && sentiment.cryptoFearGreed ? sentiment.cryptoFearGreed.value : "--", sentiment && sentiment.cryptoFearGreed ? sentiment.cryptoFearGreed.label : "等待情绪", "")
	]);

	const searchBox = h("div", { className: "dbw-dash-search" },
		h("input", {
			value: query, placeholder: "搜索 NVDA / BTC 添加", "aria-label": "搜索并加入自选",
			onChange: (event) => setQuery(event.target.value)
		}),
		results.length ? h("div", { className: "dbw-dash-results" }, results.map(addButton)) : null
	);

	const groupLabel = (title, count) => h("div", { className: "dbw-dash-group" }, h("span", null, title), h("span", null, count + " 个"));
	const listPanel = h("div", { className: "dbw-dash-panel" }, [
		h("div", { className: "dbw-dash-panel-head" }, h("b", null, "自选"), h("span", null, rows.length + " 个 · 点击查看"), searchBox),
		cryptoRows.length ? groupLabel("加密", cryptoRows.length) : null,
		cryptoRows.map(rowView),
		stockRows.length ? groupLabel("美股", stockRows.length) : null,
		stockRows.map(rowView),
		rows.length ? null : h("div", { className: "dbw-dash-empty" }, "自选为空，上方搜索添加")
	]);

	let detailBody = h("div", { className: "dbw-dash-empty" }, "选择一个自选查看详情");
	if (selected) {
		const sig = signal(selected);
		const targetText = selectedTarget ? formatPrice(selectedTarget.price) + (selectedTarget.direction === "below" ? " 下破" : " 上破") : "未设置";
		detailBody = h("div", { className: "dbw-dash-detail" }, [
			h("div", { className: "dbw-dash-detail-top", key: "top" },
				h("div", null, h("b", null, selected.title), h("small", null, selected.sub)),
				h("div", { className: "dbw-dash-detail-price" }, h("b", null, Number.isFinite(selected.price) ? formatPrice(selected.price) : "--"), h("span", { className: selected.change >= 0 ? "dbw-tone-up" : "dbw-tone-down" }, fmtPct(selected.change)))),
			h("div", { className: "dbw-dash-metrics", key: "metrics" }, [
				h("div", { className: "dbw-dash-metric", key: "rsi" }, h("span", null, "RSI14"), h("b", null, fmtNum(selected.ta && selected.ta.rsi, 1))),
				h("div", { className: "dbw-dash-metric", key: "macd" }, h("span", null, "MACD 柱"), h("b", null, fmtNum(selected.ta && selected.ta.macd && selected.ta.macd.hist, 2))),
				h("div", { className: "dbw-dash-metric", key: "adx" }, h("span", null, "ADX"), h("b", null, fmtNum(selected.ta && selected.ta.adx && selected.ta.adx.adx, 1))),
				h("div", { className: "dbw-dash-metric", key: "atr" }, h("span", null, "ATR%"), h("b", null, fmtPct(selected.ta && selected.ta.atrPct, 1))),
				h("div", { className: "dbw-dash-metric", key: "hi" }, h("span", null, "距 60 日高"), h("b", null, fmtPct(selected.ta && selected.ta.distanceHigh60Pct, 1))),
				h("div", { className: "dbw-dash-metric", key: "ma" }, h("span", null, "均线"), h("b", null, selected.ta && selected.ta.maAlignment === "bull" ? "多头" : selected.ta && selected.ta.maAlignment === "bear" ? "空头" : "交织"))
			]),
			h("div", { className: "dbw-dash-target-label", key: "target-label" }, h("span", null, "技术面", " ", h("b", { className: sig.cls }, sig.label)), h("b", null, "目标 " + targetText)),
			h("div", { className: "dbw-dash-target", key: "target" }, [
				h("div", { className: "dbw-dash-target-row", key: "inputs" },
					h("input", { type: "number", min: "0", step: "any", value: targetPrice, placeholder: "目标价", onChange: (event) => setTargetPrice(event.target.value), "aria-label": "目标价" }),
					h("select", { value: targetDirection, onChange: (event) => setTargetDirection(event.target.value), "aria-label": "方向" }, [h("option", { value: "above", key: "a" }, "上破"), h("option", { value: "below", key: "b" }, "下破")]),
					h("input", { type: "number", min: "0", step: "any", value: targetStop, placeholder: "止损", onChange: (event) => setTargetStop(event.target.value), "aria-label": "止损价" })
				),
				h("div", { className: "dbw-dash-target-row", key: "buttons" },
					h("button", { type: "button", className: "dbw-dash-primary", onClick: () => void saveTarget() }, "保存目标"),
					selectedTarget ? h("button", { type: "button", className: "dbw-dash-secondary", onClick: () => void deleteTarget() }, "清除") : null,
					h("button", { type: "button", className: "dbw-dash-secondary", onClick: () => void mutateWatchlist(selected.kind, selected.symbol, "remove") }, "移除自选")
				)
			])
		]);
	}

	const dist = (title, item) => item && item.zones ? h("div", { className: "dbw-dash-dist", key: title }, [
		h("div", { className: "dbw-dash-dist-top", key: "top" }, h("span", null, title), h("b", null, item.currentLabel + " · " + item.currentPerYear + " 天/年")),
		h("div", { className: "dbw-dash-dist-bar", key: "bar" }, item.zones.map((zone) => h("span", {
			key: zone.label, className: "dbw-dash-dist-seg",
			style: { width: Math.max(2, Number(zone.pct) || 2) + "%" },
			"data-current": zone.current ? "true" : undefined,
			title: zone.label + " · " + zone.pct + "%"
		}))),
		h("div", { className: "dbw-dash-dist-meta", key: "meta" }, "常态 " + (item.mode ? item.mode.label : "--") + " · 当前高于 " + Math.round(item.historicalPercentile || 0) + "% 的交易日")
	]) : null;

	const distributionPanel = h("div", { className: "dbw-dash-panel" }, [
		h("div", { className: "dbw-dash-panel-head", key: "head" }, h("b", null, "市场情绪分布"), h("span", null, "条宽 = 历史占比 · 高亮 = 当前区间")),
		h("div", { key: "body" }, [
			dist("VIX", sentiment && sentiment.vix && sentiment.vix.distribution),
			dist("VXN", sentiment && sentiment.vxn && sentiment.vxn.distribution),
			dist("加密 F&G", sentiment && sentiment.cryptoFearGreed && sentiment.cryptoFearGreed.distribution)
		])
	]);

	if (advanced) {
		return h("div", { className: "dbw-adv" }, [
			h("div", { className: "dbw-adv-bar", key: "bar" }, [
				h("button", { type: "button", className: "dbw-dash-btn", onClick: () => setAdvanced(false) }, "← 返回概览"),
				h("span", { key: "tip" }, "高级视图：7 套预设、信号提醒、完整市场分布"),
				h("button", { type: "button", className: "dbw-dash-btn", onClick: () => setAdvanced(false) }, "关闭")
			]),
			h(MonitorPanel, { key: "legacy" })
		]);
	}

	return h("div", { className: "dbw-dash" }, [
		h("div", { className: "dbw-dash-head", key: "head" }, [
			h("div", { key: "title" }, h("h1", null, "加密美股监控"), h("p", null, data.at ? "实时行情 · " + new Date(data.at).toLocaleTimeString("zh-CN", { hour12: false }) + " 更新" : "正在连接行情…")),
			h("div", { className: "dbw-dash-tools", key: "tools" },
				h("button", { type: "button", className: "dbw-dash-btn", disabled: busy, onClick: () => void load(true) }, busy ? "刷新中…" : "刷新"),
				h("button", { type: "button", className: "dbw-dash-btn", onClick: () => setAdvanced(true) }, "高级视图"),
				h("span", { className: "dbw-dash-btn", style: { cursor: "default" } }, "公共行情 · 不下单"))
		]),
		error ? h("div", { className: "dbw-dash-error", key: "error" }, error) : null,
		kpis,
		h("div", { className: "dbw-dash-grid", key: "grid" }, [listPanel, h("div", { className: "dbw-dash-panel", key: "detail" }, detailBody)]),
		distributionPanel
	]);
}


			function MonitorPanel() {
				const host = React.useRef(null);
				React.useEffect(() => {
					if (!host.current) return undefined;
					return mountPanel(ctx, host.current);
				}, []);
				return h("div", { className: "dbw-main-panel", ref: host });
			}


			slots.inject("sidebar.panellist", () => slots.register({
				name: "sidebar.panellist", id: PLUGIN_ID, order: 22, label: "加密美股监控"
			}, SidebarIcon));
			slots.inject("main", () => slots.register({
				name: "main", key: PLUGIN_ID
			}, Dashboard));
		}

		exports.apply = apply;
		exports.inject = ["slots"];
		return module.exports;
	}
});











