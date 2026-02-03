import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, Zap, Route, Crown, ChevronRight, LogOut, Target, Shield, Grid3x3, Star, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { getLevelInfo } from '@/constants/levels';

const BADGES = [
  { id: '1', name: 'First Blood', icon: Target, color: Colors.accent, unlocked: true },
  { id: '2', name: '10km Club', icon: Route, color: Colors.secondary, unlocked: true },
  { id: '3', name: 'Conqueror', icon: Shield, color: Colors.primary, unlocked: false },
  { id: '4', name: 'Marathon', icon: Trophy, color: Colors.warning, unlocked: false },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, userTerritories } = useApp();

  const levelInfo = user ? getLevelInfo(user.xp) : null;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.primary + '12', Colors.background]}
          style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.headerActions}>
            <View style={{ width: 46 }} />
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark] as const}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarText}>{user.name[0]}</Text>
                </LinearGradient>
              )}
              <View style={styles.levelRing}>
                <Text style={styles.levelRingText}>{levelInfo?.level}</Text>
              </View>
              {user.isPremium && (
                <View style={styles.premiumBadge}>
                  <Crown size={12} color={Colors.background} fill={Colors.background} />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.titleTag}>
              <Star size={12} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.titleText}>{levelInfo?.title}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View style={styles.xpInfo}>
              <Zap size={18} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.xpText}>{user.xp} XP</Text>
            </View>
            <Text style={styles.xpToNext}>
              {levelInfo?.xpToNextLevel} to Lvl {(levelInfo?.level || 1) + 1}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${(levelInfo?.progress || 0) * 100}%` }]}
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard 
            icon={<Zap size={22} color={Colors.warning} />}
            value={user.totalPoints.toLocaleString()}
            label="Points"
            color={Colors.warning}
          />
          <StatCard 
            icon={<Shield size={22} color={Colors.primary} />}
            value={user.territoriesCount.toString()}
            label="Territories"
            color={Colors.primary}
          />
          <StatCard 
            icon={<Route size={22} color={Colors.secondary} />}
            value={user.totalDistance.toFixed(1)}
            label="km Total"
            color={Colors.secondary}
          />
          <StatCard 
            icon={<Grid3x3 size={22} color={Colors.tertiary} />}
            value={(Math.round(user.totalDistance / 5) || 0).toString()}
            label="Runs"
            color={Colors.tertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </View>
        </View>

        {!user.isPremium && (
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.warning + '18', Colors.warning + '05']}
              style={styles.premiumGradient}
            >
              <View style={styles.premiumContent}>
                <View style={styles.premiumIconContainer}>
                  <Crown size={24} color={Colors.warning} />
                </View>
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>Go Pro</Text>
                  <Text style={styles.premiumDescription}>Unlimited territories & stats</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.warning} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Territories</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{userTerritories.length}</Text>
            </View>
          </View>
          {userTerritories.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Target size={36} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyText}>No territories yet</Text>
              <Text style={styles.emptySubtext}>Start running to conquer areas!</Text>
            </View>
          ) : (
            userTerritories.map((territory) => (
              <TouchableOpacity key={territory.id} style={styles.territoryItem} activeOpacity={0.7}>
                <View style={[styles.territoryColor, { backgroundColor: territory.color }]} />
                <View style={styles.territoryInfo}>
                  <Text style={styles.territoryName}>{territory.name}</Text>
                  <View style={styles.territoryMeta}>
                    <Text style={styles.territoryArea}>{territory.area.toFixed(2)} km²</Text>
                    <View style={styles.territoryPoints}>
                      <Zap size={12} color={Colors.warning} />
                      <Text style={styles.territoryPointsText}>{territory.pointsValue}</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Privacy Policy</Text>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Terms of Service</Text>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Help & Support</Text>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={18} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '12' }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BadgeItem({ badge }: { badge: typeof BADGES[0] }) {
  const IconComponent = badge.icon;
  return (
    <View style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}>
      <View style={[styles.badgeIcon, { backgroundColor: badge.unlocked ? badge.color + '18' : Colors.surface }]}>
        <IconComponent size={20} color={badge.unlocked ? badge.color : Colors.textTertiary} />
      </View>
      <Text style={[styles.badgeName, !badge.unlocked && styles.badgeNameLocked]}>{badge.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingsButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  levelRing: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -18,
    width: 36,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  levelRingText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  titleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warningMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  xpCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  xpToNext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  countBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeItem: {
    width: '23%',
    alignItems: 'center',
    padding: 10,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: Colors.textTertiary,
  },
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '25',
    borderRadius: 16,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  premiumIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.warningMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumText: {},
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  premiumDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  territoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  territoryColor: {
    width: 5,
    height: 40,
    borderRadius: 3,
    marginRight: 14,
  },
  territoryInfo: {
    flex: 1,
  },
  territoryName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  territoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  territoryArea: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  territoryPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  territoryPointsText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    fontSize: 15,
    color: Colors.text,
  },
  logoutItem: {
    justifyContent: 'flex-start',
    gap: 10,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 15,
    color: Colors.error,
    fontWeight: '600' as const,
  },
});
