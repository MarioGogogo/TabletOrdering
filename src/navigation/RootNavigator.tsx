/**
 * 根导航器 - 包含 Login, Home, Order 核心页面
 *
 * 起始页：LoginScreen（登录页面）
 * 首页：HomeScreen（门店看板）
 * 分包：TableScreen（支持远程加载）
 */

import React, { Suspense, useEffect } from 'react';
import { View, ActivityIndicator, Platform, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// 登录页面
import HomeV2Screen from '../screens/V2/LoginScreen';
// 首页（门店看板）
import HomeScreen from '../screens/HomeScreen';
// 点单页面（使用 WatermelonDB 版本）
import OrderScreen from '../screens/OrderScreenWithDB';
// 桌台页面
import TableScreen from '../screens/V2/TableScreen';

// 分包懒加载
const OrdersScreen = React.lazy(
  () => import(
    /* webpackChunkName: "orders" */
    /* webpackPrefetch: true */
    '../screens/OrdersScreen'
  )
);


// 分包加载状态
function ChunkLoader() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f7' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Order: undefined;
  Orders: undefined;
  Table: undefined;
  BundleError: { bundleName: string };
};

// 分包错误页面组件
type BundleErrorProps = NativeStackScreenProps<RootStackParamList, 'BundleError'>;

function BundleErrorScreen({ route, navigation }: BundleErrorProps) {
  const { bundleName } = route.params;
  const { bundleConfigs } = useAppStore();

  // 从 bundleConfigs 中查找对应的配置信息
  const bundleConfig = bundleConfigs.find(b => b.screen === bundleName);
  const url = bundleConfig?.url || '未配置';
  const version = bundleConfig?.version || '-';

  return (
    <View style={bundleErrorStyles.container}>
      <Text style={bundleErrorStyles.emoji}>📦❌</Text>
      <Text style={bundleErrorStyles.title}>分包配置不存在</Text>
      <Text style={bundleErrorStyles.code}>404</Text>
      <Text style={bundleErrorStyles.message}>
        分包 "{bundleName}" 未在服务端配置{'\n'}请联系管理员添加该分包
      </Text>

      {/* 显示 URL 信息 */}
      {bundleConfig && (
        <View style={bundleErrorStyles.infoBox}>
          <Text style={bundleErrorStyles.infoLabel}>分包信息:</Text>
          <Text style={bundleErrorStyles.infoText}>名称: {bundleConfig.label || bundleName}</Text>
          <Text style={bundleErrorStyles.infoText}>版本: {version}</Text>
          <Text style={bundleErrorStyles.infoUrl} numberOfLines={2}>
            URL: {url}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={bundleErrorStyles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={bundleErrorStyles.buttonText}>← 返回</Text>
      </TouchableOpacity>
    </View>
  );
}

const bundleErrorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    padding: 20,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  code: { fontSize: 64, fontWeight: 'bold', color: '#e0e0e0', marginBottom: 16 },
  message: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#666', marginBottom: 4 },
  infoUrl: { fontSize: 11, color: '#999', fontFamily: 'monospace' },
  button: { backgroundColor: '#6366f1', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * iOS 标准的页面切换动画配置
 * 适用于所有非底部Tab栏切换的页面跳转
 *
 * 动画效果：
 * - iOS: 原生从右侧滑入动画
 * - Android: 模拟 iOS 的水平滑动动画（从右滑入，向左滑出）
 */
const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  // 统一使用滑动动画，让 Android 也有 iOS 风格的滑动效果
  animation: 'slide_from_right',
  // 确保使用原生的 iOS 动画类型
  gestureEnabled: true,
  // iOS 使用水平方向的滑动返回手势
  gestureDirection: 'horizontal',
  // 卡片式展示（iOS 默认）
  presentation: 'card',
  // 内容样式（iOS 默认卡片样式）
  contentStyle: {
    backgroundColor: '#f2f2f7',
  },
  // 确保动画类型为 iOS 原生
  animationTypeForReplace: 'push',
};

export default function RootNavigator() {
  const { isLoggedIn } = useAppStore();

  return (
    <Suspense fallback={<ChunkLoader />}>
      <Stack.Navigator
        screenOptions={stackScreenOptions}
        initialRouteName={isLoggedIn ? "Home" : "Login"}
      >
        {/* 登录页面（起始页） */}
        <Stack.Screen
          name="Login"
          component={HomeV2Screen}
          options={{
            headerShown: false,
          }}
        />

        {/* 首页（门店看板） */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* 点单页面 */}
        <Stack.Screen
          name="Order"
          component={OrderScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* 订单管理页面（分包加载） */}
        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* 桌台页面 */}
        <Stack.Screen
          name="Table"
          component={TableScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* 分包错误页面 */}
        <Stack.Screen name="BundleError" component={BundleErrorScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}
