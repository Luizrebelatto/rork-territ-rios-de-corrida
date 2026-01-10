import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Medal, Crown, MapPin, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { RankingEntry } from '@/types';

type TabType = 'global' | 'groups';

export default function RankingsScreen() {
  const insets = useSafeAreaInsets();
  const { rankings, groups, user } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('global');

  const userRank = rankings.find(r => r.userId === user?.id);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.backgroundSecondary, Colors.background]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.title}>Rankings</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'global' && styles.activeTab]}
            onPress={() => setActiveTab('global')}
          >
            <Text style={[styles.tabText, activeTab === 'global' && styles.activeTabText]}>Global</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
            onPress={() => setActiveTab('groups')}
          >
            <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Groups</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'global' && (
          <>
            <View style={styles.podium}>
              {rankings.slice(0, 3).map((entry, index) => (
                <PodiumItem key={entry.userId} entry={entry} position={index + 1} />
              ))}
            </View>

            {userRank && userRank.rank > 3 && (
              <View style={styles.userRankCard}>
                <Text style={styles.userRankLabel}>Your Ranking</Text>
                <RankingRow entry={userRank} isCurrentUser />
              </View>
            )}

            <View style={styles.listContainer}>
              {rankings.slice(3).map((entry) => (
                <RankingRow 
                  key={entry.userId} 
                  entry={entry}
                  isCurrentUser={entry.userId === user?.id}
                />
              ))}
            </View>
          </>
        )}

        {activeTab === 'groups' && (
          <View style={styles.groupsContainer}>
            {groups.map((group, index) => (
              <View key={group.id} style={styles.groupCard}>
                <View style={styles.groupRank}>
                  <Text style={styles.groupRankText}>#{index + 1}</Text>
                </View>
                <View style={[styles.groupColor, { backgroundColor: group.color }]} />
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMembers}>{group.memberCount} members</Text>
                </View>
                <View style={styles.groupStats}>
                  <View style={styles.groupStat}>
                    <Zap size={14} color={Colors.primary} />
                    <Text style={styles.groupStatValue}>{group.totalPoints}</Text>
                  </View>
                  <View style={styles.groupStat}>
                    <MapPin size={14} color={Colors.secondary} />
                    <Text style={styles.groupStatValue}>{group.territoriesCount}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PodiumItem({ entry, position }: { entry: RankingEntry; position: number }) {
  const height = position === 1 ? 100 : position === 2 ? 80 : 60;
  const iconColor = position === 1 ? Colors.warning : position === 2 ? '#C0C0C0' : '#CD7F32';
  const Icon = position === 1 ? Crown : Medal;
  
  return (
    <View style={[styles.podiumItem, { order: position === 1 ? 0 : position === 2 ? -1 : 1 }]}>
      <View style={styles.podiumAvatar}>
        {entry.userAvatar ? (
          <Image source={{ uri: entry.userAvatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{entry.userName[0]}</Text>
          </View>
        )}
        <View style={[styles.podiumBadge, { backgroundColor: iconColor }]}>
          <Icon size={12} color={Colors.background} fill={Colors.background} />
        </View>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{entry.userName}</Text>
      <Text style={styles.podiumPoints}>{entry.points} pts</Text>
      <LinearGradient
        colors={[iconColor + '40', iconColor + '20']}
        style={[styles.podiumBar, { height }]}
      >
        <Text style={styles.podiumPosition}>#{position}</Text>
      </LinearGradient>
    </View>
  );
}

function RankingRow({ entry, isCurrentUser = false }: { entry: RankingEntry; isCurrentUser?: boolean }) {
  return (
    <View style={[styles.rankingRow, isCurrentUser && styles.currentUserRow]}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{entry.rank}</Text>
      </View>
      <View style={styles.rankAvatar}>
        {entry.userAvatar ? (
          <Image source={{ uri: entry.userAvatar }} style={styles.smallAvatarImage} />
        ) : (
          <View style={styles.smallAvatarPlaceholder}>
            <Text style={styles.smallAvatarText}>{entry.userName[0]}</Text>
          </View>
        )}
      </View>
      <View style={styles.rankInfo}>
        <Text style={styles.rankName}>{entry.userName}</Text>
        <Text style={styles.rankLevel}>Level {entry.level}</Text>
      </View>
      <View style={styles.rankStats}>
        <Text style={styles.rankPoints}>{entry.points}</Text>
        <Text style={styles.rankPointsLabel}>points</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    gap: 16,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumAvatar: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  podiumBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
    maxWidth: 80,
  },
  podiumPoints: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
  podiumPosition: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  userRankCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  userRankLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  currentUserRow: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  rankBadge: {
    width: 36,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  rankAvatar: {
    marginRight: 12,
  },
  smallAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  smallAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAvatarText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  rankLevel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rankStats: {
    alignItems: 'flex-end',
  },
  rankPoints: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  rankPointsLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  groupsContainer: {
    padding: 20,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  groupRank: {
    width: 32,
    alignItems: 'center',
  },
  groupRankText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  groupColor: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 14,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  groupMembers: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  groupStats: {
    flexDirection: 'row',
    gap: 16,
  },
  groupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupStatValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
