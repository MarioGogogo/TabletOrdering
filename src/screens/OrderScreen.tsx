/**
 * 点单界面 - POS点菜系统主界面
 *
 * 100%复刻 order.html UI
 * 适配横屏 iPad 设备
 *
 * @format
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import ProductCard from '../components/ProductCard';
import type { Product } from '../components/ProductCard';
import Dialog, { DialogRef } from '../components/Dialog';

// 导入菜品数据
import dishesData from '../data/dishes.json';

// 菜品数据接口定义
interface Dish {
  id: string;
  categoryId: number;
  categoryName: string;
  name: string;
  price: string;
  image: string;
  sales: number;
  isHot: boolean;
}

// 分类数据接口定义
interface Category {
  id: number;
  name: string;
  count: number;
}

// 颜色配置 - 与 order.html 保持一致
const COLORS = {
  // 主色调 - 金色/黄色
  primary: '#FFC107',

  // 背景色
  backgroundLight: '#F3F4F6',
  backgroundDark: '#0A0A0A',
  cardDark: '#1A1A1A',
  sidebarDark: '#111111',

  // Light 模式颜色
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // 语义色
  red500: '#EF4444',
  blue400: '#60A5FA',
  blue500: '#3B82F6',

  // 透明色
  black: '#000000',
};

// 获取屏幕尺寸
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 左侧面板宽度 (300-340px 根据屏幕适配，匹配HTML的320px)
const LEFT_PANEL_WIDTH = SCREEN_WIDTH >= 1200 ? 340 : 320;

// 模拟数据 - 购物车商品
interface CartItem {
  id: string;
  name: string;
  specs: string;
  quantity: number;
  price: number;
  isCombo?: boolean;
  comboItems?: string;
  tags?: string[];
}

const mockCartItems: CartItem[] = [];

// ==================== 分类配置 ====================
// 从菜品数据中动态生成分类配置
const generateCategoryConfig = (dishes: Dish[]): Category[] => {
  // 使用 Map 来收集每个分类的菜品数量
  const categoryMap = new Map<number, { name: string; count: number }>();

  dishes.forEach(dish => {
    const existing = categoryMap.get(dish.categoryId);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(dish.categoryId, {
        name: dish.categoryName,
        count: 1,
      });
    }
  });

  // 转换为数组并按 categoryId 排序
  return Array.from(categoryMap.entries())
    .map(([id, info]) => ({
      id,
      name: info.name,
      count: info.count,
    }))
    .sort((a, b) => a.id - b.id);
};

// 生成分类配置
const CATEGORY_CONFIG: Category[] = generateCategoryConfig(
  dishesData as Dish[],
);

// 根据配置生成分类列表
const categories = CATEGORY_CONFIG.map(cat => cat.name);

// 计算每个分类的起始索引
const getCategoryStartIndex = (categoryIndex: number): number => {
  let startIndex = 0;
  for (let i = 0; i < categoryIndex; i++) {
    startIndex += CATEGORY_CONFIG[i].count;
  }
  return startIndex;
};

// 将菜品数据转换为商品数据格式
const convertDishesToProducts = (dishes: Dish[]): Product[] => {
  return dishes.map(dish => ({
    id: dish.id,
    name: dish.name,
    price: parseFloat(dish.price),
    image: dish.image,
    sales: dish.sales,
    isHot: dish.isHot,
    categoryName: dish.categoryName,
    categoryId: dish.categoryId,
    quantity: 0,
  }));
};

// ==================== 卡片尺寸计算 ====================
// 与 ProductCard 组件保持一致的尺寸计算（使用上面定义的 LEFT_PANEL_WIDTH）
const CONTAINER_PADDING = 24;
const COLUMN_GAP = 20;
const NUM_COLUMNS = 4;
const CARD_ASPECT_RATIO = 1.2;

// 计算实际卡片高度
const containerWidth = SCREEN_WIDTH - LEFT_PANEL_WIDTH - CONTAINER_PADDING * 2;
const columnWidth = containerWidth / NUM_COLUMNS;
const cardWidth = columnWidth - COLUMN_GAP;
const ACTUAL_CARD_HEIGHT = cardWidth * CARD_ASPECT_RATIO;

// 商品项高度 (FlashList 的 estimatedItemSize) - 使用实际计算值
const ITEM_ESTIMATED_SIZE = Math.round(ACTUAL_CARD_HEIGHT);

// 每行高度 = 卡片高度 + 行间距 (ItemSeparatorComponent 的 12px)
const ROW_HEIGHT = ITEM_ESTIMATED_SIZE + 12;

// 使用导入的菜品数据转换为商品列表
const mockProducts: Product[] = convertDishesToProducts(dishesData as Dish[]);

// 就餐类型选项
type DiningType = 'dineIn' | 'takeOut' | 'delivery';

export default function OrderScreen() {
  const [diningType, setDiningType] = useState<DiningType>('dineIn');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [products, setProducts] = useState(mockProducts);
  const [searchText, setSearchText] = useState('');
  const [note, setNote] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // 对话框引用
  const dialogRef = useRef<DialogRef>(null);

  // FlashList 引用
  const flashListRef = useRef<any>(null);

  // 标记是否正在通过点击分类触发的程序化滚动（防止滚动监听导致分类闪烁）
  const isScrollingByPress = useRef(false);

  // 计算合计
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0; // 暂无优惠

  // 更新商品数量（菜品列表和购物车双向同步）
  const updateProductQuantity = useCallback((id: string, delta: number) => {
    // 1. 更新菜品列表中的数量
    setProducts(prods =>
      prods.map(prod =>
        prod.id === id
          ? { ...prod, quantity: Math.max(0, prod.quantity + delta) }
          : prod,
      ),
    );

    // 2. 同步更新购物车
    setCartItems(items => {
      const existingItem = items.find(item => item.id === id);
      
      if (existingItem) {
        // 已存在：更新数量
        const newQuantity = Math.max(0, existingItem.quantity + delta);
        if (newQuantity === 0) {
          // 数量为0：移除商品
          return items.filter(item => item.id !== id);
        }
        return items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item,
        );
      } else if (delta > 0) {
        // 不存在且是增加：添加新商品到购物车
        const product = products.find(p => p.id === id);
        if (product) {
          return [
            ...items,
            {
              id: product.id,
              name: product.name,
              specs: '默认配置',
              quantity: delta,
              price: product.price,
            },
          ];
        }
      }
      return items;
    });
  }, [products]);

  // 更新购物车商品数量（同步更新菜品列表）
  const updateCartItemQuantity = (id: string, delta: number) => {
    // 1. 更新购物车
    setCartItems(items =>
      items
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter(item => item.quantity > 0),
    );

    // 2. 同步更新菜品列表中的数量
    setProducts(prods =>
      prods.map(prod =>
        prod.id === id
          ? { ...prod, quantity: Math.max(0, prod.quantity + delta) }
          : prod,
      ),
    );
  };

  // 整单取消
  const handleCancelOrder = useCallback(() => {
    if (cartItems.length === 0) {
      return;
    }
    dialogRef.current?.show({
      type: 'warning',
      title: '确认取消',
      message: '确定要取消整单吗？所有商品将被清空',
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: () => {
        // 清空购物车
        setCartItems([]);
        // 重置所有商品数量
        setProducts(mockProducts);
        // 清空备注
        setNote('');
      },
    });
  }, [cartItems.length]);

  // 打开支付弹窗
  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      dialogRef.current?.show({
        type: 'warning',
        title: '提示',
        message: '购物车为空，请先添加商品',
        confirmText: '我知道了',
      });
      return;
    }
    setShowPaymentModal(true);
  }, [cartItems.length]);

  // 处理支付
  const handlePayment = useCallback((method: string) => {
    setShowPaymentModal(false);
    // 模拟支付成功
    setTimeout(() => {
      dialogRef.current?.show({
        type: 'success',
        title: '支付成功',
        message: `已通过${method}支付 ¥${totalPrice.toFixed(2)}`,
        confirmText: '确定',
        onConfirm: () => {
          // 清空购物车
          setCartItems([]);
          // 重置所有商品数量
          setProducts(mockProducts);
          // 清空备注
          setNote('');
        },
      });
    }, 300);
  }, [totalPrice]);

  // 使用常量定义的列数
  const numColumns = NUM_COLUMNS;

  // 处理列表滚动 - 根据位置计算当前分类
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // 如果是通过点击分类触发的滚动，则不处理（防止闪烁）
      if (isScrollingByPress.current) {
        return;
      }

      const offsetY = event.nativeEvent.contentOffset.y;
      // 加上一点缓冲，使分类切换更自然
      const scrollPosition = offsetY + ROW_HEIGHT / 2;

      let accumulatedRows = 0;
      // 默认设置为最后一个分类，这样当滚动到底部时会正确高亮最后一个分类
      let currentCategory = CATEGORY_CONFIG.length - 1;

      for (let i = 0; i < CATEGORY_CONFIG.length; i++) {
        // 计算该分类占用的行数（向上取整）
        const categoryRows = Math.ceil(CATEGORY_CONFIG[i].count / NUM_COLUMNS);
        const categoryEndRows = accumulatedRows + categoryRows;
        const categoryEndPosition = categoryEndRows * ROW_HEIGHT;

        if (scrollPosition < categoryEndPosition) {
          currentCategory = i;
          break;
        }
        accumulatedRows = categoryEndRows;
      }

      // 只有当分类变化时才更新状态
      if (currentCategory !== selectedCategory) {
        setSelectedCategory(currentCategory);
      }
    },
    [selectedCategory],
  );

  // 点击分类标签 - 滚动到对应位置
  const handleCategoryPress = useCallback((categoryIndex: number) => {
    // 标记正在程序化滚动，防止 handleScroll 导致分类闪烁
    isScrollingByPress.current = true;

    // 立即设置选中的分类
    setSelectedCategory(categoryIndex);

    // 计算目标分类之前所有分类占用的总行数
    let totalRows = 0;
    for (let i = 0; i < categoryIndex; i++) {
      totalRows += Math.ceil(CATEGORY_CONFIG[i].count / NUM_COLUMNS);
    }
    const targetOffset = totalRows * ROW_HEIGHT;

    flashListRef.current?.scrollToOffset({
      offset: targetOffset,
      animated: true,
    });

    // 滚动动画结束后恢复滚动监听（动画大约 300-500ms）
    setTimeout(() => {
      isScrollingByPress.current = false;
    }, 500);
  }, []);

  return (
    <View style={styles.container}>
      {/* 左侧购物车面板 */}
      <View style={styles.leftPanel}>
        {/* 顶部：流水号 + 就餐类型 */}
        <View style={styles.cartHeader}>
          <View style={styles.cartHeaderTop}>
            <Text style={styles.orderNumber}>流水号：001号</Text>
            <View style={styles.diningTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.diningTypeButton,
                  diningType === 'dineIn' && styles.diningTypeButtonActive,
                ]}
                onPress={() => setDiningType('dineIn')}
              >
                <Text
                  style={[
                    styles.diningTypeText,
                    diningType === 'dineIn' && styles.diningTypeTextActive,
                  ]}
                >
                  堂食
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.diningTypeButton,
                  diningType === 'takeOut' && styles.diningTypeButtonActive,
                ]}
                onPress={() => setDiningType('takeOut')}
              >
                <Text
                  style={[
                    styles.diningTypeText,
                    diningType === 'takeOut' && styles.diningTypeTextActive,
                  ]}
                >
                  自取
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.diningTypeButton,
                  diningType === 'delivery' && styles.diningTypeButtonActive,
                ]}
                onPress={() => setDiningType('delivery')}
              >
                <Text
                  style={[
                    styles.diningTypeText,
                    diningType === 'delivery' && styles.diningTypeTextActive,
                  ]}
                >
                  外卖
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* 列表表头 */}
          <View style={styles.cartListHeader}>
            <Text style={styles.cartListHeaderText}>商品名称</Text>
            <Text
              style={[styles.cartListHeaderText, styles.cartListHeaderQuantity]}
            >
              数量
            </Text>
            <Text
              style={[styles.cartListHeaderText, styles.cartListHeaderPrice]}
            >
              小计
            </Text>
          </View>
        </View>

        {/* 购物车列表 */}
        <ScrollView
          style={styles.cartList}
          contentContainerStyle={styles.cartListContent}
          showsVerticalScrollIndicator={false}
        >
          {cartItems.map(item => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                {item.isCombo && item.comboItems ? (
                  <>
                    <Text style={styles.cartItemComboSpecs}>
                      {item.comboItems}
                    </Text>
                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.cartItemTags}>
                        {item.tags.map((tag, idx) => (
                          <View key={idx} style={styles.cartItemTag}>
                            <Text style={styles.cartItemTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.cartItemSpecs}>{item.specs}</Text>
                )}
              </View>
              <View style={styles.cartItemQuantity}>
                <TouchableOpacity
                  style={styles.quantityButtonMinus}
                  onPress={() => updateCartItemQuantity(item.id, -1)}
                >
                  <Text style={styles.quantityButtonMinusText}>－</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButtonPlus}
                  onPress={() => updateCartItemQuantity(item.id, 1)}
                >
                  <Text style={styles.quantityButtonPlusText}>＋</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cartItemPrice}>¥{item.price.toFixed(2)}</Text>
            </View>
          ))}

          {/* 备注区域 - 只有购物车有数据时才显示 */}
          {cartItems.length > 0 && (
            <View style={styles.noteSection}>
              <TextInput
                style={styles.noteInput}
                placeholder="备注信息..."
                placeholderTextColor={COLORS.gray400}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}
        </ScrollView>

        {/* 底部结算区域 */}
        <View style={styles.cartFooter}>
          <View style={styles.cartSummary}>
            <Text style={styles.cartSummaryItems}>共 {totalItems} 项</Text>
            <View style={styles.cartSummaryPrice}>
              <Text style={styles.cartTotalLabel}>
                合计：
                <Text style={styles.cartTotalPrice}>
                  ¥ {totalPrice.toFixed(1)}
                </Text>
              </Text>
              <Text style={styles.cartDiscount}>
                已优惠：{discount.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.cartActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
              <Text style={styles.cancelButtonIcon}>🗑</Text>
              <Text style={styles.cancelButtonText}>整单取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>
                结账 ¥{totalPrice.toFixed(1)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 右侧商品区域 */}
      <View style={styles.rightPanel}>
        {/* 顶部搜索栏 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="通过名称/拼音/条码搜索"
              placeholderTextColor={COLORS.gray400}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerItem}>
              <Image
                source={{ uri: 'https://flagcdn.com/w40/gb.png' }}
                style={styles.flagIcon}
              />
              <Text style={styles.headerItemText}>English</Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.userIcon}>👤</Text>
              <Text style={styles.headerItemText}>admin</Text>
            </View>
          </View>
        </View>

        {/* 分类标签 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === index && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryPress(index)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === index && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 商品网格 - 使用 FlashList 实现虚拟化 */}
        <View style={styles.productsContainer}>
          <FlashList
            ref={flashListRef}
            data={products}
            renderItem={({ item, index }) => (
              <ProductCard
                product={item}
                numColumns={numColumns}
                onQuantityChange={updateProductQuantity}
                index={index}
                leftPanelWidth={LEFT_PANEL_WIDTH}
              />
            )}
            keyExtractor={item => item.id}
            // @ts-expect-error - FlashList 特有的 estimatedItemSize 属性
            estimatedItemSize={ITEM_ESTIMATED_SIZE}
            numColumns={numColumns}
            contentContainerStyle={styles.productsContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            // 列间距（行与行之间的垂直间距）
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            // iPad 优化：减少同时渲染的内容，降低内存占用
            windowSize={7}
            // 每次渲染 10 个项目，平衡性能和流畅度
            maxToRenderPerBatch={10}
            // 滚动到可见区域的初始渲染数量
            initialNumToRender={12}
            // 视口外的项目不活跃，保持性能
            removeClippedSubviews
            // iOS 风格滚动优化：自然减速效果
            decelerationRate="normal"
            // 启用弹性滚动（iOS bounce 效果）
            bounces={true}
            // Android 过度滚动模式
            overScrollMode="always"
          />
        </View>
      </View>

      {/* 支付弹窗 */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModal}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>选择支付方式</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.paymentAmount}>
              <Text style={styles.paymentAmountLabel}>应付金额</Text>
              <Text style={styles.paymentAmountValue}>¥ {totalPrice.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={styles.paymentMethodButton}
                onPress={() => handlePayment('微信')}
              >
                <Text style={styles.paymentMethodIcon}>💬</Text>
                <Text style={styles.paymentMethodText}>微信支付</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paymentMethodButton}
                onPress={() => handlePayment('支付宝')}
              >
                <Text style={styles.paymentMethodIcon}>📱</Text>
                <Text style={styles.paymentMethodText}>支付宝</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paymentMethodButton}
                onPress={() => handlePayment('现金')}
              >
                <Text style={styles.paymentMethodIcon}>💵</Text>
                <Text style={styles.paymentMethodText}>现金</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 自定义对话框 */}
      <Dialog ref={dialogRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
  },

  // ==================== 左侧面板 ====================
  leftPanel: {
    width: LEFT_PANEL_WIDTH,
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
    flexDirection: 'column',
  },

  // 购物车头部
  cartHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  cartHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  diningTypeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: 4,
  },
  diningTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  diningTypeButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  diningTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  diningTypeTextActive: {
    color: COLORS.gray900,
  },
  cartListHeader: {
    flexDirection: 'row',
  },
  cartListHeaderText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cartListHeaderQuantity: {
    flex: 0,
    width: 80,
    textAlign: 'center',
  },
  cartListHeaderPrice: {
    flex: 0,
    width: 64,
    textAlign: 'right',
  },

  // 购物车列表
  cartList: {
    flex: 1,
  },
  cartListContent: {
    padding: 16,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  cartItemSpecs: {
    fontSize: 10,
    color: COLORS.gray400,
    marginTop: 4,
  },
  cartItemComboSpecs: {
    fontSize: 10,
    color: COLORS.blue400,
    marginTop: 4,
  },
  cartItemTags: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  cartItemTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
  },
  cartItemTagText: {
    fontSize: 10,
    color: COLORS.gray600,
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'center',
    gap: 8,
  },
  quantityButtonMinus: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonMinusText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  quantityText: {
    fontSize: 14,
    color: COLORS.gray900,
    minWidth: 16,
    textAlign: 'center',
  },
  quantityButtonPlus: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPlusText: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '700',
  },
  cartItemPrice: {
    width: 64,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'right',
  },

  // 备注区域
  noteSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  noteInput: {
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    color: COLORS.gray900,
    height: 80,
  },

  // 购物车底部
  cartFooter: {
    padding: 16,
    backgroundColor: COLORS.gray50,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartSummaryItems: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  cartSummaryPrice: {
    alignItems: 'flex-end',
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  cartTotalPrice: {
    color: COLORS.primary,
  },
  cartDiscount: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.red500,
    marginTop: 2,
  },
  cartActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray700,
    borderRadius: 8,
    paddingVertical: 12,
  },
  cancelButtonIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  checkoutButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },

  // ==================== 右侧面板 ====================
  rightPanel: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    flexDirection: 'column',
  },

  // 顶部搜索栏
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 40,
    width: 400,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: COLORS.gray400,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray900,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    gap: 24,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagIcon: {
    width: 20,
    height: 14,
    borderRadius: 2,
  },
  userIcon: {
    fontSize: 14,
  },
  headerItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray500,
  },

  // 分类标签
  categoriesContainer: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  categoryTextActive: {
    color: COLORS.black,
    fontWeight: '700',
  },

  // 商品网格容器
  productsContainer: {
    flex: 1,
    paddingRight:12,
  },
  productsContent: {
    // paddingHorizontal: 24,
    paddingTop: 12,
    // paddingBottom: 24,
  },

  // ==================== 支付弹窗样式 ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModal: {
    width: 400,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  paymentAmount: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.gray50,
  },
  paymentAmountLabel: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 8,
  },
  paymentAmountValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },
  paymentMethods: {
    padding: 24,
    gap: 12,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
  },
});
