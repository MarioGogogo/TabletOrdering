# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
# 启动开发服务器（使用 Re.Pack + Rspack，支持代码分割）
npm start

# 启动 Metro 备用开发服务器（不支持代码分割）
npm run start:metro

# 运行应用
npm run ios                      # iOS 模拟器
npm run android                  # Android 模拟器

# 代码检查和测试
npm run lint                     # ESLint 检查
npm test                         # Jest 单元测试

# 构建生产包
npm run build:android            # 发布 APK（Release）
npm run build:android:debug      # Debug APK

# 分析 Bundle 大小
npm run analyze                  # 生成 Bundle 分析报告 (build/rsdoctor-report/)
```

## 项目架构

这是一个企业级 **React Native 0.83.1 + TypeScript** 构建的平板点餐系统，采用 Re.Pack 实现代码分割，WatermelonDB 实现本地数据持久化，支持完整的版本管理和远程分包加载。

### 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| React Native | 0.83.1 | 跨平台框架 |
| TypeScript | 5.8.3 | 类型安全 |
| @callstack/repack | 5.2.3 | 代码分割 + 远程加载 |
| @rspack/core | 1.7.2 | 高性能打包器（替代 Webpack） |
| Zustand | 5.0.10 | 轻量级状态管理 |
| @nozbe/watermelondb | 0.28.0 | 离线优先数据库（LokiJS 适配器） |
| @react-navigation | 7.1.27 | 导航框架 |
| @shopify/flash-list | 2.2.0 | 高性能列表组件 |
| react-native-fast-image | 8.6.3 | 智能图片缓存 |

### 项目结构

```
src/
├── navigation/
│   ├── RootNavigator.tsx        # 主导航栈：LoginScreen → HomeScreen
│   └── types.ts                 # 导航类型定义
│
├── screens/                     # 页面组件（12 个）
│   ├── LoginScreen.tsx          # 用户认证入口
│   ├── HomeScreen.tsx           # 门店看板 + 侧边栏导航（Bento Box 布局）
│   ├── DashboardScreen.tsx      # 数据展示仪表板
│   ├── OrderScreenWithDB.tsx    # 点单页面（WatermelonDB 集成）
│   ├── TableScreen.tsx          # 桌台管理（条件加载：开发静态/生产分包）
│   ├── OrdersScreen.tsx         # 订单管理列表（条件加载：开发静态/生产分包）
│   ├── MemberScreen.tsx         # 会员管理系统（静态导入）
│   ├── RecommendScreen.tsx      # 推荐页面
│   ├── ErrorScreen.tsx          # 错误提示页
│   └── ...
│
├── components/                  # 共享 UI 组件
│   ├── ProductCard.tsx          # 商品卡片（React.memo 优化）
│   ├── ChunkErrorBoundary.tsx   # 分包错误边界
│   ├── Dialog.tsx               # 通用对话框
│   ├── UpdateDialog.tsx         # 模块更新弹窗
│   ├── FloatingTabBar.tsx       # 浮动选项卡栏
│   ├── Toast.tsx                # 消息提示
│   └── BackButton.tsx           # 返回按钮
│
├── database/                    # 数据持久化层
│   ├── database.ts              # WatermelonDB 实例化
│   └── schema.ts                # 数据库 Schema 定义
│
├── models/                      # WatermelonDB 数据模型
│   ├── Dish.ts                  # 菜品模型（支持计算属性）
│   ├── CartItem.ts              # 购物车项目模型
│   ├── Category.ts              # 分类模型
│   └── index.ts                 # 模型导出
│
├── store/
│   └── useAppStore.ts           # Zustand 全局状态管理
│                                 # 管理：认证、设置、购物车、分包配置等
│
├── services/                    # 业务逻辑服务层
│   ├── BundleConfigService.ts   # 分包配置获取（支持重试机制）
│   ├── DishSyncService.ts       # 菜品数据同步到 WatermelonDB
│   └── DataMigrationService.ts  # 数据迁移工具
│
├── theme/
│   └── colors.ts                # 颜色常量（现代仪表板风格）
│
├── utils/
│   └── deviceHelper.ts          # 设备检测工具（平板/手机、横屏适配）
│
├── data/
│   ├── dishes.json              # 菜品数据样本（264KB）
│   └── updateDishes.json        # 菜品数据更新版本
│
└── types/                       # 全局 TypeScript 类型定义
```

### 数据库架构

使用 **WatermelonDB** + **LokiJS** 实现离线优先的本地数据持久化：

```
表结构：
├── dishes         # 菜品主表（支持价格、图片、热度、售罄状态等）
├── cart_items     # 购物车项目持久化
└── categories     # 分类表（动态管理）

关键特性：
- 装饰器定义字段 (@field, @bool, @date)
- 支持计算属性（Dish 模型的折扣、可购买状态等）
- 异步查询和过滤（Q.where, Q.sortBy, Q.like）
- 原子性同步（创建→更新→删除三步保证一致性）
```

### 代码分割方案

**分包配置** (index.js):

| 分包名称 | 关联屏幕 | 加载方式 | 说明 |
|---------|---------|---------|------|
| **main** | 其他屏幕 | 主包 | ~ 2.5MB |
| **table** | TableScreen | 条件加载 | 开发静态/生产分包 |
| **orders** | OrdersScreen | 条件加载 | 开发静态/生产分包 |

**加载策略** (HomeScreen.tsx):
```typescript
// 开发模式：使用 require() 直接静态导入（避免 DevServer chunk 加载问题）
if (__DEV__) {
  TableScreen = require('./TableScreen').default;
  OrdersScreen = require('./OrdersScreen').default;
} else {
  // 生产模式：分包懒加载
  TableScreen = lazy(() => import(/* webpackChunkName: "table" */ './TableScreen'));
  OrdersScreen = lazy(() => import(/* webpackChunkName: "orders" */ './OrdersScreen'));
}
```

**版本管理流程**:
```
1. 开发环境 (__DEV__ = true):
   - TableScreen/OrdersScreen 使用静态导入，无 chunk 加载
   - 其他分包从本地 DevServer 加载 → http://localhost:8081/{scriptId}.chunk.bundle

2. 生产环境 (__DEV__ = false):
   获取分包配置 → BundleConfigService.fetchBundleConfigWithRetry()
   分包从远程服务器加载 → https://server.com/{scriptId}.chunk.bundle?v={version}

3. 版本检查与更新:
   检查本地缓存版本 vs 最新远程版本
   → 版本不同时显示 UpdateDialog
   → 用户确认后清除缓存并重新加载
   → 支持灰度更新（版本参数 ?v={version} 触发缓存更新）
```

### 状态管理与数据流

**Zustand Store** (useAppStore.ts):
```typescript
{
  // 认证状态（持久化）
  token, user, isLoggedIn

  // 应用设置（持久化）
  darkMode, notifications

  // 购物车状态（持久化）
  cartCount

  // 分包配置（持久化）
  bundleConfigs, bundleConfigUpdated

  // 模块更新（不持久化）
  pendingUpdate, isCheckingUpdate
}
```

**数据同步流程**:
```
RemoteAPI (菜品数据)
  ↓
BundleConfigService / API 调用
  ↓
DishSyncService.sync() (支持增删改三种操作)
  ↓
WatermelonDB (本地数据库)
  ↓
OrderScreenWithDB (查询和显示)
  ↓
ProductCard (逐项渲染 with React.memo 优化)
```

## 开发工作流

### 1. 启动开发环境

```bash
npm start                 # 启动 Re.Pack DevServer
npm run android           # 在另一个终端运行应用
```

**特点**:
- 侧边栏页面（桌台、订单）使用静态导入，无 chunk 加载延迟
- 分包页面从本地 DevServer 加载（支持热更新）
- 支持远程调试（Chrome DevTools）

### 2. 修改菜品数据和测试同步

**本地修改** (src/data/dishes.json):
- 修改菜品数据后，需要手动触发同步
- 调用 `DishSyncService.sync(newDishes)` 更新 WatermelonDB

**版本检查**:
```typescript
// 在 index.js 或应用初始化时调用
BundleConfigService.fetchBundleConfigWithRetry()
  .then(config => {
    // config 包含所有分包的最新版本信息
    // 用于检查是否有更新可用
  });
```

### 3. 添加新屏幕和分包

**步骤**:
1. 在 `src/screens/NewScreen.tsx` 创建新屏幕
2. 在 `src/navigation/RootNavigator.tsx` 添加导航路由
3. 如需条件加载（在 HomeScreen 中使用）：
   ```typescript
   // 开发静态导入，生产分包加载
   let NewScreen: React.ComponentType<any>;
   if (__DEV__) {
     NewScreen = require('./NewScreen').default;
   } else {
     NewScreen = lazy(() => import(/* webpackChunkName: "new" */ './NewScreen'));
   }
   ```
4. 在 `index.js` 的 `remoteBundleConfig` 添加分包配置
5. 在 `rspack.config.mjs` 确保分包文件被正确输出到 `build/output/android/remote/`

### 4. 处理分包加载错误

所有动态加载的屏幕都应使用 `ChunkErrorBoundary` 包装：

```typescript
<ChunkErrorBoundary screenName="TableScreen" onRetry={handleRetry}>
  <Suspense fallback={<LoadingScreen />}>
    <TableScreen />
  </Suspense>
</ChunkErrorBoundary>
```

**特点**:
- 捕获分包加载失败、执行失败、网络错误等
- 提供友好的错误提示和重试机制
- 防止分包异常导致整个应用崩溃

### 5. 测试 WatermelonDB 数据库操作

```typescript
// 查询示例
const dishes = await database.collections.get('dishes')
  .query(Q.where('is_available', true))
  .fetch();

// 更新示例
await database.write(async () => {
  const dish = await dishCollection.find(dishId);
  await dish.update(dish => {
    dish.is_sold_out = true;
  });
});

// 删除示例
await database.write(async () => {
  const dish = await dishCollection.find(dishId);
  await dish.markAsDeleted();
});
```

## 构建和部署

### 生成 Release APK

```bash
npm run build:android

# 输出：android/app/build/outputs/apk/release/app-release.apk
```

**流程** (scripts/build-android-repack.sh):
1. 清理旧 bundle
2. 使用 Rspack 编译 JS Bundle
3. Gradle 编译 APK
4. 签名 APK（可选）

### 分析 Bundle 大小

```bash
npm run analyze

# 查看报告：open build/rsdoctor-report/index.html
```

**优化建议**:
- 检查是否有大型依赖未被分包（table.chunk.bundle 应该包含 TableScreen 相关逻辑）
- 使用 React.memo 避免不必要的重渲染
- 确保 FlashList 被正确使用处理大列表

### 部署远程分包

1. 构建分包：`npm run build:android`
2. 上传 `build/output/android/remote/{scriptId}.chunk.bundle` 到 CDN/服务器
3. 更新 API 返回配置（包含新的 URL 和版本号）：

```json
{
  "table": {
    "url": "https://your-cdn.com/table.chunk.bundle",
    "version": "2.0.0"  // 更新版本号强制用户更新
  }
}
```

## 关键实现细节

### 1. 版本缓存机制

每个分包的版本缓存存储在内存中 (`loadedVersions` 对象)：
- 首次加载时记录版本
- 检查更新时对比版本
- 版本不同时通过 URL 参数 `?v={version}` 强制浏览器/应用刷新缓存

### 2. 分包懒加载 (React.lazy + Suspense)

```typescript
const TableScreen = React.lazy(
  () => import(/* webpackChunkName: "table" */ '../screens/TableScreen')
);

// 在导航中使用
<Suspense fallback={<LoadingScreen />}>
  <TableScreen />
</Suspense>
```

### 3. 持久化状态管理

Zustand 使用 `persist` 中间件持久化到 AsyncStorage：
- 支持选择性持久化（指定哪些状态持久化）
- 应用启动时自动恢复
- 用户登出时清除

### 4. 设备适配

`deviceHelper.ts` 提供平板和横屏适配：
```typescript
DeviceHelper.isTablet()          // 返回是否为平板
DeviceHelper.isLandscape()       // 返回是否为横屏
DeviceHelper.getDialogWidth()    // 返回适配的对话框宽度（平板显示更大）
```

## 测试

```bash
# 运行所有单元测试
npm test

# 运行特定测试文件
npm test -- src/__tests__/utils.test.ts

# Watch 模式
npm test -- --watch
```

**测试框架**: Jest 29.6.3 + React Test Renderer

## 代码质量

```bash
# ESLint 检查
npm run lint

# Prettier 格式化（推荐使用编辑器 Format on Save）
npx prettier --write src/
```

**配置**:
- `.eslintrc.js`: 使用 @react-native/eslint-config
- `.prettierrc.js`: 单引号、尾逗号
- `tsconfig.json`: 严格模式 + 装饰器支持（WatermelonDB 需要）

## 常见开发场景

### 场景 1: 添加新的菜品字段

1. 修改 `src/database/schema.ts` 添加新字段定义
2. 更新 `src/models/Dish.ts` 的 WatermelonDB 模型
3. 修改 `src/data/dishes.json` 包含新字段的示例数据
4. 更新 `OrderScreenWithDB.tsx` 显示新字段
5. 调用 `DishSyncService.sync()` 迁移数据

### 场景 2: 修改分包大小，需要拆分

1. 创建新的屏幕文件
2. 在 `index.js` 注册新的分包配置
3. 更新路由指向新屏幕
4. 在 `rspack.config.mjs` 中配置分包输出
5. 重新构建和测试

### 场景 3: 修复分包加载失败

**常见错误**：`Error: Loading chunk table failed`

**排查步骤**:
1. 检查开发服务器是否运行：`npm start`
2. 查看控制台日志确认 URL：
   ```
   [ScriptManager] Resolving: table, DEV: true
   [ScriptManager] DevServer URL: http://localhost:8081/table.chunk.bundle
   ```
3. 如果是 HomeScreen 中的页面，确认已使用条件加载模式

**解决方案**:
- 开发模式：使用 `require()` 直接静态导入
- 生产模式：检查远程服务器 URL 和版本配置

使用 `ChunkErrorBoundary` 的 error log 查看具体错误：
- 网络错误 → 检查 URL 和网络连接
- 脚本执行错误 → 检查分包内容是否损坏
- 版本冲突 → 清除缓存并重新下载

## 资源文件位置

- **菜品数据**: `src/data/dishes.json`, `src/data/updateDishes.json`
- **颜色配置**: `src/theme/colors.ts`
- **构建脚本**: `scripts/build-android-repack.sh`, `scripts/build-android.sh`
- **配置文件**: `rspack.config.mjs`, `babel.config.js`, `react-native.config.js`
- **类型定义**: `src/types/`

## 相关文档

- README.md: 项目概述和快速开始
- React Navigation: https://reactnavigation.org/
- WatermelonDB: https://watermelondb.org/
- Re.Pack: https://re-pack.dev/
- Zustand: https://github.com/pmndrs/zustand
