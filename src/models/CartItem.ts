/**
 * 购物车模型
 * 用于持久化购物车数据
 */

import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class CartItemModel extends Model {
  static table = 'cart_items';

  @field('dish_id') dishId!: string;
  @field('dish_name') dishName!: string;
  @field('dish_price') dishPrice!: number;
  @field('dish_image') dishImage!: string;
  @field('quantity') quantity!: number;
  @field('specs') specs!: string | null;

  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  // 计算属性 - 小计
  get subtotal(): number {
    return this.dishPrice * this.quantity;
  }
}
