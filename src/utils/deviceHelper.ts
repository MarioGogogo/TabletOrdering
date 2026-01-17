import DeviceInfo from 'react-native-device-info';
import { Dimensions } from 'react-native';

/**
 * 设备类型检测工具
 */
export class DeviceHelper {
  private static isTabletCache: boolean | null = null;

  /**
   * 判断当前设备是否为平板
   * 使用 react-native-device-info 的 API 进行判断
   */
  static isTablet(): boolean {
    if (this.isTabletCache === null) {
      this.isTabletCache = DeviceInfo.isTablet();
    }
    return this.isTabletCache;
  }

  /**
   * 获取屏幕宽度
   */
  static getScreenWidth(): number {
    return Dimensions.get('window').width;
  }

  /**
   * 获取屏幕高度
   */
  static getScreenHeight(): number {
    return Dimensions.get('window').height;
  }

  /**
   * 判断是否为横屏
   */
  static isLandscape(): boolean {
    const { width, height } = Dimensions.get('window');
    return width > height;
  }

  /**
   * 根据设备类型返回合适的弹窗宽度
   * @param defaultWidth 默认宽度（手机端）
   * @returns 适配后的宽度
   */
  static getDialogWidth(defaultWidth: number = 400): number {
    // 如果是平板，使用较小的宽度比例
    if (this.isTablet()) {
      const screenWidth = this.getScreenWidth();
      // 横屏平板：宽度限制在 400-480 之间
      // 竖屏平板：宽度限制在 360-420 之间
      if (this.isLandscape()) {
        return Math.min(480, screenWidth * 0.35);
      } else {
        return Math.min(420, screenWidth * 0.85);
      }
    }
    // 手机端：使用默认宽度或屏幕宽度的 90%
    return Math.min(defaultWidth, this.getScreenWidth() - 64);
  }

  /**
   * 获取弹窗的最大高度限制
   */
  static getDialogMaxHeight(): number {
    const screenHeight = this.getScreenHeight();
    if (this.isTablet()) {
      return screenHeight * 0.7; // 平板限制在屏幕高度的 70%
    }
    return screenHeight * 0.8; // 手机限制在屏幕高度的 80%
  }

  /**
   * 清除缓存（用于设备变化时，如折叠屏设备）
   */
  static clearCache(): void {
    this.isTabletCache = null;
  }
}
