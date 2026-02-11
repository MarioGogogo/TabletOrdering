/**
 * 分类模型
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, bool } from '@nozbe/watermelondb/decorators';

export default class CategoryModel extends Model {
  static table = 'categories';

  @field('category_id') categoryId!: number;
  @field('name') name!: string;
  @field('icon') icon!: string | null;
  @field('sort_order') sortOrder!: number | null;
  @field('is_available') isAvailable!: boolean;

  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
