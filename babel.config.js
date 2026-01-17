module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 启用装饰器支持 (WatermelonDB 需要)
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    // 内联环境变量 (支持 __DEV__ 条件编译)
    'babel-plugin-transform-inline-environment-variables',
  ],
};
