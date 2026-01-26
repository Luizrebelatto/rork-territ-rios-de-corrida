import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Plus, Search, MapPin, Zap, Crown, X, Check, Medal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Group } from '@/types';

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
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.backgroundSecondary, Colors.background]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Groups</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color={Colors.background} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

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

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <CreateGroupModal onClose={() => setShowCreateModal(false)} />
      </Modal>

      <Modal
        visible={!!selectedGroup}
        animationType="slide"
        presentationStyle="pageSheet"
      >
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
      <View style={[styles.groupAvatar, { backgroundColor: group.color + '30' }]}>
        <Users size={24} color={group.color} />
      </View>
      <View style={styles.groupInfo}>
        <View style={styles.groupNameRow}>
          <Text style={styles.groupName}>{group.name}</Text>
          {isMember && (
            <View style={styles.memberBadge}>
              <Check size={12} color={Colors.primary} />
            </View>
          )}
        </View>
        <Text style={styles.groupDescription} numberOfLines={1}>
          {group.description || `${group.memberCount} members`}
        </Text>
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
        <TouchableOpacity onPress={onClose}>
          <X size={24} color={Colors.textSecondary} />
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
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="What is this group about?"
            placeholderTextColor={Colors.textTertiary}
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
                {selectedColor === color && <Check size={18} color={Colors.background} />}
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
        <TouchableOpacity onPress={onClose}>
          <X size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{group.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={styles.groupDetailStats}>
          <View style={styles.groupDetailStat}>
            <Text style={styles.groupDetailStatValue}>{group.memberCount}</Text>
            <Text style={styles.groupDetailStatLabel}>Membros</Text>
          </View>
          <View style={styles.groupDetailStat}>
            <Text style={styles.groupDetailStatValue}>{group.totalPoints.toLocaleString()}</Text>
            <Text style={styles.groupDetailStatLabel}>Pontos</Text>
          </View>
          <View style={styles.groupDetailStat}>
            <Text style={styles.groupDetailStatValue}>{group.territoriesCount}</Text>
            <Text style={styles.groupDetailStatLabel}>Territórios</Text>
          </View>
        </View>

        {top3.length > 0 && (
          <View style={styles.podium}>
            {top3.map((member, index) => (
              <GroupPodiumItem key={member.userId} member={member} position={index + 1} groupColor={group.color} />
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
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.joinButtonGradient}
            >
              <Text style={styles.joinButtonText}>Entrar no Grupo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function GroupPodiumItem({ member, position, groupColor }: { member: Group['members'][0] & { rank: number }; position: number; groupColor: string }) {
  const height = position === 1 ? 100 : position === 2 ? 80 : 60;
  const iconColor = position === 1 ? Colors.warning : position === 2 ? '#C0C0C0' : '#CD7F32';
  const Icon = position === 1 ? Crown : Medal;
  
  return (
    <View style={[styles.podiumItem, { order: position === 1 ? 0 : position === 2 ? -1 : 1 }]}>
      <View style={styles.podiumAvatar}>
        {member.userAvatar ? (
          <Image source={{ uri: member.userAvatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{member.userName[0]}</Text>
          </View>
        )}
        <View style={[styles.podiumBadge, { backgroundColor: iconColor }]}>
          <Icon size={12} color={Colors.background} fill={Colors.background} />
        </View>
        {member.role === 'owner' && (
          <View style={styles.ownerBadge}>
            <Crown size={10} color={Colors.warning} fill={Colors.warning} />
          </View>
        )}
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{member.userName}</Text>
      <Text style={styles.podiumPoints}>{member.points.toLocaleString()} pts</Text>
      <LinearGradient
        colors={[iconColor + '40', iconColor + '20']}
        style={[styles.podiumBar, { height }]}
      >
        <Text style={styles.podiumPosition}>#{position}</Text>
      </LinearGradient>
    </View>
  );
}

function GroupMemberRankRow({ member, isCurrentUser = false }: { member: Group['members'][0] & { rank: number }; isCurrentUser?: boolean }) {
  return (
    <View style={[styles.rankingRow, isCurrentUser && styles.currentUserRow]}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{member.rank}</Text>
      </View>
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
            <Crown size={12} color={Colors.warning} fill={Colors.warning} />
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
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
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
    color: Colors.text,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  memberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  groupStats: {
    gap: 8,
  },
  groupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupStatValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  createText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  createTextDisabled: {
    color: Colors.textTertiary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
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
    borderColor: Colors.text,
  },
  groupDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  groupDetailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupDetailName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  groupDetailDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  groupDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  groupDetailStat: {
    alignItems: 'center',
  },
  groupDetailStatValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  groupDetailStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  membersSection: {
    marginBottom: 24,
  },
  membersSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberAvatar: {
    marginRight: 12,
  },
  memberAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  memberPoints: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
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
  ownerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.warning + '30',
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
  rankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  rankRole: {
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
  joinButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  joinButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});
