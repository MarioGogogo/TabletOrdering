/**
 * 菜品模型
 * WatermelonDB Model 定义
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, bool, children } from '@nozbe/watermelondb/decorators';

// 菜品原始数据接口（从服务器获取）
export interface RemoteDishData {
  id: string;
  categoryId: number;
  categoryName: string;
  name: string;
  price: string;
  image: string;
  imageVersion?: number;
  sales?: number;
  isHot?: boolean;
  description?: string;
  originalPrice?: string;
  sortOrder?: number;
  isAvailable?: boolean;
  isSoldOut?: boolean;
}

export default class Dish extends Model {
  static table = 'dishes';

  // 字段装饰器
  @field('dish_id') dishId!: string;
  @field('name') name!: string;
  @field('category_id') categoryId!: number;
  @field('category_name') categoryName!: string;
  @field('price') price!: number;
  @field('original_price') originalPrice!: number | null;
  @field('image_url') imageUrl!: string;
  @field('image_version') imageVersion!: number | null;
  @field('sales') sales!: number | null;
  @field('description') description!: string | null;
  @field('is_available') isAvailable!: boolean;
  @field('is_sold_out') isSoldOut!: boolean;
  @field('is_hot') isHot!: boolean;
  @field('sort_order') sortOrder!: number | null;

  // 使用 @field 而不是 @date，因为 Schema 中定义为 number（时间戳）
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  // 计算属性 - 判断是否可以购买
  get canPurchase(): boolean {
    return this.isAvailable && !this.isSoldOut;
  }

  // 计算属性 - 格式化价格
  get formattedPrice(): string {
    return `¥${this.price.toFixed(2)}`;
  }

  // 计算属性 - 是否有优惠
  get hasDiscount(): boolean {
    return this.originalPrice !== null && this.originalPrice > this.price;
  }

  // 计算属性 - 折扣金额
  get discountAmount(): number {
    if (this.originalPrice && this.originalPrice > this.price) {
      return this.originalPrice - this.price;
    }
    return 0;
  }

  // 计算属性 - 折扣百分比
  get discountPercent(): number {
    if (this.originalPrice && this.originalPrice > this.price) {
      return Math.round((this.discountAmount / this.originalPrice) * 100);
    }
    return 0;
  }
}
