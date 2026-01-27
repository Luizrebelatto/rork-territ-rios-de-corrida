import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polygon, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Play, MapPin, Zap, Target, TrendingUp, Clock, Flame, ChevronRight, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_LOCATION } from '@/mocks/data';
import { Territory, WeeklyGoal } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WEEKLY_GOALS: WeeklyGoal[] = [
  { id: '1', type: 'distance', target: 25, current: 18.5, unit: 'km', label: 'Distance' },
  { id: '2', type: 'runs', target: 5, current: 3, unit: 'runs', label: 'Runs' },
  { id: '3', type: 'territories', target: 2, current: 1, unit: 'zones', label: 'Territories' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, hasOnboarded, territories, userLocation, canCreateTerritory, isLoading } = useApp();
  const mapRef = useRef<MapView>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'dashboard'>('dashboard');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    } else if (!isLoading && isAuthenticated && !hasOnboarded) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, hasOnboarded, isLoading, router]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleStartRun = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!canCreateTerritory) {
        router.push('/paywall');
        return;
      }
      router.push('/run');
    });
  }, [canCreateTerritory, router, scaleAnim]);

  const centerOnUser = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mapRef.current?.animateToRegion({
      ...userLocation,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  }, [userLocation]);

  if (isLoading || !isAuthenticated) {
    return <View style={styles.container} />;
  }

  const totalWeeklyProgress = WEEKLY_GOALS.reduce((acc, goal) => acc + (goal.current / goal.target), 0) / WEEKLY_GOALS.length;

  return (
    <View style={styles.container}>
      {viewMode === 'map' ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          customMapStyle={mapStyle}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {territories.map((territory) => (
            <React.Fragment key={territory.id}>
              <Polygon
                coordinates={territory.coordinates}
                fillColor={territory.color + '30'}
                strokeColor={territory.color}
                strokeWidth={3}
                tappable
                onPress={() => setSelectedTerritory(territory)}
              />
              <Marker
                coordinate={getPolygonCenter(territory.coordinates)}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={() => setSelectedTerritory(territory)}
              >
                <View style={[styles.territoryMarker, { backgroundColor: territory.color }]}>
                  <MapPin size={12} color={Colors.background} />
                </View>
              </Marker>
            </React.Fragment>
          ))}
        </MapView>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: 200 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Let's run,</Text>
              <Text style={styles.userName}>{user?.name || 'Runner'}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lvl {user?.level || 1}</Text>
            </View>
          </View>

          <View style={styles.weeklyCard}>
            <LinearGradient
              colors={[Colors.surfaceLight, Colors.surface]}
              style={styles.weeklyCardGradient}
            >
              <View style={styles.weeklyHeader}>
                <View style={styles.weeklyTitleRow}>
                  <Target size={20} color={Colors.primary} />
                  <Text style={styles.weeklyTitle}>Weekly Goals</Text>
                </View>
                <View style={styles.weeklyProgressBadge}>
                  <Text style={styles.weeklyProgressText}>{Math.round(totalWeeklyProgress * 100)}%</Text>
                </View>
              </View>
              
              <View style={styles.goalsGrid}>
                {WEEKLY_GOALS.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statsRow}>
            <StatCard 
              icon={<Flame size={22} color={Colors.accent} />}
              value={Math.round((user?.totalDistance || 0) * 45).toString()}
              label="Calories"
              color={Colors.accent}
            />
            <StatCard 
              icon={<MapPin size={22} color={Colors.secondary} />}
              value={(user?.territoriesCount || 0).toString()}
              label="Territories"
              color={Colors.secondary}
            />
            <StatCard 
              icon={<Zap size={22} color={Colors.warning} />}
              value={(user?.totalPoints || 0).toString()}
              label="Points"
              color={Colors.warning}
            />
          </View>

          <TouchableOpacity 
            style={styles.historyCard}
            onPress={() => router.push('/history')}
            activeOpacity={0.7}
          >
            <View style={styles.historyLeft}>
              <View style={styles.historyIconContainer}>
                <Clock size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.historyTitle}>Run History</Text>
                <Text style={styles.historySubtitle}>View your past activities</Text>
              </View>
            </View>
            <ChevronRight size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.quickStatsCard}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{(user?.totalDistance || 0).toFixed(1)}</Text>
                <Text style={styles.quickStatLabel}>Total km</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{Math.round((user?.totalDistance || 0) / 5) || 0}</Text>
                <Text style={styles.quickStatLabel}>Total Runs</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>5:42</Text>
                <Text style={styles.quickStatLabel}>Avg Pace</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        {viewMode === 'map' && (
          <>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={centerOnUser}
            >
              <Navigation size={20} color={Colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.modeToggle}>
          <TouchableOpacity 
            style={[styles.modeButton, viewMode === 'dashboard' && styles.modeButtonActive]}
            onPress={() => setViewMode('dashboard')}
          >
            <TrendingUp size={18} color={viewMode === 'dashboard' ? Colors.background : Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, viewMode === 'map' && styles.modeButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <MapPin size={18} color={viewMode === 'map' ? Colors.background : Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.runButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={[styles.runButtonPulse, { transform: [{ scale: pulseAnim }] }]} />
          <TouchableOpacity 
            style={styles.runButton}
            onPress={handleStartRun}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.runButtonGradient}
            >
              <Play size={36} color={Colors.background} fill={Colors.background} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.runHint}>START RUN</Text>
      </View>

      {selectedTerritory && (
        <TerritoryCard 
          territory={selectedTerritory} 
          onClose={() => setSelectedTerritory(null)}
          bottom={insets.bottom + 200}
        />
      )}
    </View>
  );
}

function GoalCard({ goal }: { goal: WeeklyGoal }) {
  const progress = Math.min(goal.current / goal.target, 1);
  const isComplete = progress >= 1;
  
  return (
    <View style={styles.goalCard}>
      <View style={styles.goalInfo}>
        <Text style={styles.goalLabel}>{goal.label}</Text>
        <Text style={styles.goalProgress}>
          <Text style={styles.goalCurrent}>{goal.current}</Text>
          <Text style={styles.goalTarget}>/{goal.target} {goal.unit}</Text>
        </Text>
      </View>
      <View style={styles.goalBarContainer}>
        <View style={[styles.goalBar, { width: `${progress * 100}%` }, isComplete && styles.goalBarComplete]} />
      </View>
    </View>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TerritoryCard({ territory, onClose, bottom }: { territory: Territory; onClose: () => void; bottom: number }) {
  return (
    <View style={[styles.territoryCard, { bottom }]}>
      <TouchableOpacity style={styles.cardClose} onPress={onClose}>
        <Text style={styles.cardCloseText}>×</Text>
      </TouchableOpacity>
      <View style={[styles.territoryColorBar, { backgroundColor: territory.color }]} />
      <Text style={styles.territoryName}>{territory.name}</Text>
      <Text style={styles.territoryOwner}>
        Owned by {territory.ownerName}
        {territory.groupName && ` • ${territory.groupName}`}
      </Text>
      <View style={styles.territoryStats}>
        <View style={styles.territoryStat}>
          <Text style={styles.territoryStatValue}>{territory.area.toFixed(2)}</Text>
          <Text style={styles.territoryStatLabel}>km²</Text>
        </View>
        <View style={styles.territoryStat}>
          <Text style={styles.territoryStatValue}>{territory.pointsValue}</Text>
          <Text style={styles.territoryStatLabel}>points</Text>
        </View>
      </View>
    </View>
  );
}

function getPolygonCenter(coords: { latitude: number; longitude: number }[]) {
  const lat = coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length;
  const lng = coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length;
  return { latitude: lat, longitude: lng };
}

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0D0D0D' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0D0D' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1F1F1F' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#080808' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#151515' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  levelBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  weeklyCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  weeklyCardGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weeklyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  weeklyProgressBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  weeklyProgressText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  goalsGrid: {
    gap: 16,
  },
  goalCard: {
    gap: 10,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  goalProgress: {},
  goalCurrent: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  goalTarget: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
  },
  goalBarContainer: {
    height: 6,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  goalBarComplete: {
    backgroundColor: Colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  historyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  historySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  quickStatsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  quickStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    right: 16,
    flexDirection: 'row',
    gap: 10,
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  runButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runButtonPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '20',
  },
  runButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  runButtonGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  runHint: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  territoryMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  territoryCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardClose: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 4,
  },
  cardCloseText: {
    fontSize: 28,
    color: Colors.textSecondary,
    fontWeight: '300' as const,
  },
  territoryColorBar: {
    width: 50,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  territoryName: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  territoryOwner: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  territoryStats: {
    flexDirection: 'row',
    gap: 32,
  },
  territoryStat: {
    alignItems: 'flex-start',
  },
  territoryStatValue: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  territoryStatLabel: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
});
