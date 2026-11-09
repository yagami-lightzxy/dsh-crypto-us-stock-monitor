# AGENTS.md · 加密美股监控

此文件给 AI Agent 读取。插件运行在 DSH Desktop 内，行情 API 是只读的；**自选与目标价写操作也只改本地 JSON，不会下单**。

## 快速读取

```bash
# 基址：DSH Web GUI 地址（当前会话见运行上下文，例如 http://127.0.0.1:8388）
export DSH_BASE_URL=http://127.0.0.1:8388

# 全部自选 + 目标价 + revision
curl -s "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/state"

# 多标的报价（加密用 xxxUSDT，美股用 ticker）
curl -s "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/quotes?symbols=BTCUSDT&stocks=NVDA,AAPL"

# 市场宽度/情绪
curl -s "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/market"

# 搜索
curl -s "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/search?q=nvda"
```

或直接用 CLI（无需依赖）：

```bash
node bin/monitor.mjs state
node bin/monitor.mjs quotes BTCUSDT NVDA
node bin/monitor.mjs market
node bin/monitor.mjs target set NVDA 200 --stock --stop 170 --note "突破后目标"
node bin/monitor.mjs target clear NVDA --stock
```

## 写目标价 / 自选

```bash
# 设置目标价（direction: above / below；stop/note 可选）
curl -s -X PUT "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/targets" \
  -H 'Content-Type: application/json' \
  -d '{"kind":"stock","symbol":"NVDA","price":200,"direction":"above","stop":170,"note":"右侧确认"}'

# 删除目标价
curl -s -X DELETE "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/targets?symbol=NVDA&kind=stock"

# 加/删自选
curl -s -X POST "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/watchlist" \
  -H 'Content-Type: application/json' \
  -d '{"kind":"stock","symbol":"MSFT","action":"add"}'

# 批量替换状态（谨慎；会覆盖自选与目标价）
curl -s -X PUT "$DSH_BASE_URL/plugins/dsh-crypto-us-stock-monitor/api/state" \
  -H 'Content-Type: application/json' \
  -d '{"watchlist":{"crypto":["BTCUSDT"],"stocks":["NVDA"]},"targets":{}}'
```

面板每 20 秒同步一次服务端状态；Agent 改完目标价后，用户在面板里最多等 20 秒，或点一次刷新。

## 状态文件

- `~/.dsh/storages/dsh-crypto-us-stock-monitor/state.json`
- 字段：`revision`、`updatedAt`、`watchlist`、`targets`
- 目标价 key：`crypto:BTCUSDT` / `stock:NVDA`

## 约束

- 仅本地接口，无鉴权；不要把端口暴露到公网。
- 接口不会交易、不会连接券商；目标价只是提醒。
- 数据来自第三方公共接口，可能延迟/失败；交易决策前自行核实。
- 修改自选/目标价会影响用户面板，执行前确认用户意图。
