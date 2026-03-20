<p align="center">
  <img src="https://raw.githubusercontent.com/Sobranier/openclaw-cli/main/assets/hero.png" alt="OpenClaw CLI" width="700" />
</p>

<h1 align="center">OpenClaw CLI</h1>

<p align="center">
  让你的 OpenClaw 服务永不宕机。
</p>

<p align="center">
  <a href="./README.md">EN</a> | <a href="https://openclaw-cli.app">openclaw-cli.app</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/openclaw-cli"><img src="https://img.shields.io/npm/v/openclaw-cli?label=openclaw-cli&color=blue" alt="openclaw-cli" /></a>
  &nbsp;
  <a href="https://www.npmjs.com/package/openclaw-cli"><img src="https://img.shields.io/npm/dm/openclaw-cli?color=blue" alt="downloads" /></a>
  &nbsp;
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen" alt="license" /></a>
  &nbsp;
  <img src="https://img.shields.io/node/v/openclaw-cli" alt="node" />
</p>

---

## 为什么需要它？

OpenClaw 以本地守护进程的方式运行。网络抖动、系统唤醒、意外更新——任何一个都可能让它悄悄挂掉，而你只有在用 AI 助手的时候才会发现。

OpenClaw CLI 替你盯着网关。检测到故障，自动重启，全程通知。零配置，不用盯。

## 开始使用

```bash
npm install -g openclaw-cli
openclaw-cli watch -d
```

就这样。OpenClaw CLI 现在在后台运行了。

## 核心命令

```bash
openclaw-cli watch            # 开始监控（前台）
openclaw-cli watch -d         # 开始监控（后台）
openclaw-cli unwatch          # 停止监控

openclaw-cli status           # 快速健康检查
openclaw-cli doctor           # 完整诊断
```

## 网关管理

```bash
openclaw-cli gateway start
openclaw-cli gateway stop
openclaw-cli gateway restart
```

## 监控面板

```bash
openclaw-cli monitor          # 启动 Web 面板（http://localhost:9090）
```

## 兼容别名

`openclaw-doctor`、`hello-claw`、`aiclaw`、`pddclaw` 等别名包全部指向同一个 CLI 引擎。

- 主包：https://www.npmjs.com/package/openclaw-cli
- 项目地址：https://github.com/Sobranier/openclaw-cli

## 更多文档

- 开发和发布流程：[CONTRIBUTING.md](./CONTRIBUTING.md)
- English README：[README.md](./README.md)

## 协议

[MIT](./LICENSE)
