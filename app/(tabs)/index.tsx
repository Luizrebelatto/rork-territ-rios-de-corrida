import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polygon, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Play, MapPin, Zap, Bell, Crown, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_LOCATION } from '@/mocks/data';
import { Territory, Activity } from '@/types';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, hasOnboarded, territories, activities, userLocation, canCreateTerritory, isLoading } = useApp();
  const mapRef = useRef<MapView>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [showFeed, setShowFeed] = useState(false);
  const feedAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    } else if (!isLoading && isAuthenticated && !hasOnboarded) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, hasOnboarded, isLoading, router]);

  const toggleFeed = () => {
    Animated.timing(feedAnimation, {
      toValue: showFeed ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowFeed(!showFeed);
  };

  const handleStartRun = () => {
    if (!canCreateTerritory) {
      router.push('/paywall');
      return;
    }
    router.push('/run');
  };

  const centerOnUser = () => {
    mapRef.current?.animateToRegion({
      ...userLocation,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  };

  if (isLoading || !isAuthenticated) {
    return <View style={styles.container} />;
  }

  const feedTranslateY = feedAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <View style={styles.container}>
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
              fillColor={territory.color + '40'}
              strokeColor={territory.color}
              strokeWidth={2}
              tappable
              onPress={() => setSelectedTerritory(territory)}
            />
            <Marker
              coordinate={getPolygonCenter(territory.coordinates)}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => setSelectedTerritory(territory)}
            >
              <View style={[styles.territoryMarker, { backgroundColor: territory.color }]}>
                <MapPin size={14} color={Colors.background} />
              </View>
            </Marker>
          </React.Fragment>
        ))}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.userStats}>
          <LinearGradient
            colors={[Colors.surface, Colors.surfaceLight]}
            style={styles.statsContainer}
          >
            <Zap size={16} color={Colors.primary} />
            <Text style={styles.statsText}>{user?.totalPoints || 0}</Text>
            <View style={styles.statsDivider} />
            <MapPin size={16} color={Colors.secondary} />
            <Text style={styles.statsText}>{user?.territoriesCount || 0}</Text>
          </LinearGradient>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFeed}>
            <Bell size={22} color={Colors.text} />
            {activities.length > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          {!user?.isPremium && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.premiumButton]}
              onPress={() => router.push('/paywall')}
            >
              <Crown size={20} color={Colors.warning} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.locationButton, { bottom: insets.bottom + 160 }]}
        onPress={centerOnUser}
      >
        <Navigation size={22} color={Colors.primary} />
      </TouchableOpacity>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 100 }]}>
        <TouchableOpacity 
          style={styles.runButton}
          onPress={handleStartRun}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.runButtonGradient}
          >
            <Play size={32} color={Colors.background} fill={Colors.background} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.runHint}>Tap to start running</Text>
      </View>

      {selectedTerritory && (
        <TerritoryCard 
          territory={selectedTerritory} 
          onClose={() => setSelectedTerritory(null)}
          bottom={insets.bottom + 100}
        />
      )}

      <Animated.View 
        style={[
          styles.feedContainer, 
          { 
            transform: [{ translateY: feedTranslateY }],
            bottom: insets.bottom + 100,
          }
        ]}
      >
        <ActivityFeed activities={activities.slice(0, 5)} onClose={toggleFeed} />
      </Animated.View>
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

function ActivityFeed({ activities, onClose }: { activities: Activity[]; onClose: () => void }) {
  return (
    <View style={styles.feedCard}>
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.feedCloseText}>×</Text>
        </TouchableOpacity>
      </View>
      {activities.map((activity) => (
        <View key={activity.id} style={styles.feedItem}>
          <View style={[styles.feedDot, { backgroundColor: getActivityColor(activity.type) }]} />
          <Text style={styles.feedItemText}>
            <Text style={styles.feedUserName}>{activity.userName}</Text> {activity.description}
          </Text>
          <Text style={styles.feedTime}>{getRelativeTime(activity.timestamp)}</Text>
        </View>
      ))}
    </View>
  );
}

function getPolygonCenter(coords: { latitude: number; longitude: number }[]) {
  const lat = coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length;
  const lng = coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length;
  return { latitude: lat, longitude: lng };
}

function getActivityColor(type: string) {
  switch (type) {
    case 'territory_conquered': return Colors.primary;
    case 'territory_lost': return Colors.error;
    case 'level_up': return Colors.warning;
    default: return Colors.secondary;
  }
}

function getRelativeTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b95a8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3548' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1421' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e2640' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  userStats: {
    flexDirection: 'row',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  statsText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statsDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: Colors.warning + '20',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
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
  runButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  runButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  runHint: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  territoryMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardClose: {
    position: 'absolute',
    top: 8,
    right: 12,
    padding: 4,
  },
  cardCloseText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  territoryColorBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  territoryName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  territoryOwner: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  territoryStats: {
    flexDirection: 'row',
    gap: 24,
  },
  territoryStat: {
    alignItems: 'center',
  },
  territoryStatValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  territoryStatLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  feedContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  feedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  feedCloseText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  feedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  feedItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  feedUserName: {
    color: Colors.text,
    fontWeight: '600' as const,
  },
  feedTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 8,
  },
});
