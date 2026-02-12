import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

// 颜色配置 - 完全复刻 HTML
const COLORS = {
  // 主色调
  primary: '#3B82F6',
  primaryDark: '#2563EB',

  // 背景色
  backgroundLight: '#F8FAFC',
  backgroundDark: '#0F172A',

  // 卡片背景
  cardBg: '#FFFFFF',
  cardBgDark: 'rgba(30, 41, 59, 0.7)',

  // 文字颜色
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textWhite: '#FFFFFF',

  // 边框颜色
  borderLight: '#E2E8F0',
  borderDark: '#334155',

  // 渐变配色
  blueStart: '#3B82F6',
  blueEnd: '#2563EB',
  orangeStart: '#FB923C',
  orangeEnd: '#F97316',
  pinkStart: '#EC4899',
  pinkEnd: '#E11D48',

  // 语义色
  stone100: '#F5F5F4',
  stone200: '#E7E5E4',
  stone800: '#292524',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',
};

// 类型定义
interface HeaderProps {
  onThemeToggle?: (isDark: boolean) => void;
}

interface StoreInfoProps {
  storeName: string;
  storeCode: string;
  logoUrl?: string;
}

interface FeatureCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  gradient: [string, string];
  stats?: Array<{ label: string; value: string }>;
  onPress?: () => void;
}

interface QuickActionProps {
  title: string;
  subtitle?: string;
  icon?: string;
  variant: 'stone' | 'slate' | 'indigo';
  onPress?: () => void;
}

// 头部组件
const Header: React.FC<HeaderProps> = ({ onThemeToggle }) => {
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    onThemeToggle?.(newIsDark);
    console.log('Theme toggled:', newIsDark);
  };

  return (
    <View style={styles.header}>
      {/* Logo 和公司名称 */}
      <View style={styles.logoSection}>
        <View style={styles.logoBox}>
          <Icon name="restaurant" size={20} color={COLORS.textWhite} />
        </View>
        <Text style={styles.companyName}>公司名称：餐饮系统</Text>
      </View>

      {/* 右侧功能区 */}
      <View style={styles.headerRight}>
        {/* 图标按钮组 */}
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="notifications" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="print" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="wifi" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 时间和用户信息 */}
        <View style={styles.userSection}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <View style={styles.userBadge}>
            <View style={styles.userAvatar}>
              <Icon name="person" size={14} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.userName}>admin</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// 门店信息组件
const StoreInfo: React.FC<StoreInfoProps> = ({
  storeName,
  storeCode,
  logoUrl,
}) => {
  return (
    <View style={styles.storeInfoSection}>
      <View style={styles.storeInfoCard}>
        <View style={styles.storeLogo}>
          <View style={styles.storeLogoPlaceholder}>
            <Icon name="store" size={24} color={COLORS.textSecondary} />
          </View>
        </View>
        <View style={styles.storeTextInfo}>
          <Text style={styles.storeName}>{storeName}</Text>
          <Text style={styles.storeCode}>商编: {storeCode}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.reportButton}>
        <Icon name="analytics" size={20} color={COLORS.textWhite} />
        <Text style={styles.reportButtonText}>报表中心</Text>
      </TouchableOpacity>
    </View>
  );
};

// 功能卡片组件
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  icon,
  gradient,
  stats,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featureCard}>
        <View style={styles.featureCardContent}>
          {/* 标题区域 */}
          <View style={styles.featureCardHeader}>
            <Text style={styles.featureCardTitle}>{title}</Text>
            {subtitle && (
              <View style={styles.featureCardSubtitle}>
                <Text style={styles.featureCardSubtitleText}>{subtitle}</Text>
                <Icon name="arrow-forward" size={14} color={COLORS.textWhite} />
              </View>
            )}
          </View>

          {/* 统计数据区域 */}
          {stats && (
            <View style={styles.featureCardStats}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
              {stats.length > 1 && (
                <View style={styles.statDivider} />
              )}
            </View>
          )}
        </View>

        {/* 背景图标 */}
        <View style={styles.featureCardIconBg}>
          <Icon name={icon} size={120} color="rgba(255,255,255,0.25)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// 快捷操作组件
const QuickAction: React.FC<QuickActionProps> = ({
  title,
  subtitle,
  icon: _icon,
  variant,
  onPress,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'stone':
        return {
          bg: COLORS.stone100,
          border: COLORS.stone200,
          title: COLORS.stone800,
          iconBg: COLORS.stone800,
        };
      case 'slate':
        return {
          bg: COLORS.slate100,
          border: COLORS.slate200,
          title: COLORS.slate800,
          iconBg: COLORS.slate700,
        };
      case 'indigo':
        return {
          bg: COLORS.slate800,
          border: COLORS.slate700,
          title: COLORS.textWhite,
          iconBg: 'rgba(255,255,255,0.1)',
        };
      default:
        return {
          bg: COLORS.stone100,
          border: COLORS.stone200,
          title: COLORS.stone800,
          iconBg: COLORS.stone800,
        };
    }
  };

  const styles_variant = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.quickAction,
        {
          backgroundColor: styles_variant.bg,
          borderColor: styles_variant.border,
        },
      ]}>
      <View style={styles.quickActionContent}>
        <Text style={[styles.quickActionTitle, { color: styles_variant.title }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        )}
      </View>
      <View
        style={[
          styles.quickActionIcon,
          { backgroundColor: styles_variant.iconBg },
        ]}>
        <Icon
          name="chevron-right"
          size={20}
          color={variant === 'indigo' ? COLORS.textWhite : COLORS.textWhite}
        />
      </View>
    </TouchableOpacity>
  );
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 主屏幕组件
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 768;

  // 确保是横屏且平板设备
  const shouldRender = isLandscape && isTablet;
  console.log('Device check:', { shouldRender, isLandscape, isTablet, width, height });

  const handleOrderPress = () => {
    console.log('点餐');
  };

  const handleTablePress = () => {
    navigation.navigate('Table');
  };

  const handleOrderListPress = () => {
    console.log('订单');
  };

  const handleVipPress = () => {
    console.log('会员VIP');
  };

  const handleMarketingPress = () => {
    console.log('营销活动');
  };

  const handlePrintPress = () => {
    console.log('打印');
  };

  const handleSettingsPress = () => {
    console.log('设置');
  };

  const handleAdminPress = () => {
    console.log('后台管理');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.backgroundLight}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <Header />

        {/* 门店信息和报表按钮 */}
        <StoreInfo
          storeName="某某炸鸡店-西湖店"
          storeCode="1000257"
          logoUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuD1vRO34ZG_PhNqB7uysfMGPJ8BK8BRfEi5GR2JmxlmJSTkOTvQp_DeiCTR9bb_ERTToGX8ttVwbjLhptkPJC7qk3QXWT2LsMNP-E7se30_tI2O2Hh54Dk9X0H-MycscaEC_0eTmN7tJyRcfqwVzod1KRsQ15leBMnmvDTBwIiyCcf0lZkUN1-Fl0L6a8qXv0KodZ4CIVrP2DwuKV4CFd6aGsXr9kxtHozzZ-uoVAT3FOiRBqVg8u3284_hkmCep17PmZs4MACfH6k"
        />

        {/* 功能卡片区域 - 3列布局 */}
        <View style={styles.featureCardsContainer}>
          <View style={styles.featureCardsRow}>
            {/* 点餐卡片 */}
            <View style={styles.featureCardWrapper}>
              <FeatureCard
                title="点餐"
                subtitle="快捷点餐"
                icon="restaurant-menu"
                gradient={[COLORS.blueStart, COLORS.blueEnd]}
                onPress={handleOrderPress}
              />
            </View>

            {/* 桌台卡片 */}
            <View style={styles.featureCardWrapper}>
              <FeatureCard
                title="桌台"
                subtitle="共 20 桌"
                icon="table-bar"
                gradient={[COLORS.orangeStart, COLORS.orangeEnd]}
                stats={[
                  { label: '空桌', value: '5' },
                  { label: '就餐中', value: '5' },
                ]}
                onPress={handleTablePress}
              />
            </View>

            {/* 订单卡片 */}
            <View style={styles.featureCardWrapper}>
              <FeatureCard
                title="订单"
                subtitle="查看全部"
                icon="receipt-long"
                gradient={[COLORS.pinkStart, COLORS.pinkEnd]}
                onPress={handleOrderListPress}
              />
            </View>
          </View>
        </View>

        {/* 快捷操作区域 */}
        <View style={styles.quickActionsContainer}>
          {/* 第一行 */}
          <View style={styles.quickActionsRow}>
            {/* 会员VIP */}
            <QuickAction
              title="会员VIP"
              subtitle="开通VIP会员，享专属特权"
              variant="stone"
              onPress={handleVipPress}
            />

            {/* 营销活动 */}
            <QuickAction
              title="营销活动/锁客"
              subtitle="营销活动/锁客"
              variant="slate"
              onPress={handleMarketingPress}
            />

            {/* 打印和设置 */}
            <View style={styles.buttonStack}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePrintPress}>
                <Icon
                  name="print"
                  size={20}
                  color={COLORS.textPrimary}
                />
                <Text style={styles.actionButtonText}>打印</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSettingsPress}>
                <Icon
                  name="settings"
                  size={20}
                  color={COLORS.textPrimary}
                />
                <Text style={styles.actionButtonText}>设置</Text>
              </TouchableOpacity>
            </View>

            {/* 后台管理 */}
            <TouchableOpacity
              style={styles.adminCard}
              onPress={handleAdminPress}>
              <View style={styles.adminIconBg}>
                <Icon
                  name="admin-panel-settings"
                  size={24}
                  color={COLORS.textWhite}
                />
              </View>
              <Text style={styles.adminTitle}>餐厅后台管理</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // 头部样式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.borderLight,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginRight: 16,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  userAvatar: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.gray200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // 门店信息样式
  storeInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  storeInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  storeLogo: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.gray200,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  storeLogoImage: {
    width: '100%',
    height: '100%',
  },
  storeLogoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeTextInfo: {},
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  storeCode: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.indigo600,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.indigo600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  reportButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginLeft: 8,
  },

  // 功能卡片样式
  featureCardsContainer: {
    marginBottom: 40,
  },
  featureCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCardWrapper: {
    flex: 1,
    marginHorizontal: 6,
    maxWidth: '32%',
  },
  featureCard: {
    borderRadius: 32,
    padding: 24,
    height: 220,
    overflow: 'hidden',
  },
  featureCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featureCardHeader: {
    zIndex: 10,
  },
  featureCardTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 12,
  },
  featureCardSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureCardSubtitleText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textWhite,
    marginRight: 4,
  },
  featureCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  featureCardIconBg: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -60,
  },

  // 快捷操作样式
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 6,
    maxWidth: '23%',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // 按钮堆叠
  buttonStack: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: 6,
    maxWidth: '15%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginVertical: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },

  // 后台管理卡片
  adminCard: {
    flex: 1,
    backgroundColor: COLORS.slate800,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate700,
    marginHorizontal: 6,
    maxWidth: '18%',
  },
  adminIconBg: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
});

export default HomeScreen;
