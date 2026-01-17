/**
 * WatermelonDB 数据库配置
 * 初始化数据库实例
 *
 * 使用 LokiJS 适配器（纯 JS 实现，不需要原生模块）
 * 生产环境可以切换到 SQLite 适配器以获得更好的性能
 */

import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { Database } from '@nozbe/watermelondb';
import schema from './schema';
import { Dish, CartItemModel, CategoryModel } from '../models';

// 创建数据库适配器（使用 LokiJS）
const adapter = new LokiJSAdapter({
  schema,
  // 使用 IndexedDB（Web）或 AsyncStorage（React Native）
  useWebWorker: false,
  useIncrementalIndexedDB: true,
});

// 创建数据库实例
export const database = new Database({
  adapter,
  modelClasses: [Dish, CartItemModel, CategoryModel],
});

// 数据库操作辅助类
export class DatabaseService {
  /**
   * 清空所有数据（谨慎使用）
   */
  static async clearAll() {
    await database.action(async () => {
      await database.get('dishes').query().fetch().then(records => {
        records.forEach(record => record.markAsDeleted());
      });
      await database.get('cart_items').query().fetch().then(records => {
        records.forEach(record => record.markAsDeleted());
      });
      await database.get('categories').query().fetch().then(records => {
        records.forEach(record => record.markAsDeleted());
      });
    });
  }

  /**
   * 获取数据库统计信息
   */
  static async getStats() {
    const dishesCount = await database.get('dishes').query().fetchCount();
    const cartCount = await database.get('cart_items').query().fetchCount();
    const categoriesCount = await database
      .get('categories')
      .query()
      .fetchCount();

    return {
      dishes: dishesCount,
      cartItems: cartCount,
      categories: categoriesCount,
    };
  }
}

export default database;
