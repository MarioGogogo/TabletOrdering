module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 启用装饰器支持 (WatermelonDB 需要)
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
};
