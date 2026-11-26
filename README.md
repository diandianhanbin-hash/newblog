# Less is more | 点点寒彬的学习日志

基于 Astro、TypeScript 和原生 CSS 的静态博客。文章、分类、标签、日期和搜索索引由 Markdown 构建。

## 本机开发

使用 Node.js 24 LTS 与 npm。

```sh
nvm use
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

开发服务器默认地址为 `http://localhost:4321/`，生产构建输出到 `dist/`。发布前可以用 `npm run preview` 验证产物。

## 编辑文章

在 `src/content/posts/` 下新建 Markdown 文件，填写以下字段。

```yaml
---
title: "文章标题"
publishedAt: "2026-11-26T15:30:00+08:00"
categories: ["分类"]
tags: ["标签"]
path: "/notes/example.html"
---
```

- `path` 为公开固定路径。同名文章使用不同路径。改名时可在 `aliases` 中添加历史 `.html` 路径，历史地址继续访问该篇文章。
- 首页和时间线按同一发布时间倒序排列，页面日期与年份按 `Asia/Shanghai` 显示。
- Markdown 的二级标题 `##` 会进入搜索。静态索引和文章目录共用渲染后的锚点。
- 图片用 Markdown 引用腾讯云开发云存储的公开 HTTPS 地址。音视频使用带 `controls` 的 `<audio>` 和 `<video>`，可设 `preload="metadata"`。使用访客可以长期访问的地址，避免带有短期签名的链接。

## 迁移记录

- 对照腾讯云托管文件清单与本机 VuePress 原稿，导入 219 篇 Markdown，保留各自的旧 `.html` 地址。历史路径 `/Talk/规则？.html` 对应改名后的《玩蚂蚁》。原云端文章 HTML 共 220 份，下载备份在本机 `.migration/cloud/`，由 Git 忽略。
- 保留旧站 `/tag/`、`/timeline/` 和备案入口。联系页提供邮件和「点点寒彬说」公众号二维码。
- 已核对的媒体和待补图片见 [旧博客媒体迁移清单](docs/legacy-media.md)。

## 腾讯云部署

现站所在环境为 `my-blog-5gdg4r47983f736d`。2026-11-26 通过 `tcb env list` 验证本机登录，并通过 `tcb hosting detail` 验证该环境的静态托管已开通。

正式发布需先确认目标环境 ID。确认后执行：

```sh
npm run build
tcb hosting deploy ./dist -e "<环境 ID>"
```

同一托管环境已有播客等独立路径，发布时需要保留这些对象。
