/**
 * 订单管理页面
 *
 * 查看和处理订单
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme/colors';

interface Order {
  id: string;
  table: string;
  items: number;
  total: string;
  status: 'preparing' | 'served' | 'pending' | 'paid';
  time: string;
}

const orders: Order[] = [
  { id: '20240116001', table: '05号桌', items: 3, total: '128', status: 'preparing', time: '14:23' },
  { id: '20240116002', table: '02号桌', items: 5, total: '256', status: 'served', time: '14:15' },
  { id: '20240116003', table: '07号桌', items: 2, total: '68', status: 'pending', time: '14:10' },
  { id: '20240116004', table: '03号桌', items: 8, total: '520', status: 'paid', time: '13:45' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'preparing': return { color: '#F59E0B', text: '准备中' };
    case 'served': return { color: '#10B981', text: '已上菜' };
    case 'pending': return { color: '#6366f1', text: '待处理' };
    case 'paid': return { color: '#94A3B8', text: '已付款' };
    default: return { color: '#94A3B8', text: status };
  }
};

export default function OrdersScreen() {
  return (
    <View style={styles.pageContent}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitleLarge}>订单管理</Text>
        <Text style={styles.pageSubtitle}>查看和处理订单</Text>
      </View>

      <View style={styles.orderList}>
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          return (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              activeOpacity={0.9}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderTable}>{order.table}</Text>
                </View>
                <Text style={styles.orderTime}>{order.time}</Text>
              </View>
              <View style={styles.orderBody}>
                <Text style={styles.orderItems}>共 {order.items} 道菜</Text>
                <Text style={styles.orderTotal}>¥{order.total}</Text>
              </View>
              <View style={styles.orderFooter}>
                <View style={[styles.orderStatus, { backgroundColor: statusConfig.color + '15' }]}>
                  <Text style={[styles.orderStatusText, { color: statusConfig.color }]}>
                    {statusConfig.text}
                  </Text>
                </View>
                <View style={styles.orderAction}>
                  <Text style={styles.orderActionText}>查看详情</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    flex: 1,
  },
  pageHeader: {
    marginBottom: 24,
  },
  pageTitleLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    color: COLORS.gray500,
  },
  orderList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
    fontFamily: 'monospace',
  },
  orderTable: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  orderTime: {
    fontSize: 12,
    color: COLORS.gray400,
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderItems: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderAction: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  orderActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});
