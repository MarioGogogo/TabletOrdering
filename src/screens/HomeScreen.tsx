/**
 * 首页 - 门店看板数据
 *
 * 适配横屏 iPad 设备
 * 设计风格: Bento Box Grid + Modern Dashboard
 *
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, LinearGradient, Defs, Stop, Circle } from 'react-native-svg';
import { useNavigation, CommonActions } from '@react-navigation/native';
import OrderScreen from './OrderScreen';

// 颜色配置 - 现代仪表盘配色
const COLORS = {
  // 主色调 - 金色
  primary: '#EAB308',
  'primary-dark': '#A16207',
  'primary-light': '#FEF9C3',
  'primary-subtle': '#FEF08A',

  // 背景色
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  surface: '#F1F5F9',

  // 侧边栏
  sidebar: '#FFFFFF',
  sidebarBorder: '#E2E8F0',

  // 中性色
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // 语义色 - 蓝色系
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blueGradientStart: '#3B82F6',
  blueGradientEnd: '#60A5FA',

  // 语义色 - 绿色系
  emerald50: '#ECFDF5',
  emerald100: '#D1FAE5',
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',
  emeraldGradientStart: '#10B981',
  emeraldGradientEnd: '#34D399',

  // 语义色 - 橙色系
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amberGradientStart: '#F59E0B',
  amberGradientEnd: '#FBBF24',

  // 语义色 - 紫色系
  purple50: '#FAF5FF',
  purple100: '#F3E8FF',
  purple400: '#C084FC',
  purple500: '#A855F7',
  purple600: '#9333EA',
  purpleGradientStart: '#9333EA',
  purpleGradientEnd: '#C084FC',

  // 语义色 - 红色系
  red50: '#FEF2F2',
  red500: '#EF4444',
  red600: '#DC2626',
};

// 动画数字组件
function AnimatedNumber({ value, style, duration = 1000 }: { value: string; style?: TextStyle; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.Text style={[style, { opacity: animatedValue }]}>
      {displayValue}
    </Animated.Text>
  );
}

// 迷你趋势图组件
function MiniTrendChart({ path, color, trend }: { path: string; color: string; trend: 'up' | 'down' | 'stable' }) {
  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#64748B';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <View style={styles.miniChartContainer}>
      <Svg width={80} height={32} viewBox="0 0 100 40" fill="none">
        <Path
          d={path}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View style={[styles.trendBadge, { backgroundColor: trendColor + '15' }]}>
        <Text style={[styles.trendText, { color: trendColor }]}>{trendIcon} 12%</Text>
      </View>
    </View>
  );
}

// 统计数据卡片组件
interface StatCardProps {
  title: string;
  value: string;
  color: string;
  bgColor: string;
  borderColor: string;
  chartPath: string;
  trend: 'up' | 'down' | 'stable';
  gradientColors: [string, string];
}

function StatCard({ title, value, color, bgColor, borderColor, chartPath, trend, gradientColors }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.statCardContent}>
        <View>
          <Text style={[styles.statTitle, { color }]}>{title}</Text>
          <AnimatedNumber value={value} style={styles.statValue} />
        </View>
        <MiniTrendChart path={chartPath} color={color} trend={trend} />
      </View>
      {/* 渐变装饰条 */}
      <View style={[styles.statCardAccent, { backgroundColor: gradientColors[0] }]} />
    </View>
  );
}

// 区域填充路径生成器
function createAreaPath(points: { x: number; y: number }[], height: number = 200): string {
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 4} ${height - p.y * 1.6}`).join(' ');
  return `${linePath} L 400 ${height} L 0 ${height} Z`;
}

// 平滑曲线路径生成器
function createSmoothPath(points: { x: number; y: number }[], height: number = 200): string {
  if (points.length < 2) return '';

  let path = `M ${points[0].x * 4} ${height - points[0].y * 1.6}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) * 2;
    const cpY = height - p1.y * 1.6;
    path += ` Q ${p0.x * 4 + 30} ${height - p0.y * 1.6}, ${p1.x * 4} ${cpY}`;
  }

  return path;
}

// 日营业统计图表组件
function DailyRevenueChart() {
  const dataPoints = [
    { x: 0, y: 80 }, { x: 25, y: 120 }, { x: 50, y: 90 }, { x: 75, y: 150 }, { x: 100, y: 110 },
  ];

  const areaPath = createAreaPath(dataPoints);
  const linePath = createSmoothPath(dataPoints);

  return (
    <View style={styles.chartContainer}>
      <Svg width="100%" height={200} viewBox="0 0 400 200" style={styles.chartSvg}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#EAB308" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#EAB308" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        {/* 区域填充 */}
        <Path d={areaPath} fill="url(#areaGradient)" />
        {/* 曲线 */}
        <Path
          d={linePath}
          stroke="#EAB308"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 数据点 */}
        <Circle cx={0} cy={56} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
        <Circle cx={100} cy={8} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
        <Circle cx={200} cy={56} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
        <Circle cx={300} cy={-40} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
        <Circle cx={400} cy={24} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
      </Svg>

      {/* 悬浮数据点 */}
      <View style={styles.chartPointBadge}>
        <View style={styles.chartPointDot} />
        <View style={styles.chartPointContent}>
          <Text style={styles.chartPointTime}>14:00</Text>
          <Text style={styles.chartPointValue}>¥1,960</Text>
        </View>
      </View>
    </View>
  );
}


// 多系列趋势图表组件
function WeeklyTrendChart() {
  const revenuePoints = [
    { x: 0, y: 100 }, { x: 16.6, y: 80 }, { x: 33.3, y: 120 }, { x: 50, y: 70 },
    { x: 66.6, y: 130 }, { x: 83.3, y: 100 }, { x: 100, y: 150 },
  ];

  const orderPoints = [
    { x: 0, y: 60 }, { x: 16.6, y: 80 }, { x: 33.3, y: 50 }, { x: 50, y: 90 },
    { x: 66.6, y: 70 }, { x: 83.3, y: 110 }, { x: 100, y: 85 },
  ];

  const flowPoints = [
    { x: 0, y: 40 }, { x: 16.6, y: 50 }, { x: 33.3, y: 35 }, { x: 50, y: 60 },
    { x: 66.6, y: 45 }, { x: 83.3, y: 70 }, { x: 100, y: 55 },
  ];

  const revenuePath = createSmoothPath(revenuePoints);
  const orderPath = createSmoothPath(orderPoints);
  const flowPath = createSmoothPath(flowPoints);

  return (
    <View style={styles.chartContainer}>
      <Svg width="100%" height={200} viewBox="0 0 400 200" style={styles.chartSvg}>
        {/* 成交额曲线 */}
        <Path
          d={revenuePath}
          stroke="#3B82F6"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 订单量曲线 */}
        <Path
          d={orderPath}
          stroke="#10B981"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 客流量曲线 */}
        <Path
          d={flowPath}
          stroke="#EAB308"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 数据点 - 固定渲染 */}
        <Circle cx={200} cy={88} r={4} fill="#3B82F6" />
        <Circle cx={400} cy={40} r={4} fill="#3B82F6" />
        <Circle cx={200} cy={136} r={4} fill="#10B981" />
        <Circle cx={400} cy={88} r={4} fill="#10B981" />
        <Circle cx={200} cy={184} r={4} fill="#EAB308" />
        <Circle cx={400} cy={168} r={4} fill="#EAB308" />
      </Svg>

      {/* 快捷数据标签 */}
      <View style={styles.quickStats}>
        <View style={[styles.quickStatItem, { backgroundColor: COLORS.blue50 }]}>
          <View style={[styles.quickStatDot, { backgroundColor: COLORS.blue500 }]} />
          <Text style={styles.quickStatLabel}>最高成交额</Text>
          <Text style={[styles.quickStatValue, { color: COLORS.blue600 }]}>¥8,920</Text>
        </View>
      </View>
    </View>
  );
}

// ==================== 页面内容组件 ====================

// 桌台内容组件
function TableContent() {
  const tables = [
    { id: 1, name: '01号桌', status: 'available', seats: 4 },
    { id: 2, name: '02号桌', status: 'occupied', seats: 4 },
    { id: 3, name: '03号桌', status: 'reserved', seats: 6 },
    { id: 4, name: '04号桌', status: 'available', seats: 2 },
    { id: 5, name: '05号桌', status: 'occupied', seats: 6 },
    { id: 6, name: '06号桌', status: 'available', seats: 8 },
    { id: 7, name: '07号桌', status: 'cleaning', seats: 4 },
    { id: 8, name: '08号桌', status: 'available', seats: 4 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'occupied': return '#EF4444';
      case 'reserved': return '#F59E0B';
      case 'cleaning': return '#6366f1';
      default: return '#94A3B8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '空闲';
      case 'occupied': return '使用中';
      case 'reserved': return '已预订';
      case 'cleaning': return '清洁中';
      default: return status;
    }
  };

  return (
    <View style={styles.pageContent}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitleLarge}>桌台管理</Text>
        <Text style={styles.pageSubtitle}>实时查看桌台状态</Text>
      </View>

      {/* 桌台网格 */}
      <View style={styles.tableGrid}>
        {tables.map((table) => (
          <TouchableOpacity key={table.id} style={styles.tableCard} activeOpacity={0.7}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableName}>{table.name}</Text>
              <View style={[styles.tableStatus, { backgroundColor: getStatusColor(table.status) + '20' }]}>
                <View style={[styles.tableStatusDot, { backgroundColor: getStatusColor(table.status) }]} />
                <Text style={[styles.tableStatusText, { color: getStatusColor(table.status) }]}>
                  {getStatusText(table.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.tableSeats}>可容纳 {table.seats} 人</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// 订单内容组件
function OrdersContent() {
  const orders = [
    { id: '20240116001', table: '05号桌', items: 3, total: '128', status: 'preparing', time: '14:23' },
    { id: '20240116002', table: '02号桌', items: 5, total: '256', status: 'served', time: '14:15' },
    { id: '20240116003', table: '07号桌', items: 2, total: '68', status: 'pending', time: '14:10' },
    { id: '20240116004', table: '03号桌', items: 8, total: '520', status: 'paid', time: '13:45' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'preparing': return { color: '#F59E0B', text: '准备中' };
      case 'served': return { color: '#10B981', text: '已上菜' };
      case 'pending': return { color: '#6366f1', text: '待处理' };
      case 'paid': return { color: '#94A3B8', text: '已付款' };
      default: return { color: '#94A3B8', text: status };
    }
  };

  return (
    <View style={styles.pageContent}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitleLarge}>订单管理</Text>
        <Text style={styles.pageSubtitle}>查看和处理订单</Text>
      </View>

      {/* 订单列表 */}
      <View style={styles.orderList}>
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          return (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              activeOpacity={0.9}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderTable}>{order.table}</Text>
                </View>
                <Text style={styles.orderTime}>{order.time}</Text>
              </View>
              <View style={styles.orderBody}>
                <Text style={styles.orderItems}>共 {order.items} 道菜</Text>
                <Text style={styles.orderTotal}>¥{order.total}</Text>
              </View>
              <View style={styles.orderFooter}>
                <View style={[styles.orderStatus, { backgroundColor: statusConfig.color + '15' }]}>
                  <Text style={[styles.orderStatusText, { color: statusConfig.color }]}>
                    {statusConfig.text}
                  </Text>
                </View>
                <View style={styles.orderAction}>
                  <Text style={styles.orderActionText}>查看详情</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// 会员内容组件
function MemberContent() {
  const members = [
    { id: 1, name: '张三', phone: '138****8888', points: 2560, level: '黄金会员' },
    { id: 2, name: '李四', phone: '139****6666', points: 1280, level: '白银会员' },
    { id: 3, name: '王五', phone: '136****5555', points: 5200, level: '钻石会员' },
    { id: 4, name: '赵六', phone: '137****4444', points: 680, level: '普通会员' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case '钻石会员': return '#F59E0B';
      case '黄金会员': return '#EAB308';
      case '白银会员': return '#94A3B8';
      default: return '#64748B';
    }
  };

  return (
    <View style={styles.pageContent}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitleLarge}>会员管理</Text>
        <Text style={styles.pageSubtitle}>会员信息与积分管理</Text>
      </View>

      {/* 会员统计 */}
      <View style={styles.memberStats}>
        <View style={styles.memberStatCard}>
          <Text style={styles.memberStatValue}>1,234</Text>
          <Text style={styles.memberStatLabel}>会员总数</Text>
        </View>
        <View style={styles.memberStatCard}>
          <Text style={styles.memberStatValue}>56,780</Text>
          <Text style={styles.memberStatLabel}>总积分</Text>
        </View>
        <View style={styles.memberStatCard}>
          <Text style={styles.memberStatValue}>¥128,560</Text>
          <Text style={styles.memberStatLabel}>总消费</Text>
        </View>
      </View>

      {/* 会员列表 */}
      <View style={styles.memberList}>
        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberCard}
            activeOpacity={0.9}
          >
            <View style={styles.memberInfo}>
              <View style={[styles.memberAvatar, { backgroundColor: getLevelColor(member.level) + '20' }]}>
                <Text style={styles.memberAvatarText}>{member.name[0]}</Text>
              </View>
              <View style={styles.memberDetail}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={[styles.memberLevel, { backgroundColor: getLevelColor(member.level) + '15' }]}>
                    <Text style={[styles.memberLevelText, { color: getLevelColor(member.level) }]}>
                      {member.level}
                    </Text>
                  </View>
                </View>
                <Text style={styles.memberPhone}>{member.phone}</Text>
              </View>
            </View>
            <View style={styles.memberPoints}>
              <Text style={styles.memberPointsValue}>{member.points}</Text>
              <Text style={styles.memberPointsLabel}>积分</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// 首页仪表盘内容组件
function DashboardContent() {
  return (
    <View style={styles.dashboardCard}>
      {/* 标题区域 */}
      <View style={styles.dashboardHeader}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.titleIndicator} />
          <Text style={styles.dashboardTitle}>数据概览</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>导出报表</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]} activeOpacity={0.7}>
            <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>刷新数据</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 统计卡片 - Bento Grid 布局 */}
      <View style={styles.statsGrid}>
        <StatCard
          title="今日营业额"
          value="¥5,276.00"
          color="#2563EB"
          bgColor={COLORS.blue50}
          borderColor="#DBEAFE"
          chartPath="M0 35 Q 20 10, 40 30 T 80 15 L 100 25"
          trend="up"
          gradientColors={['#3B82F6', '#60A5FA']}
        />
        <StatCard
          title="会员总量"
          value="5,276"
          color="#059669"
          bgColor={COLORS.emerald50}
          borderColor="#D1FAE5"
          chartPath="M0 30 L 20 20 L 40 35 L 60 15 L 80 25 L 100 10"
          trend="up"
          gradientColors={['#10B981', '#34D399']}
        />
        <StatCard
          title="订单总量"
          value="5,276"
          color="#D97706"
          bgColor={COLORS.amber50}
          borderColor="#FEF3C7"
          chartPath="M0 35 L 25 15 L 50 30 L 75 10 L 100 25"
          trend="stable"
          gradientColors={['#F59E0B', '#FBBF24']}
        />
        <StatCard
          title="商品总量"
          value="5,276"
          color="#9333EA"
          bgColor={COLORS.purple50}
          borderColor="#EDE9FE"
          chartPath="M0 25 Q 25 5, 50 25 T 100 15"
          trend="up"
          gradientColors={['#A855F7', '#C084FC']}
        />
      </View>

      {/* 图表区域 */}
      <View style={styles.chartsSection}>
        {/* 日营业统计 */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartHeaderLeft}>
              <View style={styles.chartIndicator} />
              <Text style={styles.chartTitle}>日营业统计</Text>
            </View>
            <View style={styles.chartHeaderRight}>
              <View style={styles.chartBadge}>
                <Text style={styles.chartBadgeText}>今日</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartStatsRow}>
            <View style={styles.chartStatItem}>
              <Text style={styles.chartStatLabel}>今日营收</Text>
              <Text style={styles.chartStatValue}>
                <AnimatedNumber value="¥5,276.00" style={styles.chartStatValue} />
              </Text>
            </View>
            <View style={styles.chartStatDivider} />
            <View style={styles.chartStatItem}>
              <Text style={styles.chartStatLabel}>今日客流量</Text>
              <Text style={styles.chartStatValue}>
                <AnimatedNumber value="1,434" style={styles.chartStatValue} />
              </Text>
            </View>
          </View>

          <View style={styles.chartWrapper}>
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisLabel}>10,000</Text>
              <Text style={styles.yAxisLabel}>8,000</Text>
              <Text style={styles.yAxisLabel}>6,000</Text>
              <Text style={styles.yAxisLabel}>4,000</Text>
              <Text style={styles.yAxisLabel}>2,000</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>
            <DailyRevenueChart />
            <View style={styles.chartXAxis}>
              <Text style={styles.xAxisLabel}>4:00</Text>
              <Text style={styles.xAxisLabel}>8:00</Text>
              <Text style={styles.xAxisLabel}>12:00</Text>
              <Text style={styles.xAxisLabel}>16:00</Text>
              <Text style={styles.xAxisLabel}>20:00</Text>
              <Text style={styles.xAxisLabel}>24:00</Text>
            </View>
          </View>

          {/* 图例 */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>营收趋势</Text>
            </View>
          </View>
        </View>

        {/* 近7日趋势 */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartHeaderLeft}>
              <View style={[styles.chartIndicator, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.chartTitle}>近7日趋势</Text>
            </View>
            <View style={styles.chartHeaderRight}>
              <View style={[styles.chartBadge, { backgroundColor: COLORS.gray100 }]}>
                <Text style={[styles.chartBadgeText, { color: COLORS.gray600 }]}>近7天</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartStatsRow}>
            <View style={styles.chartStatItem}>
              <Text style={styles.chartStatLabel}>成交额</Text>
              <Text style={styles.chartStatValue}>
                <AnimatedNumber value="¥5,276" style={styles.chartStatValue} />
              </Text>
            </View>
            <View style={styles.chartStatDivider} />
            <View style={styles.chartStatItem}>
              <Text style={styles.chartStatLabel}>订单量</Text>
              <Text style={styles.chartStatValue}>
                <AnimatedNumber value="5,276" style={styles.chartStatValue} />
              </Text>
            </View>
            <View style={styles.chartStatDivider} />
            <View style={styles.chartStatItem}>
              <Text style={styles.chartStatLabel}>客流量</Text>
              <Text style={styles.chartStatValue}>
                <AnimatedNumber value="5,276" style={styles.chartStatValue} />
              </Text>
            </View>
          </View>

          <View style={styles.chartWrapper}>
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisLabel}>10,000</Text>
              <Text style={styles.yAxisLabel}>8,000</Text>
              <Text style={styles.yAxisLabel}>6,000</Text>
              <Text style={styles.yAxisLabel}>4,000</Text>
              <Text style={styles.yAxisLabel}>2,000</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>
            <WeeklyTrendChart />
            <View style={styles.chartXAxis}>
              <Text style={styles.xAxisLabel}>7/1</Text>
              <Text style={styles.xAxisLabel}>7/2</Text>
              <Text style={styles.xAxisLabel}>7/3</Text>
              <Text style={styles.xAxisLabel}>7/4</Text>
              <Text style={styles.xAxisLabel}>7/5</Text>
              <Text style={styles.xAxisLabel}>7/6</Text>
              <Text style={styles.xAxisLabel}>7/7</Text>
            </View>
          </View>

          {/* 图例 */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.blue500 }]} />
              <Text style={styles.legendText}>成交额</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.emerald500 }]} />
              <Text style={styles.legendText}>订单量</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>客流量</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activePage, setActivePage] = useState('Home');

  // 侧边栏导航项
  const navItems = [
    { name: 'Home', screen: 'Home', icon: '📊', label: '首页' },
    { name: 'Order', screen: 'Order', icon: '🛒', label: '点单' },
    { name: 'Table', screen: 'Table', icon: '🪑', label: '桌台' },
    { name: 'Orders', screen: 'Orders', icon: '📋', label: '订单' },
    { name: 'Member', screen: 'Member', icon: '👥', label: '会员' },
  ];

  // 获取页面标题
  const getPageTitle = () => {
    switch (activePage) {
      case 'Home': return '门店看板';
      case 'Order': return '点单';
      case 'Table': return '桌台管理';
      case 'Orders': return '订单管理';
      case 'Member': return '会员管理';
      default: return '门店看板';
    }
  };

  // 渲染当前页面内容
  const renderPageContent = () => {
    switch (activePage) {
      case 'Order':
        return <OrderScreen />;
      case 'Table':
        return <TableContent />;
      case 'Orders':
        return <OrdersContent />;
      case 'Member':
        return <MemberContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 侧边栏 */}
      <View style={[styles.sidebar, { paddingTop: insets.top + 20 }]}>
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>🍽</Text>
          </View>
          <Text style={styles.logoText}>CATERING</Text>
        </View>

        <View style={styles.nav}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.navItem,
                activePage === item.screen && styles.navItemActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setActivePage(item.screen)}
            >
              <View style={[styles.navIconWrapper, activePage === item.screen && styles.navIconWrapperActive]}>
                <Text style={[styles.navIcon, activePage === item.screen && styles.navIconActive]}>
                  {item.icon}
                </Text>
              </View>
              <Text style={[styles.navLabel, activePage === item.screen && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 侧边栏底部信息 */}
        <View style={styles.sidebarFooter}>
          <View style={styles.systemStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>系统正常</Text>
          </View>

          {/* 退出登录按钮 */}
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={() => {
              // 重置导航栈并跳转到登录页
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            }}
          >
            <View style={styles.logoutIconWrapper}>
              <Text style={styles.logoutIcon}>🚪</Text>
            </View>
            <Text style={styles.logoutText}>退出</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 主内容区 */}
      <View style={styles.main}>
        {/* 顶部栏 - 点单页面隐藏 */}
        {activePage !== 'Order' && (
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <View style={styles.headerLeft}>
              <Text style={styles.pageTitle}>{getPageTitle()}</Text>
              {activePage === 'Home' && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>实时数据</Text>
                </View>
              )}
            </View>

            <View style={styles.headerRight}>
              <View style={styles.langSelector}>
                <Text style={styles.flag}>🇺🇸</Text>
                <Text style={styles.langText}>EN</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>A</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>admin</Text>
                  <Text style={styles.userRole}>管理员</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 内容区域 - 根据当前页面渲染 */}
        <View style={styles.content}>
          {renderPageContent()}
        </View>
      </View>
    </View>
  );
}

// 常量
const SIDEBAR_WIDTH = 88;
const CHART_HEIGHT = 200;

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  } as ViewStyle,

  // 侧边栏
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.sidebar,
    borderRightWidth: 1,
    borderRightColor: COLORS.sidebarBorder,
    alignItems: 'center',
    paddingBottom: 24,
  } as ViewStyle,

  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  } as ViewStyle,

  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  logoIconText: {
    fontSize: 24,
  } as TextStyle,

  logoText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS['primary-dark'],
    marginTop: 8,
    letterSpacing: 1,
  } as TextStyle,

  nav: {
    width: '100%',
    paddingHorizontal: 10,
    flex: 1,
  } as ViewStyle,

  navItem: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 4,
  } as ViewStyle,

  navItemActive: {
    backgroundColor: COLORS['primary-light'],
  } as ViewStyle,

  navIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  navIconWrapperActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  navIcon: {
    fontSize: 22,
    color: COLORS.gray500,
  } as TextStyle,

  navIconActive: {
    color: COLORS.primary,
  } as TextStyle,

  navLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 6,
    fontWeight: '600',
  } as TextStyle,

  navLabelActive: {
    color: COLORS['primary-dark'],
  } as TextStyle,

  sidebarFooter: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.sidebarBorder,
  } as ViewStyle,

  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emerald500,
    marginRight: 6,
  } as ViewStyle,

  statusText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  } as TextStyle,

  // 退出登录按钮样式
  logoutButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.red50,
  } as ViewStyle,

  logoutIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  } as ViewStyle,

  logoutIcon: {
    fontSize: 18,
  } as TextStyle,

  logoutText: {
    fontSize: 11,
    color: COLORS.red500,
    fontWeight: '600',
  } as TextStyle,

  // 主内容区
  main: {
    flex: 1,
    flexDirection: 'column',
  } as ViewStyle,

  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sidebarBorder,
  } as ViewStyle,

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,

  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
  } as TextStyle,

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  } as ViewStyle,

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald500,
    marginRight: 6,
  } as ViewStyle,

  liveText: {
    fontSize: 11,
    color: COLORS.emerald600,
    fontWeight: '600',
  } as TextStyle,

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  } as ViewStyle,

  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
  } as ViewStyle,

  flag: {
    fontSize: 16,
  } as TextStyle,

  langText: {
    fontSize: 13,
    color: COLORS.gray600,
    fontWeight: '600',
  } as TextStyle,

  dropdownIcon: {
    fontSize: 10,
    color: COLORS.gray400,
  } as TextStyle,

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    paddingLeft: 6,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
  } as ViewStyle,

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  } as TextStyle,

  userDetails: {
    justifyContent: 'center',
  } as ViewStyle,

  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  } as TextStyle,

  userRole: {
    fontSize: 11,
    color: COLORS.gray500,
  } as TextStyle,

  // 内容区域
  content: {
    flex: 1,
    // padding: 32,
    overflow: 'hidden',
  } as ViewStyle,

  dashboardCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  } as ViewStyle,

  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  } as ViewStyle,

  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  titleIndicator: {
    width: 5,
    height: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    marginRight: 12,
  } as ViewStyle,

  dashboardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
  } as TextStyle,

  headerActions: {
    flexDirection: 'row',
    gap: 10,
  } as ViewStyle,

  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  } as ViewStyle,

  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
  } as ViewStyle,

  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  } as TextStyle,

  actionButtonTextPrimary: {
    color: COLORS.white,
  } as TextStyle,

  // 统计卡片
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  } as ViewStyle,

  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  } as ViewStyle,

  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as ViewStyle,

  statCardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  } as ViewStyle,

  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  } as TextStyle,

  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.gray900,
  } as TextStyle,

  miniChartContainer: {
    alignItems: 'flex-end',
  } as ViewStyle,

  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  } as ViewStyle,

  trendText: {
    fontSize: 10,
    fontWeight: '600',
  } as TextStyle,

  // 图表区域
  chartsSection: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  } as ViewStyle,

  chartCard: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    padding: 24,
  } as ViewStyle,

  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  } as ViewStyle,

  chartHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  chartHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  chartIndicator: {
    width: 4,
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 10,
  } as ViewStyle,

  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
  } as TextStyle,

  chartBadge: {
    backgroundColor: COLORS.emerald50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,

  chartBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.emerald600,
  } as TextStyle,

  chartStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  } as ViewStyle,

  chartStatItem: {
    flex: 1,
  } as ViewStyle,

  chartStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 16,
  } as ViewStyle,

  chartStatLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 4,
    fontWeight: '500',
  } as TextStyle,

  chartStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
  } as TextStyle,

  chartWrapper: {
    flex: 1,
    position: 'relative',
    paddingLeft: 40,
    paddingBottom: 24,
  } as ViewStyle,

  chartYAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 24,
    justifyContent: 'space-between',
    paddingVertical: 2,
  } as ViewStyle,

  yAxisLabel: {
    fontSize: 10,
    color: COLORS.gray400,
    textAlign: 'right',
    width: 32,
    fontWeight: '500',
  } as TextStyle,

  chartContainer: {
    flex: 1,
    position: 'relative',
  } as ViewStyle,

  chartSvg: {
    width: '100%',
    height: CHART_HEIGHT,
  } as ViewStyle,

  chartPointBadge: {
    position: 'absolute',
    top: 20,
    left: '35%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 8,
    paddingRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  } as ViewStyle,

  chartPointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  } as ViewStyle,

  chartPointContent: {
    justifyContent: 'center',
  } as ViewStyle,

  chartPointTime: {
    fontSize: 10,
    color: COLORS.gray500,
    fontWeight: '500',
  } as TextStyle,

  chartPointValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray900,
  } as TextStyle,

  chartXAxis: {
    position: 'absolute',
    left: 40,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,

  xAxisLabel: {
    fontSize: 10,
    color: COLORS.gray400,
    fontWeight: '500',
  } as TextStyle,

  quickStats: {
    position: 'absolute',
    top: 8,
    right: 8,
  } as ViewStyle,

  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  } as ViewStyle,

  quickStatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  } as ViewStyle,

  quickStatLabel: {
    fontSize: 10,
    color: COLORS.gray500,
  } as TextStyle,

  quickStatValue: {
    fontSize: 12,
    fontWeight: '700',
  } as TextStyle,

  // 图例
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  } as ViewStyle,

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as ViewStyle,

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,

  legendText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  } as TextStyle,

  // ==================== 页面内容样式 ====================

  pageContent: {
    flex: 1,
  } as ViewStyle,

  pageHeader: {
    marginBottom: 24,
  } as ViewStyle,

  pageTitleLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  } as TextStyle,

  pageSubtitle: {
    fontSize: 15,
    color: COLORS.gray500,
  } as TextStyle,

  // 分类标签
  categoryTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  } as ViewStyle,

  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
  } as ViewStyle,

  categoryTabActive: {
    backgroundColor: COLORS.primary,
  } as ViewStyle,

  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  } as TextStyle,

  categoryTabTextActive: {
    color: COLORS.white,
  } as TextStyle,

  // 商品网格
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  } as ViewStyle,

  productCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  } as ViewStyle,

  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    fontSize: 40,
  } as ViewStyle,

  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  } as TextStyle,

  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  } as TextStyle,

  productSales: {
    fontSize: 11,
    color: COLORS.gray400,
  } as TextStyle,

  // 桌台网格
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  } as ViewStyle,

  tableCard: {
    width: 180,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  } as ViewStyle,

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  tableName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  } as TextStyle,

  tableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  } as ViewStyle,

  tableStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  } as ViewStyle,

  tableStatusText: {
    fontSize: 11,
    fontWeight: '600',
  } as TextStyle,

  tableSeats: {
    fontSize: 12,
    color: COLORS.gray500,
  } as TextStyle,

  // 订单列表
  orderList: {
    gap: 12,
  } as ViewStyle,

  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  } as ViewStyle,

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  } as ViewStyle,

  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,

  orderId: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
    fontFamily: 'monospace',
  } as TextStyle,

  orderTable: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
  } as TextStyle,

  orderTime: {
    fontSize: 12,
    color: COLORS.gray400,
  } as TextStyle,

  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  } as ViewStyle,

  orderItems: {
    fontSize: 13,
    color: COLORS.gray500,
  } as TextStyle,

  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
  } as TextStyle,

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  orderStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,

  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,

  orderAction: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  } as ViewStyle,

  orderActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  } as TextStyle,

  // 会员统计
  memberStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  } as ViewStyle,

  memberStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  } as ViewStyle,

  memberStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  } as TextStyle,

  memberStatLabel: {
    fontSize: 13,
    color: COLORS.gray500,
  } as TextStyle,

  // 会员列表
  memberList: {
    gap: 12,
  } as ViewStyle,

  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  } as ViewStyle,

  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,

  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  memberAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray700,
  } as TextStyle,

  memberDetail: {
    gap: 4,
  } as ViewStyle,

  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,

  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
  } as TextStyle,

  memberLevel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  } as ViewStyle,

  memberLevelText: {
    fontSize: 10,
    fontWeight: '600',
  } as TextStyle,

  memberPhone: {
    fontSize: 12,
    color: COLORS.gray500,
    fontFamily: 'monospace',
  } as TextStyle,

  memberPoints: {
    alignItems: 'flex-end',
  } as ViewStyle,

  memberPointsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  } as TextStyle,

  memberPointsLabel: {
    fontSize: 11,
    color: COLORS.gray500,
  } as TextStyle,
});
