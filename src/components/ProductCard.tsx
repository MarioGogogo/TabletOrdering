/**
 * 商品卡片组件 - 针对 iPad 点菜场景优化
 *
 * 优化点：
 * - React.memo 避免父组件状态变化导致的不必要重渲染
 * - 使用 react-native-fast-image 实现图片缓存和优先级加载
 * - 独立的 props 类型定义，便于类型检查
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';

// 颜色配置
const COLORS = {
  primary: '#FFC107',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray900: '#111827',
  black: '#000000',
  white: '#FFFFFF',
};

// 获取屏幕宽度用于计算列数
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 根据屏幕宽度动态计算列数
const getNumColumns = () => {
  if (SCREEN_WIDTH >= 1200) {
    return 4; // 大屏 iPad
  }
  return 3; // 小屏 iPad
};

// 商品数据类型
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  sales?: number;
  isHot?: boolean;
  categoryName?: string;
  categoryId?: number;
}

// Props 类型
interface ProductCardProps {
  product: Product;
  numColumns: number;
  onQuantityChange: (id: string, delta: number) => void;
  index: number;
  leftPanelWidth: number; // 左侧面板宽度
}

// 列间距常量
const COLUMN_GAP = 20;
// 容器左右 padding
const CONTAINER_PADDING = 24;
// 卡片宽高比：1:1.25（高度是宽度的1.25倍），适合展示菜品图片和下方信息
const CARD_ASPECT_RATIO = 1.2;

const ProductCard = React.memo<ProductCardProps>(({ product, numColumns, onQuantityChange, index, leftPanelWidth }) => {
  // 计算卡片宽度和高度：
  // FlashList 分配给每个 item 的列宽 = (容器宽度) / numColumns
  // 容器宽度 = 屏幕宽度 - 左侧面板 - 左右padding
  const containerWidth = SCREEN_WIDTH - leftPanelWidth - CONTAINER_PADDING * 2;
  const columnWidth = containerWidth / numColumns;
  // 卡片宽度 = 列宽 - 左右 margin (每侧 COLUMN_GAP/2)
  const cardWidth = columnWidth - COLUMN_GAP;
  // 卡片高度 = 宽度 × 宽高比
  const cardHeight = cardWidth * CARD_ASPECT_RATIO;

  // 预加载图片（当索引在前 20 项时优先加载）
  const shouldPreload = index < 20;

  const handlePress = useCallback(() => {
    onQuantityChange(product.id, 1);
  }, [product.id, onQuantityChange]);

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth, height: cardHeight, marginHorizontal: COLUMN_GAP / 2 }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <FastImage
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
          // 优先级：前 20 项高优先级，其余普通
          priority={shouldPreload ? FastImage.priority.high : FastImage.priority.normal}
          // 缓存策略：磁盘缓存
          cache={FastImage.cacheControl.immutable}
        />
        {/* 热销标签 */}
        {product.isHot && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>热销</Text>
          </View>
        )}
        {/* 销量标签 */}
        {product.sales !== undefined && product.sales > 0 && (
          <View style={styles.salesBadge}>
            <Text style={styles.salesBadgeText}>月售 {product.sales}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.bottom}>
          <Text style={styles.price}>¥{product.price.toFixed(1)}</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.minusButton}
              onPress={() => onQuantityChange(product.id, -1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.minusText}>－</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{product.quantity}</Text>
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => onQuantityChange(product.id, 1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.plusText}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// 比较函数：只有当 id、quantity 或 price 变化时才重渲染
ProductCard.compare = (prevProps: ProductCardProps, nextProps: ProductCardProps) => {
  if (prevProps.product.id !== nextProps.product.id) return false;
  if (prevProps.product.quantity !== nextProps.product.quantity) return false;
  if (prevProps.product.price !== nextProps.product.price) return false;
  if (prevProps.numColumns !== nextProps.numColumns) return false;
  return true;
};

const styles = StyleSheet.create({
  card: {
    // 高度通过代码动态设置，不使用 aspectRatio
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hotBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  salesBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 193, 7, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  salesBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.black,
  },
  info: {
    padding: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.gray200,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
    height: 28,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  minusButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
  },
  minusText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
    lineHeight: 14,
  },
  quantity: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray900,
    minWidth: 16,
    textAlign: 'center',
  },
  plusButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '700',
    lineHeight: 16,
  },
});

export default ProductCard;
