import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Pause, Square, Play, X, Zap, Grid3x3, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Coordinate } from '@/types';



export default function RunScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startRun, updateRunPath, endRun, currentRun, userLocation, setUserLocation } = useApp();
  const mapRef = useRef<MapView>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startLocation, setStartLocation] = useState<Coordinate | null>(null);
  const [path, setPath] = useState<Coordinate[]>([]);
  const [cellsConquered, setCellsConquered] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingAnim = useRef(new Animated.Value(1)).current;
  const cellFlashAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const isPausedRef = useRef(false);
  const lastCellUpdateRef = useRef(0);

  const startTimer = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const flashCellConquest = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(cellFlashAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cellFlashAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cellFlashAnim]);

  const startLocationTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied');
      return;
    }

    // Get initial position for the pin
    const currentPos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const initialCoord: Coordinate = {
      latitude: currentPos.coords.latitude,
      longitude: currentPos.coords.longitude,
    };
    setStartLocation(initialCoord);
    setPath([initialCoord]);
    setUserLocation(initialCoord);

    mapRef.current?.animateToRegion({
      latitude: initialCoord.latitude,
      longitude: initialCoord.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 500);

    // Watch position updates
    locationSubRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 3,
      },
      (location) => {
        if (isPausedRef.current) return;

        const newPoint: Coordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setPath((prev) => [...prev, newPoint]);
        updateRunPath(newPoint);
        setUserLocation(newPoint);

        const currentTime = Date.now();
        if (currentTime - lastCellUpdateRef.current > 3000) {
          setCellsConquered(prev => prev + 1);
          flashCellConquest();
          lastCellUpdateRef.current = currentTime;
        }

        mapRef.current?.animateToRegion({
          latitude: newPoint.latitude,
          longitude: newPoint.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 500);
      }
    );
  }, [updateRunPath, flashCellConquest, setUserLocation]);

  const startAnimations = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnim, {
          toValue: 0.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, recordingAnim]);

  useEffect(() => {
    startRun();
    startTimer();
    startLocationTracking();
    startAnimations();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (locationSubRef.current) locationSubRef.current.remove();
    };
  }, []);

  const togglePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    isPausedRef.current = newPaused;

    if (newPaused && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (!newPaused) {
      startTimer();
    }
  }, [isPaused, startTimer]);

  const handleStop = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (locationSubRef.current) locationSubRef.current.remove();

    const result = await endRun();

    router.replace({
      pathname: '/run-summary',
      params: {
        distance: currentRun?.distance?.toFixed(2) || '0',
        duration: elapsedTime.toString(),
        pace: currentRun?.pace?.toFixed(2) || '0',
        territoryCreated: result?.territory ? 'true' : 'false',
        territoryName: result?.territory?.name || '',
        territoryPoints: result?.territory?.pointsValue?.toString() || '0',
        cellsConquered: cellsConquered.toString(),
      },
    });
  }, [endRun, currentRun, elapsedTime, router, cellsConquered]);

  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (locationSubRef.current) locationSubRef.current.remove();
    router.back();
  }, [router]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const distance = currentRun?.distance || 0;
  const pace = elapsedTime > 0 && distance > 0 
    ? (elapsedTime / 60 / distance)
    : 0;
  const paceMinutes = Math.floor(pace);
  const paceSeconds = Math.round((pace - paceMinutes) * 60);

  const isPathClosed = path.length >= 4 && 
    Math.abs(path[0].latitude - path[path.length - 1].latitude) < 0.0005 &&
    Math.abs(path[0].longitude - path[path.length - 1].longitude) < 0.0005;

  const initialRegion = {
    latitude: startLocation?.latitude || userLocation.latitude,
    longitude: startLocation?.longitude || userLocation.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
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
        {path.length > 1 && (
          <Polyline
            coordinates={path}
            strokeColor={isPathClosed ? Colors.primary : Colors.secondary}
            strokeWidth={6}
          />
        )}
        {startLocation && (
          <Marker
            coordinate={startLocation}
            title="Início"
            pinColor={Colors.primary}
          />
        )}
      </MapView>

      <Animated.View 
        style={[
          styles.cellFlashOverlay,
          {
            opacity: cellFlashAnim,
          }
        ]}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['rgba(10,10,15,0.98)', 'rgba(10,10,15,0.5)', 'transparent']}
        style={[styles.topGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <X size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.recordingBadge}>
            <Animated.View style={[styles.recordingDot, { opacity: recordingAnim }]} />
            <Text style={styles.recordingText}>{isPaused ? 'PAUSED' : 'LIVE'}</Text>
          </View>

          {isPathClosed ? (
            <View style={styles.closedBadge}>
              <Lock size={12} color={Colors.background} />
              <Text style={styles.closedText}>LOCKED</Text>
            </View>
          ) : (
            <View style={styles.cellsBadge}>
              <Grid3x3 size={14} color={Colors.secondary} />
              <Text style={styles.cellsText}>+{cellsConquered}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.7)', 'rgba(10,10,15,0.9)']}
        locations={[0, 0.5, 1]}
        style={[styles.bottomGradient, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.metricsContainer}>
          <View style={styles.primaryMetric}>
            <Text style={styles.primaryValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.primaryLabel}>TIME</Text>
          </View>

          <View style={styles.secondaryMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{distance.toFixed(2)}</Text>
              <Text style={styles.metricUnit}>KM</Text>
            </View>
            
            <View style={styles.metricDivider} />
            
            <View style={styles.metric}>
              <Text style={styles.metricValue}>
                {paceMinutes}:{paceSeconds.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.metricUnit}>PACE</Text>
            </View>
            
            <View style={styles.metricDivider} />
            
            <View style={styles.metric}>
              <View style={styles.cellsMetric}>
                <Grid3x3 size={16} color={Colors.primary} />
                <Text style={[styles.metricValue, { color: Colors.primary }]}>{cellsConquered}</Text>
              </View>
              <Text style={styles.metricUnit}>CELLS</Text>
            </View>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.pauseButton}
            onPress={togglePause}
            activeOpacity={0.8}
          >
            {isPaused ? (
              <Play size={26} color={Colors.text} fill={Colors.text} />
            ) : (
              <Pause size={26} color={Colors.text} />
            )}
          </TouchableOpacity>

          <View style={styles.stopButtonContainer}>
            <Animated.View style={[styles.stopButtonPulse, { transform: [{ scale: pulseAnim }] }]} />
            <TouchableOpacity 
              style={styles.stopButton}
              onPress={handleStop}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.accent, Colors.accentLight] as const}
                style={styles.stopButtonGradient}
              >
                <Square size={30} color={Colors.text} fill={Colors.text} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.placeholderButton} />
        </View>

        <View style={styles.hintContainer}>
          {isPathClosed ? (
            <View style={styles.hintBadge}>
              <Zap size={14} color={Colors.primary} />
              <Text style={styles.hintTextSuccess}>Territory ready! Stop to claim</Text>
            </View>
          ) : (
            <Text style={styles.hintText}>Return to start to close territory</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  cellFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary + '15',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  cancelButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 2,
  },
  closedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  closedText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.background,
    letterSpacing: 1,
  },
  cellsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  cellsText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.secondary,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    alignItems: 'center',
  },
  metricsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  primaryMetric: {
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryValue: {
    fontSize: 80,
    fontWeight: '100' as const,
    color: Colors.text,
    letterSpacing: -3,
    fontVariant: ['tabular-nums'],
  },
  primaryLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
    letterSpacing: 4,
    marginTop: -8,
  },
  secondaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
    letterSpacing: 2,
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  cellsMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 20,
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stopButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonPulse: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.accent + '20',
  },
  stopButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    ...Platform.select({
      ios: {
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  stopButtonGradient: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 60,
    height: 60,
  },
  hintContainer: {
    alignItems: 'center',
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  hintTextSuccess: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
