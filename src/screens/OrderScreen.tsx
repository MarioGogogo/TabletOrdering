/**
 * 点单界面 - POS点菜系统主界面
 *
 * 100%复刻 order.html UI
 * 适配横屏 iPad 设备
 *
 * @format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';

// 颜色配置 - 与 order.html 保持一致
const COLORS = {
  // 主色调 - 金色/黄色
  primary: '#FFC107',

  // 背景色
  backgroundLight: '#F3F4F6',
  backgroundDark: '#0A0A0A',
  cardDark: '#1A1A1A',
  sidebarDark: '#111111',

  // Light 模式颜色
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // 语义色
  red500: '#EF4444',
  blue400: '#60A5FA',
  blue500: '#3B82F6',

  // 透明色
  black: '#000000',
};

// 获取屏幕尺寸
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 左侧面板宽度 (300-340px 根据屏幕适配，匹配HTML的320px)
const LEFT_PANEL_WIDTH = SCREEN_WIDTH >= 1200 ? 360 : 340;

// 模拟数据 - 购物车商品
interface CartItem {
  id: string;
  name: string;
  specs: string;
  quantity: number;
  price: number;
  isCombo?: boolean;
  comboItems?: string;
  tags?: string[];
}

const mockCartItems: CartItem[] = [
  { id: '1', name: '摩卡咖啡', specs: '常温、不加奶、不加糖', quantity: 1, price: 48.0 },
  { id: '2', name: '巧克力物语', specs: '默认配置', quantity: 1, price: 48.0 },
  { id: '3', name: '摩卡咖啡', specs: '冰、少糖', quantity: 1, price: 48.0 },
  {
    id: '4',
    name: '摩卡咖啡',
    specs: '',
    quantity: 1,
    price: 48.0,
    isCombo: true,
    comboItems: '摩卡咖啡【常规】、巧克力物语蛋糕【小份】',
    tags: ['少冰', '不加糖'],
  },
];

// 模拟数据 - 分类
const categories = [
  '全部分类',
  '意式咖啡',
  '精酿啤酒',
  '原麦烘焙',
  '意式早餐',
  '美团套餐',
  '精酿啤酒',
  '美团套餐',
  '原麦烘焙',
];

// 模拟数据 - 商品
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: '摩卡咖啡',
    price: 28.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGhufoySu1LSMMqEf1TVK4tcpsx9q0LNXTC0ViFJ4VdQ2bQBSHi4Lz7LrBPD1_aZSTlW-WjBpPtzW4mKeTJ1QbBnN5shCN8-wT_kzxXdwMrEywQZ3sGGDzgnzzh7VyuFLfZcHBHm90c2Tvr9Moi2UI_nGodYJx3IjI6yEZg5Iqs-qM2uDtyX0Ywa1PmRFLwejkzReXCU1QidI2ijs8ebZC7p60KFgkqzi8EnjpHae-J4_WmHTtauGLl6mNPpG0eJm31qXzZrlBeZGo',
    quantity: 1,
  },
  {
    id: '2',
    name: '蓝莓蛋糕',
    price: 28.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUodXWICxiWGsqmyuEAoNOZ_99aEZaPgRLSV-M0hyNSm7ytV1obvw3ClROPbQYAGQUN_CRpRQ5zlZV06G-C5W0xaHQwDUxq_nvFm2w0tvMhkAL23Xj4aNCLAOVVDQBOhJ5ZzZ5s8RFe73Q5bqrqLa8cwabIDCuw31EJVv-yRUW1l9TdBp-lOCeJ9_sH-JLqgwtFpmFtvygl-sYp_SSJoZ0nV8MDxiZBYZUohB_mLoy_-w9MKdaOpSHVZWxJfZpjAGwvovTPATvM2Md',
    quantity: 1,
  },
  {
    id: '3',
    name: '摩卡咖啡',
    price: 28.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2ezoTbqiqse-TzztWOXAv6BhbP7y2Q59aOw1I-kinfTDvSbwOTxXACvC68Xcrs6-pgz-2gFkVTqxusP6UGYzkVB8Vz4RvIFkBTDTebrYYvsjlKpU2DyG4tLdBZgB2aFQuz2aIV7uazXXSH_evA5JyxRAIqZEmmD3iReoLMHWom4DgtJFTcjaL-wdbbuLkgK0XDZqifxIvDTbXq_L5YckqsBvT9BaSdguXIlvamvos38VIdCz4pcXyhA_DJpuMrewyn8yjxQtcGASk',
    quantity: 1,
  },
  {
    id: '4',
    name: '摩卡咖啡',
    price: 28.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-syXNPdhNuYu2RqbH571dR8yIyeVKjg6G3mUlVGhpToPlAKpZnhIuOdEavPkQy_pXqLNpfpWkWtdQIk5Gfa9Yb0NQamdKmQ5RooKZlllIL9k-2fDzz3B3OigeC01jELuUys70Gq92JVT3w7DlHqmu18zDLiy4hufrHPPn-xGV5eBQRzNfABTF-SQ49ja0jnCzXirHFtP5ilZxwzKqSwqnwFzEbf4FkTLpKum5-uik0juYfENyyZ2SXSlmehNW4XKPDXkGOdv6va8r',
    quantity: 1,
  },
  {
    id: '5',
    name: '鲜果塔',
    price: 28.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtebsgnf125URHevqiO-eNc4R5mWCjCWpyI7WQHbr9MpvwXEPd97ge05yuRIF6CANUCb29fkSXjyOa1dX-rmH1P388r45_MowB0tHITd7AfzUbYbu-QZSh925Xpw_69V2eBr4E0cj929pvMXnwAEI0kos6X6wmaeZvwpe6kTJAj_q-BkQrFjswPfLab_2BcYv_fjgfdb3Iz_J72J2aIYPPBvXMaOZys8eN1-UsWyjnrEA38VAA5loslqqfGuP_UZmdz8GgonotPgFB',
    quantity: 1,
  },
  {
    id: '6',
    name: '甜玫甜心蛋糕',
    price: 28.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbXirsWXP1ggbztg9CeWcmPTCy4Khi98q236F1GwSLNDt0cfQfwpm7JWh4SyJOlLlJME5Om6kjHiYBMMyt7WZg-ji8xR4_-j91GJHxiL7d8_Rk250vqiOTMa3DEDOOfbw7534NMQ1yrBpCo05WUdzZESb-RVKCILwxxmuI2Kfvh4n1CP-UQ9penMGo0jz8WF9amqW9SFzyQBBQSsMFO5PSOVGdKvLigr6an8gD5e8eTUeHtKvRGzjrozuIjSqxAErb6gTgZanyp9a1',
    quantity: 1,
  },
  {
    id: '7',
    name: '摩卡咖啡',
    price: 28.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgcIa9KU4S3n1eeZD5aQ0QX09x-2ZxaeHy1lPXsW8NahyuZP3bPt29omCccaLsT_h21fmVVjtqCqs_zw3GYqX8Tl-YOzrhv-lu0gEALUXyx3Y3TRExJAHo5A9q7ebbmnZ6owT5GwO4xI-DPB-wvnh3i3WQlYRmecgRFle3BHucCUZuNwpJUgJujr6VCbFPi_N53SH7KBjh14-HgNx68EKQJ0K77qrmKvjsB3pWFEPoBXht74LojyEXd0_AIG2Q4xjuXe-929D8BpzJ',
    quantity: 1,
  },
  {
    id: '8',
    name: '麦祺蛋糕',
    price: 28.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzALhkICAinsfU_d3RGfd_xuiqRfBafQFiArGaOSPoXbss2B5JH2uInopl_Jy9q96IJDrvpaohW44aiJ4VZl0f_hjKntEkk3lEQ5QaLPM6qEkC0DY-Mj0cE7_L9FOLKrOGph0llM8-6OwB1EUzMRXJzm1MGArrunoMdf4XrpA6CYqKlKF3hgeOBID_r0AFTZ2T8OLwi8ugxF5aFsRLyDw4UVcxvt0V5omEj0YVhMYEFO40QOXilm5dq8EN2IwK0ZcNfJNa_YDcHf-_',
    quantity: 1,
  },
  {
    id: '9',
    name: '意式浓缩',
    price: 18.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGhufoySu1LSMMqEf1TVK4tcpsx9q0LNXTC0ViFJ4VdQ2bQBSHi4Lz7LrBPD1_aZSTlW-WjBpPtzW4mKeTJ1QbBnN5shCN8-wT_kzxXdwMrEywQZ3sGGDzgnzzh7VyuFLfZcHBHm90c2Tvr9Moi2UI_nGodYJx3IjI6yEZg5Iqs-qM2uDtyX0Ywa1PmRFLwejkzReXCU1QidI2ijs8ebZC7p60KFgkqzi8EnjpHae-J4_WmHTtauGLl6mNPpG0eJm31qXzZrlBeZGo',
    quantity: 1,
  },
  {
    id: '10',
    name: '卡布奇诺',
    price: 32.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2ezoTbqiqse-TzztWOXAv6BhbP7y2Q59aOw1I-kinfTDvSbwOTxXACvC68Xcrs6-pgz-2gFkVTqxusP6UGYzkVB8Vz4RvIFkBTDTebrYYvsjlKpU2DyG4tLdBZgB2aFQuz2aIV7uazXXSH_evA5JyxRAIqZEmmD3iReoLMHWom4DgtJFTcjaL-wdbbuLkgK0XDZqifxIvDTbXq_L5YckqsBvT9BaSdguXIlvamvos38VIdCz4pcXyhA_DJpuMrewyn8yjxQtcGASk',
    quantity: 1,
  },
  {
    id: '11',
    name: '提拉米苏',
    price: 38.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUodXWICxiWGsqmyuEAoNOZ_99aEZaPgRLSV-M0hyNSm7ytV1obvw3ClROPbQYAGQUN_CRpRQ5zlZV06G-C5W0xaHQwDUxq_nvFm2w0tvMhkAL23Xj4aNCLAOVVDQBOhJ5ZzZ5s8RFe73Q5bqrqLa8cwabIDCuw31EJVv-yRUW1l9TdBp-lOCeJ9_sH-JLqgwtFpmFtvygl-sYp_SSJoZ0nV8MDxiZBYZUohB_mLoy_-w9MKdaOpSHVZWxJfZpjAGwvovTPATvM2Md',
    quantity: 1,
  },
  {
    id: '12',
    name: '美式咖啡',
    price: 22.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-syXNPdhNuYu2RqbH571dR8yIyeVKjg6G3mUlVGhpToPlAKpZnhIuOdEavPkQy_pXqLNpfpWkWtdQIk5Gfa9Yb0NQamdKmQ5RooKZlllIL9k-2fDzz3B3OigeC01jELuUys70Gq92JVT3w7DlHqmu18zDLiy4hufrHPPn-xGV5eBQRzNfABTF-SQ49ja0jnCzXirHFtP5ilZxwzKqSwqnwFzEbf4FkTLpKum5-uik0juYfENyyZ2SXSlmehNW4XKPDXkGOdv6va8r',
    quantity: 1,
  },
  {
    id: '13',
    name: '焦糖玛奇朵',
    price: 35.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgcIa9KU4S3n1eeZD5aQ0QX09x-2ZxaeHy1lPXsW8NahyuZP3bPt29omCccaLsT_h21fmVVjtqCqs_zw3GYqX8Tl-YOzrhv-lu0gEALUXyx3Y3TRExJAHo5A9q7ebbmnZ6owT5GwO4xI-DPB-wvnh3i3WQlYRmecgRFle3BHucCUZuNwpJUgJujr6VCbFPi_N53SH7KBjh14-HgNx68EKQJ0K77qrmKvjsB3pWFEPoBXht74LojyEXd0_AIG2Q4xjuXe-929D8BpzJ',
    quantity: 1,
  },
  {
    id: '14',
    name: '拿铁咖啡',
    price: 30.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGhufoySu1LSMMqEf1TVK4tcpsx9q0LNXTC0ViFJ4VdQ2bQBSHi4Lz7LrBPD1_aZSTlW-WjBpPtzW4mKeTJ1QbBnN5shCN8-wT_kzxXdwMrEywQZ3sGGDzgnzzh7VyuFLfZcHBHm90c2Tvr9Moi2UI_nGodYJx3IjI6yEZg5Iqs-qM2uDtyX0Ywa1PmRFLwejkzReXCU1QidI2ijs8ebZC7p60KFgkqzi8EnjpHae-J4_WmHTtauGLl6mNPpG0eJm31qXzZrlBeZGo',
    quantity: 1,
  },
  {
    id: '15',
    name: '抹茶拿铁',
    price: 34.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzALhkICAinsfU_d3RGfd_xuiqRfBafQFiArGaOSPoXbss2B5JH2uInopl_Jy9q96IJDrvpaohW44aiJ4VZl0f_hjKntEkk3lEQ5QaLPM6qEkC0DY-Mj0cE7_L9FOLKrOGph0llM8-6OwB1EUzMRXJzm1MGArrunoMdf4XrpA6CYqKlKF3hgeOBID_r0AFTZ2T8OLwi8ugxF5aFsRLyDw4UVcxvt0V5omEj0YVhMYEFO40QOXilm5dq8EN2IwK0ZcNfJNa_YDcHf-_',
    quantity: 1,
  },
  {
    id: '16',
    name: '红丝绒蛋糕',
    price: 42.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbXirsWXP1ggbztg9CeWcmPTCy4Khi98q236F1GwSLNDt0cfQfwpm7JWh4SyJOlLlJME5Om6kjHiYBMMyt7WZg-ji8xR4_-j91GJHxiL7d8_Rk250vqiOTMa3DEDOOfbw7534NMQ1yrBpCo05WUdzZESb-RVKCILwxxmuI2Kfvh4n1CP-UQ9penMGo0jz8WF9amqW9SFzyQBBQSsMFO5PSOVGdKvLigr6an8gD5e8eTUeHtKvRGzjrozuIjSqxAErb6gTgZanyp9a1',
    quantity: 1,
  },
  {
    id: '17',
    name: '草莓华夫饼',
    price: 45.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUodXWICxiWGsqmyuEAoNOZ_99aEZaPgRLSV-M0hyNSm7ytV1obvw3ClROPbQYAGQUN_CRpRQ5zlZV06G-C5W0xaHQwDUxq_nvFm2w0tvMhkAL23Xj4aNCLAOVVDQBOhJ5ZzZ5s8RFe73Q5bqrqLa8cwabIDCuw31EJVv-yRUW1l9TdBp-lOCeJ9_sH-JLqgwtFpmFtvygl-sYp_SSJoZ0nV8MDxiZBYZUohB_mLoy_-w9MKdaOpSHVZWxJfZpjAGwvovTPATvM2Md',
    quantity: 1,
  },
  {
    id: '18',
    name: '经典舒芙蕾',
    price: 58.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtebsgnf125URHevqiO-eNc4R5mWCjCWpyI7WQHbr9MpvwXEPd97ge05yuRIF6CANUCb29fkSXjyOa1dX-rmH1P388r45_MowB0tHITd7AfzUbYbu-QZSh925Xpw_69V2eBr4E0cj929pvMXnwAEI0kos6X6wmaeZvwpe6kTJAj_q-BkQrFjswPfLab_2BcYv_fjgfdb3Iz_J72J2aIYPPBvXMaOZys8eN1-UsWyjnrEA38VAA5loslqqfGuP_UZmdz8GgonotPgFB',
    quantity: 1,
  },
  {
    id: '19',
    name: '杨枝甘露',
    price: 28.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzALhkICAinsfU_d3RGfd_xuiqRfBafQFiArGaOSPoXbss2B5JH2uInopl_Jy9q96IJDrvpaohW44aiJ4VZl0f_hjKntEkk3lEQ5QaLPM6qEkC0DY-Mj0cE7_L9FOLKrOGph0llM8-6OwB1EUzMRXJzm1MGArrunoMdf4XrpA6CYqKlKF3hgeOBID_r0AFTZ2T8OLwi8ugxF5aFsRLyDw4UVcxvt0V5omEj0YVhMYEFO40QOXilm5dq8EN2IwK0ZcNfJNa_YDcHf-_',
    quantity: 1,
  },
  {
    id: '20',
    name: '多肉葡萄',
    price: 32.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2ezoTbqiqse-TzztWOXAv6BhbP7y2Q59aOw1I-kinfTDvSbwOTxXACvC68Xcrs6-pgz-2gFkVTqxusP6UGYzkVB8Vz4RvIFkBTDTebrYYvsjlKpU2DyG4tLdBZgB2aFQuz2aIV7uazXXSH_evA5JyxRAIqZEmmD3iReoLMHWom4DgtJFTcjaL-wdbbuLkgK0XDZqifxIvDTbXq_L5YckqsBvT9BaSdguXIlvamvos38VIdCz4pcXyhA_DJpuMrewyn8yjxQtcGASk',
    quantity: 1,
  },
  {
    id: '21',
    name: '芝芝莓莓',
    price: 34.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-syXNPdhNuYu2RqbH571dR8yIyeVKjg6G3mUlVGhpToPlAKpZnhIuOdEavPkQy_pXqLNpfpWkWtdQIk5Gfa9Yb0NQamdKmQ5RooKZlllIL9k-2fDzz3B3OigeC01jELuUys70Gq92JVT3w7DlHqmu18zDLiy4hufrHPPn-xGV5eBQRzNfABTF-SQ49ja0jnCzXirHFtP5ilZxwzKqSwqnwFzEbf4FkTLpKum5-uik0juYfENyyZ2SXSlmehNW4XKPDXkGOdv6va8r',
    quantity: 1,
  },
  {
    id: '22',
    name: '金凤茶王',
    price: 26.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgcIa9KU4S3n1eeZD5aQ0QX09x-2ZxaeHy1lPXsW8NahyuZP3bPt29omCccaLsT_h21fmVVjtqCqs_zw3GYqX8Tl-YOzrhv-lu0gEALUXyx3Y3TRExJAHo5A9q7ebbmnZ6owT5GwO4xI-DPB-wvnh3i3WQlYRmecgRFle3BHucCUZuNwpJUgJujr6VCbFPi_N53SH7KBjh14-HgNx68EKQJ0K77qrmKvjsB3pWFEPoBXht74LojyEXd0_AIG2Q4xjuXe-929D8BpzJ',
    quantity: 1,
  },
  {
    id: '23',
    name: '满杯红柚',
    price: 28.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGhufoySu1LSMMqEf1TVK4tcpsx9q0LNXTC0ViFJ4VdQ2bQBSHi4Lz7LrBPD1_aZSTlW-WjBpPtzW4mKeTJ1QbBnN5shCN8-wT_kzxXdwMrEywQZ3sGGDzgnzzh7VyuFLfZcHBHm90c2Tvr9Moi2UI_nGodYJx3IjI6yEZg5Iqs-qM2uDtyX0Ywa1PmRFLwejkzReXCU1QidI2ijs8ebZC7p60KFgkqzi8EnjpHae-J4_WmHTtauGLl6mNPpG0eJm31qXzZrlBeZGo',
    quantity: 1,
  },
  {
    id: '24',
    name: '气泡冰咖啡',
    price: 36.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2ezoTbqiqse-TzztWOXAv6BhbP7y2Q59aOw1I-kinfTDvSbwOTxXACvC68Xcrs6-pgz-2gFkVTqxusP6UGYzkVB8Vz4RvIFkBTDTebrYYvsjlKpU2DyG4tLdBZgB2aFQuz2aIV7uazXXSH_evA5JyxRAIqZEmmD3iReoLMHWom4DgtJFTcjaL-wdbbuLkgK0XDZqifxIvDTbXq_L5YckqsBvT9BaSdguXIlvamvos38VIdCz4pcXyhA_DJpuMrewyn8yjxQtcGASk',
    quantity: 1,
  },
  {
    id: '25',
    name: '香草奶昔',
    price: 38.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGhufoySu1LSMMqEf1TVK4tcpsx9q0LNXTC0ViFJ4VdQ2bQBSHi4Lz7LrBPD1_aZSTlW-WjBpPtzW4mKeTJ1QbBnN5shCN8-wT_kzxXdwMrEywQZ3sGGDzgnzzh7VyuFLfZcHBHm90c2Tvr9Moi2UI_nGodYJx3IjI6yEZg5Iqs-qM2uDtyX0Ywa1PmRFLwejkzReXCU1QidI2ijs8ebZC7p60KFgkqzi8EnjpHae-J4_WmHTtauGLl6mNPpG0eJm31qXzZrlBeZGo',
    quantity: 1,
  },
  {
    id: '26',
    name: '蓝莓华夫饼',
    price: 48.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUodXWICxiWGsqmyuEAoNOZ_99aEZaPgRLSV-M0hyNSm7ytV1obvw3ClROPbQYAGQUN_CRpRQ5zlZV06G-C5W0xaHQwDUxq_nvFm2w0tvMhkAL23Xj4aNCLAOVVDQBOhJ5ZzZ5s8RFe73Q5bqrqLa8cwabIDCuw31EJVv-yRUW1l9TdBp-lOCeJ9_sH-JLqgwtFpmFtvygl-sYp_SSJoZ0nV8MDxiZBYZUohB_mLoy_-w9MKdaOpSHVZWxJfZpjAGwvovTPATvM2Md',
    quantity: 1,
  },
  {
    id: '27',
    name: '混合浆果杯',
    price: 34.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtebsgnf125URHevqiO-eNc4R5mWCjCWpyI7WQHbr9MpvwXEPd97ge05yuRIF6CANUCb29fkSXjyOa1dX-rmH1P388r45_MowB0tHITd7AfzUbYbu-QZSh925Xpw_69V2eBr4E0cj929pvMXnwAEI0kos6X6wmaeZvwpe6kTJAj_q-BkQrFjswPfLab_2BcYv_fjgfdb3Iz_J72J2aIYPPBvXMaOZys8eN1-UsWyjnrEA38VAA5loslqqfGuP_UZmdz8GgonotPgFB',
    quantity: 1,
  },
  {
    id: '28',
    name: '芝士蛋糕',
    price: 44.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbXirsWXP1ggbztg9CeWcmPTCy4Khi98q236F1GwSLNDt0cfQfwpm7JWh4SyJOlLlJME5Om6kjHiYBMMyt7WZg-ji8xR4_-j91GJHxiL7d8_Rk250vqiOTMa3DEDOOfbw7534NMQ1yrBpCo05WUdzZESb-RVKCILwxxmuI2Kfvh4n1CP-UQ9penMGo0jz8WF9amqW9SFzyQBBQSsMFO5PSOVGdKvLigr6an8gD5e8eTUeHtKvRGzjrozuIjSqxAErb6gTgZanyp9a1',
    quantity: 1,
  },
  {
    id: '29',
    name: '法式吐司',
    price: 40.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzALhkICAinsfU_d3RGfd_xuiqRfBafQFiArGaOSPoXbss2B5JH2uInopl_Jy9q96IJDrvpaohW44aiJ4VZl0f_hjKntEkk3lEQ5QaLPM6qEkC0DY-Mj0cE7_L9FOLKrOGph0llM8-6OwB1EUzMRXJzm1MGArrunoMdf4XrpA6CYqKlKF3hgeOBID_r0AFTZ2T8OLwi8ugxF5aFsRLyDw4UVcxvt0V5omEj0YVhMYEFO40QOXilm5dq8EN2IwK0ZcNfJNa_YDcHf-_',
    quantity: 1,
  },
  {
    id: '30',
    name: '抹茶红豆冰',
    price: 36.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2ezoTbqiqse-TzztWOXAv6BhbP7y2Q59aOw1I-kinfTDvSbwOTxXACvC68Xcrs6-pgz-2gFkVTqxusP6UGYzkVB8Vz4RvIFkBTDTebrYYvsjlKpU2DyG4tLdBZgB2aFQuz2aIV7uazXXSH_evA5JyxRAIqZEmmD3iReoLMHWom4DgtJFTcjaL-wdbbuLkgK0XDZqifxIvDTbXq_L5YckqsBvT9BaSdguXIlvamvos38VIdCz4pcXyhA_DJpuMrewyn8yjxQtcGASk',
    quantity: 1,
  },
  {
    id: '31',
    name: '巧克力松饼',
    price: 32.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-syXNPdhNuYu2RqbH571dR8yIyeVKjg6G3mUlVGhpToPlAKpZnhIuOdEavPkQy_pXqLNpfpWkWtdQIk5Gfa9Yb0NQamdKmQ5RooKZlllIL9k-2fDzz3B3OigeC01jELuUys70Gq92JVT3w7DlHqmu18zDLiy4hufrHPPn-xGV5eBQRzNfABTF-SQ49ja0jnCzXirHFtP5ilZxwzKqSwqnwFzEbf4FkTLpKum5-uik0juYfENyyZ2SXSlmehNW4XKPDXkGOdv6va8r',
    quantity: 1,
  },
  {
    id: '32',
    name: '香蕉船',
    price: 52.0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgcIa9KU4S3n1eeZD5aQ0QX09x-2ZxaeHy1lPXsW8NahyuZP3bPt29omCccaLsT_h21fmVVjtqCqs_zw3GYqX8Tl-YOzrhv-lu0gEALUXyx3Y3TRExJAHo5A9q7ebbmnZ6owT5GwO4xI-DPB-wvnh3i3WQlYRmecgRFle3BHucCUZuNwpJUgJujr6VCbFPi_N53SH7KBjh14-HgNx68EKQJ0K77qrmKvjsB3pWFEPoBXht74LojyEXd0_AIG2Q4xjuXe-929D8BpzJ',
    quantity: 1,
  },
  { id: '33', name: '咸焦糖拿铁', price: 34.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGhufoySu1LSMMqEf1TVK4tcpsx9q0LNXTC0ViFJ4VdQ2bQBSHi4Lz7LrBPD1_aZSTlW-WjBpPtzW4mKeTJ1QbBnN5shCN8-wT_kzxXdwMrEywQZ3sGGDzgnzzh7VyuFLfZcHBHm90c2Tvr9Moi2UI_nGodYJx3IjI6yEZg5Iqs-qM2uDtyX0Ywa1PmRFLwejkzReXCU1QidI2ijs8ebZC7p60KFgkqzi8EnjpHae-J4_WmHTtauGLl6mNPpG0eJm31qXzZrlBeZGo', quantity: 1 },
  { id: '34', name: '黑糖波波茶', price: 28.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUodXWICxiWGsqmyuEAoNOZ_99aEZaPgRLSV-M0hyNSm7ytV1obvw3ClROPbQYAGQUN_CRpRQ5zlZV06G-C5W0xaHQwDUxq_nvFm2w0tvMhkAL23Xj4aNCLAOVVDQBOhJ5ZzZ5s8RFe73Q5bqrqLa8cwabIDCuw31EJVv-yRUW1l9TdBp-lOCeJ9_sH-JLqgwtFpmFtvygl-sYp_SSJoZ0nV8MDxiZBYZUohB_mLoy_-w9MKdaOpSHVZWxJfZpjAGwvovTPATvM2Md', quantity: 1 },
  { id: '35', name: '红丝绒奶茶', price: 30.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2ezoTbqiqse-TzztWOXAv6BhbP7y2Q59aOw1I-kinfTDvSbwOTxXACvC68Xcrs6-pgz-2gFkVTqxusP6UGYzkVB8Vz4RvIFkBTDTebrYYvsjlKpU2DyG4tLdBZgB2aFQuz2aIV7uazXXSH_evA5JyxRAIqZEmmD3iReoLMHWom4DgtJFTcjaL-wdbbuLkgK0XDZqifxIvDTbXq_L5YckqsBvT9BaSdguXIlvamvos38VIdCz4pcXyhA_DJpuMrewyn8yjxQtcGASk', quantity: 1 },
  { id: '36', name: '奥利奥奶昔', price: 36.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-syXNPdhNuYu2RqbH571dR8yIyeVKjg6G3mUlVGhpToPlAKpZnhIuOdEavPkQy_pXqLNpfpWkWtdQIk5Gfa9Yb0NQamdKmQ5RooKZlllIL9k-2fDzz3B3OigeC01jELuUys70Gq92JVT3w7DlHqmu18zDLiy4hufrHPPn-xGV5eBQRzNfABTF-SQ49ja0jnCzXirHFtP5ilZxwzKqSwqnwFzEbf4FkTLpKum5-uik0juYfENyyZ2SXSlmehNW4XKPDXkGOdv6va8r', quantity: 1 },
  { id: '37', name: '芝士乌龙', price: 26.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtebsgnf125URHevqiO-eNc4R5mWCjCWpyI7WQHbr9MpvwXEPd97ge05yuRIF6CANUCb29fkSXjyOa1dX-rmH1P388r45_MowB0tHITd7AfzUbYbu-QZSh925Xpw_69V2eBr4E0cj929pvMXnwAEI0kos6X6wmaeZvwpe6kTJAj_q-BkQrFjswPfLab_2BcYv_fjgfdb3Iz_J72J2aIYPPBvXMaOZys8eN1-UsWyjnrEA38VAA5loslqqfGuP_UZmdz8GgonotPgFB', quantity: 1 },
  { id: '38', name: '四季春茶', price: 22.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbXirsWXP1ggbztg9CeWcmPTCy4Khi98q236F1GwSLNDt0cfQfwpm7JWh4SyJOlLlJME5Om6kjHiYBMMyt7WZg-ji8xR4_-j91GJHxiL7d8_Rk250vqiOTMa3DEDOOfbw7534NMQ1yrBpCo05WUdzZESb-RVKCILwxxmuI2Kfvh4n1CP-UQ9penMGo0jz8WF9amqW9SFzyQBBQSsMFO5PSOVGdKvLigr6an8gD5e8eTUeHtKvRGzjrozuIjSqxAErb6gTgZanyp9a1', quantity: 1 },
  { id: '39', name: '葡萄气泡饮', price: 24.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgcIa9KU4S3n1eeZD5aQ0QX09x-2ZxaeHy1lPXsW8NahyuZP3bPt29omCccaLsT_h21fmVVjtqCqs_zw3GYqX8Tl-YOzrhv-lu0gEALUXyx3Y3TRExJAHo5A9q7ebbmnZ6owT5GwO4xI-DPB-wvnh3i3WQlYRmecgRFle3BHucCUZuNwpJUgJujr6VCbFPi_N53SH7KBjh14-HgNx68EKQJ0K77qrmKvjsB3pWFEPoBXht74LojyEXd0_AIG2Q4xjuXe-929D8BpzJ', quantity: 1 },
  { id: '40', name: '草莓圣代', price: 18.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzALhkICAinsfU_d3RGfd_xuiqRfBafQFiArGaOSPoXbss2B5JH2uInopl_Jy9q96IJDrvpaohW44aiJ4VZl0f_hjKntEkk3lEQ5QaLPM6qEkC0DY-Mj0cE7_L9FOLKrOGph0llM8-6OwB1EUzMRXJzm1MGArrunoMdf4XrpA6CYqKlKF3hgeOBID_r0AFTZ2T8OLwi8ugxF5aFsRLyDw4UVcxvt0V5omEj0YVhMYEFO40QOXilm5dq8EN2IwK0ZcNfJNa_YDcHf-_', quantity: 1 },
  { id: '41', name: '经典可乐', price: 10.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGhufoySu1LSMMqEf1TVK4tcpsx9q0LNXTC0ViFJ4VdQ2bQBSHi4Lz7LrBPD1_aZSTlW-WjBpPtzW4mKeTJ1QbBnN5shCN8-wT_kzxXdwMrEywQZ3sGGDzgnzzh7VyuFLfZcHBHm90c2Tvr9Moi2UI_nGodYJx3IjI6yEZg5Iqs-qM2uDtyX0Ywa1PmRFLwejkzReXCU1QidI2ijs8ebZC7p60KFgkqzi8EnjpHae-J4_WmHTtauGLl6mNPpG0eJm31qXzZrlBeZGo', quantity: 1 },
  { id: '42', name: '雪碧柠檬', price: 10.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUodXWICxiWGsqmyuEAoNOZ_99aEZaPgRLSV-M0hyNSm7ytV1obvw3ClROPbQYAGQUN_CRpRQ5zlZV06G-C5W0xaHQwDUxq_nvFm2w0tvMhkAL23Xj4aNCLAOVVDQBOhJ5ZzZ5s8RFe73Q5bqrqLa8cwabIDCuw31EJVv-yRUW1l9TdBp-lOCeJ9_sH-JLqgwtFpmFtvygl-sYp_SSJoZ0nV8MDxiZBYZUohB_mLoy_-w9MKdaOpSHVZWxJfZpjAGwvovTPATvM2Md', quantity: 1 },
  { id: '43', name: '美年达', price: 10.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2ezoTbqiqse-TzztWOXAv6BhbP7y2Q59aOw1I-kinfTDvSbwOTxXACvC68Xcrs6-pgz-2gFkVTqxusP6UGYzkVB8Vz4RvIFkBTDTebrYYvsjlKpU2DyG4tLdBZgB2aFQuz2aIV7uazXXSH_evA5JyxRAIqZEmmD3iReoLMHWom4DgtJFTcjaL-wdbbuLkgK0XDZqifxIvDTbXq_L5YckqsBvT9BaSdguXIlvamvos38VIdCz4pcXyhA_DJpuMrewyn8yjxQtcGASk', quantity: 1 },
  { id: '44', name: '柠檬红茶', price: 15.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-syXNPdhNuYu2RqbH571dR8yIyeVKjg6G3mUlVGhpToPlAKpZnhIuOdEavPkQy_pXqLNpfpWkWtdQIk5Gfa9Yb0NQamdKmQ5RooKZlllIL9k-2fDzz3B3OigeC01jELuUys70Gq92JVT3w7DlHqmu18zDLiy4hufrHPPn-xGV5eBQRzNfABTF-SQ49ja0jnCzXirHFtP5ilZxwzKqSwqnwFzEbf4FkTLpKum5-uik0juYfENyyZ2SXSlmehNW4XKPDXkGOdv6va8r', quantity: 1 },
  { id: '45', name: '茉莉花茶', price: 12.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtebsgnf125URHevqiO-eNc4R5mWCjCWpyI7WQHbr9MpvwXEPd97ge05yuRIF6CANUCb29fkSXjyOa1dX-rmH1P388r45_MowB0tHITd7AfzUbYbu-QZSh925Xpw_69V2eBr4E0cj929pvMXnwAEI0kos6X6wmaeZvwpe6kTJAj_q-BkQrFjswPfLab_2BcYv_fjgfdb3Iz_J72J2aIYPPBvXMaOZys8eN1-UsWyjnrEA38VAA5loslqqfGuP_UZmdz8GgonotPgFB', quantity: 1 },
  { id: '46', name: '拿铁咖啡', price: 30.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbXirsWXP1ggbztg9CeWcmPTCy4Khi98q236F1GwSLNDt0cfQfwpm7JWh4SyJOlLlJME5Om6kjHiYBMMyt7WZg-ji8xR4_-j91GJHxiL7d8_Rk250vqiOTMa3DEDOOfbw7534NMQ1yrBpCo05WUdzZESb-RVKCILwxxmuI2Kfvh4n1CP-UQ9penMGo0jz8WF9amqW9SFzyQBBQSsMFO5PSOVGdKvLigr6an8gD5e8eTUeHtKvRGzjrozuIjSqxAErb6gTgZanyp9a1', quantity: 1 },
  { id: '47', name: '抹茶拿铁', price: 34.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgcIa9KU4S3n1eeZD5aQ0QX09x-2ZxaeHy1lPXsW8NahyuZP3bPt29omCccaLsT_h21fmVVjtqCqs_zw3GYqX8Tl-YOzrhv-lu0gEALUXyx3Y3TRExJAHo5A9q7ebbmnZ6owT5GwO4xI-DPB-wvnh3i3WQlYRmecgRFle3BHucCUZuNwpJUgJujr6VCbFPi_N53SH7KBjh14-HgNx68EKQJ0K77qrmKvjsB3pWFEPoBXht74LojyEXd0_AIG2Q4xjuXe-929D8BpzJ', quantity: 1 },
  { id: '48', name: '燕麦拿铁', price: 36.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzALhkICAinsfU_d3RGfd_xuiqRfBafQFiArGaOSPoXbss2B5JH2uInopl_Jy9q96IJDrvpaohW44aiJ4VZl0f_hjKntEkk3lEQ5QaLPM6qEkC0DY-Mj0cE7_L9FOLKrOGph0llM8-6OwB1EUzMRXJzm1MGArrunoMdf4XrpA6CYqKlKF3hgeOBID_r0AFTZ2T8OLwi8ugxF5aFsRLyDw4UVcxvt0V5omEj0YVhMYEFO40QOXilm5dq8EN2IwK0ZcNfJNa_YDcHf-_', quantity: 1 },
  { id: '49', name: '香草拿铁', price: 34.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGhufoySu1LSMMqEf1TVK4tcpsx9q0LNXTC0ViFJ4VdQ2bQBSHi4Lz7LrBPD1_aZSTlW-WjBpPtzW4mKeTJ1QbBnN5shCN8-wT_kzxXdwMrEywQZ3sGGDzgnzzh7VyuFLfZcHBHm90c2Tvr9Moi2UI_nGodYJx3IjI6yEZg5Iqs-qM2uDtyX0Ywa1PmRFLwejkzReXCU1QidI2ijs8ebZC7p60KFgkqzi8EnjpHae-J4_WmHTtauGLl6mNPpG0eJm31qXzZrlBeZGo', quantity: 1 },
  { id: '50', name: '焦糖玛奇朵', price: 38.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUodXWICxiWGsqmyuEAoNOZ_99aEZaPgRLSV-M0hyNSm7ytV1obvw3ClROPbQYAGQUN_CRpRQ5zlZV06G-C5W0xaHQwDUxq_nvFm2w0tvMhkAL23Xj4aNCLAOVVDQBOhJ5ZzZ5s8RFe73Q5bqrqLa8cwabIDCuw31EJVv-yRUW1l9TdBp-lOCeJ9_sH-JLqgwtFpmFtvygl-sYp_SSJoZ0nV8MDxiZBYZUohB_mLoy_-w9MKdaOpSHVZWxJfZpjAGwvovTPATvM2Md', quantity: 1 },
  { id: '51', name: '布朗尼', price: 25.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2ezoTbqiqse-TzztWOXAv6BhbP7y2Q59aOw1I-kinfTDvSbwOTxXACvC68Xcrs6-pgz-2gFkVTqxusP6UGYzkVB8Vz4RvIFkBTDTebrYYvsjlKpU2DyG4tLdBZgB2aFQuz2aIV7uazXXSH_evA5JyxRAIqZEmmD3iReoLMHWom4DgtJFTcjaL-wdbbuLkgK0XDZqifxIvDTbXq_L5YckqsBvT9BaSdguXIlvamvos38VIdCz4pcXyhA_DJpuMrewyn8yjxQtcGASk', quantity: 1 },
  { id: '52', name: '重乳酪蛋糕', price: 32.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-syXNPdhNuYu2RqbH571dR8yIyeVKjg6G3mUlVGhpToPlAKpZnhIuOdEavPkQy_pXqLNpfpWkWtdQIk5Gfa9Yb0NQamdKmQ5RooKZlllIL9k-2fDzz3B3OigeC01jELuUys70Gq92JVT3w7DlHqmu18zDLiy4hufrHPPn-xGV5eBQRzNfABTF-SQ49ja0jnCzXirHFtP5ilZxwzKqSwqnwFzEbf4FkTLpKum5-uik0juYfENyyZ2SXSlmehNW4XKPDXkGOdv6va8r', quantity: 1 },
  { id: '53', name: '黑森林蛋糕', price: 35.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtebsgnf125URHevqiO-eNc4R5mWCjCWpyI7WQHbr9MpvwXEPd97ge05yuRIF6CANUCb29fkSXjyOa1dX-rmH1P388r45_MowB0tHITd7AfzUbYbu-QZSh925Xpw_69V2eBr4E0cj929pvMXnwAEI0kos6X6wmaeZvwpe6kTJAj_q-BkQrFjswPfLab_2BcYv_fjgfdb3Iz_J72J2aIYPPBvXMaOZys8eN1-UsWyjnrEA38VAA5loslqqfGuP_UZmdz8GgonotPgFB', quantity: 1 },
  { id: '54', name: '芒果班戟', price: 28.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbXirsWXP1ggbztg9CeWcmPTCy4Khi98q236F1GwSLNDt0cfQfwpm7JWh4SyJOlLlJME5Om6kjHiYBMMyt7WZg-ji8xR4_-j91GJHxiL7d8_Rk250vqiOTMa3DEDOOfbw7534NMQ1yrBpCo05WUdzZESb-RVKCILwxxmuI2Kfvh4n1CP-UQ9penMGo0jz8WF9amqW9SFzyQBBQSsMFO5PSOVGdKvLigr6an8gD5e8eTUeHtKvRGzjrozuIjSqxAErb6gTgZanyp9a1', quantity: 1 },
  { id: '55', name: '榴莲班戟', price: 32.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgcIa9KU4S3n1eeZD5aQ0QX09x-2ZxaeHy1lPXsW8NahyuZP3bPt29omCccaLsT_h21fmVVjtqCqs_zw3GYqX8Tl-YOzrhv-lu0gEALUXyx3Y3TRExJAHo5A9q7ebbmnZ6owT5GwO4xI-DPB-wvnh3i3WQlYRmecgRFle3BHucCUZuNwpJUgJujr6VCbFPi_N53SH7KBjh14-HgNx68EKQJ0K77qrmKvjsB3pWFEPoBXht74LojyEXd0_AIG2Q4xjuXe-929D8BpzJ', quantity: 1 },
  { id: '56', name: '草莓大福', price: 15.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzALhkICAinsfU_d3RGfd_xuiqRfBafQFiArGaOSPoXbss2B5JH2uInopl_Jy9q96IJDrvpaohW44aiJ4VZl0f_hjKntEkk3lEQ5QaLPM6qEkC0DY-Mj0cE7_L9FOLKrOGph0llM8-6OwB1EUzMRXJzm1MGArrunoMdf4XrpA6CYqKlKF3hgeOBID_r0AFTZ2T8OLwi8ugxF5aFsRLyDw4UVcxvt0V5omEj0YVhMYEFO40QOXilm5dq8EN2IwK0ZcNfJNa_YDcHf-_', quantity: 1 },
  { id: '57', name: '红豆沙', price: 12.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGhufoySu1LSMMqEf1TVK4tcpsx9q0LNXTC0ViFJ4VdQ2bQBSHi4Lz7LrBPD1_aZSTlW-WjBpPtzW4mKeTJ1QbBnN5shCN8-wT_kzxXdwMrEywQZ3sGGDzgnzzh7VyuFLfZcHBHm90c2Tvr9Moi2UI_nGodYJx3IjI6yEZg5Iqs-qM2uDtyX0Ywa1PmRFLwejkzReXCU1QidI2ijs8ebZC7p60KFgkqzi8EnjpHae-J4_WmHTtauGLl6mNPpG0eJm31qXzZrlBeZGo', quantity: 1 },
  { id: '58', name: '芝麻糊', price: 12.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUodXWICxiWGsqmyuEAoNOZ_99aEZaPgRLSV-M0hyNSm7ytV1obvw3ClROPbQYAGQUN_CRpRQ5zlZV06G-C5W0xaHQwDUxq_nvFm2w0tvMhkAL23Xj4aNCLAOVVDQBOhJ5ZzZ5s8RFe73Q5bqrqLa8cwabIDCuw31EJVv-yRUW1l9TdBp-lOCeJ9_sH-JLqgwtFpmFtvygl-sYp_SSJoZ0nV8MDxiZBYZUohB_mLoy_-w9MKdaOpSHVZWxJfZpjAGwvovTPATvM2Md', quantity: 1 },
  { id: '59', name: '双皮奶', price: 18.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2ezoTbqiqse-TzztWOXAv6BhbP7y2Q59aOw1I-kinfTDvSbwOTxXACvC68Xcrs6-pgz-2gFkVTqxusP6UGYzkVB8Vz4RvIFkBTDTebrYYvsjlKpU2DyG4tLdBZgB2aFQuz2aIV7uazXXSH_evA5JyxRAIqZEmmD3iReoLMHWom4DgtJFTcjaL-wdbbuLkgK0XDZqifxIvDTbXq_L5YckqsBvT9BaSdguXIlvamvos38VIdCz4pcXyhA_DJpuMrewyn8yjxQtcGASk', quantity: 1 },
  { id: '60', name: '姜撞奶', price: 18.0, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-syXNPdhNuYu2RqbH571dR8yIyeVKjg6G3mUlVGhpToPlAKpZnhIuOdEavPkQy_pXqLNpfpWkWtdQIk5Gfa9Yb0NQamdKmQ5RooKZlllIL9k-2fDzz3B3OigeC01jELuUys70Gq92JVT3w7DlHqmu18zDLiy4hufrHPPn-xGV5eBQRzNfABTF-SQ49ja0jnCzXirHFtP5ilZxwzKqSwqnwFzEbf4FkTLpKum5-uik0juYfENyyZ2SXSlmehNW4XKPDXkGOdv6va8r', quantity: 1 },
];

// 就餐类型选项
type DiningType = 'dineIn' | 'takeOut' | 'delivery';

export default function OrderScreen() {
  const [diningType, setDiningType] = useState<DiningType>('dineIn');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [products, setProducts] = useState(mockProducts);
  const [searchText, setSearchText] = useState('');
  const [note, setNote] = useState('');

  // 计算合计
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = 28.8; // 模拟价格
  const discount = 2.0;

  // 更新购物车商品数量
  const updateCartItemQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  // 更新商品数量
  const updateProductQuantity = (id: string, delta: number) => {
    setProducts(prods =>
      prods.map(prod =>
        prod.id === id
          ? { ...prod, quantity: Math.max(0, prod.quantity + delta) }
          : prod
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* 左侧购物车面板 */}
      <View style={styles.leftPanel}>
        {/* 顶部：流水号 + 就餐类型 */}
        <View style={styles.cartHeader}>
          <View style={styles.cartHeaderTop}>
            <Text style={styles.orderNumber}>流水号：001号</Text>
            <View style={styles.diningTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.diningTypeButton,
                  diningType === 'dineIn' && styles.diningTypeButtonActive,
                ]}
                onPress={() => setDiningType('dineIn')}
              >
                <Text
                  style={[
                    styles.diningTypeText,
                    diningType === 'dineIn' && styles.diningTypeTextActive,
                  ]}
                >
                  堂食
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.diningTypeButton,
                  diningType === 'takeOut' && styles.diningTypeButtonActive,
                ]}
                onPress={() => setDiningType('takeOut')}
              >
                <Text
                  style={[
                    styles.diningTypeText,
                    diningType === 'takeOut' && styles.diningTypeTextActive,
                  ]}
                >
                  自取
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.diningTypeButton,
                  diningType === 'delivery' && styles.diningTypeButtonActive,
                ]}
                onPress={() => setDiningType('delivery')}
              >
                <Text
                  style={[
                    styles.diningTypeText,
                    diningType === 'delivery' && styles.diningTypeTextActive,
                  ]}
                >
                  外卖
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* 列表表头 */}
          <View style={styles.cartListHeader}>
            <Text style={styles.cartListHeaderText}>商品名称</Text>
            <Text style={[styles.cartListHeaderText, styles.cartListHeaderQuantity]}>数量</Text>
            <Text style={[styles.cartListHeaderText, styles.cartListHeaderPrice]}>小计</Text>
          </View>
        </View>

        {/* 购物车列表 */}
        <ScrollView
          style={styles.cartList}
          contentContainerStyle={styles.cartListContent}
          showsVerticalScrollIndicator={false}
        >
          {cartItems.map(item => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                {item.isCombo && item.comboItems ? (
                  <>
                    <Text style={styles.cartItemComboSpecs}>{item.comboItems}</Text>
                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.cartItemTags}>
                        {item.tags.map((tag, idx) => (
                          <View key={idx} style={styles.cartItemTag}>
                            <Text style={styles.cartItemTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.cartItemSpecs}>{item.specs}</Text>
                )}
              </View>
              <View style={styles.cartItemQuantity}>
                <TouchableOpacity
                  style={styles.quantityButtonMinus}
                  onPress={() => updateCartItemQuantity(item.id, -1)}
                >
                  <Text style={styles.quantityButtonMinusText}>－</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButtonPlus}
                  onPress={() => updateCartItemQuantity(item.id, 1)}
                >
                  <Text style={styles.quantityButtonPlusText}>＋</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cartItemPrice}>¥{item.price.toFixed(2)}</Text>
            </View>
          ))}

          {/* 备注区域 */}
          <View style={styles.noteSection}>
            <TextInput
              style={styles.noteInput}
              placeholder="备注信息..."
              placeholderTextColor={COLORS.gray400}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* 底部结算区域 */}
        <View style={styles.cartFooter}>
          <View style={styles.cartSummary}>
            <Text style={styles.cartSummaryItems}>共 {totalItems} 项</Text>
            <View style={styles.cartSummaryPrice}>
              <Text style={styles.cartTotalLabel}>
                合计：<Text style={styles.cartTotalPrice}>¥ {totalPrice.toFixed(1)}</Text>
              </Text>
              <Text style={styles.cartDiscount}>已优惠：{discount.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.cartActions}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelButtonIcon}>🗑</Text>
              <Text style={styles.cancelButtonText}>整单取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>结账 ¥{totalPrice.toFixed(1)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 右侧商品区域 */}
      <View style={styles.rightPanel}>
        {/* 顶部搜索栏 */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="通过名称/拼音/条码搜索"
              placeholderTextColor={COLORS.gray400}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerItem}>
              <Image
                source={{ uri: 'https://flagcdn.com/w40/gb.png' }}
                style={styles.flagIcon}
              />
              <Text style={styles.headerItemText}>English</Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.userIcon}>👤</Text>
              <Text style={styles.headerItemText}>admin</Text>
            </View>
          </View>
        </View>

        {/* 分类标签 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === index && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(index)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === index && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 商品网格 */}
        <ScrollView
          style={styles.productsContainer}
          contentContainerStyle={styles.productsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.productsGrid}>
            {products.map(product => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImageContainer}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productBottom}>
                    <Text style={styles.productPrice}>¥{product.price.toFixed(1)}</Text>
                    <View style={styles.productQuantityControls}>
                      <TouchableOpacity
                        style={styles.productQuantityMinus}
                        onPress={() => updateProductQuantity(product.id, -1)}
                      >
                        <Text style={styles.productQuantityMinusText}>－</Text>
                      </TouchableOpacity>
                      <Text style={styles.productQuantityText}>{product.quantity}</Text>
                      <TouchableOpacity
                        style={styles.productQuantityPlus}
                        onPress={() => updateProductQuantity(product.id, 1)}
                      >
                        <Text style={styles.productQuantityPlusText}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
  },

  // ==================== 左侧面板 ====================
  leftPanel: {
    width: LEFT_PANEL_WIDTH,
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
    flexDirection: 'column',
  },

  // 购物车头部
  cartHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  cartHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  diningTypeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: 4,
  },
  diningTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  diningTypeButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  diningTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  diningTypeTextActive: {
    color: COLORS.gray900,
  },
  cartListHeader: {
    flexDirection: 'row',
  },
  cartListHeaderText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cartListHeaderQuantity: {
    flex: 0,
    width: 80,
    textAlign: 'center',
  },
  cartListHeaderPrice: {
    flex: 0,
    width: 64,
    textAlign: 'right',
  },

  // 购物车列表
  cartList: {
    flex: 1,
  },
  cartListContent: {
    padding: 16,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  cartItemSpecs: {
    fontSize: 10,
    color: COLORS.gray400,
    marginTop: 4,
  },
  cartItemComboSpecs: {
    fontSize: 10,
    color: COLORS.blue400,
    marginTop: 4,
  },
  cartItemTags: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  cartItemTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
  },
  cartItemTagText: {
    fontSize: 10,
    color: COLORS.gray600,
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'center',
    gap: 8,
  },
  quantityButtonMinus: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonMinusText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  quantityText: {
    fontSize: 14,
    color: COLORS.gray900,
    minWidth: 16,
    textAlign: 'center',
  },
  quantityButtonPlus: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPlusText: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '700',
  },
  cartItemPrice: {
    width: 64,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'right',
  },

  // 备注区域
  noteSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  noteInput: {
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    color: COLORS.gray900,
    height: 80,
  },

  // 购物车底部
  cartFooter: {
    padding: 16,
    backgroundColor: COLORS.gray50,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartSummaryItems: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  cartSummaryPrice: {
    alignItems: 'flex-end',
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  cartTotalPrice: {
    color: COLORS.primary,
  },
  cartDiscount: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.red500,
    marginTop: 2,
  },
  cartActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray700,
    borderRadius: 8,
    paddingVertical: 12,
  },
  cancelButtonIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  checkoutButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },

  // ==================== 右侧面板 ====================
  rightPanel: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    flexDirection: 'column',
  },

  // 顶部搜索栏
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchContainer: {
    flex: 1,
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: COLORS.gray400,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray900,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 24,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagIcon: {
    width: 20,
    height: 14,
    borderRadius: 2,
  },
  userIcon: {
    fontSize: 14,
  },
  headerItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray500,
  },

  // 分类标签
  categoriesContainer: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  categoryTextActive: {
    color: COLORS.black,
    fontWeight: '700',
  },

  // 商品网格
  productsContainer: {
    flex: 1,
  },
  productsContent: {
    padding: 24,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    // 4列布局：(100% - 3个间隙) / 4，正方形卡片
    width: '23.5%',
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productImageContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 6,
  },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productQuantityMinus: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productQuantityMinusText: {
    fontSize: 14,
    color: COLORS.gray400,
  },
  productQuantityText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray900,
    minWidth: 16,
    textAlign: 'center',
  },
  productQuantityPlus: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productQuantityPlusText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '700',
  },
});
