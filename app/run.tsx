import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { Pause, Square, Play, MapPin, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_LOCATION } from '@/mocks/data';
import { Coordinate } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RunScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startRun, updateRunPath, endRun, currentRun, userLocation } = useApp();
  const mapRef = useRef<MapView>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [path, setPath] = useState<Coordinate[]>([userLocation]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingAnim = useRef(new Animated.Value(1)).current;
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
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        }, 500);
      }
    }, 1000);
  }, [userLocation, isPaused, updateRunPath]);

  const startAnimations = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
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
        Animated.timing(recordingAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, recordingAnim]);

  useEffect(() => {
    startRun();
    startTimer();
    startLocationSimulation();
    startAnimations();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [startRun, startTimer, startLocationSimulation, startAnimations]);

  const togglePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPaused(!isPaused);
    
    if (!isPaused && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else {
      startTimer();
    }
  }, [isPaused, startTimer]);

  const handleStop = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (simulationRef.current) clearInterval(simulationRef.current);

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
      },
    });
  }, [endRun, currentRun, elapsedTime, router]);

  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (simulationRef.current) clearInterval(simulationRef.current);
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
  const calories = Math.round(distance * 45);

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
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
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
            strokeWidth={5}
            lineDashPattern={isPaused ? [10, 5] : undefined}
          />
        )}
        
        {path.length > 0 && (
          <Circle
            center={path[0]}
            radius={25}
            fillColor={Colors.primary + '40'}
            strokeColor={Colors.primary}
            strokeWidth={3}
          />
        )}
      </MapView>

      <LinearGradient
        colors={['rgba(13,13,13,0.95)', 'rgba(13,13,13,0)']}
        style={[styles.topGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.recordingBadge}>
            <Animated.View style={[styles.recordingDot, { opacity: recordingAnim }]} />
            <Text style={styles.recordingText}>{isPaused ? 'PAUSED' : 'RECORDING'}</Text>
          </View>

          {isPathClosed && (
            <View style={styles.closedBadge}>
              <MapPin size={14} color={Colors.background} />
              <Text style={styles.closedText}>CLOSED!</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['rgba(13,13,13,0)', 'rgba(13,13,13,0.98)', Colors.background]}
        locations={[0, 0.3, 0.5]}
        style={[styles.bottomGradient, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.metricsContainer}>
          <View style={styles.primaryMetric}>
            <Text style={styles.primaryValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.primaryLabel}>DURATION</Text>
          </View>

          <View style={styles.secondaryMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{distance.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>KM</Text>
            </View>
            
            <View style={styles.metricDivider} />
            
            <View style={styles.metric}>
              <Text style={styles.metricValue}>
                {paceMinutes}:{paceSeconds.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.metricLabel}>PACE</Text>
            </View>
            
            <View style={styles.metricDivider} />
            
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{calories}</Text>
              <Text style={styles.metricLabel}>CAL</Text>
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
              <Play size={28} color={Colors.text} fill={Colors.text} />
            ) : (
              <Pause size={28} color={Colors.text} />
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
                colors={[Colors.accent, Colors.accent + 'CC']}
                style={styles.stopButtonGradient}
              >
                <Square size={32} color={Colors.text} fill={Colors.text} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.placeholderButton} />
        </View>

        <Text style={styles.hintText}>
          {isPathClosed 
            ? '🎯 Stop now to claim your territory!' 
            : 'Return to start to close the loop'}
        </Text>
      </LinearGradient>
    </View>
  );
}

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0D0D0D' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0D0D' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#444444' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A1A1A' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#080808' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0F0F0F' }] },
];

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
    height: 140,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 1.5,
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
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.background,
    letterSpacing: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 80,
    alignItems: 'center',
  },
  metricsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  primaryMetric: {
    alignItems: 'center',
    marginBottom: 28,
  },
  primaryValue: {
    fontSize: 72,
    fontWeight: '200' as const,
    color: Colors.text,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginTop: -4,
  },
  secondaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  pauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent + '25',
  },
  stopButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    ...Platform.select({
      ios: {
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  stopButtonGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 64,
    height: 64,
  },
  hintText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
