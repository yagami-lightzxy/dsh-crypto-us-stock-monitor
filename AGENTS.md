# AGENTS.md · 加密美股监控

供 AI Agent 调用插件时查阅。插件运行在 DSH Desktop 中，可读取行情，并在本地保存自选和目标价。

## 快速读取

```bash
# 基址填写当前 DSH Web GUI 地址，以下以 http://127.0.0.1:8388 为例
export DSH_BASE_URL=http://127.0.0.1:8388

# 读取自选、目标价和状态版本号
curl -s "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/state"

# 读取多个标的报价（加密使用 BTCUSDT 这类交易对，美股使用股票代码）
curl -s "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/quotes?symbols=BTCUSDT&stocks=NVDA,AAPL"

# 读取市场宽度和情绪指标
curl -s "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/market"

# 搜索标的
curl -s "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/search?q=nvda"

# 迷你走势序列（面板用它画 60 日走势，复用日线缓存）
curl -s "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/series?symbols=BTCUSDT&stocks=NVDA&limit=80"
```

也可以使用 CLI。需要 Node.js 18 或更高版本，且 DSH Desktop 和插件已启动；基址通过 `--base` 或环境变量 `DSH_BASE_URL` 指定，默认 `http://127.0.0.1:8388`。

```bash
node bin/monitor.mjs state
node bin/monitor.mjs quotes BTCUSDT NVDA
node bin/monitor.mjs market
node bin/monitor.mjs target set NVDA 200 --stock --stop 170 --note "突破后目标"
node bin/monitor.mjs target clear NVDA --stock
```

## 设置目标价与管理自选

```bash
# 设置目标价（direction 为 above 或 below；stop、note 可选）
curl -s -X PUT "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/targets" \
  -H 'Content-Type: application/json' \
  -d '{"kind":"stock","symbol":"NVDA","price":200,"direction":"above","stop":170,"note":"右侧确认"}'

# 删除目标价
curl -s -X DELETE "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/targets?symbol=NVDA&kind=stock"

# 添加自选（action 改为 remove 可移除）
curl -s -X POST "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/watchlist" \
  -H 'Content-Type: application/json' \
  -d '{"kind":"stock","symbol":"MSFT","action":"add"}'

# 批量替换自选和目标价（此示例会将目标价清空为 {}）
curl -s -X PUT "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/state" \
  -H 'Content-Type: application/json' \
  -d '{"watchlist":{"crypto":["BTCUSDT"],"stocks":["NVDA"]},"targets":{}}'
```

面板每 20 秒同步一次服务端状态。Agent 修改后，可等待自动同步，也可手动刷新面板。

## 状态文件

- `~/.dsh/storages/dsh-crypto-us-stock-monitor/state.json`
- 字段：`revision`、`updatedAt`、`watchlist`、`targets`
- 目标价键名：`crypto:BTCUSDT` / `stock:NVDA`

## 操作约定

- 接口用于本机访问，未设置鉴权；端口应保持在本地访问范围。
- 写入范围为面板的自选和目标价设置；目标价用于提醒，接口不执行交易。
- 行情来自第三方公共接口。用于交易决策前，核对数据时间和请求状态。
- 按用户已授权的范围修改自选和目标价；范围不清时先确认。批量替换前核对待覆盖内容。
