# 音匣 · 登录门 / 连接页盖章规格（给小戴）

**状态：** 设计盖章 · 2026-09-19 · 小杨  
**唯一稿源：** HTML 原型（PNG 仅对照）  
**路径：** `/Users/fuchenlin/Documents/tempwork/yinxia-prototype/pages/`  
- 启动：`splash.html`  
- 选服务：`connect.html`  
- 填表连接：`connect-form.html`（用户说的「连接到 Navidrome」应对这一页）  
- 失败：`connect-fail.html`  
- Token：`shared.css` 顶部 CSS 变量  

**画布：** 竖屏设计基准 390×844 pt（原型 phone 框）

---

## 0. 颜色 / 字体（全局）

| Token | 值 |
|---|---|
| `--bg` | `#0C0E16` |
| `--bg-2` | `#141824` |
| `--card` | `#1B2030` |
| `--card-2` | `#242A3C` |
| `--line` | `rgba(255,255,255,0.08)` |
| `--text` | `#F5F7FB` |
| `--muted` | `#8D93A8` |
| `--faint` | `#626883` |
| `--purple` | `#6D4DFF`（主按钮 / focus） |
| `--purple-2` | `#8D78FF` |
| `--green` | `#3DCF8E`（成功态） |
| `--danger` | `#FF6B6B` |

字体：系统 SF Pro / PingFang SC。正文 Regular；标题 Semibold。

---

## 1. 启动页 `splash.html`

- 全屏深色底（可径向紫渐变：`#3A2A62 → #120E1C → #090B12`）
- 居中：Logo（64 框、圆角 16、描边 2.4、三根等化器）→ 标题「音匣」→ Slogan「装下你的每一首歌」
- **无**系统 Form；整页可点 → `connect.html`
- 冷启动**禁止**直达曲库

---

## 2. 选服务 `connect.html`（登录门第一步）

**布局（自上而下）**
1. `connect-head`：Logo sm + 「音匣」+ 「添加资料库」  
2. 服务列表（竖排卡片，非系统 `List`/`Form`）  
3. 底注文案：「仅连接你自己的服务器」

**服务行 `.svc`**
- 背景：`--card`；圆角 **14–16**；左右边距 **16**；行间距 **10–12**
- 左：色点方标 **36×36**，圆角 **10**  
  - Subsonic `#3D8BFD` · Navidrome `#6D4DFF` · Jellyfin `#00A4DC` · Emby `#52B54B` · Plex `#E5A00D`
- 中：主文案 **17 Semibold**；副文案 **12 muted**（Navidrome 副文：「推荐 · 兼容 Subsonic」）
- 右：chevron muted
- 整行可点 → `connect-form` 并带上服务名

**与系统 Form 差异：** 不是 `Form { Section }` 分组表单；是自定义卡片列表。

---

## 3. 连接表单 `connect-form.html`（用户吐槽的那页）

### 3.1 结构（必须按此，不要用默认 Navigation+Form 堆）

```
[返回]                    （无大标题栏居中「连接到 xxx」系统风）
连接 Navidrome            ← 大标题 28 Semibold，左对齐
[徽章：色点 + Navidrome]  ← 小 pill，非 Section header
填写服务器信息            ← section-label 12–13 muted，大写感/字距可略松
┌ 服务器地址 ───────────┐  ← 自定义 field，不是 Form Section inset
│ https://…             │
├ 用户名 ───────────────┤
│                       │
├ 密码 ─────────────────┤
│ ••••••                │
└───────────────────────┘
提示：地址需含协议，如 https://
[ 连接 ]                  ← 主按钮 满宽 purple
改用其他服务              ← ghost 文字按钮
```

### 3.2 关键尺寸 / 组件

| 元素 | 规格 |
|---|---|
| 顶栏 | 仅返回 `icon-btn` 44 触控；**不要**系统大标题「连接到 Navidrome」 |
| 页标题 | 「连接 {服务名}」，**28pt Semibold**，左对齐，距顶栏下约 **8–12** |
| 服务徽章 `.badge` | 高约 **28**；左色点 8–10；字 13；背景略浅于 card；圆角满高胶囊 |
| section-label | **12–13 muted**，「填写服务器信息」；上间距 **20–24**，下 **8–10** |
| `.field` | 下间距 **14**；label **12 muted** 在输入框上方（**外置 label**，不要用 Floating / 系统 Form 内嵌） |
| 输入框 | 背景 `--card`；圆角 **12**；高约 **48**；左右 padding **14–16**；字 16；placeholder muted |
| focus | 内描边 / ring：`--purple` 1pt |
| 密码 | `secure`；无额外眼睛按钮也可（MVP） |
| 主按钮 `.btn` | 满宽；高 **50–52**；背景 `--purple`；字 17 Semibold 白；圆角 **14**；上间距 **16–20** |
| 次按钮 ghost | 无底；字 `--purple` 或 `--text`；居中；「改用其他服务」→ 回选服务页 |
| hint | 12 muted；在密码下、主按钮上 |

### 3.3 文案（盖章）

- 标题：`连接 Navidrome`（动态服务名），**不是**「连接到 Navidrome」  
- section：`填写服务器信息`  
- 字段：`服务器地址` / `用户名` / `密码`  
- 主按钮：`连接`  
- 次操作：`改用其他服务`

---

## 4. 失败态 `connect-fail.html`

- 顶栏可有居中短标题「连接 Navidrome」
- 顶部 `alert` 卡：标题「连接失败」+ 说明「无法访问服务器，请检查地址或网络」；危险色点缀
- 下方字段只读回显；主按钮「重试」；ghost「改用其他服务」

---

## 5. 与当前系统 Form 风 — 关键差异（改 UI 时优先砍这些）

| 现状（系统风） | 原型盖章 |
|---|---|
| 导航大标题 / 「连接到 Navidrome」 | 左对齐 **28**「连接 Navidrome」+ 返回，无系统 Large Title |
| `Form { Section("服务器信息") { TextField } }` 分组灰底 | 外置 label + 独立圆角输入条，无 Form Section 容器 |
| Inset grouped 列表分割线 | 字段间距 14，靠卡片自身圆角分离 |
| 主按钮挤在 Form 底或 toolbar | 页面流里满宽 purple **连接** |
| 缺少选服务门 | **必须先有** `connect` 五服务列表，再进表单 |
| 成功后体验像「登录页」残留 | 成功进曲库；失败用 alert 卡，不弹系统 Alert 替代整页（可用 toast 辅） |

---

## 6. 实现优先级（给工程）

1. 拆两页：ServicePicker（`connect`）→ ConnectForm（`connect-form`）  
2. ConnectForm 按 §3 自定义布局，**禁用**默认 `Form` 外观  
3. 颜色/圆角吃 token  
4. 失败态按 §4  
5. 对照打开：`pages/connect-form.html`（浏览器）

有歧义 @小杨。截图以 HTML 原型为准。
