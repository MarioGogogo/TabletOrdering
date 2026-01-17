/**
 * 首页 - 门店看板数据
 *
 * 适配横屏 iPad 设备
 * 设计风格: Bento Box Grid + Modern Dashboard
 *
 * @format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { COLORS } from '../theme/colors';

// 导入页面组件
import DashboardScreen from './DashboardScreen';
import TableScreen from './TableScreen';
import OrdersScreen from './OrdersScreen';
import MemberScreen from './MemberScreen';
import OrderScreen from './OrderScreen';

// 常量
const SIDEBAR_WIDTH = 88;

export default function HomeScreen() {
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
  
      case 'Orders':
        return <OrdersScreen />;
      case 'Member':
        return <MemberScreen />;
      default:
        return <DashboardScreen />;
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

        {/* 内容区域 */}
        <View style={[styles.content, activePage !== 'Order' && { padding: 32 }]}>
          {renderPageContent()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  // 侧边栏
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.sidebar,
    borderRightWidth: 1,
    borderRightColor: COLORS.sidebarBorder,
    alignItems: 'center',
    paddingBottom: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
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
  },
  logoIconText: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS['primary-dark'],
    marginTop: 8,
    letterSpacing: 1,
  },
  nav: {
    width: '100%',
    paddingHorizontal: 10,
    flex: 1,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: COLORS['primary-light'],
  },
  navIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconWrapperActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navIcon: {
    fontSize: 22,
    color: COLORS.gray500,
  },
  navIconActive: {
    color: COLORS.primary,
  },
  navLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 6,
    fontWeight: '600',
  },
  navLabelActive: {
    color: COLORS['primary-dark'],
  },
  sidebarFooter: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.sidebarBorder,
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emerald500,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  // 退出登录按钮样式
  logoutButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.red50,
  },
  logoutIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: 11,
    color: COLORS.red500,
    fontWeight: '600',
  },
  // 主内容区
  main: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sidebarBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald500,
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    color: COLORS.emerald600,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
  },
  flag: {
    fontSize: 16,
  },
  langText: {
    fontSize: 13,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 10,
    color: COLORS.gray400,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    paddingLeft: 6,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  userDetails: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  userRole: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  // 内容区域
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});
