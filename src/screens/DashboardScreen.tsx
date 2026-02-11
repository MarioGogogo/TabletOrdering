/**
 * 首页仪表盘 - 门店数据看板
 *
 * 显示实时营业数据、图表统计
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, LinearGradient, Defs, Stop, Circle } from 'react-native-svg';
import { COLORS } from '../theme/colors';

// 动画数字组件
function AnimatedNumber({ value, style, duration = 1000 }: { value: string; style?: any; duration?: number }) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setOpacity(1), duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  return (
    <Text style={[style, { opacity }]}>
      {value}
    </Text>
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
        <Path d={areaPath} fill="url(#areaGradient)" />
        <Path
          d={linePath}
          stroke="#EAB308"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={0} cy={56} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
        <Circle cx={100} cy={8} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
        <Circle cx={200} cy={56} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
        <Circle cx={300} cy={-40} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
        <Circle cx={400} cy={24} r={5} fill="#FFFFFF" stroke="#EAB308" strokeWidth={3} />
      </Svg>

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
        <Path d={revenuePath} stroke="#3B82F6" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={orderPath} stroke="#10B981" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={flowPath} stroke="#EAB308" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={200} cy={88} r={4} fill="#3B82F6" />
        <Circle cx={400} cy={40} r={4} fill="#3B82F6" />
        <Circle cx={200} cy={136} r={4} fill="#10B981" />
        <Circle cx={400} cy={88} r={4} fill="#10B981" />
        <Circle cx={200} cy={184} r={4} fill="#EAB308" />
        <Circle cx={400} cy={168} r={4} fill="#EAB308" />
      </Svg>

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

export default function DashboardScreen() {
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

      {/* 统计卡片 */}
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

const CHART_HEIGHT = 200;

const styles = StyleSheet.create({
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
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIndicator: {
    width: 5,
    height: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    marginRight: 12,
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  actionButtonTextPrimary: {
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statCardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  miniChartContainer: {
    alignItems: 'flex-end',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartsSection: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  chartCard: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    padding: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartIndicator: {
    width: 4,
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  chartBadge: {
    backgroundColor: COLORS.emerald50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.emerald600,
  },
  chartStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  chartStatItem: {
    flex: 1,
  },
  chartStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 16,
  },
  chartStatLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 4,
    fontWeight: '500',
  },
  chartStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  chartWrapper: {
    flex: 1,
    position: 'relative',
    paddingLeft: 40,
    paddingBottom: 24,
  },
  chartYAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 24,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  yAxisLabel: {
    fontSize: 10,
    color: COLORS.gray400,
    textAlign: 'right',
    width: 32,
    fontWeight: '500',
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
  },
  chartSvg: {
    width: '100%',
    height: CHART_HEIGHT,
  },
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
  },
  chartPointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  chartPointContent: {
    justifyContent: 'center',
  },
  chartPointTime: {
    fontSize: 10,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  chartPointValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  chartXAxis: {
    position: 'absolute',
    left: 40,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xAxisLabel: {
    fontSize: 10,
    color: COLORS.gray400,
    fontWeight: '500',
  },
  quickStats: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  quickStatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  quickStatLabel: {
    fontSize: 10,
    color: COLORS.gray500,
  },
  quickStatValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },
});
