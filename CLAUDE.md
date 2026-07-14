# 应帆×秦彻 · 专属回忆 — 项目说明

## 项目概述
恋与深空角色"秦彻"的专属回忆网页**迭代版**。基于分享版 fork，用于后续独立迭代开发。支持用户上传照片、添加语录、拖拽排序。仅本地使用，暂不部署。

- **GitHub**：`https://github.com/Fanchuan999/yingfan-x-qinche`

## 同步流程

```bash
cd "D:\small progect\应帆x秦彻"
git add -A
git commit -m "描述改了什么"
git push
```

## 版本关系

| 版本 | 路径 | 用途 |
|------|------|------|
| 原版（应帆） | `D:\small progect\秦彻（应帆）\` | 原始版，不动 |
| 分享版 | `D:\small progect\与秦彻的恋爱日常\` | Vercel 部署版 |
| **迭代版（当前）** | `D:\small progect\应帆x秦彻\` | 本地迭代开发 |

## 文件结构

- `index.html` — 唯一的页面文件（HTML + CSS + JS 全在一个文件里，~4000 行）
- `photos/` — 默认照片（已压缩，约 2MB 总量）
- `photos_backup/` — 原始照片备份（本地，已 .gitignore）
- `music/` — 音乐文件夹
- `.gitignore` — 排除 photos_backup/

## 存储机制

| 数据 | 存储位置 |
|------|---------|
| 用户上传照片 | IndexedDB `qinche-db` / `user_photos` |
| 自定义语录 | localStorage `qinche_custom_quotes` |
| 照片顺序 | localStorage `qinche_gallery_order` |
| 语录顺序 | localStorage `qinche_quotes_order` |
| 已删除默认照片 | localStorage `qinche_deleted_photos` |
| 已删除默认语录 | localStorage `qinche_deleted_quotes` |

## 设计约束

- 配色：黑底 + 红色（主色 #c41e3a），永远不改主题色
- 风格：暗黑炫酷，西方龙 + 乌鸦元素保留
- 音乐播放器：底部固定，紧凑高度 48px
- 保持火焰粒子特效

## 用户待办

- 桌宠功能（用户在计划中）