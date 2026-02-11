/**
 * WatermelonDB Schema 定义
 * 定义数据库表结构
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    // 菜品表
    tableSchema({
      name: 'dishes',
      columns: [
        { name: 'dish_id', type: 'string' },              // 后台菜品ID
        { name: 'name', type: 'string' },                  // 菜名
        { name: 'category_id', type: 'number' },          // 分类ID
        { name: 'category_name', type: 'string' },        // 分类名称
        { name: 'price', type: 'number' },                // 当前价格
        { name: 'original_price', type: 'number', isOptional: true }, // 原价
        { name: 'image_url', type: 'string' },            // 图片URL
        { name: 'image_version', type: 'number', isOptional: true }, // 图片版本号
        { name: 'sales', type: 'number', isOptional: true }, // 销量
        { name: 'description', type: 'string', isOptional: true }, // 描述
        { name: 'is_available', type: 'boolean' },        // 是否上架
        { name: 'is_sold_out', type: 'boolean' },         // 是否售罄
        { name: 'is_hot', type: 'boolean' },              // 是否热门
        { name: 'sort_order', type: 'number', isOptional: true }, // 排序序号
        { name: 'created_at', type: 'number' },           // 创建时间戳
        { name: 'updated_at', type: 'number' },           // 更新时间戳
      ],
    }),

    // 购物车表（可选，用于持久化购物车数据）
    tableSchema({
      name: 'cart_items',
      columns: [
        { name: 'dish_id', type: 'string' },              // 关联的菜品ID
        { name: 'dish_name', type: 'string' },            // 菜名（冗余）
        { name: 'dish_price', type: 'number' },           // 价格（冗余）
        { name: 'dish_image', type: 'string' },           // 图片（冗余）
        { name: 'quantity', type: 'number' },             // 数量
        { name: 'specs', type: 'string', isOptional: true }, // 规格说明
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // 分类表（可选，用于动态分类管理）
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'category_id', type: 'number' },          // 分类ID
        { name: 'name', type: 'string' },                 // 分类名称
        { name: 'icon', type: 'string', isOptional: true }, // 图标
        { name: 'sort_order', type: 'number', isOptional: true }, // 排序
        { name: 'is_available', type: 'boolean' },        // 是否可用
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
