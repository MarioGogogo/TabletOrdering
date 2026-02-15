import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';

// Material Icons 映射 (使用文字代替)
const Icons = {
  arrowBack: '←',
  search: '🔍',
  notifications: '🔔',
  print: '🖨️',
  wifi: '📶',
  person: '👤',
  deleteOutline: '🗑️',
  add: '+',
  remove: '−',
  chevronRight: '›',
};

// 菜品数据
const DISH_ITEMS = [
  { name: '云梦山炒香鸡', price: '68', count: 1 },
  { name: '惠灵顿和风烤猪排', price: '168', count: 0 },
  { name: '爆辣黑虎虾', price: '58', count: 2 },
  { name: '佛跳墙', price: '100', count: 1 },
  { name: '蒜蓉粉丝蒸大虾', price: '88', count: 0 },
  { name: '红烧狮子头', price: '45', count: 0 },
  { name: '清爽拍黄瓜', price: '18', count: 3 },
  { name: '养生南瓜粥', price: '12', count: 0 },
  { name: '招牌北京烤鸭', price: '198', count: 0 },
  { name: '干炒牛河', price: '38', count: 1 },
  { name: '时令蔬菜炒肉', price: '28', count: 0 },
  { name: '精选水果盘', price: '48', count: 0 },
];

// 购物车数据
const CART_ITEMS = [
  { name: '云梦山炒香鸡', price: '68', qty: 1 },
  { name: '惠灵顿和风烤猪排', price: '168', qty: 1 },
  { name: '爆辣黑虎虾', price: '58', qty: 1, selected: true },
  { name: '佛跳墙', price: '100', qty: 1 },
  { name: '清蒸鲈鱼', price: '88', qty: 1 },
];

// 分类数据
const CATEGORIES = ['全部', '热菜', '凉菜', '套餐', '酒水', '配菜', '啤酒', '白酒'];

// 操作按钮数据
const ACTION_BUTTONS = ['规格/做法', '加料', '赠菜', '单品备注', '整单备注', '单品打折\n/减免'];

export default function OrderScreen() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [makeOrderChecked, setMakeOrderChecked] = useState(true);
  const [guestOrderChecked, setGuestOrderChecked] = useState(false);

  const totalAmount = CART_ITEMS.reduce((sum, item) => sum + parseInt(item.price) * item.qty, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>{Icons.arrowBack}</Text>
          </TouchableOpacity>
          <View style={styles.tableInfo}>
            <Text style={styles.tableNumber}>1号桌</Text>
            <Text style={styles.guestCount}>人数: 4人</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>{Icons.search}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索菜品名称/拼音"
            placeholderTextColor={COLORS.gray400}
          />
          <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.resetButtonText}>重置</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.headerIcon}>{Icons.notifications}</Text>
          <Text style={styles.headerIcon}>{Icons.print}</Text>
          <Text style={styles.headerIcon}>{Icons.wifi}</Text>
          <Text style={styles.timeText}>15:34</Text>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qDgRzYpdElkmbtdlg0LgsYvl_qqBSCwwylJQb93vfFssp-snXbNgrIqBiMyxDPzkZYpQ_F5hc4okn2_J6I__-rP1VQFlbSXiGXJ_pQhw_QpSw7WbV-u67SGo7rrlUM2-3mbhlI3k7hMV6BGJJoAqAXpSjw_-XARKpcvy70elxEC9R79dv2iRSuMg_Fj8y46ZDi6jTgIudw0rh_UMbvuxBQ_NiDkWj6J0qrmrQcZucdA-k-X_XGuRMv4oz9iVkBgKSpPE-AWwWjY' }}
              style={styles.userAvatar}
            />
            <Text style={styles.userName}>admin</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Left Sidebar - Cart */}
        <View style={styles.cartSidebar}>
          <View style={styles.cartHeader}>
            <TouchableOpacity style={styles.memberButton}>
              <Text style={styles.memberButtonIcon}>{Icons.person}</Text>
              <Text style={styles.memberButtonText}>会员登录</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton}>
              <Text style={styles.clearButtonIcon}>{Icons.deleteOutline}</Text>
              <Text style={styles.clearButtonText}>清空</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
            {CART_ITEMS.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.cartItem,
                  item.selected && styles.cartItemSelected,
                ]}
              >
                <View style={styles.cartItemHeader}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>¥ {item.price}</Text>
                </View>
                <Text style={styles.cartItemQty}>X {item.qty}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.cartFooter}>
            <View style={styles.cartOptions}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setMakeOrderChecked(!makeOrderChecked)}
                >
                  <View style={[styles.checkboxBox, makeOrderChecked && styles.checkboxChecked]}>
                    {makeOrderChecked && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>制作单</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setGuestOrderChecked(!guestOrderChecked)}
                >
                  <View style={[styles.checkboxBox, guestOrderChecked && styles.checkboxChecked]}>
                    {guestOrderChecked && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>客单</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalCount}>共 {CART_ITEMS.length} 项</Text>
                <Text style={styles.totalAmount}>¥ {totalAmount.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutButtonText}>下单并结账</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.orderButton}>
                <Text style={styles.orderButtonText}>下单</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Middle Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton}>
            <Text style={styles.toolbarButtonIcon}>{Icons.add}</Text>
          </TouchableOpacity>
          <Text style={styles.toolbarQty}>1</Text>
          <TouchableOpacity style={styles.toolbarButton}>
            <Text style={styles.toolbarButtonIcon}>{Icons.remove}</Text>
          </TouchableOpacity>

          <View style={styles.toolbarActions}>
            {ACTION_BUTTONS.map((label, index) => (
              <TouchableOpacity key={index} style={styles.toolbarActionButton}>
                <Text style={styles.toolbarActionText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>删除</Text>
          </TouchableOpacity>
        </View>

        {/* Right Content - Product Grid */}
        <View style={styles.content}>
          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {CATEGORIES.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryTab,
                  selectedCategory === index && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(index)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === index && styles.categoryTabTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryTabIcon}>{Icons.chevronRight}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Product Grid */}
          <ScrollView style={styles.productScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.productGrid}>
              {DISH_ITEMS.map((item, index) => (
                <TouchableOpacity key={index} style={styles.productCard}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>¥{item.price}</Text>
                  </View>
                  {item.count > 0 && (
                    <View style={styles.productBadge}>
                      <Text style={styles.productBadgeText}>{item.count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Pagination */}
          <View style={styles.pagination}>
            <Text style={styles.paginationInfo}>当前分类下有23个商品</Text>
            <View style={styles.paginationButtons}>
              {[1, 2, 3, 4, 5].map((page) => (
                <TouchableOpacity
                  key={page}
                  style={[
                    styles.pageButton,
                    currentPage === page && styles.pageButtonActive,
                  ]}
                  onPress={() => setCurrentPage(page)}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      currentPage === page && styles.pageButtonTextActive,
                    ]}
                  >
                    {page}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.pageNavButton}>
                <Text style={styles.pageNavButtonText}>上一页</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageNavButton}>
                <Text style={styles.pageNavButtonText}>下一页</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 颜色配置 (来自 HTML)
const PRIMARY_COLOR = '#a3e635'; // 亮绿色
const PRIMARY_DARK = '#84cc16';
const BACKGROUND_LIGHT = '#f3f4f6';
const TEXT_DARK = '#0f172a';
const TEXT_GRAY = '#64748b';
const TEXT_LIGHT_GRAY = '#94a3b8';
const WHITE = '#ffffff';
const BORDER_COLOR = '#e2e8f0';
const SLATE_50 = '#f8fafc';
const SLATE_100 = '#f1f5f9';
const SLATE_800 = '#1e293b';
const ORANGE_100 = '#ffedd5';
const ORANGE_700 = '#c2410c';
const RED_500 = '#ef4444';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
  },
  // Header Styles
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SLATE_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: TEXT_DARK,
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  guestCount: {
    fontSize: 14,
    color: TEXT_GRAY,
    marginLeft: 16,
  },
  searchContainer: {
    flex: 2,
    maxWidth: 600,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SLATE_100,
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
    paddingVertical: 0,
  },
  resetButton: {
    backgroundColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_DARK,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerIcon: {
    fontSize: 20,
    marginHorizontal: 8,
    color: TEXT_GRAY,
  },
  timeText: {
    fontSize: 18,
    fontFamily: 'monospace',
    marginLeft: 8,
    color: TEXT_DARK,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: BORDER_COLOR,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: TEXT_DARK,
  },
  // Main Layout
  main: {
    flex: 1,
    flexDirection: 'row',
  },
  // Cart Sidebar
  cartSidebar: {
    width: 320,
    backgroundColor: WHITE,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
    flexDirection: 'column',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  memberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE_100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  memberButtonIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  memberButtonText: {
    fontSize: 13,
    color: ORANGE_700,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButtonIcon: {
    fontSize: 14,
    marginRight: 4,
    color: TEXT_LIGHT_GRAY,
  },
  clearButtonText: {
    fontSize: 13,
    color: TEXT_LIGHT_GRAY,
  },
  cartList: {
    flex: 1,
    padding: 8,
  },
  cartItem: {
    padding: 12,
    backgroundColor: SLATE_50,
    borderRadius: 12,
    marginBottom: 8,
  },
  cartItemSelected: {
    backgroundColor: `${PRIMARY_COLOR}20`,
    borderWidth: 1,
    borderColor: `${PRIMARY_COLOR}40`,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_DARK,
    flex: 1,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  cartItemQty: {
    fontSize: 12,
    color: TEXT_LIGHT_GRAY,
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  cartOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkboxChecked: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  checkboxCheck: {
    fontSize: 12,
    color: TEXT_DARK,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 12,
    color: TEXT_DARK,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalCount: {
    fontSize: 12,
    color: TEXT_LIGHT_GRAY,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PRIMARY_DARK,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: SLATE_800,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: 'bold',
  },
  orderButton: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Toolbar
  toolbar: {
    width: 96,
    backgroundColor: SLATE_50,
    alignItems: 'center',
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  toolbarButton: {
    width: 64,
    height: 48,
    backgroundColor: WHITE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toolbarButtonIcon: {
    fontSize: 24,
    color: TEXT_DARK,
  },
  toolbarQty: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
    color: TEXT_DARK,
  },
  toolbarActions: {
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 8,
    gap: 8,
  },
  toolbarActionButton: {
    backgroundColor: WHITE,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  toolbarActionText: {
    fontSize: 11,
    color: TEXT_DARK,
    textAlign: 'center',
    lineHeight: 14,
  },
  deleteButton: {
    width: 64,
    height: 48,
    backgroundColor: RED_500,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    shadowColor: RED_500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '500',
  },
  // Content Area
  content: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
  },
  categoryTabs: {
    maxHeight: 48,
    marginBottom: 16,
  },
  categoryTabsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: WHITE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  categoryTabText: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '400',
  },
  categoryTabTextActive: {
    fontWeight: 'bold',
  },
  categoryTabIcon: {
    fontSize: 20,
    color: TEXT_DARK,
  },
  productScroll: {
    flex: 1,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    width: '23%',
    minWidth: 180,
    aspectRatio: 4 / 3,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  productName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: TEXT_DARK,
    lineHeight: 22,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 14,
    color: TEXT_LIGHT_GRAY,
    fontWeight: '500',
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: RED_500,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productBadgeText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
  },
  paginationInfo: {
    fontSize: 12,
    color: TEXT_GRAY,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageButton: {
    width: 32,
    height: 32,
    backgroundColor: WHITE,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonActive: {
    backgroundColor: SLATE_800,
  },
  pageButtonText: {
    fontSize: 12,
    color: TEXT_DARK,
  },
  pageButtonTextActive: {
    color: WHITE,
  },
  pageNavButton: {
    paddingHorizontal: 12,
    height: 32,
    backgroundColor: WHITE,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNavButtonText: {
    fontSize: 12,
    color: TEXT_DARK,
  },
});
