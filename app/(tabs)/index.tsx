import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { Zap, LayoutGrid, Navigation, Route, Shield, Swords, Crosshair } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_LOCATION } from '@/mocks/data';
import { Territory } from '@/types';

const LIME = '#B8E030';
const BG = '#0B1A0B';
const SURFACE = '#0F220F';
const BORDER = '#1E361E';



export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, hasOnboarded, territories, userLocation, isLoading } = useApp();
  const mapRef = useRef<MapView>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    } else if (!isLoading && isAuthenticated && !hasOnboarded) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, hasOnboarded, isLoading]);

  const centerOnUser = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
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

  const handleMarkerPress = (territoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const territory = territories.find(t => t.id === territoryId);
    if (territory) {
      setSelectedTerritory(territory);
    }
  };

  const initialRegion = {
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
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
              coordinate={getPolygonCenter(territory.coordinates)}
              title={territory.name}
              onPress={() => handleMarkerPress(territory.id)}
            />
          </React.Fragment>
        ))}
      </MapView>

      <LinearGradient
        colors={['rgba(11,26,11,0.97)', 'rgba(11,26,11,0.6)', 'transparent']}
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
                <Zap size={12} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.pointsText}>{(user?.totalPoints || 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
            <Navigation size={20} color={LIME} fill={LIME} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsBar}>
          <StatPill
            icon={<LayoutGrid size={14} color={LIME} />}
            value={userTerritoryCount.toString()}
            label="Zones"
          />
          <StatPill
            icon={<Crosshair size={14} color={LIME} />}
            value={totalArea.toFixed(2)}
            label="km²"
          />
          <StatPill
            icon={<Route size={14} color={LIME} />}
            value={(user?.totalDistance || 0).toFixed(1)}
            label="km"
          />
        </View>
      </LinearGradient>

      {selectedTerritory && (
        <TerritoryCard 
          territory={selectedTerritory} 
          isOwned={selectedTerritory.ownerId === user?.id}
          onClose={() => setSelectedTerritory(null)}
          bottom={insets.bottom + 90}
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
    backgroundColor: SURFACE,
    borderWidth: 2,
    borderColor: LIME,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: LIME,
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
    backgroundColor: SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SURFACE,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statPillValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statPillLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#7A9A7A',
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
