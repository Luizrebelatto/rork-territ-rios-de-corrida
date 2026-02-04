import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { Play, Zap, Target, Navigation, Grid3x3, Crosshair, Shield, Swords } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_LOCATION } from '@/mocks/data';
import { Territory } from '@/types';



export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, hasOnboarded, territories, userLocation, canCreateTerritory, isLoading } = useApp();
  const mapRef = useRef<MapView>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    } else if (!isLoading && isAuthenticated && !hasOnboarded) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, hasOnboarded, isLoading]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, glowAnim]);

  const handleStartRun = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
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

  const userTerritoryCount = territories.filter(t => t.ownerId === user?.id).length;
  const totalArea = territories
    .filter(t => t.ownerId === user?.id)
    .reduce((sum, t) => sum + t.area, 0);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        mapType="standard"
        showsUserLocation={true}
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
      >
        {territories.map((territory) => (
          <React.Fragment key={territory.id}>
            <Polygon
              coordinates={territory.coordinates}
              fillColor={territory.ownerId === user?.id ? Colors.cells.owned : Colors.cells.enemy}
              strokeColor={territory.color}
              strokeWidth={2}
            />
            <Marker
              identifier={territory.id}
              coordinate={getPolygonCenter(territory.coordinates)}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTerritory(territory);
              }}
            >
              <View style={[styles.territoryMarker, { backgroundColor: territory.color }]}>
                {territory.ownerId === user?.id ? (
                  <Shield size={10} color={Colors.background} />
                ) : (
                  <Swords size={10} color={Colors.background} />
                )}
              </View>
            </Marker>
          </React.Fragment>
        ))}
      </MapView>

      <LinearGradient
        colors={['rgba(10,10,15,0.95)', 'rgba(10,10,15,0.6)', 'transparent']}
        style={[styles.topGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.topBar}>
          <View style={styles.userInfo}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LV {user?.level || 1}</Text>
            </View>
            <View style={styles.userStats}>
              <Text style={styles.userName}>{user?.name || 'Runner'}</Text>
              <View style={styles.pointsRow}>
                <Zap size={12} color={Colors.warning} />
                <Text style={styles.pointsText}>{(user?.totalPoints || 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
            <Navigation size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsBar}>
          <StatPill 
            icon={<Grid3x3 size={14} color={Colors.primary} />}
            value={userTerritoryCount.toString()}
            label="Zones"
          />
          <StatPill 
            icon={<Target size={14} color={Colors.secondary} />}
            value={totalArea.toFixed(2)}
            label="km²"
          />
          <StatPill 
            icon={<Crosshair size={14} color={Colors.accent} />}
            value={(user?.totalDistance || 0).toFixed(1)}
            label="km"
          />
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.8)', 'rgba(10,10,15,0.98)']}
        style={[styles.bottomGradient, { paddingBottom: insets.bottom + 100 }]}
      >
        <Animated.View style={[styles.runButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.View 
            style={[
              styles.runButtonGlow, 
              { 
                transform: [{ scale: pulseAnim }],
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.6],
                }),
              }
            ]} 
          />
          <Animated.View style={[styles.runButtonPulse, { transform: [{ scale: pulseAnim }] }]} />
          <TouchableOpacity 
            style={styles.runButton}
            onPress={handleStartRun}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark] as const}
              style={styles.runButtonGradient}
            >
              <Play size={40} color={Colors.background} fill={Colors.background} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.runLabelContainer}>
          <Text style={styles.runLabel}>CONQUER</Text>
          <View style={styles.runLabelDot} />
          <Text style={styles.runLabel}>TERRITORY</Text>
        </View>
      </LinearGradient>

      {selectedTerritory && (
        <TerritoryCard 
          territory={selectedTerritory} 
          isOwned={selectedTerritory.ownerId === user?.id}
          onClose={() => setSelectedTerritory(null)}
          bottom={insets.bottom + 180}
        />
      )}
    </View>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      {icon}
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

function TerritoryCard({ 
  territory, 
  isOwned,
  onClose, 
  bottom 
}: { 
  territory: Territory; 
  isOwned: boolean;
  onClose: () => void; 
  bottom: number;
}) {
  return (
    <TouchableOpacity 
      style={[styles.territoryCard, { bottom }]}
      onPress={onClose}
      activeOpacity={0.95}
    >
      <View style={[styles.territoryColorAccent, { backgroundColor: territory.color }]} />
      <View style={styles.territoryContent}>
        <View style={styles.territoryHeader}>
          <View style={styles.territoryTitleRow}>
            <View style={[styles.ownershipBadge, isOwned ? styles.ownedBadge : styles.enemyBadge]}>
              {isOwned ? <Shield size={12} color={Colors.primary} /> : <Swords size={12} color={Colors.accent} />}
              <Text style={[styles.ownershipText, isOwned ? styles.ownedText : styles.enemyText]}>
                {isOwned ? 'YOUR ZONE' : 'CONTESTED'}
              </Text>
            </View>
          </View>
          <Text style={styles.territoryName}>{territory.name}</Text>
          <Text style={styles.territoryOwner}>
            Owned by {territory.ownerName}
            {territory.groupName && ` • ${territory.groupName}`}
          </Text>
        </View>
        <View style={styles.territoryStats}>
          <View style={styles.territoryStat}>
            <Text style={styles.territoryStatValue}>{territory.area.toFixed(2)}</Text>
            <Text style={styles.territoryStatLabel}>km²</Text>
          </View>
          <View style={styles.territoryStatDivider} />
          <View style={styles.territoryStat}>
            <Text style={styles.territoryStatValue}>{territory.pointsValue}</Text>
            <Text style={styles.territoryStatLabel}>pts</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getPolygonCenter(coords: { latitude: number; longitude: number }[]) {
  const lat = coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length;
  const lng = coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length;
  return { latitude: lat, longitude: lng };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  userStats: {
    gap: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statPillValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statPillLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 60,
  },
  runButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runButtonGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primary,
  },
  runButtonPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '25',
  },
  runButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  runButtonGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  runLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  runLabel: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
    letterSpacing: 3,
  },
  runLabelDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  territoryMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  territoryColorAccent: {
    width: 5,
  },
  territoryContent: {
    flex: 1,
    padding: 18,
  },
  territoryHeader: {
    marginBottom: 14,
  },
  territoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ownedBadge: {
    backgroundColor: Colors.primaryMuted,
  },
  enemyBadge: {
    backgroundColor: Colors.accentMuted,
  },
  ownershipText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  ownedText: {
    color: Colors.primary,
  },
  enemyText: {
    color: Colors.accent,
  },
  territoryName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  territoryOwner: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  territoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  territoryStat: {
    flex: 1,
  },
  territoryStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  territoryStatValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  territoryStatLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
