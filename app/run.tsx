import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { Pause, Square, Play, MapPin, Timer, Route } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_LOCATION } from '@/mocks/data';
import { Coordinate } from '@/types';

export default function RunScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startRun, updateRunPath, endRun, currentRun, userLocation } = useApp();
  const mapRef = useRef<MapView>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [path, setPath] = useState<Coordinate[]>([userLocation]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const startLocationSimulation = useCallback(() => {
    let angle = 0;
    const centerLat = userLocation.latitude;
    const centerLng = userLocation.longitude;
    const radius = 0.002;

    simulationRef.current = setInterval(() => {
      if (!isPaused) {
        angle += 0.15;
        const newLat = centerLat + radius * Math.sin(angle);
        const newLng = centerLng + radius * Math.cos(angle);
        const newPoint = { latitude: newLat, longitude: newLng };
        
        setPath((prev) => [...prev, newPoint]);
        updateRunPath(newPoint);

        mapRef.current?.animateToRegion({
          latitude: newLat,
          longitude: newLng,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }, 500);
      }
    }, 1000);
  }, [userLocation, isPaused, updateRunPath]);

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    startRun();
    startTimer();
    startLocationSimulation();
    startPulseAnimation();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [startRun, startTimer, startLocationSimulation, startPulseAnimation]);

  

  const togglePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleStop = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (simulationRef.current) clearInterval(simulationRef.current);

    const result = await endRun();
    
    if (result?.territory) {
      Alert.alert(
        'Territory Conquered!',
        `You created "${result.territory.name}" worth ${result.territory.pointsValue} points!`,
        [{ text: 'Awesome!', onPress: () => router.back() }]
      );
    } else if (path.length >= 4) {
      Alert.alert(
        'Run Completed',
        `Great run! ${currentRun?.distance.toFixed(2) || 0} km completed. Close your path next time to create a territory!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      router.back();
    }
  }, [endRun, path, currentRun, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const distance = currentRun?.distance || 0;
  const pace = elapsedTime > 0 && distance > 0 
    ? (elapsedTime / 60 / distance).toFixed(2) 
    : '0.00';

  const isPathClosed = path.length >= 4 && 
    Math.abs(path[0].latitude - path[path.length - 1].latitude) < 0.0005 &&
    Math.abs(path[0].longitude - path[path.length - 1].longitude) < 0.0005;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        customMapStyle={mapStyle}
        showsUserLocation
        showsMyLocationButton={false}
        followsUserLocation
      >
        {path.length > 1 && (
          <Polyline
            coordinates={path}
            strokeColor={isPathClosed ? Colors.primary : Colors.secondary}
            strokeWidth={4}
            lineDashPattern={isPaused ? [10, 5] : undefined}
          />
        )}
        
        {path.length > 0 && (
          <Circle
            center={path[0]}
            radius={30}
            fillColor={Colors.primary + '40'}
            strokeColor={Colors.primary}
            strokeWidth={2}
          />
        )}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Animated.View style={[styles.recordingBadge, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>{isPaused ? 'PAUSED' : 'RECORDING'}</Text>
        </Animated.View>

        {isPathClosed && (
          <View style={styles.closedBadge}>
            <MapPin size={14} color={Colors.background} />
            <Text style={styles.closedText}>PATH CLOSED!</Text>
          </View>
        )}
      </View>

      <View style={[styles.statsPanel, { bottom: insets.bottom + 120 }]}>
        <View style={styles.statItem}>
          <Timer size={20} color={Colors.textSecondary} />
          <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
          <Text style={styles.statLabel}>Time</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Route size={20} color={Colors.textSecondary} />
          <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.paceIcon}>⚡</Text>
          <Text style={styles.statValue}>{pace}</Text>
          <Text style={styles.statLabel}>min/km</Text>
        </View>
      </View>

      <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity 
          style={styles.pauseButton}
          onPress={togglePause}
          activeOpacity={0.8}
        >
          {isPaused ? (
            <Play size={28} color={Colors.text} fill={Colors.text} />
          ) : (
            <Pause size={28} color={Colors.text} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.stopButton}
          onPress={handleStop}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.error, Colors.error + 'CC']}
            style={styles.stopButtonGradient}
          >
            <Square size={32} color={Colors.text} fill={Colors.text} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            {isPathClosed 
              ? 'Stop now to claim your territory!' 
              : 'Return to start point to close the loop'}
          </Text>
        </View>
      </View>
    </View>
  );
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
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 1,
  },
  closedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  closedText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  statsPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paceIcon: {
    fontSize: 20,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 20,
  },
  pauseButton: {
    position: 'absolute',
    left: 40,
    bottom: 60,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    ...Platform.select({
      ios: {
        shadowColor: Colors.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  stopButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
