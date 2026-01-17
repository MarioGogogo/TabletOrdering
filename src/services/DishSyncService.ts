/**
 * 菜品数据同步服务
 * 负责从远程同步数据到本地 WatermelonDB
 */

import database, { DatabaseService } from '../database/database';
import { Dish, RemoteDishData } from '../models';
import { Q } from '@nozbe/watermelondb';

export interface SyncOptions {
  // 是否删除本地存在但远程不存在的菜品
  removeNotFound?: boolean;
  // 进度回调
  onProgress?: (current: number, total: number) => void;
  // 完成回调
  onComplete?: (stats: SyncStats) => void;
}

export interface SyncStats {
  total: number;
  created: number;
  updated: number;
  deleted: number;
  errors: number;
  duration: number; // 毫秒
}

export class DishSyncService {
  /**
   * 同步菜品数据
   * @param remoteDishes 远程菜品数据
   * @param options 同步选项
   */
  static async sync(
    remoteDishes: RemoteDishData[],
    options: SyncOptions = {},
  ): Promise<SyncStats> {
    const startTime = Date.now();
    const stats: SyncStats = {
      total: remoteDishes.length,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: 0,
      duration: 0,
    };

    const { removeNotFound = true, onProgress, onComplete } = options;

    try {
      await database.action(async () => {
        const dishesCollection = database.get<Dish>('dishes');

        // 1. 获取所有本地菜品（用于快速查找）
        const localDishes = await dishesCollection.query().fetch();
        const localDishMap = new Map<string, Dish>();
        localDishes.forEach(dish => {
          localDishMap.set(dish.dishId, dish);
        });

        // 2. 收集远程菜品 ID（用于标记删除）
        const remoteDishIds = new Set<string>();
        const dishesToDelete: Dish[] = [];

        // 3. 遍历远程数据，创建或更新
        for (let i = 0; i < remoteDishes.length; i++) {
          const remoteDish = remoteDishes[i];
          remoteDishIds.add(remoteDish.id);

          try {
            const existingDish = localDishMap.get(remoteDish.id);

            if (existingDish) {
              // 更新现有菜品
              await existingDish.update(dish => {
                dish.name = remoteDish.name;
                dish.categoryId = remoteDish.categoryId;
                dish.categoryName = remoteDish.categoryName;
                dish.price = parseFloat(remoteDish.price);
                dish.originalPrice = remoteDish.originalPrice
                  ? parseFloat(remoteDish.originalPrice)
                  : null;
                dish.imageUrl = remoteDish.image;
                dish.imageVersion = remoteDish.imageVersion || null;
                dish.sales = remoteDish.sales || 0;
                dish.description = remoteDish.description || null;
                dish.isAvailable = remoteDish.isAvailable !== false;
                dish.isSoldOut = remoteDish.isSoldOut || false;
                dish.isHot = remoteDish.isHot || false;
                dish.sortOrder = remoteDish.sortOrder || null;
                dish.updatedAt = new Date();
              });
              stats.updated++;
            } else {
              // 创建新菜品
              await dishesCollection.create(dish => {
                dish.dishId = remoteDish.id;
                dish.name = remoteDish.name;
                dish.categoryId = remoteDish.categoryId;
                dish.categoryName = remoteDish.categoryName;
                dish.price = parseFloat(remoteDish.price);
                dish.originalPrice = remoteDish.originalPrice
                  ? parseFloat(remoteDish.originalPrice)
                  : null;
                dish.imageUrl = remoteDish.image;
                dish.imageVersion = remoteDish.imageVersion || null;
                dish.sales = remoteDish.sales || 0;
                dish.description = remoteDish.description || null;
                dish.isAvailable = remoteDish.isAvailable !== false;
                dish.isSoldOut = remoteDish.isSoldOut || false;
                dish.isHot = remoteDish.isHot || false;
                dish.sortOrder = remoteDish.sortOrder || null;
                dish.createdAt = new Date();
                dish.updatedAt = new Date();
              });
              stats.created++;
            }

            // 触发进度回调
            if (onProgress) {
              onProgress(i + 1, remoteDishes.length);
            }
          } catch (error) {
            console.error(`同步菜品 ${remoteDish.id} 失败:`, error);
            stats.errors++;
          }
        }

        // 4. 处理本地存在但远程不存在的菜品
        if (removeNotFound) {
          for (const localDish of localDishes) {
            if (!remoteDishIds.has(localDish.dishId)) {
              dishesToDelete.push(localDish);
            }
          }

          // 批量删除
          for (const dish of dishesToDelete) {
            await dish.markAsDeleted();
            stats.deleted++;
          }
        }
      });

      stats.duration = Date.now() - startTime;

      // 触发完成回调
      if (onComplete) {
        onComplete(stats);
      }

      return stats;
    } catch (error) {
      console.error('同步失败:', error);
      stats.errors++;
      stats.duration = Date.now() - startTime;
      throw error;
    }
  }

  /**
   * 获取所有可售菜品
   */
  static async getAvailableDishes(): Promise<Dish[]> {
    const dishesCollection = database.get<Dish>('dishes');
    return dishesCollection
      .query(
        Q.where('is_available', true),
        Q.sortBy('sort_order', Q.asc),
      )
      .fetch();
  }

  /**
   * 根据分类获取菜品
   */
  static async getDishesByCategory(categoryId: number): Promise<Dish[]> {
    const dishesCollection = database.get<Dish>('dishes');
    return dishesCollection
      .query(
        Q.where('is_available', true),
        Q.where('category_id', categoryId),
        Q.sortBy('sort_order', Q.asc),
      )
      .fetch();
  }

  /**
   * 搜索菜品
   */
  static async searchDishes(keyword: string): Promise<Dish[]> {
    if (!keyword.trim()) {
      return this.getAvailableDishes();
    }

    const dishesCollection = database.get<Dish>('dishes');
    // WatermelonDB 的搜索使用 Q.where('column', Q.like(`%${keyword}%`))
    return dishesCollection
      .query(
        Q.where('is_available', true),
        Q.where('name', Q.like(`%${keyword}%`)),
      )
      .fetch();
  }

  /**
   * 获取热门菜品
   */
  static async getHotDishes(limit: number = 10): Promise<Dish[]> {
    const dishesCollection = database.get<Dish>('dishes');
    return dishesCollection
      .query(
        Q.where('is_available', true),
        Q.where('is_hot', true),
        Q.sortBy('sales', Q.desc),
      )
      .take(limit)
      .fetch();
  }

  /**
   * 更新菜品售罄状态
   */
  static async updateSoldOutStatus(
    dishId: string,
    isSoldOut: boolean,
  ): Promise<void> {
    await database.action(async () => {
      const dishesCollection = database.get<Dish>('dishes');
      const dishes = await dishesCollection
        .query(Q.where('dish_id', dishId))
        .fetch();

      if (dishes.length > 0) {
        await dishes[0].update(dish => {
          dish.isSoldOut = isSoldOut;
          dish.updatedAt = new Date();
        });
      }
    });
  }

  /**
   * 批量更新售罄状态
   */
  static async batchUpdateSoldOutStatus(
    updates: Array<{ dishId: string; isSoldOut: boolean }>,
  ): Promise<void> {
    await database.action(async () => {
      const dishesCollection = database.get<Dish>('dishes');

      for (const update of updates) {
        const dishes = await dishesCollection
          .query(Q.where('dish_id', update.dishId))
          .fetch();

        if (dishes.length > 0) {
          await dishes[0].update(dish => {
            dish.isSoldOut = update.isSoldOut;
            dish.updatedAt = new Date();
          });
        }
      }
    });
  }
}

export default DishSyncService;
