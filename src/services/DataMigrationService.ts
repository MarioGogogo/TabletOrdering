/**
 * 数据迁移服务
 * 将 JSON 数据迁移到 WatermelonDB
 */

import DishSyncService from './DishSyncService';
import { RemoteDishData } from '../models';
import dishesJson from '../data/dishes.json';

export class DataMigrationService {
  /**
   * 将 JSON 数据迁移到数据库
   * @param showProgress 是否显示进度日志
   */
  static async migrateFromJSON(showProgress: boolean = true) {
    if (showProgress) {
      console.log('开始迁移数据...');
    }

    try {
      // 1. 转换 JSON 数据为 RemoteDishData 格式
      const remoteDishes: RemoteDishData[] = dishesJson.map(
        (item: any, index: number) => ({
          id: item.id,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          name: item.name,
          price: item.price,
          image: item.image,
          sales: item.sales || 0,
          isHot: item.isHot || false,
          description: item.description || '',
          // 默认值
          isAvailable: true,
          isSoldOut: false,
          sortOrder: index,
          imageVersion: Date.now(),
        }),
      );

      if (showProgress) {
        console.log(`待迁移菜品数量: ${remoteDishes.length}`);
      }

      // 2. 执行同步
      const stats = await DishSyncService.sync(remoteDishes, {
        removeNotFound: true,
        onProgress: (current, total) => {
          if (showProgress) {
            const percent = Math.round((current / total) * 100);
            console.log(`迁移进度: ${current}/${total} (${percent}%)`);
          }
        },
        onComplete: completedStats => {
          if (showProgress) {
            console.log('迁移完成:', completedStats);
          }
        },
      });

      return stats;
    } catch (error) {
      console.error('数据迁移失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否需要迁移
   */
  static async needsMigration(): Promise<boolean> {
    const { DatabaseService } = await import('../database/database');
    const stats = await DatabaseService.getStats();
    // 如果数据库中没有菜品数据，则需要迁移
    return stats.dishes === 0;
  }

  /**
   * 重新迁移（清除现有数据后重新导入）
   */
  static async reMigrate(showProgress: boolean = true) {
    if (showProgress) {
      console.log('开始重新迁移...');
    }

    try {
      // 1. 清空数据库
      const { DatabaseService } = await import('../database/database');
      await DatabaseService.clearAll();

      if (showProgress) {
        console.log('数据库已清空');
      }

      // 2. 重新迁移
      return await this.migrateFromJSON(showProgress);
    } catch (error) {
      console.error('重新迁移失败:', error);
      throw error;
    }
  }
}

export default DataMigrationService;
