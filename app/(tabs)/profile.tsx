import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  Crown,
  Star,
  Lock,
  FileText,
  Trophy,
  MapPin,
  LogOut,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getLevelInfo } from '@/constants/levels';

const BG = '#0B1A0B';
const SURFACE = '#0F220F';
const BORDER_DEFAULT = '#1E361E';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#7A9A7A';
const TEXT_MUTED = '#4A6A4A';
const LIME = '#B8E030';
const LIME_TEXT = '#0B1A0B';
const GOLD = '#C8960C';
const GOLD_LIGHT = '#F0C040';
const GOLD_BG = '#1A1400';
const GOLD_BORDER = '#8B6914';
const RED = '#E05A4B';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, userTerritories } = useApp();

  const levelInfo = user ? getLevelInfo(user.xp) : null;
  const badgesEarned = 15;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Profile Row */}
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{user.name[0]}</Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userGroups}>
              <Text style={styles.groupsLabel}>Groups: </Text>
              City Sprinters, Global Conquerors
            </Text>
          </View>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Trophy size={22} color={LIME} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Badges{'\n'}Earned:</Text>
              <Text style={styles.statValue}>{badgesEarned}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <MapPin size={22} color={LIME} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Territories{'\n'}Conquered:</Text>
              <Text style={styles.statValue}>{user.territoriesCount}</Text>
            </View>
          </View>
        </View>

        {/* Premium Card */}
        {!user.isPremium && (
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.85}
          >
            <View style={styles.premiumTop}>
              <View style={styles.premiumTag}>
                <Crown size={13} color={GOLD_LIGHT} fill={GOLD_LIGHT} />
                <Text style={styles.premiumTagText}>Premium</Text>
              </View>
              <View style={styles.premiumMedal}>
                <Star size={22} color={GOLD_LIGHT} fill={GOLD_LIGHT} />
              </View>
            </View>
            <Text style={styles.premiumTitle}>Go PRO!</Text>
            <Text style={styles.premiumSubtitle}>Unlock all features & more stats.</Text>
            <View style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem icon={<Star size={18} color={LIME} />} label="Rate the App" />
          <MenuItem icon={<Lock size={18} color={LIME} />} label="Privacy Policy" />
          <MenuItem icon={<FileText size={18} color={LIME} />} label="Terms of Service" />
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
      <View style={styles.menuIconBox}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
      <ChevronDown size={18} color={TEXT_MUTED} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  // Profile Row
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    marginTop: 4,
  },
  avatarWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: LIME,
  },
  avatar: {
    width: 90,
    height: 90,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: LIME,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
  },
  userGroups: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  groupsLabel: {
    color: TEXT_SECONDARY,
    fontWeight: '600' as const,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    padding: 14,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: LIME + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 16,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
    marginTop: 2,
  },

  // Premium Card
  premiumCard: {
    backgroundColor: '#0D1A08',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GOLD_BORDER,
    padding: 18,
    marginBottom: 20,
  },
  premiumTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GOLD_BG,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumTagText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GOLD_LIGHT,
  },
  premiumMedal: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: GOLD_BG,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A0F00',
  },

  // Menu
  menuSection: {
    gap: 10,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: SURFACE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: LIME + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },

  // Logout
  logoutButton: {
    backgroundColor: RED,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
  },
});
