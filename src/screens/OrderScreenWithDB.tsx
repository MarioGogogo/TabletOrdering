/**
 * 点单界面 - 使用 WatermelonDB 版本
 *
 * 从 JSON 数据迁移到 WatermelonDB 存储
 * 支持每日同步最新菜品数据
 *
 * @format
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';
import ProductCard from '../components/ProductCard';
import type { Product } from '../components/ProductCard';
import Dish from '../models/Dish';
import DishSyncService from '../services/DishSyncService';
import DataMigrationService from '../services/DataMigrationService';

// 菜品数据接口定义
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
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window');

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

const mockCartItems: CartItem[] = [
  {
    id: '1',
    name: '摩卡咖啡',
    specs: '常温、不加奶、不加糖',
    quantity: 1,
    price: 48.0,
  },
  {
    id: '2',
    name: '巧克力物语',
    specs: '默认配置',
    quantity: 1,
    price: 48.0,
  },
  {
    id: '3',
    name: '摩卡咖啡',
    specs: '冰、少糖',
    quantity: 1,
    price: 48.0,
  },
  {
    id: '4',
    name: '摩卡咖啡',
    specs: '',
    quantity: 1,
    price: 48.0,
    isCombo: true,
    comboItems: '摩卡咖啡【常规】、巧克力物语蛋糕【小份】',
    tags: ['少冰', '不加糖'],
  },
];

// ==================== 卡片尺寸计算 ====================
const CONTAINER_PADDING = 24;
const COLUMN_GAP = 20;
const NUM_COLUMNS = 4;
const CARD_ASPECT_RATIO = 1.2;

// 计算实际卡片高度
const containerWidth = SCREEN_WIDTH - LEFT_PANEL_WIDTH - CONTAINER_PADDING * 2;
const columnWidth = containerWidth / NUM_COLUMNS;
const cardWidth = columnWidth - COLUMN_GAP;
const ACTUAL_CARD_HEIGHT = cardWidth * CARD_ASPECT_RATIO;

// 商品项高度
const ITEM_ESTIMATED_SIZE = Math.round(ACTUAL_CARD_HEIGHT);

// 每行高度 = 卡片高度 + 行间距
const ROW_HEIGHT = ITEM_ESTIMATED_SIZE + 12;

// 就餐类型选项
type DiningType = 'dineIn' | 'takeOut' | 'delivery';

/**
 * 将 WatermelonDB 的 Dish 模型转换为 ProductCard 需要的格式
 */
const dishToProduct = (dish: Dish): Product => ({
  id: dish.id,
  name: dish.name,
  price: dish.price,
  image: dish.imageUrl,
  sales: dish.sales || 0,
  isHot: dish.isHot,
  categoryName: dish.categoryName,
  categoryId: dish.categoryId,
  quantity: 0,
  isSoldOut: dish.isSoldOut,
  hasDiscount: dish.hasDiscount,
  originalPrice: dish.originalPrice,
});

export default function OrderScreenWithDB() {
  // 获取数据库实例
  const database = useDatabase();

  const [diningType, setDiningType] = useState<DiningType>('dineIn');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryConfig, setCategoryConfig] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('');

  // FlashList 引用
  const flashListRef = useRef<any>(null);

  // 标记是否正在通过点击分类触发的程序化滚动
  const isScrollingByPress = useRef(false);

  // 计算合计
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = 28.8; // 模拟价格
  const discount = 2.0;

  /**
   * 加载菜品数据
   */
  useEffect(() => {
    loadDishesFromDatabase();
  }, [database]);

  /**
   * 从数据库加载菜品数据
   */
  const loadDishesFromDatabase = async () => {
    try {
      setIsLoading(true);
      setSyncStatus('加载数据...');

      // 检查是否需要迁移
      const needsMigration = await DataMigrationService.needsMigration();

      if (needsMigration) {
        setSyncStatus('正在导入初始数据...');
        await DataMigrationService.migrateFromJSON(false);
      }

      // 从数据库获取所有可售菜品
      setSyncStatus('正在加载菜品...');
      const dishes = await database
        .get<Dish>('dishes')
        .query(Q.where('is_available', true))
        .fetch();

      // 转换为 Product 格式
      const productList = dishes.map(dishToProduct);
      setProducts(productList);

      // 生成分类配置
      const categoryConfig = generateCategoryConfig(dishes);
      setCategoryConfig(categoryConfig);
      setCategories(categoryConfig.map(cat => cat.name));

      setSyncStatus(`已加载 ${dishes.length} 道菜品`);
    } catch (error) {
      console.error('加载菜品失败:', error);
      setSyncStatus('加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 从菜品数据中动态生成分类配置
   */
  const generateCategoryConfig = (dishes: Dish[]): Category[] => {
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

    return Array.from(categoryMap.entries())
      .map(([id, info]) => ({
        id,
        name: info.name,
        count: info.count,
      }))
      .sort((a, b) => a.id - b.id);
  };

  /**
   * 模拟从远程同步数据
   * 实际使用时替换为真实的 API 调用
   */
  const syncFromRemote = async () => {
    try {
      setSyncStatus('正在同步...');
      setIsLoading(true);

      // TODO: 替换为实际的 API 调用
      // const remoteDishes = await fetchDishesFromAPI();

      // 暂时使用本地 JSON 模拟
      const dishesJson = require('../data/dishes.json');
      const remoteDishes = dishesJson.map((item: any) => ({
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        name: item.name,
        price: item.price,
        image: item.image,
        sales: item.sales || 0,
        isHot: item.isHot || false,
        imageVersion: Date.now(),
      }));

      const stats = await DishSyncService.sync(remoteDishes, {
        removeNotFound: true,
        onProgress: (current, total) => {
          setSyncStatus(`同步中: ${current}/${total}`);
        },
      });

      setSyncStatus(
        `同步完成: 新增 ${stats.created}, 更新 ${stats.updated}, 删除 ${stats.deleted}`,
      );

      // 重新加载数据
      await loadDishesFromDatabase();

      // 3秒后清除状态
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      console.error('同步失败:', error);
      setSyncStatus('同步失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 更新购物车商品数量
  const updateCartItemQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter(item => item.quantity > 0),
    );
  };

  // 更新商品数量
  const updateProductQuantity = useCallback((id: string, delta: number) => {
    setProducts(prods =>
      prods.map(prod =>
        prod.id === id
          ? { ...prod, quantity: Math.max(0, prod.quantity + delta) }
          : prod,
      ),
    );
  }, []);

  // 处理列表滚动 - 根据位置计算当前分类
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isScrollingByPress.current) {
        return;
      }

      const offsetY = event.nativeEvent.contentOffset.y;
      const scrollPosition = offsetY + ROW_HEIGHT / 2;

      let accumulatedRows = 0;
      let currentCategory = categoryConfig.length - 1;

      for (let i = 0; i < categoryConfig.length; i++) {
        const categoryRows = Math.ceil(categoryConfig[i].count / NUM_COLUMNS);
        const categoryEndRows = accumulatedRows + categoryRows;
        const categoryEndPosition = categoryEndRows * ROW_HEIGHT;

        if (scrollPosition < categoryEndPosition) {
          currentCategory = i;
          break;
        }
        accumulatedRows = categoryEndRows;
      }

      if (currentCategory !== selectedCategory) {
        setSelectedCategory(currentCategory);
      }
    },
    [selectedCategory, categoryConfig],
  );

  // 点击分类标签 - 滚动到对应位置
  const handleCategoryPress = useCallback((categoryIndex: number) => {
    isScrollingByPress.current = true;
    setSelectedCategory(categoryIndex);

    let totalRows = 0;
    for (let i = 0; i < categoryIndex; i++) {
      totalRows += Math.ceil(categoryConfig[i].count / NUM_COLUMNS);
    }
    const targetOffset = totalRows * ROW_HEIGHT;

    flashListRef.current?.scrollToOffset({
      offset: targetOffset,
      animated: true,
    });

    setTimeout(() => {
      isScrollingByPress.current = false;
    }, 500);
  }, [categoryConfig]);

  // 根据分类筛选产品
  const filteredProducts =
    selectedCategory === 0
      ? products
      : products.filter(p => p.categoryId === categoryConfig[selectedCategory]?.id);

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
          {/* 数据同步按钮 */}
          <TouchableOpacity
            style={styles.syncButton}
            onPress={syncFromRemote}
            disabled={isLoading}
          >
            <Text style={styles.syncButtonText}>
              {isLoading ? '同步中...' : '同步数据'}
            </Text>
          </TouchableOpacity>
          {syncStatus ? (
            <Text style={styles.syncStatus}>{syncStatus}</Text>
          ) : null}
          {/* 列表表头 */}
          <View style={styles.cartListHeader}>
            <Text style={styles.cartListHeaderText}>商品名称</Text>
            <Text
              style={[
                styles.cartListHeaderText,
                styles.cartListHeaderQuantity,
              ]}
            >
              数量
            </Text>
            <Text
              style={[
                styles.cartListHeaderText,
                styles.cartListHeaderPrice,
              ]}
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
              <Text style={styles.cartItemPrice}>
                ¥{item.price.toFixed(2)}
              </Text>
            </View>
          ))}

          {/* 备注区域 */}
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
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelButtonIcon}>🗑</Text>
              <Text style={styles.cancelButtonText}>整单取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkoutButton}>
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

        {/* 商品网格 */}
        <View style={styles.productsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>{syncStatus}</Text>
            </View>
          ) : (
            <FlashList
              ref={flashListRef}
              data={filteredProducts}
              renderItem={({ item, index }) => (
                <ProductCard
                  product={item}
                  numColumns={NUM_COLUMNS}
                  onQuantityChange={updateProductQuantity}
                  index={index}
                  leftPanelWidth={LEFT_PANEL_WIDTH}
                />
              )}
              keyExtractor={item => item.id}
              estimatedItemSize={ITEM_ESTIMATED_SIZE}
              numColumns={NUM_COLUMNS}
              contentContainerStyle={styles.productsContent}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              windowSize={7}
              maxToRenderPerBatch={10}
              initialNumToRender={12}
              removeClippedSubviews
              decelerationRate="normal"
              bounces={true}
              overScrollMode="always"
            />
          )}
        </View>
      </View>
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
  syncButton: {
    backgroundColor: COLORS.blue500,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  syncStatus: {
    fontSize: 10,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 8,
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
    paddingRight: 12,
  },
  productsContent: {
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
});
