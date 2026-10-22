# AUREL STUDIO 全站质量验收与上线前审计

> 审计日期：2026-10-22
> 审计对象：`E:\电商网站`（Next.js 16.4.2 / React 19.3.0 / TypeScript 5 / Tailwind CSS 4）
> 审计性质：只读验收。未修改任何业务代码、商品数据、依赖或视觉设计。
> 审计范围：第一至第四阶段（品牌首页、商品与 SKU、购物车/收藏/搜索、多币种/国际化/SEO）。

---

## 0. 审计方法与限制

### 0.1 实际执行的环境

| 项目 | 实际情况 |
|---|---|
| 依赖 | `node_modules` 已存在，直接复用；未安装任何项目依赖 |
| 开发服务器 | 复用已在 `http://localhost:3000` 运行的 `next dev` |
| 生产验证 | 执行 `npm run build` 成功，另起 `next start -p 3100` 做生产模式复测 |
| 浏览器 | Playwright Core + 本机 Microsoft Edge（Chromium），真实 Chromium 内核；Playwright Core 安装在项目外的托管工作区，未写入 `package.json` |
| 视口 | 375×812、390×844、430×932、768×1024、1440×900 |
| 工程检查 | `tsc --noEmit`、`eslint .`、`vitest run`、`next build` |
| 数据验证 | 直接读取 `catalog` 数据模型与 25 个商品的变体矩阵，不依赖页面文案 |

### 0.2 明确未做的验证（不得视为通过）

- 未运行 Lighthouse（本机未安装，未擅自引入依赖），因此**没有 Performance / Accessibility 分数**；性能只报告实测 LCP/CLS/TBT 与资源体积。
- 未做真实网络限速（4G/3G）与真实手机测试；移动端仅做 4× CPU 降速 + 375px 视口模拟。
- 未做 NVDA / VoiceOver 屏幕阅读器实测，只做 DOM 层可访问性检查。
- 未做 Safari / Firefox 兼容性测试。
- 未做线上部署验证（CDN、缓存头、真实域名、hreflang 线上表现）。
- 未做支付/结账验证：项目本就没有结账，按钮为禁用的 Demo 状态。

### 0.3 只读声明

本轮除新增本报告与 `.workbuddy/memory/2026-10-22.md` 工作日志外，未改动项目文件。临时测试脚本与截图放在项目外的 `%TEMP%\aurel-qa\`，未写入项目目录；`npm run build` 只改写了 `.next` 构建产物。

---

## A. 项目整体状态

| 问题 | 结论 | 依据 |
|---|---|---|
| 网站能否正常启动 | **YES** | `next dev` 与 `next start` 均返回 200；首页、集合、商品、购物车、收藏、搜索均可打开 |
| 能否正常构建 | **YES** | `npm run build` 成功，生成 33 条 sitemap URL；无构建错误 |
| 能否完成购物演示 | **YES** | 五条用户路径 A–E 全部实测通过，含 SKU 校验、金额校验、刷新持久化 |
| 核心功能是否真实可用 | **YES，有保留** | 加购/合并/库存/金额/收藏/搜索/币种均为真实逻辑，不是 UI 空壳；但商品图片数据、国际化覆盖、死链存在明显缺口 |
| 是否适合直接用于面试展示 | **CONDITIONAL** | 视觉与工程底子明显高于普通作品集；但演示时点到 `/editorial`、页脚政策页会 404，切德语后导航仍是英文，属于“现场会被看见”的问题 |
| 是否达到进入第五阶段的条件 | **CONDITIONAL** | 无 P0/P1；有 8 项 P2。建议先清掉 P2，再进入结账/埋点/E2E 阶段 |

**一句话结论：** 这不是模板堆砌，是一套真实可跑的电商前端；功能完成度高，但“商品图片真实性、国际化完整性、死链、无效路由状态码”四项还不满足“前四阶段已完成”的验收标准。

---

## B. 阶段验收表

| 阶段 | 状态 | 主要问题 |
|---|---|---|
| 第一阶段：品牌首页 | **PARTIAL** | 视觉、布局、图片、导航均正常；但 Hero 第二 CTA「View the lookbook」、mega menu「Read the story」、Editorial Band 三处均指向不存在的 `/editorial`；Newsletter 为无请求的假成功；页脚 8 个链接 404 |
| 第二阶段：商品列表、详情、SKU | **PARTIAL** | 筛选/排序/URL/刷新/无结果/Quick Add/Quick View/Gallery/颜色/尺码/SKU/库存/相关商品全部通过；但多款商品主图与商品本身不对应（包袋无包、长裤无裤、帽款错帽型），商品数据可信度不达标 |
| 第三阶段：购物车、Wishlist、搜索 | **PASS** | 同 SKU 合并、不同 SKU 分行、超库存收敛、删除、小计、Header 同步、刷新保留、损坏 localStorage 自愈、搜索大小写/空格/无结果/URL/返回全部通过；Wishlist 页有 1 个 React `getServerSnapshot` 控制台错误（P2），不影响功能 |
| 第四阶段：多币种、国际化、SEO | **PARTIAL** | USD/EUR/GBP 换算与持久化正确，JSON-LD 始终 USD 且价格/库存真实；但 `$150`、导航「Under $100」、搜索弹窗价格不随币种；德语只翻译了部分界面，导航/页脚/筛选/搜索页仍是英文，无语言路由；无效动态路由首次请求返回 200，404 页输出冲突的 robots 标签 |

---

## C. 功能测试明细

### C.1 工程检查（全部实际执行）

| 检查 | 命令 | 结果 | 说明 |
|---|---|---|---|
| TypeScript | `npx tsc --noEmit` | **PASS** | 退出码 0，无错误；`strict: true`，源码中 `any` 出现 0 次 |
| ESLint | `npx eslint .` | **PASS** | 退出码 0，无警告输出；但 `package.json` 的 `lint` 脚本没有 README 声称的 `--max-warnings=0` |
| 单元测试 | `npx vitest run` | **PASS** | 9 个测试文件、113/113 通过；覆盖目录数据、变体唯一性、购物车 reducer、库存收敛、币种换算、JSON-LD |
| 生产构建 | `npm run build` | **PASS** | Next 16.4.2 + Turbopack 构建成功；`/`、`/cart`、`/wishlist`、`/search`、`robots.txt`、`sitemap.xml` 生成 |
| 依赖安全 | `npm audit --omit=dev` | **PASS** | 0 个生产依赖漏洞 |
| 端到端测试 | 项目内 | **NOT IMPLEMENTED** | 仓库没有 Playwright/Cypress 配置；本次审计使用项目外临时脚本，不作为项目资产 |

### C.2 路由与运行状态

生产模式（3100）逐条请求结果：

| 路由 | 状态 | 结果 |
|---|---|---|
| `/` | 200 | PASS，H1「Designed for the way you live.」 |
| `/collections/women`、`/men`、`/knitwear`、`/shirts`、`/trousers`、`/outerwear`、`/accessories` | 200 | PASS，7 个集合全部可访问 |
| `/products/fluid-cotton-tee`、`/wool-overcoat`、`/straw-bucket-hat` | 200 | PASS；sitemap 中 25 个商品 URL 全部 200 |
| `/cart` | 200 | PASS |
| `/wishlist` | 200 | PASS（开发模式控制台有 React 错误，见 P2-04） |
| `/search`、`/search?q=wool` | 200 | PASS |
| `/products/不存在` | 首次 200，二次 404 | **FAIL（P2-08）**，软 404 |
| `/collections/不存在` | 首次 200，二次 404 | **FAIL（P2-08）**，软 404 |
| `/editorial`、`/account`、`/shipping`、`/returns`、`/faq`、`/contact`、`/privacy`、`/terms`、`/cookies`、`/accessibility` | 404 | **FAIL（P2-07）**，站内 10 个入口指向这些地址 |
| `/de`、`/de/products/fluid-cotton-tee` | 404 | **FAIL（P2-06）**，无语言路由 |

> 说明：无效路由的状态码不稳定——开发模式下集合页始终 200、商品页 404；生产模式下首次请求任何新 slug 为 200（软 404），第二次才 404。这是 Cache Components（PPR）先流出外壳、后执行 `notFound()` 导致的，不是网络偶发。

### C.3 第一阶段：品牌首页

| 测试项 | 结果 | 证据 |
|---|---|---|
| Logo / 字标 | PASS | 文本字标「AUREL STUDIO / EST. 2026」，无破图 |
| 导航可用 | PASS | 主导航 5 项 + mega menu 2 组，hover 与 focus 均可打开 |
| Hero 图片加载 | PASS | 1800×2520 源图，`priority`，实际请求 1920w，71.6 KB |
| 商品入口跳转 | PASS | 「Shop the collection」→ `/collections/women`（200） |
| Header / Footer | PASS | 粘性头部、三列页脚、地区选择器均渲染 |
| 布局稳定 / 无横向滚动 | PASS | 5 个视口 `scrollWidth === clientWidth`；首页与 PDP 实测 CLS = 0 |
| 图片比例 | PASS | 商品卡固定 3:4，`object-cover`，无拉伸 |
| 字体 / 留白 / 对齐 | PASS | Instrument Serif 标题 + Schibsted Grotesk 正文；栅格一致 |
| 所有可点击按钮有效 | **FAIL** | Hero「View the lookbook」、mega menu「Read the story」、Editorial Band 均 → `/editorial` 404 |
| 占位/假内容 | **FAIL** | Newsletter 提交后显示“Thank you — you are on the list”，但无网络请求、无存储（P3-03） |
| 页面质感 | PASS | 版式、留白、影调统一，具备欧美静奢品牌感，不是默认模板 |

### C.4 第二阶段：商品列表

| 测试项 | 结果 | 证据 |
|---|---|---|
| 商品卡可打开 | PASS | 列表首卡、搜索首条、收藏卡均可进入 PDP；25 个商品 URL 全 200 |
| 名称 / 价格正确 | PASS | 列表与详情一致（`$72` vs `$72`）；折扣款 `$58 / $68` 双价都显示 |
| 分类有效 | PASS | 7 个集合均有对应商品；分类间交叉收录（如 Fluid Cotton Tee 同属 women/knitwear）正常 |
| 价格筛选 | PASS | `?price=under-100` → 仅 `$72/$58`，全部 < $100 |
| 颜色筛选 | PASS | `?color=ink` → 4/9 件；复选框回显 checked；刷新保持 |
| 尺码筛选 | PASS | `?size=XS` → 8 件（已排除 XS 全渠道缺货款） |
| 排序 | PASS | `sort=price-asc` → 58,72,128,135,165,185,245,295,340 严格升序 |
| URL 参数 | PASS | `color/size/price/sort` 可读、可分享；排序默认值不写入 URL |
| 刷新保持筛选 | PASS | `?color=ink` 刷新后仍 4 件，URL 与控件状态一致 |
| 无结果状态 | PASS | `color=oyster&size=XL&price=under-100` 显示空状态与清除入口 |
| Quick Add | PASS | 网格选码加购成功，购物车得到 `Fluid Cotton Tee / Bone / S`，SKU `AUR-WMN01-bone-S` |
| Quick View | PASS | 弹窗打开/关闭正常；选码加购后购物车 SKU 正确 |
| 商品图片正确 | **FAIL** | 多款商品主图与商品不对应，详见 P2-01 |

### C.5 第二阶段：商品详情（实测 3 款）

| 测试项 | 结果 | 证据 |
|---|---|---|
| 普通商品：Fluid Cotton Tee | PASS | 2 色 × 5 码；XS 全渠道缺货并禁用；Bone/Ink 主图切换正确 |
| 多色多码：Wool Overcoat | PASS | Heather Moss/Graphite；L 码禁用；选 Graphite + M 加购，SKU 含 `-graphite-M` |
| 单色商品：Straw Bucket Hat | PASS | 1 色 × 3 码；S 缺货禁用，改选 M 成功加购 |
| Gallery 切换 | PASS | 缩略图 2 张；切换后主图 `src` 变化 |
| 颜色选择联动 | PASS | 切 Ink 后主图、库存、尺码状态同步更新 |
| 尺码选择联动 | PASS | 选 M 后提示「In stock — Ink / M」 |
| Variant ID 匹配 | PASS | 购物车 sr-only 文本显示 `SKU AUR-WMN01-ink-M`，与所选 Ink/M 完全一致 |
| 库存校验 | PASS | 库存 0 的尺码按钮 `disabled` + 删除线；不可加购 |
| Add to Bag | PASS | 加购后抽屉自动打开，Header 数量 1 |
| Size Guide | PASS | 打开显示厘米表；Escape 与遮罩均可关闭 |
| Related Products | PASS | 「Worn with」固定 4 件，均可进入详情 |
| 列表/详情价格一致 | PASS | `$72` = `$72`；折扣款原价/现价转换规则一致（GBP `£45.82 / £53.72`） |
| 商品图片与标题一致 | **FAIL** | 见 P2-01：Canvas Weekender Bag 首图为戴草帽的女性，画面中没有包 |

### C.6 第三阶段：购物车

| 测试项 | 结果 | 证据 |
|---|---|---|
| 完整链路 | PASS | 列表 → 详情 → 选 Ink/M → 加购 → 抽屉 → 购物车页 → 改数量 → 删除 |
| 相同 SKU 合并 | PASS | 再次加入 Ink/M 后仍 3 行，该行数量变 2，金额 `$144` |
| 不同 SKU 区分 | PASS | Ink/M、Graphite/M、Natural/M 三行独立 |
| 数量变化 | PASS | +1 后行金额 `$216`；减到 1 时「−」禁用（需用 Remove 删除） |
| 超库存不能购买 | PASS | 预置数量 99 的 `AUR-WMN01-bone-M`（库存 5），刷新后自动收敛为 5；`+` 在 5 时禁用 |
| 删除 | PASS | Remove 后行数 3 → 2 |
| Subtotal | PASS | `$144 + $485 + $45 = $674`，与汇总 `$674` 完全一致 |
| Header 数量同步 | PASS | 加购后 aria-label 变为「Shopping bag, 1 item」 |
| 刷新保留 | PASS | 2 行 → 刷新 → 2 行，数量/金额不变 |
| 负数/无效 SKU | PASS | 数量 ≤0 走删除；无效 SKU 在 hydration 后被清除，0 行 |
| 损坏 localStorage | PASS | 写入 `{not json` 后页面仍正常渲染，无白屏 |
| 关闭与键盘 | PASS | Escape 关闭；打开时 `body overflow: hidden`；焦点进入关闭按钮，关闭后回到触发按钮 |
| 结账 | PASS（如设计） | 按钮 `disabled`，文案明确「Checkout — demo / no payment」，不是假结账 |

### C.7 第三阶段：Wishlist

| 测试项 | 结果 | 证据 |
|---|---|---|
| 收藏 / 取消收藏 | PASS | 卡片心形按钮切换，Header 计数 1 → 0 |
| 收藏数量 | PASS | aria-label「Wishlist, 1 item」 |
| 收藏列表 | PASS | `/wishlist` 显示 1 件（重新测试后修正了旧页面 DOM 残留导致的误计） |
| 重复收藏 | PASS | store 用 `includes` 去重，重复点击不会产生重复项 |
| 刷新保留 | PASS | 刷新后仍 1 件 |
| 进入详情 | PASS | 收藏卡 → `/products/fluid-cotton-tee` |
| 有效 SKU 加购 | PASS | 收藏页商品选码后加购成功 |
| 控制台 | **FAIL（P2-04）** | 开发模式 `/wishlist` 报 `The result of getServerSnapshot should be cached to avoid an infinite loop`，页面出现红色 1 Issue 浮标 |

### C.8 第三阶段：搜索

| 测试项 | 结果 | 证据 |
|---|---|---|
| 商品名搜索 | PASS | `tee` → 5 个结果；`Wool Overcoat` → 首条即目标商品 |
| 分类搜索 | PASS | `knitwear` → 5 个结果（集合 4 件 + 1 件文案提及 knitwear），宽匹配符合设计 |
| 大小写 | PASS | `tee` / `TEE` / `Tee` 均为 5 条 |
| 前后空格 | PASS | `"  tee  "` 仍 5 条（`normalizeQuery` 去空格） |
| 不存在关键词 | PASS | `zzzzqqq` → 0 条 + 空状态 |
| Enter 搜索 | PASS | 弹窗回车 → `/search?q=COAT`，结果 8 条 |
| 实时建议 | PASS | 输入 `COAT` 即时出 4 条商品建议 |
| 结果页 | PASS | 标题显示关键词与结果数；商品卡可点 |
| URL 参数 | PASS | `?q=` 保留；页内筛选后仍保留 `q=tee` |
| 刷新 / 返回 | PASS | 刷新结果不变；浏览器返回到上一查询 |
| 无结果状态文案 | **FAIL（P3-02）** | 显示「Nothing in this collection fits those filters」，且「Clear all filters」指向同一 URL，点击无任何变化 |
| 关键词语义 | PASS | 特殊字符按文本渲染，无 XSS/反射脚本 |

### C.9 第四阶段：多币种

| 测试项 | 结果 | 证据 |
|---|---|---|
| USD 基准 | PASS | `$72` |
| 切 UK → GBP | PASS | Header「GB · GBP」；`$72 → £56.88`（72 × 0.79） |
| 切 EUR | PASS | `€66.24`（72 × 0.92）；国家可保留 UK 而单独改币种 |
| 全站价格同步 | **FAIL（P2-02）** | PDP 仍写「Complimentary shipping over $150」；公告栏仍 `$150`；导航仍「Under $100」 |
| 购物车金额 | PASS | GBP 小计 `£56.88`；EUR `€66.24`；与基础 USD 线性一致 |
| 原价/折扣价一致 | PASS | `$58/$68 → £45.82/£53.72`，同一 `usePrice` 规则 |
| 刷新保留 | PASS | GBP 刷新后仍 GB · GBP |
| 国家 → 币种 | PASS | US→USD、GB→GBP、DE/FR→EUR；可手动覆盖 |
| 重复货币符号 | PASS | 未出现 `$…£`、`£…$` 混排 |
| 汇率说明 | PASS | 区域弹窗明确「Reference prices… Not a live market rate, and not a settlement currency」，购物车页也有 Demo 说明 |
| 搜索弹窗价格 | **FAIL（P2-03）** | EUR 模式下搜索建议仍显示 `$58 / $72 / $68 / $420 / $128` |
| JSON-LD 币种 | PASS | 无论显示币种如何，Offer 始终 `priceCurrency: "USD"`，不谎报可结算币种 |

### C.10 第四阶段：国际化

| 测试项 | 结果 | 证据 |
|---|---|---|
| 默认英文 | PASS | SSR `lang="en"`，英文文案 |
| 已声明语言 | PASS（声明层面） | `LOCALES = ["en","de"]`，`DISPLAY_LOCALES` 两种 |
| 导航翻译 | **FAIL（P2-05）** | 切德语后主导航仍 `WOMEN / MEN / KNITWEAR / OUTERWEAR / ACCESSORIES` |
| 页脚翻译 | **FAIL（P2-05）** | 栏目标题 `SHOP / CLIENT CARE / STUDIO` 与链接仍英文 |
| 购物车界面 | PASS | `Warenkorb`、`Zwischensumme`、`Versand`、`Zur Kasse — Demo-Shop` |
| 商品页按钮 | PASS | `In den Warenkorb`、`Größe wählen`、`Größentabelle` |
| 搜索界面 | PARTIAL | placeholder/结果数已翻译；结果页大标题「results across the collection」仍硬编码英文 |
| 筛选面板 | **FAIL（P2-05）** | `FILTER / COLOUR / SIZE / PRICE / Clear` 未翻译（FilterPanel 完全未接 `t()`） |
| 语言路由 | **FAIL（P2-06）** | `/de`、`/de/products/...` 均 404；语言只存 localStorage |
| `html lang` | PASS | 切换后 `document.documentElement.lang = "de"` |
| 切换后购物车状态 | PASS | 语言/币种切换后行项目、数量、SKU 均不变 |
| 缺失翻译回退 | PASS（类型层） | `de` 是 `Record<DictionaryKey,string>`，缺 key 编译失败；运行时 `translate` 回退英文 |
| 商品内容本地化 | PARTIAL（如设计） | 标题/描述/材质保持英文，README 已声明为 merchandising content |
| 数字格式本地化 | **FAIL（P2-05）** | 德语下仍显示 `€66.24`（点号+符号前置），未使用 `de-DE` 的 `66,24 €`；`usePrice` 固定 `formatAmount` 默认 locale |

### C.11 第四阶段：SEO（检查服务端原始 HTML，非 hydration 后 DOM）

| 检查项 | 结果 | 证据 |
|---|---|---|
| Title | PASS | 首页 / 集合 / 商品各自独立；模板 `%s — AUREL STUDIO` |
| Meta Description | PASS | 首页、集合、商品均为独立描述 |
| Canonical | PASS（本地） | 每页独立；集合筛选页 canonical 回干净 URL；无根级 canonical |
| Canonical 是否 localhost | 说明（P3-14） | 本地 `.env.local` 故意设为 `http://localhost:3000`；`.env.example` 为空时不输出 canonical。部署必须设置真实域名 |
| Open Graph | PASS | `og:title/description/url/image/type/site_name`；商品用自身首图 |
| Twitter Card | PASS | `summary_large_image` + 独立标题/图 |
| Product JSON-LD | PASS | 每个变体一个 Offer：SKU、`price`、`priceCurrency: USD`、`InStock/OutOfStock` |
| 价格真实性 | PASS | `$72` → `"price": "72.00"`；XS 库存 0 → `OutOfStock` |
| 虚假 Review/Rating | PASS | 无 `aggregateRating`、`review`、`gtin`、`priceValidUntil` |
| Breadcrumb JSON-LD | PASS | Home → 集合 → 商品三级，URL 正确 |
| Sitemap | PASS | 33 条 URL（1 首页 + 7 集合 + 25 商品），去重后逐条请求全部 200 |
| Robots.txt | PASS（按开关） | `SEO_INDEXING=true` 时 Allow + Sitemap；默认关闭时 `Disallow: /` |
| Cart noindex | PASS | `noindex, nofollow` |
| Wishlist noindex | PASS | `noindex, follow` |
| Search noindex | PASS | `noindex, follow`（含 `?q=`） |
| 筛选页 noindex | PASS | `noindex, follow` + canonical 回干净集合 |
| hreflang | N/A（合理） | 只有英文有 URL；项目明确不伪造德语 URL，符合规范 |
| 无效商品 404 | **FAIL（P2-08）** | 首次请求 200 + noindex，二次才 404 |
| 404 页 robots | **FAIL（P2-08）** | 同时输出 `index, follow` 与 `noindex` 两条冲突标签 |
| 多语言重复内容 | PASS | 无 `/de` 页面，不存在重复内容 |
| 每个商品独立 Metadata | PASS | title/description/canonical/OG 均来自该商品 |
| Sitemap 无效 URL | PASS | 0 条无效 |

### C.12 响应式与移动端

5 个视口 × 5 个页面（首页、集合、PDP、购物车、搜索）全部实测：

| 视口 | 横向溢出 | 布局/图片/按钮 |
|---|---|---|
| 375×812 | 无 | 汉堡菜单、单列商品、PDP 全宽图、购物车单列；无卡片错位 |
| 390×844 | 无 | 同上；搜索弹窗全宽、可滚动 |
| 430×932 | 无 | 同上 |
| 768×1024 | 无 | 3 列商品；筛选切换为抽屉；头部仍为移动布局 |
| 1440×900 | 无 | 4 列商品；左侧固定筛选；PDP 双栏；抽屉 430px |

补充：
- 移动端导航抽屉打开/关闭正常（x 坐标 -390 → 0 → -390），Escape 生效，body 滚动锁定并在关闭后恢复。
- 移动端筛选抽屉需点「Filter」打开，URL 更新后列表刷新，逻辑与桌面一致。
- 移动端头部不显示地区选择器（`hidden lg:block`），只能从页脚进入；可用，但不如桌面直观（P3）。
- 所有 5 个页面 `documentElement.scrollWidth === clientWidth`，无横向滚动。

### C.13 五条用户路径（生产模式实测）

| 流程 | 步骤 | 预期 | 实际 | 结果 |
|---|---|---|---|---|
| A 商品购买 | 首页 → Women → Fluid Cotton Tee → Ink/M → Add to Bag → Cart → 数量 2 | 抽屉出现 Ink/M；小计翻倍 | 抽屉 `Ink / M`、SKU `AUR-WMN01-ink-M`；小计 `$144` | **PASS** |
| B 收藏购物 | Men → 收藏 Wool Overcoat → Wishlist → 商品 → 选码 → Add to Bag | 收藏 1 件；加购成功 | 收藏页 1 件；购物车出现 Wool Overcoat | **PASS** |
| C 搜索购物 | Header 搜索 Wool Overcoat → 结果页 → 商品 → Add to Bag | 首条为目标；加购成功 | 5 条结果，首条 Wool Overcoat；购物车 `Heather Moss / M` | **PASS** |
| D 跨境购物 | 切 UK → GBP → Wool Overcoat → Add → Cart | `$485 → £383.15`，购物车同额 | `$485 → £383.15`；小计 `£383.15` | **PASS** |
| E 刷新持久化 | 加购 + 收藏 → 刷新 → 切德语 + EUR → 再刷新 | 数据、语言、币种全部保留 | 购物车 1 件、收藏 1 件；`lang=de`、`€66.24`；再次刷新仍一致 | **PASS** |

### C.14 可访问性（DOM 层）

| 检查项 | 结果 | 说明 |
|---|---|---|
| 图片 alt | PASS | 所有可见 `<img>` 均有 alt；PDP 缩略图为装饰性 `alt=""` |
| 按钮可访问名 | PASS | 可见 button 均有文本或 aria-label |
| 链接可访问名 | PASS | 无空链接 |
| 表单标签 | PASS | 搜索框、邮箱框、排序框均有 label；筛选 checkbox 由 `<label>` 包裹（隐式标签） |
| 重复 id | PASS | 6 个页面均无重复 id |
| 标题层级 | PASS | 每页 1 个可见 H1（路由缓存会保留隐藏旧页，但 `display:none`，不进入无障碍树） |
| 焦点管理 | PARTIAL（P3-04） | 抽屉/弹窗打开时焦点进入，关闭后返回；但无焦点陷阱，Tab 可逃到背景 |
| 键盘关闭 | PASS | Escape 关闭抽屉、搜索、尺码表、移动菜单 |
| 对比度 | **NOT TESTED** | 未接 axe/Lighthouse，未做像素级对比度计算 |

### C.15 稳定性与安全

| 检查项 | 结果 | 说明 |
|---|---|---|
| Promise 未处理 | PASS | 未见未捕获 Promise；`pageerror` 0 条（生产） |
| Hydration 错误 | PASS | 无 hydration mismatch；SSR 首屏为英文/USD，客户端切换后一致 |
| 状态同步 | PASS | Header 数量、抽屉、购物车页、收藏计数均由同一 store 派生 |
| localStorage 异常 | PASS | 损坏 JSON、无效 SKU、超库存均能自愈，不白屏 |
| XSS | PASS | 无用户输入 `dangerouslySetInnerHTML`；JSON-LD 仅转义 `<`；搜索词按文本渲染 |
| 敏感信息 | PASS | 仓库无密钥；`.env.local` 仅 SITE_URL/SEO_INDEXING，且被 `.gitignore` 排除 |
| 安全响应头 | **FAIL（P3-13）** | `next.config.ts` 未配置 CSP / X-Frame-Options / Referrer-Policy 等 |
| 错误边界 | **FAIL（P3-12）** | 无 `error.tsx` / `global-error.tsx`，客户端异常会落到 Next 默认错误页 |
| 控制台（生产） | PASS（除死链预取） | 仅死链 prefetch 的 404；无 React/Next 运行时错误 |

---

## D. 错误清单

### D.0 统计

| 等级 | 数量 | 说明 |
|---|---|---|
| P0 阻断 | 0 | 无无法运行、路由崩溃、数据损坏 |
| P1 严重 | 0 | 无加购失败、SKU 错配、金额错误、核心功能不可用 |
| P2 中等 | 8 | 图片数据、币种覆盖、搜索币种、React 错误、国际化、语言路由、死链、软 404 |
| P3 轻微 | 17 | 细节体验、代码整洁、文档、配置、性能优化 |

### D.1 P0 — 阻断问题

无。

### D.2 P1 — 严重问题

无。所有核心交易链路（选 SKU → 加购 → 合并 → 改量 → 金额 → 持久化）均通过真实浏览器验证。

### D.3 P2 — 中等问题

#### P2-01 多款商品主图与商品本身不对应

1. **位置**：集合页商品卡、PDP 主图/Gallery、Related Products、收藏页、搜索建议
2. **严重等级**：P2（在电商语境下接近 P1，属商品数据可信度问题）
3. **复现步骤**：
   - 打开 `/products/canvas-weekender-bag` → 主图为「戴草帽、穿牛仔上衣的女性」，画面中没有包；
   - 打开 `/products/linen-wide-leg-trouser` → 两张图为「牛仔外套」与「麂皮靴+牛仔裤」，没有亚麻长裤；
   - 打开 `/products/pleated-wool-trouser` → 两张图为「皮鞋」与「靴子+牛仔裤」；
   - 打开 `/products/straw-bucket-hat` 或 `/products/ribbed-wool-beanie` → 均为「宽檐毡帽」；
   - `/products/silk-blend-slip-dress` 第二张为「细针织上衣」；`/products/quilted-liner-jacket` 使用皮衣图。
4. **预期行为**：主图至少能辨认出该商品品类/颜色；颜色切换应看到对应颜色。
5. **实际行为**：25 个商品复用 24 个图片键（仅 23 个 catalog 图片文件），部分商品图与品类完全无关；同一商品两个颜色经常只是两张图互换顺序。
6. **根本原因**：`src/data/catalog.ts` 的 `PHOTO` 池按“氛围图”组织，`ColorSpec.photos` 手工指定，缺少“商品品类 ↔ 图片内容”的校验；`catalog.test.ts` 只校验图片存在，不校验语义匹配。
7. **建议修改方案**：
   - 为包袋、长裤、帽款、围巾、开衫补拍/换用对应品类图；
   - 若短期无法补图，至少把商品名改为与图片一致（如把“Canvas Weekender Bag”换成图片中真实存在的单品），避免“图文不符”；
   - 在 `catalog.test.ts` 增加启发式校验：商品标题关键词（bag/trouser/hat/scarf…）必须出现在至少一张主图 alt 中；
   - 颜色图至少保证首图能看出该颜色。
8. **涉及文件**：`src/data/catalog.ts`、`public/images/catalog/*`、`src/data/catalog.test.ts`

#### P2-02 币种切换未覆盖全站价格文案

1. **位置**：PDP 配送说明、Product Details「Shipping & returns」、公告栏、mega menu「Under $100」
2. **严重等级**：P2
3. **复现步骤**：切 UK → GBP → 打开 `/products/fluid-cotton-tee` → 查看价格区下方与页面顶部公告栏；再进 `/cart` 看免邮进度。
4. **预期行为**：所有金额按当前币种展示；免邮门槛与购物车一致。
5. **实际行为**：PDP 仍显示「Complimentary shipping over $150」，公告栏仍「over $150」，而购物车按 `£118.50` 门槛计算；导航仍写「Under $100」，筛选面板却显示「Under £92」。
6. **根本原因**：这些文案是硬编码字符串，没有走 `useFormatUsdCents`/`formatUsd`；免邮门槛常量 `FREE_SHIPPING_THRESHOLD` 只在购物车使用。
7. **建议修改方案**：把门槛提到配置（如 `FREE_SHIPPING_THRESHOLD`），文案用 `t()` + `format()` 插值；导航价格带文案从 `PRICE_BANDS` 动态生成，或明确写成「Under $100 (USD)」。
8. **涉及文件**：`src/components/product/product-view.tsx:248`、`src/components/product/product-details.tsx:38`、`src/data/site.ts:39,64,118`、`src/components/layout/announcement-bar.tsx:11`、`src/lib/cart/logic.ts`

#### P2-03 搜索弹窗价格固定 USD

1. **位置**：Header 搜索弹窗的建议列表
2. **严重等级**：P2
3. **复现步骤**：切 EUR → 打开搜索 → 输入 `tee`。
4. **预期行为**：与全站一致显示 `€`。
5. **实际行为**：显示 `$58 / $72 / $68 / $420 / $128`。
6. **根本原因**：`search-dialog.tsx` 直接调用 `formatMoney(product.price)`（USD 快照），未使用 `usePrice()`。
7. **建议修改方案**：改用 `usePrice()`；顺手把 `formatMoney` 从该组件移除，避免两套格式化入口。
8. **涉及文件**：`src/components/search/search-dialog.tsx`

#### P2-04 Wishlist 页 React `getServerSnapshot` 错误

1. **位置**：`/wishlist`
2. **严重等级**：P2
3. **复现步骤**：`npm run dev` → 打开 `/wishlist` → 看控制台与右下角红色「1 Issue」。
4. **预期行为**：无 React 错误。
5. **实际行为**：`The result of getServerSnapshot should be cached to avoid an infinite loop`；开发浮标显示 1 Issue。
6. **根本原因**：`WishlistView` 的 `useSyncExternalStore(..., () => [], ...)` 每次调用返回新数组，快照引用不稳定。
7. **建议修改方案**：模块级 `const EMPTY_SLUGS: string[] = []`，getServerSnapshot 返回该常量；同时检查其他 `useSyncExternalStore` 是否返回对象/数组。
8. **涉及文件**：`src/components/wishlist/wishlist-view.tsx`

#### P2-05 国际化覆盖不完整（含数字格式）

1. **位置**：Header、Footer、公告栏、集合页标题/描述、筛选面板、搜索页标题、PDP Details、价格格式
2. **严重等级**：P2
3. **复现步骤**：切 Deutsch → 浏览首页、集合、搜索、购物车。
4. **预期行为**：界面文案随语言切换；德语价格用 `66,24 €`。
5. **实际行为**：导航/页脚/筛选/搜索标题/公告栏仍英文；购物车标题已变 `Warenkorb`，形成中英混排；价格仍 `€66.24`。
6. **根本原因**：`site-header.tsx`、`site-footer.tsx`、`announcement-bar.tsx`、`filter-panel.tsx`、`search/page.tsx`、`product-details.tsx` 未接 `useT()`；`use-price.ts` 调 `formatAmount` 时未传 `intlLocale`（默认 en-US）。
7. **建议修改方案**：
   - 把导航/页脚数据改为 `labelKey`，由组件 `t()` 取词；
   - 筛选面板、搜索页标题、PDP Details 全量接字典；
   - `usePrice` 使用 `useIntlLocale()` 作为第三个参数；金额/日期统一走同一入口；
   - 增加“德语页面不得出现英文导航词”的 E2E 断言。
8. **涉及文件**：`src/components/layout/site-header.tsx`、`site-footer.tsx`、`announcement-bar.tsx`、`src/components/collection/filter-panel.tsx`、`src/app/search/page.tsx`、`src/components/product/product-details.tsx`、`src/lib/preferences/use-price.ts`、`src/i18n/dictionaries.ts`

#### P2-06 无语言路由（/de 404）

1. **位置**：`/de`、`/de/collections/...`、`/de/products/...`
2. **严重等级**：P2（第四阶段明确要求“语言路由”）
3. **复现步骤**：直接访问 `/de/products/fluid-cotton-tee`。
4. **预期行为**：要么提供 `/[locale]` 路由，要么在 README 中把“国际化”定义为纯 UI 预览并明确不承诺路由。
5. **实际行为**：404；语言只存在 localStorage，无法分享德语链接。
6. **根本原因**：`i18n/config.ts` 只有 `LOCALES` 与字典，没有 `app/[locale]` 段；`LocaleProvider` 仅客户端切换。
7. **建议修改方案**：若目标是“完整国际化”，引入 `app/[locale]` + middleware（或 `next-intl`）；若坚持 portfolio demo，则在 UI/README 明确「German is a UI preview, not a URL locale」，并把导航等全部翻译，避免“只换按钮不换页面”的印象。
8. **涉及文件**：`src/i18n/config.ts`、`src/i18n/provider.tsx`、`src/app/layout.tsx`（路由结构）

#### P2-07 10 个站内死链

1. **位置与入口**：
   - `/editorial`：Hero「View the lookbook」、mega menu「Read the story」、Editorial Band 整块
   - `/account`：移动端菜单「Sign in」
   - `/shipping`、`/returns`、`/faq`、`/contact`：页脚 Client Care
   - `/privacy`、`/terms`、`/cookies`、`/accessibility`：页脚法务
2. **严重等级**：P2
3. **复现步骤**：从首页点击上述任一入口。
4. **预期行为**：进入对应内容页，或入口不存在时不渲染。
5. **实际行为**：全部 404（Next 默认 404 页 + 品牌化 404 文案），且客户端会预取这些 URL，控制台出现 404。
6. **根本原因**：`src/data/site.ts`、`hero.tsx`、`editorial-band.tsx`、`mobile-nav.tsx` 中写入了尚未实现的路由；README「Known limitations」已承认页脚信息页未建，但 UI 没有隐藏。
7. **建议修改方案**：
   - 最低成本：为 10 个路由建一个统一 `[...slug]` 内容页（可用 MDX/JSON 文案），或把未建入口从 UI 移除；
   - 面试版优先补 `/shipping`、`/returns`、`/faq`、`/contact` 四页（跨境运营会看）；
   - `/editorial` 可改成 `/collections/women` 或一个真实的品牌故事页。
8. **涉及文件**：`src/data/site.ts`、`src/components/home/hero.tsx`、`src/components/home/editorial-band.tsx`、`src/components/layout/mobile-nav.tsx`、`src/components/layout/site-footer.tsx`

#### P2-08 无效动态路由首次返回 200（软 404）+ 404 页 robots 冲突

1. **位置**：`/products/[slug]`、`/collections/[slug]` 的未知参数
2. **严重等级**：P2（技术 SEO）
3. **复现步骤**：对一个从未访问过的地址连续请求两次：
   `curl -o /dev/null -w "%{http_code}" http://localhost:3100/products/nope-12345` → **200**
   再次请求同一地址 → **404**
4. **预期行为**：任何未知商品/集合都应稳定返回 404。
5. **实际行为**：首次 200 且返回 404 页面内容（软 404）；第二次命中缓存后 404。404 页同时含 `<meta name="robots" content="index, follow">` 与 `<meta name="robots" content="noindex">`。
6. **根本原因**：`cacheComponents: true`（PPR）先流式输出外壳，`notFound()` 在动态段解析后才执行，HTTP 状态已发送；404 页继承根布局的 `robots: index, follow`，Next 又注入 `noindex`。
7. **建议修改方案**：
   - 对动态段设置 `export const instant = false`（允许阻塞路由）或在页面外层加 Suspense 并让 notFound 在 shell 前判定；
   - 或在 `next.config.ts` 关闭该路由的 PPR，保证 404 状态稳定；
   - 在 `generateMetadata` 的 not-found 分支显式返回 `robots: { index: false, follow: false }`，消除冲突标签；
   - 增加 E2E：首次请求未知 slug 必须 404。
8. **涉及文件**：`next.config.ts`、`src/app/products/[slug]/page.tsx`、`src/app/collections/[slug]/page.tsx`、`src/app/not-found.tsx`

### D.4 P3 — 轻微问题

| ID | 问题 | 位置 | 复现/证据 | 建议 |
|---|---|---|---|---|
| P3-01 | 排序控件重复嵌套 `div.relative` 与重复 ChevronDown | `collection-toolbar.tsx:96-118` | DOM 中 `div.relative div.relative` = 2；外层有 2 个相同 chevron 重叠 | 删除多余的一层 div 与一个图标 |
| P3-02 | 搜索无结果文案与操作错误 | `search/page.tsx` + `empty-state.tsx` | `?q=zzzzqqq` 显示「Nothing in this collection fits those filters」；「Clear all filters」href 仍是同一 URL，点击无变化 | 为空状态增加 `variant="search"` 文案；链接改为 `/search` 或 `/collections/women` |
| P3-03 | Newsletter 假成功 | `newsletter-form.tsx` | 提交后显示成功，无 fetch、无存储 | 接真实端点，或在按钮旁标注「Demo — no email is stored」 |
| P3-04 | 模态框无焦点陷阱；PDP 放大图未锁滚动 | `cart-drawer.tsx`、`search-dialog.tsx`、`region-selector.tsx`、`product-view.tsx` | 打开后 Tab 可移到背景；zoom 打开时背景仍可滚动 | 增加 focus trap（或使用 `<dialog>`），zoom 打开时锁 body |
| P3-05 | 德语模式下仍有硬编码英文 aria-label/按钮 | `cart-button.tsx`、`wishlist-link.tsx`、`search-dialog.tsx`（Clear）、`cart-drawer.tsx`（Close） | `Shopping bag, 1 item`、`Wishlist, 1 item`、`Clear` 不随语言 | 全部改为 `t()`，字典补 key |
| P3-06 | 公告栏市场承诺与 Demo 声明矛盾 | `site.ts:118` | 「United States, United Kingdom & EU」vs 区域弹窗「shipping not configured」 | 改为「Worldwide display currencies — shipping not configured in this demo」 |
| P3-07 | 图片源分辨率上限偏低 | `public/images/*` | 商品图最大 1200×1800；Hero 1800×2520，2× 屏全宽会请求 3840w 并放大 | 补 2400px 长边源图，或限制 `deviceSizes` 避免超采样 |
| P3-08 | 未使用的 Next 默认 SVG | `public/file.svg`、`next.svg`、`vercel.svg`、`window.svg`、`globe.svg` | `grep` 源码 0 引用 | 删除，减少仓库噪音 |
| P3-09 | 项目不是 Git 仓库 | 根目录 | 无 `.git` | `git init` 并提交分阶段 commit，面试可展示演进 |
| P3-10 | README 与实现/可复现性不一致 | `README.md` | `npm run lint` 实际无 `--max-warnings=0`；声称的「35 项 HTML 审计 / 20 项浏览器审计」脚本不在仓库；404 行为描述与实际不完全一致 | 把审计脚本纳入 `scripts/` 或删除该表格；修正 lint 命令 |
| P3-11 | `scroll-behavior: smooth` 触发 Next 警告 | `globals.css:40` | 客户端导航控制台：`missing-data-scroll-behavior` | `<html data-scroll-behavior="smooth">` |
| P3-12 | 无错误边界 | `src/app` | 无 `error.tsx` / `global-error.tsx` | 增加品牌化错误页与重试按钮 |
| P3-13 | 无安全响应头 | `next.config.ts` | 响应头无 CSP/X-Frame-Options/Referrer-Policy | 加 `headers()`；图片/脚本策略按 Next 要求配置 |
| P3-14 | 部署配置风险：本地 canonical/OG/sitemap 指向 localhost | `.env.local` | `SITE_URL=http://localhost:3000`，`SEO_INDEXING=true` | 部署时设真实域名；面试用构建产物需确认环境变量 |
| P3-15 | 购物车 `sku` 字段实际写入 `variantId` | `lines.ts`、`validate.ts` | `sku: entry.variantId`、`sku: snapshot.variantId`；当前两者相同故无可见影响 | 快照中带上真实 `sku`，为 Shopify 适配留正确语义 |
| P3-16 | Home HTML 体积偏大（113.7 KB） | 构建产物 | 生产响应 document 113.7 KB | 首屏商品卡可考虑减少 Flight 数据；非阻塞 |
| P3-17 | Cache Components 下 PDP 客户端导航为阻塞式 | `products/[slug]/page.tsx` | dev 控制台 `instant-shell-url-data`；本地导航 66 ms，慢网会更明显 | 按 Next 建议包 Suspense 或 `export const instant = false` |

---

## E. 性能与 SEO

### E.1 实测 Core Web Vitals（生产构建，localhost，冷缓存，Edge/Chromium）

| 页面 | 视口/CPU | LCP | CLS | TTFB | FCP | TBT-like | 长任务 |
|---|---|---|---|---|---|---|---|
| `/` | 1440×900 / 1× | 240 ms | 0 | 9 ms | 240 ms | 0 ms | 0 |
| `/collections/women` | 1440×900 / 1× | 152 ms | 0 | 4 ms | 152 ms | 0 ms | 0 |
| `/products/fluid-cotton-tee` | 1440×900 / 1× | 128 ms | 0 | 5 ms | 128 ms | 0 ms | 0 |
| `/cart` | 1440×900 / 1× | 116 ms | 0 | 6 ms | 116 ms | 0 ms | 0 |
| `/search?q=tee` | 1440×900 / 1× | 92 ms | 0 | 5 ms | 92 ms | 0 ms | 0 |
| `/` | 375×812 / 4× CPU | 276 ms | 0 | 7 ms | 276 ms | 168 ms | 2 |
| `/products/fluid-cotton-tee` | 375×812 / 4× CPU | 308 ms | 0 | 5 ms | 308 ms | 154 ms | 2 |

结论：**CLS 为 0，LCP 远低于 2.5 s，桌面无长任务**。这是本地无网络延迟数据，不能代表真实 4G/跨境访问；但足以证明前端渲染路径没有明显阻塞。

### E.2 资源体积（首页，生产，未压缩实际字节）

| 资源 | 体积 |
|---|---|
| JS 合计 | 558.7 KB 未压缩（网络传输约 176 KB，brotli/gzip 后） |
| CSS | 45.5 KB |
| 图片（首屏 + 懒加载） | 约 124 KB 传输（Hero 1920w 71.6 KB） |
| 字体 | 2 个 woff2，约 61 KB |
| 首页总计 | 约 926 KB 未压缩 / 约 410 KB 传输 |
| 首页 HTML | 113.7 KB |

判断：JS 体积对 Next 16 + React 19 属正常范围，无明显冗余依赖；图片优化到位（AVIF/WebP 由 `next/image` 生成）。未做 bundle analyzer，无法给出逐包占比。

### E.3 SEO 结论

- **做得好的**：每页独立 Metadata、canonical 策略（筛选页回干净 URL）、OG/Twitter、真实 JSON-LD（无假评分）、sitemap 33/33 有效、noindex 精确、robots 策略与索引开关一致。
- **必须修的**：无效动态路由软 404、404 页冲突 robots、10 个死链被预取。
- **部署前确认**：`SITE_URL` 必须是真实域名；否则 canonical/OG/sitemap 会输出 localhost，或（默认配置下）整站 Disallow。

### E.4 NOT TESTED（不编造分数）

| 项目 | 原因 |
|---|---|
| Lighthouse Performance / Accessibility / Best Practices / SEO 分数 | 未安装 Lighthouse；不引入新依赖 |
| 真实 INP（field data） | 无真实用户数据 |
| 4G/3G 网络下的 LCP/CLS | 未做网络限速；只有本地与 4× CPU |
| 真实 iOS Safari / Android Chrome | 仅本机 Edge/Chromium |
| 屏幕阅读器实测（NVDA/VoiceOver） | 仅 DOM 启发式检查 |
| 线上 CDN/缓存/域名验证 | 未部署 |

---

## F. 修复优先级（可执行任务清单）

### 第一批：进入第五阶段前必须完成（P2）

| 顺序 | 任务 | 验收标准 | 工作量 |
|---|---|---|---|
| 1 | 修正约 10 款商品的图片/命名映射（P2-01） | 每个商品首图能辨认出该品类；包袋页面出现包；帽款不再用毡帽图；颜色切换有可见差异 | 中 |
| 2 | 让所有金额文案跟随币种（P2-02） | GBP 模式下全站不再出现 `$`（除明确标注 USD 的 JSON-LD/说明）；免邮门槛与购物车一致 | 小 |
| 3 | 搜索弹窗接入 `usePrice`（P2-03） | EUR 模式下建议价格为 `€` | 小 |
| 4 | 修复 Wishlist `getServerSnapshot`（P2-04） | `/wishlist` 控制台 0 error；dev 浮标无 Issue | 小 |
| 5 | 补全 i18n 覆盖 + 德语数字格式（P2-05） | 德语下导航/页脚/筛选/搜索标题/PDP Details 均为德语；价格为 `66,24 €` | 中 |
| 6 | 明确语言路由策略（P2-06） | 二选一：实现 `/de` 路由；或在 UI/README 明确“德语为界面预览、不提供 URL”，并保证界面 100% 翻译 | 中 |
| 7 | 处理 10 个死链（P2-07） | 站内不再有 404 入口；或对应页面真实存在 | 中 |
| 8 | 修复软 404 与冲突 robots（P2-08） | 首次请求未知 slug 即 404；404 页只有一条 `noindex` | 中 |

### 第二批：面试前建议完成（P3 高价值）

| 任务 | 验收标准 |
|---|---|
| 删除重复的排序 chevron/嵌套 div（P3-01） | DOM 中只有一层 relative、一个 chevron |
| 搜索空状态文案与清除动作（P3-02） | `?q=zzzz` 显示“没有找到该关键词”，清除按钮回到 `/search` |
| Newsletter 标注 Demo 或接真实端点（P3-03） | 用户能明确知道是否真的订阅成功 |
| 焦点陷阱与 zoom 锁滚动（P3-04） | Tab 不逃出弹窗；zoom 打开时背景不滚动 |
| 错误边界 + 安全响应头（P3-12/13） | 客户端异常有品牌化页面；响应头含 CSP/XFO |
| Git 仓库与分阶段提交（P3-09） | `git log` 可展示四阶段演进 |
| README 与实际一致（P3-10） | lint 命令、审计脚本、404 行为描述三者对齐 |
| 部署环境变量（P3-14） | 线上 canonical/OG/sitemap 为真实域名 |

### 第三批：可选优化

- 图片分辨率提升（P3-07）、删除默认 SVG（P3-08）、`data-scroll-behavior`（P3-11）、购物车 `sku` 语义（P3-15）、PDP Suspense（P3-17）、首页 HTML 精简（P3-16）。

---

## G. 面试作品评估

### G.1 跨境电商独立站运营岗位视角

**可以展示的能力**

- 理解完整购物路径：集合 → 筛选 → PDP → 选色选码 → 加购 → 改量 → 金额 → 持久化。
- 理解 SKU/库存：缺货尺码禁用、超库存收敛、同 SKU 合并、不同 SKU 分行。
- 理解跨境展示：国家 → 建议币种、USD 基准价、EUR/GBP 演示换算、明确“非结算币种”的合规表达。
- 有品牌意识：编辑式首页、季度 campaign 文案、材质/护理/尺码说明、免邮门槛与退货政策文案。
- 有“诚实边界”：结账按钮明确 Demo、汇率明确演示、无假评分/假评论。

**明显不足**

- 商品图片与商品不对应，这是运营岗位最敏感的“货不对板”。
- 页脚政策页全部 404；跨境运营会点 Shipping/Returns/FAQ。
- Newsletter 假成功，无法证明留资链路。
- 无 GA4/电商事件（phase 5 范围），无法展示漏斗思维。
- 无真实库存/订单/支付后台，不能证明与 ERP/Shopify 的对接理解。

**面试演示风险**

- 面试官随手点「View the lookbook」或页脚 `Shipping` → 404。
- 打开 `Canvas Weekender Bag` 看不到包 → 直接质疑商品数据。
- 切德语展示国际化 → 导航仍是英文，反而暴露未完成。

### G.2 建站专员 / 前端建站岗位视角

**实际技术亮点**

- Next.js 16 App Router + React 19 + TS strict + Tailwind 4，构建、类型、Lint、113 个单测全绿。
- 清晰的 commerce adapter 边界（`CommerceAdapter` + `MockCommerceAdapter`），未来换 Shopify Storefront 不动组件。
- 金额用整数分存储，单一换算/格式化入口，避免浮点误差。
- 购物车纯函数 reducer + hydration 对账（缺货/下架/涨价/超库存自愈），这是很多作品集没有的深度。
- JSON-LD 只写真实字段（每变体 Offer、真实库存、无假评分），SEO 策略（筛选 noindex + canonical、noindex 页面可爬）专业。
- 可访问性基础扎实：alt、aria-label、Escape、滚动锁定、焦点返回、`inert`。
- 响应式在 5 个视口无横向溢出，视觉完成度高。

**明显不足**

- 无 E2E/CI；单测只覆盖纯逻辑，没有组件与路由级测试。
- 国际化是“客户端字典预览”，无路由、覆盖不全、数字格式未本地化。
- Cache Components 下动态路由 404 状态不稳定，说明对 PPR 边界理解还差一层。
- 无错误边界、无安全响应头、无 Git 历史。
- 商品数据与图片缺少自动校验，导致“图文不符”这种数据问题逃过测试。

**面试演示风险**

- 开发模式打开 `/wishlist` 会出现红色 1 Issue 浮标。
- 展示德语时导航/页脚露馅。
- 被问到“为什么 404 第一次是 200”时需要能解释 PPR 流式响应；目前 README 已承认，但没有修复。
- 被问到“为什么搜索价格是美元”会暴露格式化入口不统一。

### G.3 进入第五阶段前必须解决的问题

1. 商品图片/命名映射（P2-01）——否则整个商品系统的可信度被否定。
2. 10 个死链（P2-07）——面试官最容易随手点到的位置。
3. 国际化补全或明确降级（P2-05/06）——避免“只换按钮不换页面”。
4. 币种覆盖（P2-02/03）——跨境岗位的核心卖点，不能半途而废。
5. 软 404 与 robots 冲突（P2-08）——技术 SEO 的基本功。
6. Wishlist React 错误（P2-04）——一行修复，避免无谓扣分。

---

## 最终结论

# 是否建议进入第五阶段：**CONDITIONAL**

### 判断依据

- **没有 P0/P1**：网站可启动、可构建、可完成完整购物演示；加购、SKU、库存、金额、持久化全部真实通过。
- **但前四阶段不能判定为“全部完成”**：第二阶段有商品图文不符；第四阶段国际化只完成了一部分，且没有语言路由；站内 10 个死链、动态路由软 404 属于上线前必须处理的问题。
- **基础远好于“需要重做”**：架构、金额模型、购物车对账、SEO 结构化数据、响应式与视觉都达到可展示水平。

### 放行条件（满足后可改为 YES）

1. 完成 F 节第一批 8 项 P2，并按验收标准逐项复测。
2. 复测必须包含：首次请求未知 slug = 404、404 页仅一条 noindex、GBP/EUR 全站无残留 `$`、德语导航/页脚/筛选/搜索均为德语且价格为 `66,24 €`、10 个原死链全部 200 或已从 UI 移除。
3. 用 `npm run build && npm start` 重新跑一遍五条用户路径，确认生产模式无回归。

### 不建议现在直接进入第五阶段的原因

第五阶段是结账、GA4 电商事件、Playwright E2E。如果带着“图文不符、死链、半套国际化、软 404”进入，第五阶段会把这些问题固化进结账漏斗与埋点验收里，返工成本更高。先把“商品真实性、链接完整性、国际化边界、404 语义”四件事收干净，再叠加交易能力。

---

## 附录：本次实际执行的命令与产物

```bash
npx tsc --noEmit          # exit 0
npx eslint .              # exit 0
npx vitest run            # 113/113 passed
npm run build             # success (Next.js 16.4.2, Turbopack)
next start -p 3100        # production verification
npm audit --omit=dev      # 0 vulnerabilities
```

临时测试产物（项目外，可删除）：

- `%TEMP%\aurel-qa\`：Playwright 脚本执行结果、截图、性能 JSON
- 覆盖页面：`/`、7 个集合、3 个 PDP、`/cart`、`/wishlist`、`/search`、无效 slug、10 个死链、`/de`
- 覆盖流程：A 商品购买、B 收藏购物、C 搜索购物、D 跨境购物、E 刷新持久化

**报告结束。**
