/**
 * 桌台管理页面
 *
 * 实时查看和管理桌台状态
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme/colors';

interface Table {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  seats: number;
}

const tables: Table[] = [
  { id: 1, name: '01号桌', status: 'available', seats: 4 },
  { id: 2, name: '02号桌', status: 'occupied', seats: 4 },
  { id: 3, name: '03号桌', status: 'reserved', seats: 6 },
  { id: 4, name: '04号桌', status: 'available', seats: 2 },
  { id: 5, name: '05号桌', status: 'occupied', seats: 6 },
  { id: 6, name: '06号桌', status: 'available', seats: 8 },
  { id: 7, name: '07号桌', status: 'cleaning', seats: 4 },
  { id: 8, name: '08号桌', status: 'available', seats: 4 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return '#10B981';
    case 'occupied': return '#EF4444';
    case 'reserved': return '#F59E0B';
    case 'cleaning': return '#6366f1';
    default: return '#94A3B8';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return '空闲';
    case 'occupied': return '使用中';
    case 'reserved': return '已预订';
    case 'cleaning': return '清洁中';
    default: return status;
  }
};

export default function TableScreen() {
  return (
    <View style={styles.pageContent}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitleLarge}>桌台管理</Text>
        <Text style={styles.pageSubtitle}>实时查看桌台状态</Text>
      </View>

      <View style={styles.tableGrid}>
        {tables.map((table) => (
          <TouchableOpacity key={table.id} style={styles.tableCard} activeOpacity={0.7}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableName}>{table.name}</Text>
              <View style={[styles.tableStatus, { backgroundColor: getStatusColor(table.status) + '20' }]}>
                <View style={[styles.tableStatusDot, { backgroundColor: getStatusColor(table.status) }]} />
                <Text style={[styles.tableStatusText, { color: getStatusColor(table.status) }]}>
                  {getStatusText(table.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.tableSeats}>可容纳 {table.seats} 人</Text>
          </TouchableOpacity>
        ))}
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
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tableCard: {
    width: 180,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  tableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tableStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tableStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tableSeats: {
    fontSize: 12,
    color: COLORS.gray500,
  },
});
