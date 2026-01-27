import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, MapPin, Zap, Route, Crown, ChevronRight, LogOut, Award, TrendingUp, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { getLevelInfo } from '@/constants/levels';

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
          colors={[Colors.primary + '15', Colors.background]}
          style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerActions}>
            <View style={{ width: 44 }} />
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarText}>{user.name[0]}</Text>
                </LinearGradient>
              )}
              {user.isPremium && (
                <View style={styles.premiumBadge}>
                  <Crown size={14} color={Colors.background} fill={Colors.background} />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.levelTag}>
              <Award size={14} color={Colors.warning} />
              <Text style={styles.levelTagText}>Level {levelInfo?.level} • {levelInfo?.title}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelXpText}>{user.xp} XP</Text>
            </View>
            <Text style={styles.levelProgressLabel}>
              {levelInfo?.xpToNextLevel} XP to Level {(levelInfo?.level || 1) + 1}
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
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primaryMuted }]}>
              <Zap size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{user.totalPoints.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondaryMuted }]}>
              <MapPin size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>{user.territoriesCount}</Text>
            <Text style={styles.statLabel}>Territories</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.accentMuted }]}>
              <Route size={24} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{user.totalDistance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>km Run</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warningMuted }]}>
              <TrendingUp size={24} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{Math.round(user.totalDistance / 5) || 0}</Text>
            <Text style={styles.statLabel}>Total Runs</Text>
          </View>
        </View>

        {!user.isPremium && (
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.warning + '20', Colors.warning + '08']}
              style={styles.premiumGradient}
            >
              <View style={styles.premiumContent}>
                <View style={styles.premiumIconContainer}>
                  <Crown size={28} color={Colors.warning} />
                </View>
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>Upgrade to Pro</Text>
                  <Text style={styles.premiumDescription}>Unlimited territories & advanced stats</Text>
                </View>
              </View>
              <ChevronRight size={22} color={Colors.warning} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.territoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Territories</Text>
            <Text style={styles.sectionCount}>{userTerritories.length}</Text>
          </View>
          {userTerritories.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Target size={40} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyText}>No territories yet</Text>
              <Text style={styles.emptySubtext}>Start running to conquer your first area!</Text>
            </View>
          ) : (
            userTerritories.map((territory) => (
              <View key={territory.id} style={styles.territoryItem}>
                <View style={[styles.territoryColor, { backgroundColor: territory.color }]} />
                <View style={styles.territoryInfo}>
                  <Text style={styles.territoryName}>{territory.name}</Text>
                  <Text style={styles.territoryMeta}>
                    {territory.area.toFixed(2)} km² • {territory.pointsValue} pts
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.textTertiary} />
              </View>
            ))
          )}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Privacy Policy</Text>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Terms of Service</Text>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Help & Support</Text>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 28,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  levelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warningMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelTagText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  levelCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  levelInfo: {},
  levelXpText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  levelProgressLabel: {
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
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  premiumCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 18,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    borderRadius: 18,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  premiumIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.warningMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumText: {},
  premiumTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  premiumDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  territoriesSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  territoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  territoryColor: {
    width: 6,
    height: 44,
    borderRadius: 3,
    marginRight: 14,
  },
  territoryInfo: {
    flex: 1,
  },
  territoryName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  territoryMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
  },
  logoutItem: {
    justifyContent: 'flex-start',
    gap: 12,
    borderBottomWidth: 0,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600' as const,
  },
});
