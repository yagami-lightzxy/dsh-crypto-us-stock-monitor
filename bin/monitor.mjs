#!/usr/bin/env node
/**
 * 加密美股监控 · Agent CLI
 * 依赖运行中的 DSH Desktop 插件 API；不直接访问行情源。
 *
 *   node bin/monitor.mjs state
 *   node bin/monitor.mjs quotes BTCUSDT AAPL
 *   node bin/monitor.mjs market
 *   node bin/monitor.mjs watch add MSFT --stock
 *   node bin/monitor.mjs target set NVDA 200 --above --stop 170 --note "突破后目标"
 *   node bin/monitor.mjs target clear NVDA --stock
 *   node bin/monitor.mjs targets
 *
 * 基址可用 --base 或 DSH_BASE_URL 指定，默认 http://127.0.0.1:8388
 */
const args = process.argv.slice(2);
let base = process.env.DSH_BASE_URL || "http://127.0.0.1:8388";
const rest = [];
for (let i = 0; i < args.length; i += 1) {
	if (args[i] === "--base" && args[i + 1]) { base = args[i + 1]; i += 1; continue; }
	rest.push(args[i]);
}
base = base.replace(/\/+$/, "");
const api = `${base}/plugins/dsh-crypto-us-stock-monitor/api`;

async function request(path, options = {}) {
	const response = await fetch(`${api}${path}`, {
		headers: { "Content-Type": "application/json" },
		...options
	});
	const text = await response.text();
	let body;
	try { body = JSON.parse(text); } catch { body = { raw: text }; }
	if (!response.ok) {
		const error = new Error(body?.error || `HTTP ${response.status}`);
		error.body = body;
		throw error;
	}
	return body;
}

function hasFlag(name) {
	const index = rest.indexOf(name);
	if (index < 0) return false;
	rest.splice(index, 1);
	return true;
}

function option(name) {
	const index = rest.indexOf(name);
	if (index < 0 || index + 1 >= rest.length) return null;
	const value = rest[index + 1];
	rest.splice(index, 2);
	return value;
}

async function main() {
	const command = rest.shift();
	if (!command || command === "help" || command === "--help") {
		console.log("用法: monitor <state|quotes|market|watch|target|targets> ...");
		console.log("  quotes BTCUSDT AAPL       多标的报价（加密/美股混合）");
		console.log("  watch add|remove SYM [--stock]");
		console.log("  target set SYM PRICE [--below] [--stop N] [--note TEXT] [--stock]");
		console.log("  target clear SYM [--stock]");
		console.log("  targets                   列出目标价");
		console.log("  state                     读取自选 + 目标价 + revision");
		console.log("全局: --base http://127.0.0.1:8388 或 DSH_BASE_URL");
		return;
	}
	if (command === "state") {
		console.log(JSON.stringify(await request("/state"), null, 2));
		return;
	}
	if (command === "targets") {
		const state = await request("/state");
		console.log(JSON.stringify(state.targets ?? {}, null, 2));
		return;
	}
	if (command === "market") {
		console.log(JSON.stringify(await request("/market"), null, 2));
		return;
	}
	if (command === "quotes") {
		if (!rest.length) throw new Error("quotes 需要至少一个 symbol");
		const symbols = rest.filter((item) => !item.startsWith("--"));
		const stocks = symbols.filter((item) => /^[A-Z][A-Z0-9.\-]{0,9}$/.test(item) && !/USDT$/.test(item));
		const crypto = symbols.filter((item) => /USDT$/.test(item));
		const query = new URLSearchParams();
		if (crypto.length) query.set("symbols", crypto.join(","));
		if (stocks.length) query.set("stocks", stocks.join(","));
		console.log(JSON.stringify(await request(`/quotes?${query}`), null, 2));
		return;
	}
	if (command === "watch") {
		const action = rest.shift();
		const symbol = rest.shift();
		const kind = hasFlag("--stock") ? "stock" : "crypto";
		if (!["add", "remove"].includes(action) || !symbol) throw new Error("watch add|remove SYM [--stock]");
		console.log(JSON.stringify(await request("/watchlist", { method: "POST", body: JSON.stringify({ kind, symbol, action }) }), null, 2));
		return;
	}
	if (command === "target") {
		const action = rest.shift();
		const symbol = rest.shift();
		const kind = hasFlag("--stock") ? "stock" : "crypto";
		if (!symbol) throw new Error("target set|clear SYM ...");
		if (action === "clear") {
			const body = await request(`/targets?symbol=${encodeURIComponent(symbol)}&kind=${kind}`, { method: "DELETE" });
			console.log(JSON.stringify(body, null, 2));
			return;
		}
		if (action !== "set") throw new Error("target set|clear SYM ...");
		const price = Number(rest.shift());
		if (!Number.isFinite(price) || price <= 0) throw new Error("target set 需要正数价格");
		const stop = option("--stop");
		const note = option("--note");
		const direction = hasFlag("--below") ? "below" : "above";
		const body = await request("/targets", {
			method: "PUT",
			body: JSON.stringify({ kind, symbol, price, direction, stop: stop ? Number(stop) : null, note: note ?? "" })
		});
		console.log(JSON.stringify(body, null, 2));
		return;
	}
	throw new Error(`未知命令: ${command}`);
}

main().catch((error) => {
	console.error(JSON.stringify({ ok: false, error: error.message, detail: error.body }, null, 2));
	process.exitCode = 1;
});
