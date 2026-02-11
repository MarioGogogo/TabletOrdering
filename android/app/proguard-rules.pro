# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ============================================
# APK 大小优化规则
# ============================================

# 移除日志类，减少方法数和包大小
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
}

# ============================================
# React Native 优化规则
# ============================================

# 保留 React Native 相关类
-keep class com.facebook.react.** { *; }
-keepclassmembers class com.facebook.react.** { *; }

# 保留 Fabric 组件
-keep class com.facebook.react.fabric.** { *; }

# ============================================
# WatermelonDB 优化规则
# ============================================

# 保留 WatermelonDB 模型类
-keep class com.nozbe.watermelondb.** { *; }
-keepclassmembers class * extends com.nozbe.watermelondb.DatabaseModel {
    <init>(...);
}

# 保留 SQLite 原生库相关类
-keep class io.nozbe.watermelondb.sqlite.** { *; }

# ============================================
# Hermes 优化规则
# ============================================

# 如果使用 Hermes，保留其相关类
-keep class com.facebook.hermes.** { *; }

# ============================================
# 通用优化规则
# ============================================

# 移除所有 Debug 相关代码
-assumenosideeffects class android.util.Debug {
    public static int getGlobalAllocSize(...);
    public static int getGlobalAllocCount(...);
}

# 保留枚举类（如果需要）
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
