import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Crown, Medal, Globe, Flag, Users, ChevronLeft, ChevronRight, Zap, MapPin } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { RankingEntry, Group } from '@/types';
import { MOCK_RANKINGS_GLOBAL, MOCK_RANKINGS_NATIONAL } from '@/mocks/data';

const BG = '#0B1A0B';
const SURFACE = '#0F220F';
const BORDER = '#1E361E';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#7A9A7A';
const TEXT_MUTED = '#4A6A4A';
const LIME = '#B8E030';
const GOLD = '#C8960C';
const GOLD_LIGHT = '#F0C040';
const SILVER = '#9EA3A8';
const BRONZE = '#8B5E3C';

type TabType = 'mundial' | 'nacional' | 'grupos';

export default function RankingsScreen() {
  const insets = useSafeAreaInsets();
  const { groups, user } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('mundial');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const rankings = activeTab === 'mundial' ? MOCK_RANKINGS_GLOBAL : MOCK_RANKINGS_NATIONAL;
  const userRank = rankings.find(r => r.userId === user?.id);

  const groupRankings = useMemo((): RankingEntry[] => {
    if (!selectedGroup) return [];
    return selectedGroup.members
      .sort((a, b) => b.points - a.points)
      .map((member, index) => ({
        rank: index + 1,
        userId: member.userId,
        userName: member.userName,
        points: member.points,
        territoriesCount: Math.floor(member.points / 200),
        level: Math.floor(member.points / 500) + 1,
      }));
  }, [selectedGroup]);

  const groupUserRank = groupRankings.find(r => r.userId === user?.id);

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'mundial', label: 'Mundial', icon: <Globe size={14} color={activeTab === 'mundial' ? BG : TEXT_SECONDARY} /> },
    { key: 'nacional', label: 'Nacional', icon: <Flag size={14} color={activeTab === 'nacional' ? BG : TEXT_SECONDARY} /> },
    { key: 'grupos', label: 'Grupos', icon: <Users size={14} color={activeTab === 'grupos' ? BG : TEXT_SECONDARY} /> },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rankings</Text>
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <View style={styles.tabContent}>
                {tab.icon}
                <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {(activeTab === 'mundial' || activeTab === 'nacional') && (
          <>
            <View style={styles.podium}>
              {rankings.slice(0, 3).map((entry, index) => (
                <PodiumItem key={entry.userId} entry={entry} position={index + 1} showFlag={activeTab === 'mundial'} />
              ))}
            </View>

            {userRank && userRank.rank > 3 && (
              <View style={styles.userRankCard}>
                <Text style={styles.userRankLabel}>Sua Posição</Text>
                <RankingRow entry={userRank} isCurrentUser showFlag={activeTab === 'mundial'} />
              </View>
            )}

            <View style={styles.listContainer}>
              {rankings.slice(3).map((entry) => (
                <RankingRow
                  key={entry.userId}
                  entry={entry}
                  isCurrentUser={entry.userId === user?.id}
                  showFlag={activeTab === 'mundial'}
                />
              ))}
            </View>
          </>
        )}

        {activeTab === 'grupos' && !selectedGroup && (
          <View style={styles.groupsContainer}>
            {groups.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={48} color={TEXT_MUTED} />
                <Text style={styles.emptyTitle}>Nenhum grupo ainda</Text>
                <Text style={styles.emptySubtitle}>Entre ou crie um grupo para competir!</Text>
              </View>
            ) : (
              groups.map((group, index) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupCard}
                  onPress={() => setSelectedGroup(group)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.groupRankBadge, index < 3 && styles.topGroupBadge]}>
                    {index === 0 ? (
                      <Crown size={16} color={GOLD_LIGHT} fill={GOLD_LIGHT} />
                    ) : (
                      <Text style={[styles.groupRankText, index < 3 && styles.topGroupRankText]}>#{index + 1}</Text>
                    )}
                  </View>
                  <View style={[styles.groupColor, { backgroundColor: group.color }]} />
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>{group.memberCount} membros</Text>
                  </View>
                  <View style={styles.groupStats}>
                    <View style={styles.groupStat}>
                      <Zap size={13} color={LIME} fill={LIME} />
                      <Text style={styles.groupStatValue}>{group.totalPoints.toLocaleString()}</Text>
                    </View>
                    <View style={styles.groupStat}>
                      <MapPin size={13} color={LIME} />
                      <Text style={styles.groupStatValue}>{group.territoriesCount}</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={TEXT_MUTED} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'grupos' && selectedGroup && (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedGroup(null)}
            >
              <ChevronLeft size={20} color={LIME} />
              <Text style={styles.backButtonText}>Voltar aos grupos</Text>
            </TouchableOpacity>

            <View style={styles.selectedGroupHeader}>
              <View style={[styles.selectedGroupColor, { backgroundColor: selectedGroup.color }]} />
              <View style={styles.selectedGroupInfo}>
                <Text style={styles.selectedGroupName}>{selectedGroup.name}</Text>
                <Text style={styles.selectedGroupMembers}>{selectedGroup.memberCount} membros • {selectedGroup.totalPoints.toLocaleString()} pts</Text>
              </View>
            </View>

            {groupRankings.length > 0 && (
              <View style={styles.podium}>
                {groupRankings.slice(0, 3).map((entry, index) => (
                  <PodiumItem key={entry.userId} entry={entry} position={index + 1} showFlag={false} />
                ))}
              </View>
            )}

            {groupUserRank && groupUserRank.rank > 3 && (
              <View style={styles.userRankCard}>
                <Text style={styles.userRankLabel}>Sua Posição</Text>
                <RankingRow entry={groupUserRank} isCurrentUser showFlag={false} />
              </View>
            )}

            <View style={styles.listContainer}>
              {groupRankings.slice(3).map((entry) => (
                <RankingRow
                  key={entry.userId}
                  entry={entry}
                  isCurrentUser={entry.userId === user?.id}
                  showFlag={false}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function PodiumItem({ entry, position, showFlag }: { entry: RankingEntry; position: number; showFlag?: boolean }) {
  const barHeight = position === 1 ? 100 : position === 2 ? 78 : 58;
  const badgeColor = position === 1 ? GOLD : position === 2 ? SILVER : BRONZE;
  const Icon = position === 1 ? Crown : Medal;

  return (
    <View style={[styles.podiumItem, position === 2 && { marginBottom: 22 }, position === 3 && { marginBottom: 42 }]}>
      <View style={styles.podiumAvatar}>
        {entry.userAvatar ? (
          <Image source={{ uri: entry.userAvatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{entry.userName[0]}</Text>
          </View>
        )}
        <View style={[styles.podiumBadge, { backgroundColor: badgeColor }]}>
          <Icon size={11} color={BG} fill={BG} />
        </View>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{entry.userName}</Text>
      {showFlag && entry.countryFlag && (
        <Text style={styles.podiumFlag}>{entry.countryFlag}</Text>
      )}
      <Text style={styles.podiumPoints}>{entry.points.toLocaleString()} pts</Text>
      <View style={[styles.podiumBar, { height: barHeight, backgroundColor: badgeColor + '30', borderTopColor: badgeColor + '60' }]}>
        <Text style={[styles.podiumPosition, { color: badgeColor }]}>#{position}</Text>
      </View>
    </View>
  );
}

function RankingRow({ entry, isCurrentUser = false, showFlag = false }: { entry: RankingEntry; isCurrentUser?: boolean; showFlag?: boolean }) {
  return (
    <View style={[styles.rankingRow, isCurrentUser && styles.currentUserRow]}>
      <Text style={styles.rankText}>#{entry.rank}</Text>
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
        <View style={styles.rankNameRow}>
          <Text style={styles.rankName}>{entry.userName}</Text>
          {showFlag && entry.countryFlag && (
            <Text style={styles.rankFlag}>{entry.countryFlag}</Text>
          )}
        </View>
        <Text style={styles.rankLevel}>Nível {entry.level}</Text>
      </View>
      <View style={styles.rankStats}>
        <Text style={styles.rankPoints}>{entry.points.toLocaleString()}</Text>
        <Text style={styles.rankPointsLabel}>pontos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: LIME,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
  },
  activeTabText: {
    color: BG,
  },
  scrollView: {
    flex: 1,
  },

  // Podium
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 12,
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
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: LIME,
  },
  podiumBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BG,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
    marginBottom: 2,
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumFlag: {
    fontSize: 14,
    marginBottom: 2,
  },
  podiumPoints: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderTopWidth: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
  podiumPosition: {
    fontSize: 15,
    fontWeight: '800' as const,
  },

  // User rank card
  userRankCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: LIME + '12',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: LIME + '30',
  },
  userRankLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: LIME,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // List
  listContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  currentUserRow: {
    backgroundColor: LIME + '12',
    borderColor: LIME + '40',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: TEXT_MUTED,
    width: 28,
  },
  rankAvatar: {},
  smallAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  smallAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAvatarText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: LIME,
  },
  rankInfo: {
    flex: 1,
  },
  rankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },
  rankFlag: {
    fontSize: 13,
  },
  rankLevel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 1,
  },
  rankStats: {
    alignItems: 'flex-end',
  },
  rankPoints: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: LIME,
  },
  rankPointsLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
  },

  // Groups
  groupsContainer: {
    padding: 20,
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  groupRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topGroupBadge: {
    backgroundColor: GOLD + '20',
    borderColor: GOLD + '50',
  },
  groupRankText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: TEXT_SECONDARY,
  },
  topGroupRankText: {
    color: GOLD_LIGHT,
  },
  groupColor: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },
  groupMembers: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  groupStats: {
    gap: 6,
    alignItems: 'flex-end',
  },
  groupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupStatValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 4,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: LIME,
  },
  selectedGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 14,
  },
  selectedGroupColor: {
    width: 5,
    height: 44,
    borderRadius: 3,
  },
  selectedGroupInfo: {
    flex: 1,
  },
  selectedGroupName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  selectedGroupMembers: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
});
