import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Keyboard,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import Dialog, { DialogRef } from '../components/Dialog';
import DishSyncService from '../services/DishSyncService';
import { RemoteDishData } from '../models';

// 颜色常量 - 与 login.html 保持一致
const COLORS = {
  primary: '#ec5b13', // 橙色主色调
  backgroundLight: '#f8f6f6',
  backgroundDark: '#221610',
  white: '#ffffff',
  white90: 'rgba(255, 255, 255, 0.9)',
  white50: 'rgba(255, 255, 255, 0.5)',
  black: '#000000',
  black40: 'rgba(0, 0, 0, 0.4)',
  black20: 'rgba(0, 0, 0, 0.2)',
  textPrimary: '#1b120d',
  textSecondary: 'rgba(27, 18, 13, 0.6)',
  borderLight: '#e7d7cf',
  borderDark: 'rgba(75, 75, 75, 0.5)',
  green400: '#4ade80',
  red500: '#ef4444',
  green500: '#22c55e',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// 数字键盘配置 - 3x4 布局
const KEYBOARD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['delete', '0', 'confirm'],
] as const;

type KeyValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | 'delete' | 'confirm';

const isSpecialKey = (key: string): key is 'delete' | 'confirm' => {
  return key === 'delete' || key === 'confirm';
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const dialogRef = useRef<DialogRef>(null);

  // 模拟从服务器获取最新菜品数据
  const fetchRemoteDishes = async (): Promise<RemoteDishData[]> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 从本地 JSON 模拟远程数据（实际应该从 API 获取）
    const dishesJson = require('../data/dishes.json');

    return dishesJson.map((item: any, index: number) => ({
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      name: item.name,
      price: item.price,
      image: item.image,
      sales: item.sales || 0,
      isHot: item.isHot || false,
      description: item.description || '',
      isAvailable: true,
      isSoldOut: false,
      sortOrder: index,
      imageVersion: Date.now(),
    }));
  };

  // 处理数字按钮点击
  const handleNumberPress = useCallback((num: string) => {
    if (pinCode.length < 4) {
      setPinCode(prev => prev + num);
    }
  }, [pinCode.length]);

  // 处理删除按钮
  const handleDeletePress = useCallback(() => {
    setPinCode(prev => prev.slice(0, -1));
  }, []);

  // 处理确认按钮 - 登录并同步数据
  const handleConfirmPress = useCallback(async () => {
    setIsSyncing(true);

    try {
      // 显示同步开始对话框
      dialogRef.current?.show({
        type: 'update',
        title: '正在同步数据',
        message: '正在从服务器下载最新菜品数据，请稍候...',
        confirmText: '后台同步',
        cancelText: '跳过',
        onConfirm: () => {
          // 用户选择后台同步，直接跳转
          navigation.replace('Home');
        },
        onCancel: () => {
          // 用户选择跳过同步，直接跳转
          navigation.replace('Home');
        },
      });

      // 获取远程数据
      const remoteDishes = await fetchRemoteDishes();

      // 同步到数据库
      const stats = await DishSyncService.sync(remoteDishes, {
        removeNotFound: true,
        onProgress: (current, total) => {
          const percent = Math.round((current / total) * 100);
          // 可以在这里更新进度提示（暂时简化处理）
          console.log(`同步进度: ${percent}%`);
        },
      });

      // 同步完成，显示成功提示
      dialogRef.current?.show({
        type: 'success',
        title: '数据同步完成',
        message: `已同步 ${stats.total} 道菜品\n新增 ${stats.created} 道，更新 ${stats.updated} 道`,
        confirmText: '开始使用',
        onConfirm: () => {
          navigation.replace('Home');
        },
      });
    } catch (error) {
      console.error('同步失败:', error);
      dialogRef.current?.show({
        type: 'warning',
        title: '同步失败',
        message: '数据同步失败，将使用本地缓存数据',
        confirmText: '继续登录',
        onConfirm: () => {
          navigation.replace('Home');
        },
      });
    } finally {
      setIsSyncing(false);
    }
  }, [navigation]);

  // 处理输入框 Focus - 隐藏键盘以显示数字键盘
  const handleInputFocus = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {/* 背景图片 */}
      <ImageBackground
        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqvxQHIbXkkImdz-JDCRO4JjGAxrooJ0w7H-O0RymX8EiP34XNOSX7S8jMqBh3kaevAOZW80kNg1qUh7aYnxxoFcWBJ3VHRwXp4kP8Xn65XhQGjEPu8JH70EKsxOMIX9E1NBrb6a5r4XdW7xwVRyrtuTQ-yfERtQsBlD86Dzpp5BjDpQQot8GLtKDwcmcfJh_rPVYkF80VKAXJaxi-GMbqKBxrDrqmtjYKHlog8tVeMY3JAwoLKHqhOlAnTus2-PAkVsDacs_DS0c6' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* 黑色遮罩 */}
        <View style={styles.overlay} />
      </ImageBackground>

      {/* 主内容区域 */}
      <View style={styles.contentContainer}>
        {/* 顶部标题区域 */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🍽️</Text>
          </View>
          <Text style={styles.headerTitle}>智能点餐系统</Text>
        </View>

        {/* 登录面板 - 横屏时左右分栏 */}
        <View style={styles.loginPanel}>
          {/* 左侧表单区域 */}
          <View style={styles.formSection}>
            <View style={styles.formContent}>
              <Text style={styles.welcomeTitle}>欢迎登录</Text>
              <Text style={styles.welcomeSubtitle}>请输入您的凭据开始服务</Text>

              {/* 员工ID/桌号输入框 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>员工ID/桌号</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="例如：05号桌"
                    placeholderTextColor={COLORS.textSecondary}
                    value={employeeId}
                    onChangeText={setEmployeeId}
                    onFocus={handleInputFocus}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* PIN码输入框 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PIN码</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••"
                    placeholderTextColor={COLORS.textSecondary}
                    value={pinCode}
                    onChangeText={setPinCode}
                    onFocus={handleInputFocus}
                    maxLength={4}
                    secureTextEntry
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* 登录按钮 */}
              <TouchableOpacity
                style={[styles.loginButton, isSyncing && styles.loginButtonDisabled]}
                onPress={handleConfirmPress}
                activeOpacity={0.8}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.loginButtonText}>同步中...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>登录</Text>
                    <Text style={styles.loginButtonIcon}>→</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* 忘记访问码链接 */}
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>忘记访问码？</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 右侧数字键盘区域 - 3x4 布局 */}
          <View style={styles.keypadSection}>
            <View style={styles.keypadContainer}>
                            {KEYBOARD_ROWS.map((row, rowIndex) => (
                <View key={String(rowIndex)} style={styles.keypadRow}>
                  {row.map((key) => {
                    const isDelete = key === 'delete';
                    const isConfirm = key === 'confirm';
                    const isNumber = !isDelete && !isConfirm;

                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.keyButton,
                          isDelete && styles.deleteButton,
                          isConfirm && styles.confirmButton,
                          isSyncing && styles.keyButtonDisabled,
                        ]}
                        onPress={() => {
                          if (isSyncing) return;
                          if (isDelete) {
                            handleDeletePress();
                          } else if (isConfirm) {
                            handleConfirmPress();
                          } else {
                            handleNumberPress(key);
                          }
                        }}
                        activeOpacity={0.7}
                        disabled={isSyncing}
                      >
                        {isDelete && <Text style={styles.deleteIcon}>⌫</Text>}
                        {isConfirm && <Text style={styles.confirmIcon}>✓</Text>}
                        {isNumber && (
                          <Text style={styles.numberText}>{key}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 底部状态栏 */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              系统状态：在线 v2.4.1
            </Text>
          </View>
          <Text style={styles.statusText}>
            当前站点：POS-04 (大厅)
          </Text>
        </View>
      </View>

      {/* Dialog 组件 */}
      <Dialog ref={dialogRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.black40,
  },
  contentContainer: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  // 顶部标题区域
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white90,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  // 登录面板
  loginPanel: {
    flexDirection: 'row',
    backgroundColor: COLORS.white90,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
    maxWidth: 900,
    alignSelf: 'center',
    width: '90%',
  },
  // 左侧表单区域
  formSection: {
    flex: 1,
    padding: 32,
    borderBottomWidth: 0,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  formContent: {
    maxWidth: 400,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    includeFontPadding: false,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: 8,
  },
  loginButtonIcon: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '700',
  },
  forgotPasswordContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  // 右侧数字键盘区域
  keypadSection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  keypadContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 16,
  },
  keyButton: {
    width: 94,
    height: 94,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyButtonDisabled: {
    opacity: 0.5,
  },
  numberText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  deleteButton: {
    backgroundColor: '#f3e3e2',
  },
  confirmButton: {
    backgroundColor: '#e0efe4',
  },
  deleteIcon: {
    fontSize: 32,
    color: '#ef4444',
  },
  confirmIcon: {
    fontSize: 32,
    color: '#22c55e',
  },
  // 底部状态栏
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green400,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
