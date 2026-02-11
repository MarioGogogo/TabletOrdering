# WatermelonDB 集成指南

本项目已集成 WatermelonDB，用于高效存储和管理菜品数据。

## 项目结构

```
src/
├── database/
│   ├── schema.ts          # 数据库表结构定义
│   └── database.ts        # 数据库实例配置
├── models/
│   ├── Dish.ts            # 菜品模型
│   ├── CartItem.ts        # 购物车模型
│   ├── Category.ts        # 分类模型
│   └── index.ts           # 模型导出
├── services/
│   ├── DishSyncService.ts # 数据同步服务
│   └── DataMigrationService.ts  # 数据迁移服务
└── screens/
    ├── OrderScreen.tsx    # 原始版本（使用 JSON）
    └── OrderScreenWithDB.tsx  # WatermelonDB 版本
```

## 数据库表结构

### dishes 表
| 字段 | 类型 | 说明 |
|------|------|------|
| dish_id | string | 后台菜品ID |
| name | string | 菜名 |
| category_id | number | 分类ID |
| category_name | string | 分类名称 |
| price | number | 当前价格 |
| original_price | number? | 原价 |
| image_url | string | 图片URL |
| image_version | number? | 图片版本号 |
| sales | number? | 销量 |
| description | string? | 描述 |
| is_available | boolean | 是否上架 |
| is_sold_out | boolean | 是否售罄 |
| is_hot | boolean | 是否热门 |
| sort_order | number? | 排序序号 |

### cart_items 表
用于持久化购物车数据（可选功能）

### categories 表
用于动态分类管理（可选功能）

## 使用方式

### 1. 在 App.tsx 中使用 OrderScreenWithDB

```typescript
import { DatabaseProvider } from '@nozbe/watermelondb';
import database from './src/database/database';
import OrderScreenWithDB from './src/screens/OrderScreenWithDB';

function App() {
  return (
    <DatabaseProvider database={database}>
      <OrderScreenWithDB />
    </DatabaseProvider>
  );
}
```

### 2. 数据同步

```typescript
import DishSyncService from './src/services/DishSyncService';

// 从远程同步数据
const remoteDishes = await fetchDishesFromAPI();
const stats = await DishSyncService.sync(remoteDishes, {
  removeNotFound: true,
  onProgress: (current, total) => {
    console.log(`同步进度: ${current}/${total}`);
  },
});

console.log('同步完成:', stats);
// stats: { total, created, updated, deleted, errors, duration }
```

### 3. 查询数据

```typescript
import { Q } from '@nozbe/watermelondb';

// 获取所有可售菜品
const dishes = await database
  .get('dishes')
  .query(Q.where('is_available', true))
  .fetch();

// 根据分类查询
const categoryDishes = await database
  .get('dishes')
  .query(
    Q.where('category_id', 1),
    Q.where('is_sold_out', false)
  )
  .fetch();

// 搜索菜品
const searchResults = await database
  .get('dishes')
  .query(Q.where('name', Q.like('%咖啡%')))
  .fetch();
```

### 4. 更新售罄状态

```typescript
import DishSyncService from './src/services/DishSyncService';

// 单个菜品
await DishSyncService.updateSoldOutStatus('dish_001', true);

// 批量更新
await DishSyncService.batchUpdateSoldOutStatus([
  { dishId: 'dish_001', isSoldOut: true },
  { dishId: 'dish_002', isSoldOut: false },
]);
```

## API 对接示例

```typescript
// src/services/api.ts
export async function fetchDishesFromAPI(): Promise<RemoteDishData[]> {
  const response = await fetch('https://your-api.com/dishes', {
    headers: {
      'Authorization': 'Bearer ' + getToken(),
    },
  });

  const data = await response.json();
  return data.dishes;
}

// 使用
const remoteDishes = await fetchDishesFromAPI();
await DishSyncService.sync(remoteDishes);
```

## 性能优化

### 1. 批量操作
```typescript
// 好的做法：批量更新
await database.action(async () => {
  for (const dish of dishes) {
    await dish.update(...);
  }
});

// 避免：循环中多次 action
for (const dish of dishes) {
  await database.action(async () => { // ❌ 低效
    await dish.update(...);
  });
}
```

### 2. 使用观察者（自动更新UI）
```typescript
import { useDatabase } from '@nozbe/watermelondb/hooks';

function MyComponent() {
  const database = useDatabase();

  useEffect(() => {
    const subscription = database
      .get('dishes')
      .query()
      .observe()
      .subscribe(dishes => {
        // 数据变化时自动更新
        console.log('菜品已更新:', dishes.length);
      });

    return () => subscription.unsubscribe();
  }, [database]);
}
```

## 数据迁移

从现有 JSON 数据迁移到数据库：

```typescript
import DataMigrationService from './src/services/DataMigrationService';

// 首次安装时迁移
const needsMigration = await DataMigrationService.needsMigration();
if (needsMigration) {
  await DataMigrationService.migrateFromJSON(true);
}

// 重新迁移（开发用）
await DataMigrationService.reMigrate(true);
```

## 常见问题

### Q: 如何调试数据库？
```typescript
import { DatabaseService } from './src/database/database';

// 查看统计信息
const stats = await DatabaseService.getStats();
console.log('数据库统计:', stats);
// { dishes: 60, cartItems: 0, categories: 0 }

// 清空所有数据（谨慎使用）
await DatabaseService.clearAll();
```

### Q: 如何处理图片更新？
WatermelonDB 只存储图片 URL，图片由 `react-native-fast-image` 自动缓存。更新图片时：

1. 服务器更新图片内容（URL 不变）
2. 更新 `image_version` 字段，添加查询参数：
```typescript
const imageUrl = `${dish.imageUrl}?v=${dish.imageVersion}`;
```

### Q: 如何处理大量数据同步？
使用增量同步：

```typescript
// 1. 只同步变更的菜品
const changedDishes = await fetchChangedDishes(lastSyncTime);
await DishSyncService.sync(changedDishes, {
  removeNotFound: false, // 不删除未返回的菜品
});

// 2. 定期全量同步
if (shouldFullSync) {
  const allDishes = await fetchAllDishes();
  await DishSyncService.sync(allDishes, {
    removeNotFound: true,
  });
}
```

## 下一步

- [ ] 实现 API 对接
- [ ] 添加图片预加载服务
- [ ] 实现购物车持久化
- [ ] 添加离线订单队列
- [ ] 实现数据冲突解决策略

## 参考资料

- [WatermelonDB 官方文档](https://watermelondb.dev/)
- [WatermelonDB GitHub](https://github.com/Nozbe/WatermelonDB)
