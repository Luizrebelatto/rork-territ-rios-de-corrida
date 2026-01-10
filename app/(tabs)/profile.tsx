import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, MapPin, Zap, Route, Crown, ChevronRight, LogOut, Award } from 'lucide-react-native';
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.primary + '20', Colors.background]}
          style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerActions}>
            <View style={{ width: 40 }} />
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{user.name[0]}</Text>
                </View>
              )}
              {user.isPremium && (
                <View style={styles.premiumBadge}>
                  <Crown size={14} color={Colors.background} fill={Colors.background} />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelInfo}>
                <Award size={20} color={Colors.warning} />
                <Text style={styles.levelTitle}>{levelInfo?.title}</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>Lvl {levelInfo?.level}</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${(levelInfo?.progress || 0) * 100}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {levelInfo?.xpToNextLevel} XP to Level {(levelInfo?.level || 1) + 1}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Zap size={22} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{user.totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondary + '20' }]}>
              <MapPin size={22} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>{user.territoriesCount}</Text>
            <Text style={styles.statLabel}>Territories</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.accent + '20' }]}>
              <Route size={22} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{user.totalDistance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>km Run</Text>
          </View>
        </View>

        {!user.isPremium && (
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.warning + '20', Colors.warning + '10']}
              style={styles.premiumGradient}
            >
              <View style={styles.premiumContent}>
                <Crown size={28} color={Colors.warning} />
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>Go Premium</Text>
                  <Text style={styles.premiumDescription}>Unlimited territories & more</Text>
                </View>
              </View>
              <ChevronRight size={22} color={Colors.warning} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.territoriesSection}>
          <Text style={styles.sectionTitle}>My Territories</Text>
          {userTerritories.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={40} color={Colors.textTertiary} />
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
    paddingBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
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
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.primary,
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
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  levelCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  levelBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
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
    marginTop: 2,
  },
  premiumCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    borderRadius: 16,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  },
  territoriesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  territoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  territoryColor: {
    width: 8,
    height: 40,
    borderRadius: 4,
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
    marginTop: 2,
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
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '500' as const,
  },
});
