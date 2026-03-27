import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Plus, Search, MapPin, Zap, Crown, X, Check, Medal } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Group } from '@/types';

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

export default function GroupsScreen() {
  const insets = useSafeAreaInsets();
  const { groups, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myGroups = groups.filter(g =>
    g.members.some(m => m.userId === user?.id)
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Groups</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color={BG} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={18} color={TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            placeholderTextColor={TEXT_MUTED}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {myGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Groups</Text>
            {myGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() => setSelectedGroup(group)}
                isMember
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover Groups</Text>
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onPress={() => setSelectedGroup(group)}
              isMember={myGroups.some(g => g.id === group.id)}
            />
          ))}
        </View>
      </ScrollView>

      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
        <CreateGroupModal onClose={() => setShowCreateModal(false)} />
      </Modal>

      <Modal visible={!!selectedGroup} animationType="slide" presentationStyle="pageSheet">
        {selectedGroup && (
          <GroupDetailModal
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            isMember={myGroups.some(g => g.id === selectedGroup.id)}
          />
        )}
      </Modal>
    </View>
  );
}

function GroupCard({ group, onPress, isMember }: { group: Group; onPress: () => void; isMember: boolean }) {
  return (
    <TouchableOpacity style={styles.groupCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.groupAvatar, { backgroundColor: group.color + '25' }]}>
        <Users size={22} color={group.color} />
      </View>
      <View style={styles.groupInfo}>
        <View style={styles.groupNameRow}>
          <Text style={styles.groupName}>{group.name}</Text>
          {isMember && (
            <View style={styles.memberBadge}>
              <Check size={11} color={LIME} />
            </View>
          )}
        </View>
        <Text style={styles.groupDescription} numberOfLines={1}>
          {group.description || `${group.memberCount} members`}
        </Text>
      </View>
      <View style={styles.groupStats}>
        <View style={styles.groupStat}>
          <Zap size={13} color={LIME} fill={LIME} />
          <Text style={styles.groupStatValue}>{group.totalPoints}</Text>
        </View>
        <View style={styles.groupStat}>
          <MapPin size={13} color={LIME} />
          <Text style={styles.groupStatValue}>{group.territoriesCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(Colors.territoryColors[0]);

  const handleCreate = () => {
    console.log('Creating group:', { name, description, selectedColor });
    onClose();
  };

  return (
    <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
      <View style={styles.modalHeader}>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <X size={20} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Create Group</Text>
        <TouchableOpacity onPress={handleCreate} disabled={!name.trim()}>
          <Text style={[styles.createText, !name.trim() && styles.createTextDisabled]}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Group Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter group name"
            placeholderTextColor={TEXT_MUTED}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="What is this group about?"
            placeholderTextColor={TEXT_MUTED}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Group Color</Text>
          <View style={styles.colorGrid}>
            {Colors.territoryColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && <Check size={18} color={BG} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function GroupDetailModal({ group, onClose, isMember }: { group: Group; onClose: () => void; isMember: boolean }) {
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  const handleJoin = () => {
    console.log('Joining group:', group.id);
    onClose();
  };

  const sortedMembers = [...group.members].sort((a, b) => b.points - a.points).map((m, i) => ({ ...m, rank: i + 1 }));
  const top3 = sortedMembers.slice(0, 3);
  const rest = sortedMembers.slice(3);
  const userMember = sortedMembers.find(m => m.userId === user?.id);

  return (
    <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
      <View style={styles.modalHeader}>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <X size={20} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{group.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={styles.groupDetailStats}>
          <View style={styles.groupDetailStat}>
            <Text style={styles.groupDetailStatValue}>{group.memberCount}</Text>
            <Text style={styles.groupDetailStatLabel}>Membros</Text>
          </View>
          <View style={styles.groupDetailStatDivider} />
          <View style={styles.groupDetailStat}>
            <Text style={styles.groupDetailStatValue}>{group.totalPoints.toLocaleString()}</Text>
            <Text style={styles.groupDetailStatLabel}>Pontos</Text>
          </View>
          <View style={styles.groupDetailStatDivider} />
          <View style={styles.groupDetailStat}>
            <Text style={styles.groupDetailStatValue}>{group.territoriesCount}</Text>
            <Text style={styles.groupDetailStatLabel}>Territórios</Text>
          </View>
        </View>

        {top3.length > 0 && (
          <View style={styles.podium}>
            {top3.map((member, index) => (
              <GroupPodiumItem key={member.userId} member={member} position={index + 1} />
            ))}
          </View>
        )}

        {userMember && userMember.rank > 3 && (
          <View style={styles.userRankCard}>
            <Text style={styles.userRankLabel}>Sua Posição</Text>
            <GroupMemberRankRow member={userMember} isCurrentUser />
          </View>
        )}

        {rest.length > 0 && (
          <View style={styles.membersSection}>
            <Text style={styles.membersSectionTitle}>Ranking do Grupo</Text>
            {rest.map((member) => (
              <GroupMemberRankRow
                key={member.userId}
                member={member}
                isCurrentUser={member.userId === user?.id}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {!isMember && (
        <View style={[styles.joinButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>Entrar no Grupo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function GroupPodiumItem({ member, position }: { member: Group['members'][0] & { rank: number }; position: number }) {
  const barHeight = position === 1 ? 100 : position === 2 ? 78 : 58;
  const badgeColor = position === 1 ? GOLD : position === 2 ? SILVER : BRONZE;
  const Icon = position === 1 ? Crown : Medal;

  return (
    <View style={[styles.podiumItem, position === 2 && { marginBottom: 22 }, position === 3 && { marginBottom: 42 }]}>
      <View style={styles.podiumAvatar}>
        {member.userAvatar ? (
          <Image source={{ uri: member.userAvatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{member.userName[0]}</Text>
          </View>
        )}
        <View style={[styles.podiumBadge, { backgroundColor: badgeColor }]}>
          <Icon size={11} color={BG} fill={BG} />
        </View>
        {member.role === 'owner' && (
          <View style={styles.ownerBadge}>
            <Crown size={10} color={GOLD_LIGHT} fill={GOLD_LIGHT} />
          </View>
        )}
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{member.userName}</Text>
      <Text style={styles.podiumPoints}>{member.points.toLocaleString()} pts</Text>
      <View style={[styles.podiumBar, { height: barHeight, backgroundColor: badgeColor + '30', borderTopColor: badgeColor + '60' }]}>
        <Text style={[styles.podiumPosition, { color: badgeColor }]}>#{position}</Text>
      </View>
    </View>
  );
}

function GroupMemberRankRow({ member, isCurrentUser = false }: { member: Group['members'][0] & { rank: number }; isCurrentUser?: boolean }) {
  return (
    <View style={[styles.rankingRow, isCurrentUser && styles.currentUserRow]}>
      <Text style={styles.rankText}>#{member.rank}</Text>
      <View style={styles.rankAvatar}>
        {member.userAvatar ? (
          <Image source={{ uri: member.userAvatar }} style={styles.smallAvatarImage} />
        ) : (
          <View style={styles.smallAvatarPlaceholder}>
            <Text style={styles.smallAvatarText}>{member.userName[0]}</Text>
          </View>
        )}
      </View>
      <View style={styles.rankInfo}>
        <View style={styles.rankNameRow}>
          <Text style={styles.rankName}>{member.userName}</Text>
          {member.role === 'owner' && (
            <Crown size={12} color={GOLD_LIGHT} fill={GOLD_LIGHT} />
          )}
        </View>
        <Text style={styles.rankRole}>
          {member.role === 'owner' ? 'Dono' : member.role === 'admin' ? 'Admin' : 'Membro'}
        </Text>
      </View>
      <View style={styles.rankStats}>
        <Text style={styles.rankPoints}>{member.points.toLocaleString()}</Text>
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

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: LIME,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  scrollView: {
    flex: 1,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: TEXT_SECONDARY,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Group Card
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  groupAvatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },
  memberBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: LIME + '25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupDescription: {
    fontSize: 13,
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

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: BG,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
  },
  createText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: LIME,
  },
  createTextDisabled: {
    color: TEXT_MUTED,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },

  // Inputs
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: SURFACE,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: BORDER,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: TEXT_PRIMARY,
  },

  // Group Detail Stats
  groupDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 20,
  },
  groupDetailStat: {
    alignItems: 'center',
    flex: 1,
  },
  groupDetailStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: BORDER,
  },
  groupDetailStatValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
  },
  groupDetailStatLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },

  // Podium
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 24,
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
  ownerBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GOLD + '30',
    borderWidth: 1.5,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
    marginBottom: 2,
    maxWidth: 80,
    textAlign: 'center',
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

  // User rank
  userRankCard: {
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

  // Members list
  membersSection: {
    marginBottom: 24,
  },
  membersSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: TEXT_SECONDARY,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    marginBottom: 8,
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
  rankRole: {
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

  // Join button
  joinButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  joinButton: {
    backgroundColor: LIME,
    borderRadius: 10,
    paddingVertical: 17,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: BG,
  },
});
