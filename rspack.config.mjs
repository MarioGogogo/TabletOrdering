/*
 * @Author: EdisonChan 148373644@qq.com
 * @Date: 2026-01-16 16:21:53
 * @LastEditors: EdisonChan 148373644@qq.com
 * @LastEditTime: 2026-01-16 16:34:53
 * @FilePath: /TabletOrdering/rspack.config.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 是否开启 Bundle 分析模式
const isAnalyze = process.env.ANALYZE === 'true';

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

export default Repack.defineRspackConfig({
  context: __dirname,
  entry: './index.js',
  output: {
    uniqueName: 'TabletOrdering', // 确认远程分包已更新为 TabletOrdering，保持一致
  },
  resolve: {
    ...Repack.getResolveOptions(),
  },
  module: {
    rules: [
      {
        test: /\.[cm]?[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: '@callstack/repack/babel-swc-loader',
          parallel: true,
          options: {},
        },
      },
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    // Rsdoctor 分析插件：通过 ANALYZE=true 环境变量开启
    isAnalyze && new RsdoctorRspackPlugin({
      // 分析功能开关（只启用 bundle 分析，避免与 Re.Pack 冲突）
      features: ['bundle'],
      // 禁用客户端服务器模式，避免调试器问题
      disableClientServer: false,
      // 生成静态 HTML 报告
      reportDir: './build/rsdoctor-report',
    }),
    new Repack.RepackPlugin({
      platform: 'android', // 明确指定平台
      // 多分包配置：每个功能模块独立打包
      extraChunks: [
        {
          include: /table/,
          type: 'remote',
          outputPath: path.join(__dirname, 'build/output/android/remote'),
        },
        {
          include: /orders/,
          type: 'remote',
          outputPath: path.join(__dirname, 'build/output/android/remote'),
        },
      ],
    }),
  ].filter(Boolean),
});
