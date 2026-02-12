import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const isLandscape = width > height;

// 计算表格网格布局参数
const GRID_PADDING = 24; // 左右padding
const GRID_GAP = 12; // 卡片间距
const COLUMNS = 8; // 列数
const AVAILABLE_WIDTH = width - (GRID_PADDING * 2);
const TOTAL_GAPS = (COLUMNS - 1) * GRID_GAP;
const CARD_WIDTH = (AVAILABLE_WIDTH - TOTAL_GAPS) / COLUMNS;

// 颜色定义
const colors = {
  primary: '#86efac',
  backgroundLight: '#f3f4f6',
  backgroundDark: '#111827',
  cardEmpty: '#e5e7eb',
  statusRed: '#fca5a5',
  statusBlue: '#93c5fd',
  statusGreen: '#86efac',
  statusOrange: '#fdba74',
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  red: {
    '500': '#ef4444',
    '900': '#7f1d1d',
  },
  blue: {
    '900': '#1e3a8a',
  },
  emerald: {
    '900': '#064e3b',
  },
  orange: {
    '900': '#7c2d12',
  },
};

// 桌台状态类型
type TableStatus = 'empty' | 'pending-payment' | 'pre-paid' | 'pending-clear' | 'pending-order';

interface Table {
  id: string;
  name: string;
  status: TableStatus;
  capacity: number;
  occupied?: number;
  duration?: number;
  note?: string;
}

// 模拟桌台数据
const tables: Table[] = [
  { id: '1', name: '大厅1', status: 'empty', capacity: 4 },
  { id: '2', name: '大厅2', status: 'empty', capacity: 4 },
  { id: '3', name: '大厅3', status: 'empty', capacity: 4 },
  { id: '4', name: '大厅4', status: 'pending-payment', capacity: 10, occupied: 8, duration: 120 },
  { id: '5', name: '大厅5', status: 'pending-payment', capacity: 10, occupied: 8, duration: 120 },
  { id: '6', name: '大厅6', status: 'empty', capacity: 4 },
  { id: '7', name: '大厅7', status: 'empty', capacity: 4 },
  { id: '8', name: '大厅8', status: 'empty', capacity: 4 },
  { id: '9', name: '华山厅', status: 'pre-paid', capacity: 10, occupied: 8, duration: 120, note: '查看备注' },
  { id: '10', name: '泰山厅', status: 'pending-clear', capacity: 10, occupied: 8, duration: 120 },
  { id: '11', name: '黄山厅', status: 'empty', capacity: 10 },
  { id: '12', name: '嵩山厅', status: 'pending-order', capacity: 10, occupied: 8, duration: 120 },
];

// 获取状态颜色
const getStatusColors = (status: TableStatus) => {
  switch (status) {
    case 'pending-payment':
      return {
        bg: colors.statusRed,
        text: colors.red[900],
        barBg: 'rgba(127, 29, 29, 0.1)',
      };
    case 'pre-paid':
      return {
        bg: colors.statusBlue,
        text: colors.blue[900],
        barBg: 'rgba(30, 58, 138, 0.1)',
      };
    case 'pending-clear':
      return {
        bg: colors.statusGreen,
        text: colors.emerald[900],
        barBg: 'rgba(6, 78, 59, 0.1)',
      };
    case 'pending-order':
      return {
        bg: colors.statusOrange,
        text: colors.orange[900],
        barBg: 'rgba(124, 45, 18, 0.1)',
      };
    default:
      return {
        bg: colors.slate[100],
        text: colors.slate[900],
        barBg: colors.slate[200],
      };
  }
};

// 获取状态文字
const getStatusText = (status: TableStatus) => {
  switch (status) {
    case 'pending-payment':
      return '待结账';
    case 'pre-paid':
      return '已预结';
    case 'pending-clear':
      return '待清台';
    case 'pending-order':
      return '待下单';
    default:
      return '';
  }
};

// 桌台卡片组件
const TableCard: React.FC<{ table: Table }> = ({ table }) => {
  const statusColors = getStatusColors(table.status);
  const isEmpty = table.status === 'empty';

  return (
    <View
      style={[
        styles.tableCard,
        { backgroundColor: statusColors.bg },
        isEmpty && styles.tableCardEmpty,
      ]}
    >
      <View>
        <View style={styles.tableCardHeader}>
          <Text
            style={[
              styles.tableCardName,
              { color: statusColors.text },
              isEmpty && styles.tableCardNameEmpty,
            ]}
          >
            {table.name}
          </Text>
          {table.note && (
            <View style={styles.noteBadge}>
              <Text style={styles.noteBadgeText}>{table.note}</Text>
            </View>
          )}
        </View>
        {!isEmpty && (
          <Text style={[styles.tableCardStatus, { color: statusColors.text }]}>
            {getStatusText(table.status)}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.tableCardBar,
          { backgroundColor: statusColors.barBg },
        ]}
      >
        <View style={styles.tableCardBarContent}>
          <Icon
            name="person"
            size={12}
            color={isEmpty ? colors.slate[400] : statusColors.text}
            style={{ opacity: isEmpty ? 0.4 : 0.8 }}
          />
          <Text
            style={[
              styles.tableCardBarText,
              {
                color: isEmpty ? colors.slate[400] : statusColors.text,
                opacity: isEmpty ? 0.4 : 0.8,
              },
            ]}
          >
            {table.occupied ? `${table.occupied}/${table.capacity}人` : `${table.capacity}人`}
          </Text>
        </View>

        {table.duration && !isEmpty && (
          <View style={styles.tableCardBarContent}>
            <Icon
              name="schedule"
              size={12}
              color={statusColors.text}
              style={{ opacity: 0.8 }}
            />
            <Text
              style={[
                styles.tableCardBarText,
                { color: statusColors.text, opacity: 0.8 },
              ]}
            >
              {table.duration}分钟
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// 底部统计项组件
const StatItem: React.FC<{
  color: string;
  label: string;
  count: number;
  isLast?: boolean;
}> = ({ color, label, count, isLast }) => {
  return (
    <View
      style={[
        styles.statItem,
        !isLast && styles.statItemBorder,
      ]}
    >
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statText}>
        {label}: {count}
      </Text>
    </View>
  );
};

const TableScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'hall' | 'room'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 统计数据
  const stats = {
    total: 12,
    empty: 10,
    pendingOrder: 1,
    pendingPayment: 1,
    prePaid: 1,
    pendingClear: 1,
  };

  // 未结账信息
  const unpaidInfo = {
    tables: 2,
    amount: 6000,
    people: 16,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.slate[100]} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="arrow-back" size={20} color={colors.slate[600]} />
            <Text style={styles.backButtonText}>返回首页</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.slate[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="桌台名称查询"
              placeholderTextColor={colors.slate[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.resetButtonText}>重置</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.headerIcons}>
            <View style={styles.iconWrapper}>
              <Icon name="notifications" size={22} color={colors.slate[500]} />
              <View style={styles.notificationDot} />
            </View>
            <Icon name="wifi" size={22} color={colors.slate[500]} />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>15:34</Text>
              <Text style={styles.dateText}>11-05 星期二</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.userContainer}>
            <View style={styles.avatar}>
              <Icon name="person" size={18} color={colors.slate[500]} />
            </View>
            <Text style={styles.username}>admin</Text>
          </View>
        </View>
      </View>

      {/* Unpaid Info Bar */}
      <View style={styles.unpaidBar}>
        <View style={styles.unpaidLeft}>
          <Text style={styles.unpaidLabel}>未结账信息:</Text>
          <View style={styles.unpaidStats}>
            <Text style={styles.unpaidStat}>{unpaidInfo.tables}桌</Text>
            <Text style={styles.unpaidDivider}>|</Text>
            <Text style={styles.unpaidStat}>¥{unpaidInfo.amount}</Text>
            <Text style={styles.unpaidDivider}>|</Text>
            <Text style={styles.unpaidStat}>{unpaidInfo.people}人</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>桌台操作</Text>
          <Icon name="expand-more" size={18} color={colors.slate[700]} />
        </TouchableOpacity>
      </View>

      {/* Tab Filter */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              全部 12
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'hall' && styles.tabButtonActive]}
            onPress={() => setActiveTab('hall')}
          >
            <Text style={[styles.tabText, activeTab === 'hall' && styles.tabTextActive]}>
              大厅 7
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'room' && styles.tabButtonActive]}
            onPress={() => setActiveTab('room')}
          >
            <Text style={[styles.tabText, activeTab === 'room' && styles.tabTextActive]}>
              包间 5
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Grid */}
      <ScrollView style={styles.mainContent} contentContainerStyle={styles.gridContainer}>
        <View style={styles.tableGrid}>
          {tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </View>
      </ScrollView>

      {/* Footer Stats */}
      <View style={styles.footer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.footerContent}>
          <View style={[styles.footerItem, styles.footerItemHighlighted]}>
            <Text style={styles.footerItemTextBold}>全部: {stats.total}</Text>
          </View>
          <StatItem color={colors.slate[300]} label="空桌台" count={stats.empty} />
          <StatItem color={colors.statusOrange} label="待下单" count={stats.pendingOrder} />
          <StatItem color={colors.statusRed} label="待结账" count={stats.pendingPayment} />
          <StatItem color={colors.statusBlue} label="已预结" count={stats.prePaid} />
          <StatItem color={colors.statusGreen} label="待清台" count={stats.pendingClear} isLast />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate[600],
    marginLeft: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 500,
    marginHorizontal: 32,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[100],
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.slate[900],
    padding: 0,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.slate[200],
    borderRadius: 18,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate[700],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    backgroundColor: colors.red[500],
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.slate[800],
  },
  dateText: {
    fontSize: 10,
    color: colors.slate[500],
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.slate[200],
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate[700],
  },
  unpaidBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  unpaidLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  unpaidLabel: {
    fontSize: 13,
    color: colors.slate[500],
  },
  unpaidStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  unpaidStat: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate[900],
  },
  unpaidDivider: {
    fontSize: 13,
    color: colors.slate[300],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.slate[200],
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate[700],
  },
  tabContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  tabWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 4,
    backgroundColor: colors.slate[200],
    borderRadius: 12,
  },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate[600],
  },
  tabTextActive: {
    fontWeight: '700',
    color: colors.slate[900],
  },
  mainContent: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tableCard: {
    width: CARD_WIDTH,
    height: 128,
    padding: 12,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  tableCardEmpty: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.slate[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tableCardName: {
    fontSize: 13,
    fontWeight: '700',
  },
  tableCardNameEmpty: {
    opacity: 0.6,
  },
  tableCardStatus: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  noteBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noteBadgeText: {
    fontSize: 9,
    color: colors.slate[800],
  },
  tableCardBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
    marginHorizontal: -8,
    marginBottom: -4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tableCardBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableCardBarText: {
    fontSize: 10,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
    height: 64,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
    height: '100%',
    paddingHorizontal: 0,
    width: '100%',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    paddingHorizontal: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    paddingHorizontal: 16,
  },
  footerItemHighlighted: {
    backgroundColor: colors.slate[50],
    borderRightWidth: 1,
    borderRightColor: colors.slate[100],
  },
  statItemBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.slate[100],
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statText: {
    fontSize: 13,
    color: colors.slate[600],
  },
  footerItemTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate[900],
  },
});

export default TableScreen;
