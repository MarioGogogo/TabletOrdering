/**
 * 会员管理页面
 *
 * 会员信息与积分管理
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme/colors';

interface Member {
  id: number;
  name: string;
  phone: string;
  points: number;
  level: string;
}

const members: Member[] = [
  { id: 1, name: '张三', phone: '138****8888', points: 2560, level: '黄金会员' },
  { id: 2, name: '李四', phone: '139****6666', points: 1280, level: '白银会员' },
  { id: 3, name: '王五', phone: '136****5555', points: 5200, level: '钻石会员' },
  { id: 4, name: '赵六', phone: '137****4444', points: 680, level: '普通会员' },
];

const getLevelColor = (level: string) => {
  switch (level) {
    case '钻石会员': return '#F59E0B';
    case '黄金会员': return '#EAB308';
    case '白银会员': return '#94A3B8';
    default: return '#64748B';
  }
};

export default function MemberScreen() {
  return (
    <View style={styles.pageContent}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitleLarge}>会员管理</Text>
        <Text style={styles.pageSubtitle}>会员信息与积分管理</Text>
      </View>

      {/* 会员统计 */}
      <View style={styles.memberStats}>
        <View style={styles.memberStatCard}>
          <Text style={styles.memberStatValue}>1,234</Text>
          <Text style={styles.memberStatLabel}>会员总数</Text>
        </View>
        <View style={styles.memberStatCard}>
          <Text style={styles.memberStatValue}>56,780</Text>
          <Text style={styles.memberStatLabel}>总积分</Text>
        </View>
        <View style={styles.memberStatCard}>
          <Text style={styles.memberStatValue}>¥128,560</Text>
          <Text style={styles.memberStatLabel}>总消费</Text>
        </View>
      </View>

      {/* 会员列表 */}
      <View style={styles.memberList}>
        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberCard}
            activeOpacity={0.9}
          >
            <View style={styles.memberInfo}>
              <View style={[styles.memberAvatar, { backgroundColor: getLevelColor(member.level) + '20' }]}>
                <Text style={styles.memberAvatarText}>{member.name[0]}</Text>
              </View>
              <View style={styles.memberDetail}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={[styles.memberLevel, { backgroundColor: getLevelColor(member.level) + '15' }]}>
                    <Text style={[styles.memberLevelText, { color: getLevelColor(member.level) }]}>
                      {member.level}
                    </Text>
                  </View>
                </View>
                <Text style={styles.memberPhone}>{member.phone}</Text>
              </View>
            </View>
            <View style={styles.memberPoints}>
              <Text style={styles.memberPointsValue}>{member.points}</Text>
              <Text style={styles.memberPointsLabel}>积分</Text>
            </View>
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
  memberStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  memberStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  memberStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  memberStatLabel: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  memberList: {
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  memberDetail: {
    gap: 4,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  memberLevel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberLevelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  memberPhone: {
    fontSize: 12,
    color: COLORS.gray500,
    fontFamily: 'monospace',
  },
  memberPoints: {
    alignItems: 'flex-end',
  },
  memberPointsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  memberPointsLabel: {
    fontSize: 11,
    color: COLORS.gray500,
  },
});
