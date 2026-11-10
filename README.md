# 加密美股监控 · Crypto × US Stock Monitor

在 DSH Desktop 里查看加密货币和美股行情，跟踪自选、技术指标、市场宽度与情绪变化。内置 7 套策略预设和信号提醒，也可以让 AI Agent 读取行情、管理自选和设置目标价。

> 界面截图：左侧图标 + 中央面板（重启 DSH 后可直接查看；`docs/panel.png` 是旧悬浮版存档，不再代表当前交互）。

## 0.15 界面与显示内容

- **左侧图标栏**：与「插件 / 浏览器 / 学习」同一列；图标右下角显示 BTCUSDT 24h 涨跌幅，每 8 秒刷新；悬停提示显示自选前 5 个加密 + 前 5 个美股 + VIX。
- **中央面板**：顶部 4 个概览卡（加密宽度、美股宽度、VIX、加密 F&G）；左侧自选列表（价格、24h 涨跌、技术面标签、目标价入口）；右侧单标的技术面与目标价编辑；底部 VIX/VXN/F&G 历史分布。
- 点自选行查看详情；搜索框可直接添加加密或美股；× 移除自选；目标价支持上破/下破与止损。
- 技术面标签是 RSI、MACD、ADX、均线、趋势的规则化摘要，不是投资建议，也不等同于旧版 7 套预设的回测信号。
- 需要旧版完整能力（7 套预设、信号提醒、完整市场分布）时，点右上角「高级视图」；仍在中央面板内，不产生悬浮窗。

## 安装与兼容

插件运行在 **DSH Desktop** 中，需要宿主支持 Cordis 插件和 `dsh.bundle.patch`。仓库可直接加载，无需构建或安装第三方运行时依赖。

1. 将仓库下载或克隆到本地目录。
2. 通过 DSH 的插件管理或配置，以本地 `link` 方式加载该目录。
3. 重启 DSH Desktop，左侧图标列（插件 / 浏览器 / 学习那一列）会出现「加密美股监控」图标；点击后在中央面板打开。

当前版本为 **0.15.1**。界面已重设计，重启 DSH 后按下方步骤验证实际加载与行情刷新。升级 DSH 后，可检查侧栏图标、中央面板加载、行情刷新和目标价同步是否正常。

包名与插件 ID：`dsh-crypto-us-stock-monitor`。`package.json` 中的 `dsh.bundle.patch` 指向 `cordis.patch.yml`。

从 0.12.x 升级时，使用旧包名 `dsh-binance-bitget-watchlist` 安装的插件需要重新 link 或安装。浏览器存储保留旧键名前缀，用于迁移自选和目标价。

## Agent 集成

Agent 可通过命令行或本地 HTTP 接口读取行情、管理自选、设置目标价。以下命令需要 DSH Desktop 和插件已启动，`--base` 填写当前 DSH Web GUI 地址：

```bash
# 读取自选、目标价和状态版本号
node bin/monitor.mjs --base http://127.0.0.1:8388 state

# 多标的报价
node bin/monitor.mjs --base http://127.0.0.1:8388 quotes BTCUSDT NVDA

# 设置美股目标价（美股代码加 --stock）
node bin/monitor.mjs --base http://127.0.0.1:8388 target set NVDA 200 --stock --stop 170 --note "右侧确认"

# 添加自选
node bin/monitor.mjs --base http://127.0.0.1:8388 watch add MSFT --stock
```

HTTP 接口如下，完整路径以 `/plugins/dsh-crypto-us-stock-monitor` 开头：

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/api/state` | 读取自选、目标价和状态版本号 |
| PUT | `/api/state` | 批量替换自选或目标价 |
| GET | `/api/watchlist` | 读取自选列表 |
| POST | `/api/watchlist` | 添加或移除自选：`{kind,symbol,action:"add"/"remove"}` |
| GET | `/api/targets` | 读取目标价映射表 |
| PUT/POST | `/api/targets` | 设置目标价：`{kind,symbol,price,direction,stop,note}` |
| DELETE | `/api/targets?symbol=NVDA&kind=stock` | 清除目标价 |

- 状态文件：`~/.dsh/storages/dsh-crypto-us-stock-monitor/state.json`
- 面板每 20 秒同步一次状态；Agent 修改后，也可以手动刷新查看。
- 自选和目标价写入本地 JSON；接口的写入范围限于这些面板设置。
- 调用示例和操作约定见 [AGENTS.md](AGENTS.md)。

## 数据与本地存储

- 行情使用公共接口，无需 API Key；插件不采集使用统计。
- 自选、预设、提醒和目标价保存在浏览器 `localStorage` 中。自选与目标价还会同步到本机 `~/.dsh/storages/dsh-crypto-us-stock-monitor/state.json`，供 Agent 读写。
- 行情和搜索请求由本机直接发往数据源，查询时会向相应服务发送标的代码或搜索词，并受其服务条款和速率限制约束。

## 回测记录

项目在 2026 年 11 月记录了一次「综合」预设的 10 年日线回测，区间为 2016-11 至 2026-11。条件为：次日开盘成交，单边手续费 0.1%，2×ATR 止损、3×ATR 目标，最长持有 60 日，评分低于 40% 时离场。

| 标的 | 策略年化 | 买入持有年化 |
|---|---:|---:|
| SPY | 7.7% | 15.0% |
| QQQ | 11.3% | 19.7% |
| NVDA | 20.5% | 59.6% |
| BTC | 6.6% | 59.6% |
| ETH | 11.3% | 24.1% |

这次回测中，「综合」预设在五个标的上的年化收益均低于买入持有。样本仅含五个近期强势标的，存在幸存者偏差，且未计入滑点和税费。结果反映的是上述样本与条件下的表现。

## 功能概览

- **自选行情**：同一面板查看加密货币和美股。加密行情来自 Binance 与 Bitget，两路数据分别获取。
- **市场宽度**：查看 Binance USDT 交易对的涨跌家数、中位涨跌幅和成交额加权涨跌幅，以及美股 4 大指数、11 个板块 ETF 的表现。
- **市场情绪**：查看 VIX、VXN、加密恐惧贪婪指数及其历史分布；VIX、VXN 同时显示近 1 年分位。
- **衍生品数据**：查看 OKX BTC 永续的多空账户比、空头账户占比、未平仓名义价值和当前资金费率。
- **策略预设**：内置综合、动量突破、低位反弹、趋势回调、突破回踩、布林收口、量价背离 7 套规则，可复制并调整参数、阈值和名称。
- **信号提醒**：行情刷新时检查预设条件，记录新信号并显示弹出提醒；可开启桌面通知。
- **标的详情**：逐项查看条件是否满足及对应数值，以及规则计算的入场价、止损价、目标价和盈亏比。

技术指标包括均线排列与斜率、RSI、KDJ、CCI、Williams %R、ADX/DMI、MACD、布林带、ATR、量比、量能趋势和 OBV 斜率，还会标记 20 日突破或跌破、距 60 日高低点的幅度、RSI 背离和 K 线形态。

## 使用面板

### 情绪仪表

仪表将数值映射为状态和简短提示，便于快速浏览：

- **VIX（美股恐慌）**：`平静 · 按预设观察` / `正常 · 按信号` / `警惕 · 避免追高` / `恐慌 · 轻仓观察` / `极度恐慌 · 分批观察`（阈值 15/20/25/30）。
- **VXN（科技股恐慌）**：`正常 · 按信号` / `警惕 · 科技仓位谨慎` / `偏高 · 控制科技仓位` / `极高 · 等待企稳`（阈值 18/23/28/35）。
- **加密 F&G**：`极度恐惧 · 分批观察` / `恐惧 · 分批观察` / `中性 · 观察持有` / `贪婪 · 避免追高` / `过热 · 适度减仓`（0–25/26–45/46–55/56–75/76–100）。

下方的 **「现在该做什么」** 汇总三项指标的提示，例如：

> VIX 26 恐慌：轻仓观察，等待回落到 20 以下；科技 VXN 34 偏高：控制科技仓位；加密 F&G 28 恐惧：分批观察

鼠标悬停可查看具体数值、近 1 年分位和区间划分。这些提示按固定阈值生成，用于概括市场情绪。

### 历史分布条

每个指标下方都有一条历史分布色带。区间越宽，表示它在历史样本中出现得越多；蓝框标出当前所在区间。下方文字说明出现频率和历史分位：

- `少见 · 21 天/年`：当前区间每年平均出现多少天；
- `常态 15–20（35.8%） · 高于 87% 的交易日`：历史最常出现的区间，以及当前值在历史样本中的分位。

分布条读法示例（数值随数据更新）：

- **VIX**：值落在 25–30 区间，占历史样本的 8.5%，平均约 21 天/年；最常见区间为 15–20，占 35.8%；当前值高于样本中 87% 的交易日。
- **VXN**：值落在 28–35 区间，占 14.5%，平均约 37 天/年；最常见区间为 18–23，占 33.2%；当前值高于样本中 92% 的交易日。
- **加密 F&G**：值落在 26–45 区间，占 27.8%，平均约 101 天/年；该区间也是历史最常见区间；当前值高于样本中 30% 的日期。

统计口径：

- **关键阈值天数**：如 `≥20 79天 · ≥25 37天 · ≥30 15天 · ≥35 6天`，表示样本中平均每年达到或超过各阈值的天数。F&G 同时列出恐惧侧的 `≤25 84天 · ≤45 186天` 和贪婪侧的 `≥55 129天 · ≥75 38天`。
- **各区间明细**：点击「查看各区间每年天数」，可展开每个区间的年均天数与占比，当前区间会高亮。
- **年均天数**：区间内的历史天数 ÷ 样本年数。
- **常态与分位**：「常态」指历史占比最高的区间；「高于 X% 的交易日」表示当前值在样本中的历史分位。
- 频率分级：占比 ≥25% 常态、10–25% 常见、3–10% 少见、<3% 极端。
- **历史样本**：VIX/VXN 使用近 10 年交易日，F&G 使用 Alternative.me 提供的全部历史。按日计数，样本长度随数据更新。

### 页签与快捷操作

- **自选**：默认页签。顶部显示市场摘要，点击可进入「市场」；下方是策略预设、机会栏、搜索和自选列表。
- **市场**：集中查看情绪仪表、汇总提示、历史分布、多空数据和市场宽度。
- **信号**：查看或清空最近的信号记录；铃铛和页签上的数字表示未读数。
- **搜索栏**：◉ 筛选机会，⇅ 切换排序，↻ 手动刷新。点击齿轮打开设置，高级参数可展开查看。
- 面板宽 560px，自选列表和市场页内容可滚动查看。

### 刷新与提醒

- **信号提醒**：每次报价刷新后，用当前预设检查自选标的。某标的首次进入「买入」状态（条件通过率 ≥80%）时，记录提醒、增加未读数并弹出提示。保留最近 50 条记录，同一标的 10 分钟内最多提醒一次。切换预设也会检查信号；多个标的同时触发时合并提示。
- **桌面通知**：在设置中勾选「桌面通知」，并允许系统通知，即可接收新信号。
- **机会栏**：按条件通过率列出排名靠前且通过率 ≥60% 的标的，最多 3 个；点击可定位到对应行。
- **筛选与排序**：「只看机会」保留通过率 ≥60% 的标的；「排序」在默认顺序、信号和涨跌幅之间切换。
- **折叠概览**：点击标题栏 ▾ 将概览收为一行，显示 VIX、VXN、F&G、市场方向和当前预设；点击摘要恢复。
- **自动刷新**：默认每 3 秒更新报价，每 30 秒更新市场数据。页面隐藏时暂停，返回后立即刷新。

## 接口

基址：`/plugins/dsh-crypto-us-stock-monitor/api`

### Agent 状态接口

- `GET /state`：`{ ok, initialized, revision, updatedAt, watchlist:{crypto,stocks}, targets }`
- `PUT /state`：`{ watchlist?, targets? }`；替换请求中提供的自选列表或目标价集合。
- `POST /watchlist`：`{ kind:"crypto"|"stock", symbol, action:"add"|"remove" }`
- `PUT /targets`：`{ kind, symbol, price, direction:"above"|"below", stop?, note? }`
- `DELETE /targets?symbol=NVDA&kind=stock`
- 目标价键名：`crypto:BTCUSDT` / `stock:NVDA`；`price` 为目标价，`stop` 为可选止损价。
- 状态写入 `~/.dsh/storages/dsh-crypto-us-stock-monitor/state.json`。

### GET `/quotes`

```
/quotes?symbols=BTCUSDT,ETHUSDT&stocks=SPY,QQQ&ma=5,20&malong=50&rsi=14&macd=12,26,9&boll=20,2&atr=14&adx=14&breakout=20&volp=20&th=0.2&style=balanced
```

- `symbols`：加密交易对，最多 30 个；`stocks`：美股代码，最多 12 个，缺省为 SPY、QQQ、DIA、IWM、NVDA、AAPL。
- `ma=fast,slow`、`malong`（默认 50）、`rsi`（14）、`macd=fast,slow,signal`、`boll=period,mult`、`atr`（14）、`adx`（14）、`breakout`（20 日）、`volp`（20 日量能）、`th`（0.2）、`style=balanced|trend|momentum|meanrev`。
- 服务端会规范化参数，并在响应的 `taConfig` 中返回实际生效值；`symbols` 与 `stocks` 都为空时返回 `400 symbols-required`。
- 指标计算至少需要 61 根日线。Binance 默认获取 61 根；慢线、长线、ADX 或突破周期需要更多数据时，自动增加至最多 300 根。

`ta` 主要字段：

```json
{
  "price": 75883.22, "bars": 61,
  "maFast": 76842.94, "maSlow": 79146.66, "maLong": 81843.94,
  "maLongSlopePct": -0.65, "priceVsMaSlowPct": -4.1, "priceVsMaLongPct": -7.3,
  "maAlignment": "bear",
  "rsi": 35.8, "kdj": { "k": 20.1, "d": 23.5, "j": 13.3 },
  "cci": -88.2, "williamsR": -71.3,
  "adx": { "adx": 18.4, "plusDi": 12.2, "minusDi": 24.6 },
  "macd": { "line": -120.4, "signal": -90.2, "hist": -30.2, "prevHist": -25.0 },
  "macdCross": null,
  "boll": { "upper": 79100.2, "middle": 78500.1, "lower": 77900, "percentB": 0.42, "bandwidthPct": 1.5, "bandwidthPercentile": 62 },
  "atr": 1234.5, "atrPct": 2.1, "atrPercentile": 38,
  "volumeRatio": 0.21, "volumeTrend": 0.85, "obvSlopePct": -18.2,
  "breakout20": false, "breakdown20": false,
  "high60": 84898, "low60": 71626,
  "distanceHigh60Pct": -10.6, "distanceLow60Pct": 6.0,
  "rsiDivergence": "bullish", "candle": "hammer",
  "trend": { "label": "空头", "score": -0.66, "threshold": 0.2 }
}
```

客户端使用上述指标和本地预设计算信号、止损价与目标价。修改自定义预设后，面板会立即按新规则计算。

### GET `/market`

```json
{
  "ok": true, "th": 0.2,
  "crypto": { "label": "震荡", "score": -0.12, "bullProbability": 43, "universe": 105, "up": 35, "down": 70, "medianChangePct": -0.29, "weightedChangePct": -0.2,
    "derivatives": { "longShortRatio": 2.98, "longPct": 74.9, "shortPct": 25.1, "openInterestUsd": 2626802942, "fundingRatePct": 0.0002 } },
  "stock": { "label": "震荡", "score": -0.05, "bullProbability": 50, "indexUp": 3, "indexCount": 4, "sectorUp": 3, "sectorCount": 11, "aboveMa20Count": 7, "aboveMa20Total": 15, "vix": { "price": 25.64 } },
  "sentiment": {
    "vix": { "price": 25.64, "percentile": 95, "zone": "恐慌" },
    "vxn": { "price": 34.02, "percentile": 99, "zone": "恐慌" },
    "cryptoFearGreed": { "value": 28, "label": "Fear", "previous": 25 }
  }
}
```

### GET `/search`

`/search?q=aapl&limit=8`：加密结果按精确匹配、前缀匹配、包含匹配排序，同类结果按成交额排序；美股通过 Yahoo 搜索并补充价格。搜索 `aapl` 时，股票 AAPL 排在加密交易对 AAPLBUSDT 之前。

## 策略预设

| 预设 | 核心条件 | 风格 |
| --- | --- | --- |
| 综合 | 趋势多头、站上慢线、MACD 柱为正、RSI<70、%B<0.9 | balanced |
| 动量突破 | 多头、突破 20 日高点、量比≥阈值、ADX≥阈值、RSI 区间、贴近 60 日高 | momentum |
| 低位反弹 | RSI≤35、%B≤0.2、距 60 日高≤−15%、MACD 改善/金叉、KDJ 低位、止跌 K 线 | meanrev |
| 趋势回调 | 价格>长线、均线多头排列、ADX≥25、RSI 38–62、回踩慢线 ±3%、MACD 柱≥0 | trend |
| 突破回踩 | 价格>慢线、距高≥−3%、缩量回踩、RSI 45–70、MACD 柱≥0、守住突破位 | momentum |
| 布林收口 | 带宽分位≤20%、ATR 分位≤45%、贴近慢线、RSI 区间 | balanced |
| 量价背离 | RSI 底背离、RSI≤45、距高≤−10%、脱离 60 日低点、MACD 改善、止跌 K 线 | meanrev |

条件通过率对应四种信号：≥80% 为「买入」，60% 至不足 80% 为「关注」，40% 至不足 60% 为「等待」，低于 40% 为「回避」。通过率表示当前满足的规则比例。

止损价 = 现价 − ATR 倍数 × ATR，默认倍数为 2；目标价 = 现价 + 盈亏比 ×（现价 − 止损价），默认盈亏比为 1.5。两项参数都可在预设中调整。

修改内置预设的参数或阈值时，会自动另存为「xxx 自定义」。自定义预设可改名、切换类型或删除。

信号和价位按预设规则计算，用于快速筛选与复盘。

## 数据源

- Binance 现货：`data-api.binance.vision`，提供 24 小时行情和日线。
- Bitget：`api.bitget.com/api/v3/market/tickers`，提供现货行情。
- Yahoo Finance：`query1.finance.yahoo.com`，提供美股行情、搜索、`^VIX`、`^VXN`、4 大指数和 11 个板块 ETF 数据。
- OKX：提供 BTC 永续多空账户比、未平仓名义价值和资金费率。
- Alternative.me：加密恐惧贪婪指数（每日更新）。

## 缓存与刷新

| 数据 | TTL |
| --- | --- |
| Binance 全量 ticker（搜索/宽度） | 10 分钟 |
| Binance 指定 pair 批量报价 | 10 秒 |
| Binance 日线（TA/趋势） | 5 分钟 |
| Bitget 单 pair ticker | 10 秒 |
| Yahoo 日线（报价/TA） | 60 秒 |
| `/search` 最终响应 | 30 秒 |
| `/market` 组合结果 | 60 秒 |
| 加密恐惧贪婪 | 5 分钟 |
| OKX 衍生品 | 60 秒 |

- 同一缓存键的并发请求会合并。缓存过期时先返回已有数据，再后台刷新；刷新失败时保留已有数据，并通过 `errors` 标记错误。
- 上游请求超时为 8 秒，并发上限为 6。客户端默认每 3 秒请求 `/quotes`，可改为 2、5 或 10 秒；每 30 秒请求 `/market`。页面隐藏时暂停请求。

## 使用说明与限制

- 公共行情可能延迟、缺失或中断；界面刷新频率与数据源更新频率不同。
- 衍生品数据取自 OKX。开发环境访问 Binance Futures、Bybit 时曾分别返回 451、403。
- 美股页面使用指数、板块宽度和 VIX/VXN 观察市场压力，未接入个股实时空头持仓。
- K 线形态以「前收盘价≈本次开盘价」估算开盘价，识别结果采用这一近似口径。
- 仅有 61 根日线时，布林带宽和 ATR 分位的历史样本不足 60 个；慢线周期大于 120 时，Yahoo 数据改取 1 年。
- VIX/VXN 的状态区间采用经验阈值，历史分布按实际样本统计。
- 插件用于行情监控、规则分析和提醒，不连接券商或执行交易，也不提供历史 K 线下载。

## English

Track crypto and US stocks in DSH Desktop. View watchlist quotes, technical indicators, market breadth, VIX/VXN, crypto Fear & Greed, and OKX derivatives data. Seven strategy presets help filter your watchlist and trigger local alerts. AI agents can read market data, manage watchlists, and set price targets through a local API or CLI.

Requires DSH Desktop and Node.js 18 or later. Uses public market data without API keys. Settings are stored locally; quote and search requests send symbols or search terms to the relevant data providers. The plugin does not collect usage analytics or execute trades. Signals are rule-based and intended for screening and review.

## License

MIT — see [LICENSE](LICENSE).













