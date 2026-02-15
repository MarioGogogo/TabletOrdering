import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 颜色常量
const COLORS = {
  brandOrange: '#ff6b00',
  brandCharcoal: '#1e293b',
  bgLight: '#f1f5f9',
  white: '#ffffff',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate800: '#1e293b',
  green500: '#22c55e',
};

interface KeypadButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'secondary' | 'icon';
  icon?: string;
}

const KeypadButton: React.FC<KeypadButtonProps> = React.memo(
  ({ label, onPress, variant = 'default' }) => {
    const isSecondary = variant === 'secondary';
    const isIcon = variant === 'icon';

    return (
      <TouchableOpacity
        style={[
          styles.keypadButton,
          isSecondary && styles.keypadButtonSecondary,
          isIcon && styles.keypadButtonSecondary,
        ]}
        onPress={onPress}
        activeOpacity={0.8}>
        {isIcon ? (
          <Icon name="backspace" size={24} color={COLORS.slate500} />
        ) : (
          <Text
            style={[
              styles.keypadButtonText,
              isSecondary && styles.keypadButtonTextSecondary,
            ]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
);

const NLoginScreen: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('0012');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKeypadPress = useCallback(
    (key: string) => {
      if (key === '清空') {
        setEmployeeId('');
        setPassword('');
      } else if (key === 'backspace') {
        if (password.length > 0) {
          setPassword(prev => prev.slice(0, -1));
        } else if (employeeId.length > 0) {
          setEmployeeId(prev => prev.slice(0, -1));
        }
      } else if (key === '0' || key === '1' || key === '2' || key === '3' || key === '4' || key === '5' || key === '6' || key === '7' || key === '8' || key === '9') {
        // 先填充工号，工号填满后填充密码
        if (employeeId.length < 6) {
          setEmployeeId(prev => prev + key);
        } else {
          setPassword(prev => prev + key);
        }
      }
    },
    [employeeId, password]
  );

  const handleLogin = useCallback(async () => {
    if (!employeeId || !password) {
      return;
    }
    setIsLoading(true);
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    // 这里处理登录成功逻辑
  }, [employeeId, password]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgLight} />
      <View style={styles.mainWrapper}>
        {/* 左侧品牌区域 - 50%宽度 */}
        <View style={styles.leftPanel}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
            }}
            style={styles.backgroundImage}
            resizeMode="cover">
            {/* 渐变遮罩 */}
            <View style={styles.gradientOverlay} />

            {/* 内容区域 */}
            <View style={styles.leftContent}>
              {/* Logo图标 */}
              <View style={styles.logoContainer}>
                <Icon name="restaurant" size={40} color={COLORS.white} />
              </View>

              {/* 标题 */}
              <Text style={styles.mainTitle}>智能点餐系统</Text>
              <Text style={styles.subTitle}>SMART DINING OS · 极致美食体验</Text>

              {/* 标签 */}
              <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>卓越品质</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>智能服务</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* 右侧登录表单区域 - 50%宽度 */}
        <View style={styles.rightPanel}>
          {/* 主内容区域 */}
          <View style={styles.formContainer}>
            {/* 标题 */}
            <View style={styles.headerSection}>
              <Text style={styles.welcomeTitle}>欢迎工作</Text>
              <Text style={styles.welcomeSubtitle}>请输入您的工号和密码以进入系统</Text>
            </View>

            {/* 输入框区域 */}
            <View style={styles.inputSection}>
              {/* 工号输入 */}
              <View style={styles.inputContainer}>
                <Icon name="account-circle" size={24} color={COLORS.slate400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="工号"
                  placeholderTextColor={COLORS.slate300}
                  value={employeeId}
                  onChangeText={setEmployeeId}
                  keyboardType="numeric"
                  editable={false}
                />
              </View>

              {/* 密码输入 */}
              <View style={styles.inputContainer}>
                <Icon name="lock" size={24} color={COLORS.slate400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="密码"
                  placeholderTextColor={COLORS.slate300}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={false}
                />
              </View>
            </View>

            {/* 数字键盘 */}
            <View style={styles.keypadSection}>
              <View style={styles.keypadRow}>
                <KeypadButton label="1" onPress={() => handleKeypadPress('1')} />
                <KeypadButton label="2" onPress={() => handleKeypadPress('2')} />
                <KeypadButton label="3" onPress={() => handleKeypadPress('3')} />
              </View>
              <View style={styles.keypadRow}>
                <KeypadButton label="4" onPress={() => handleKeypadPress('4')} />
                <KeypadButton label="5" onPress={() => handleKeypadPress('5')} />
                <KeypadButton label="6" onPress={() => handleKeypadPress('6')} />
              </View>
              <View style={styles.keypadRow}>
                <KeypadButton label="7" onPress={() => handleKeypadPress('7')} />
                <KeypadButton label="8" onPress={() => handleKeypadPress('8')} />
                <KeypadButton label="9" onPress={() => handleKeypadPress('9')} />
              </View>
              <View style={styles.keypadRow}>
                <KeypadButton
                  label="清空"
                  onPress={() => handleKeypadPress('清空')}
                  variant="secondary"
                />
                <KeypadButton label="0" onPress={() => handleKeypadPress('0')} />
                <KeypadButton
                  label="backspace"
                  onPress={() => handleKeypadPress('backspace')}
                  variant="icon"
                />
              </View>
            </View>

            {/* 登录按钮 */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading || !employeeId || !password}
              activeOpacity={0.9}>
              <Text style={styles.loginButtonText}>
                {isLoading ? '登录中...' : '登录系统'}
              </Text>
              <Icon name="login" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* 底部状态栏 */}
          <View style={styles.statusBar}>
            <View style={styles.statusLeft}>
              <View style={styles.statusItem}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>系统状态：在线</Text>
              </View>
              <View style={styles.statusItem}>
                <Icon name="wifi" size={14} color={COLORS.slate400} />
                <Text style={styles.statusText}>12ms</Text>
              </View>
            </View>
            <View style={styles.statusRight}>
              <View style={styles.statusItem}>
                <Icon name="code" size={14} color={COLORS.slate400} />
                <Text style={styles.statusText}>v2.4.0</Text>
              </View>
              <View style={styles.statusItem}>
                <Icon name="tablet" size={14} color={COLORS.slate400} />
                <Text style={styles.statusText}>POS-TAB-001</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  mainWrapper: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    maxWidth: 1080,
    maxHeight: 800,
    alignSelf: 'center',
    width: '100%',
    height: '100%',
  },
  // 左侧面板
  leftPanel: {
    width: '50%',
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  leftContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 64,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '300',
    letterSpacing: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tagText: {
    color: COLORS.white,
    fontSize: 12,
  },
  // 右侧面板
  rightPanel: {
    flex: 1,
    backgroundColor: 'rgba(248,250,252,0.8)',
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.slate100,
    overflow: 'hidden',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.brandCharcoal,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.slate500,
  },
  inputSection: {
    gap: 12,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: COLORS.slate800,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.slate800,
    padding: 0,
  },
  keypadSection: {
    gap: 8,
    marginBottom: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  keypadButton: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.slate800,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  keypadButtonSecondary: {
    backgroundColor: COLORS.slate100,
    borderWidth: 0,
  },
  keypadButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.slate800,
  },
  keypadButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.slate500,
  },
  loginButton: {
    height: 64,
    backgroundColor: COLORS.brandOrange,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.brandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopWidth: 1,
    borderTopColor: COLORS.slate200,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green500,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.slate400,
  },
});

export default NLoginScreen;
