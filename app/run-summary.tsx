import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, MapPin, Clock, Zap, Flame, Share2, X, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

export default function RunSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    distance: string;
    duration: string;
    pace: string;
    territoryCreated: string;
    territoryName: string;
    territoryPoints: string;
  }>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const trophyAnim = useRef(new Animated.Value(0)).current;

  const distance = parseFloat(params.distance || '0');
  const duration = parseInt(params.duration || '0', 10);
  const territoryCreated = params.territoryCreated === 'true';
  const territoryName = params.territoryName || '';
  const territoryPoints = parseInt(params.territoryPoints || '0', 10);

  const pace = duration > 0 && distance > 0 ? duration / 60 / distance : 0;
  const paceMinutes = Math.floor(pace);
  const paceSeconds = Math.round((pace - paceMinutes) * 60);
  const calories = Math.round(distance * 45);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    if (territoryCreated) {
      setTimeout(() => {
        Animated.spring(trophyAnim, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }).start();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 400);
    }
  }, [fadeAnim, scaleAnim, slideAnim, trophyAnim, territoryCreated]);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `I just ran ${distance.toFixed(2)} km in ${formatDuration(duration)}! ${territoryCreated ? `And conquered "${territoryName}"! 🏆` : ''} #TerritoryRun`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[territoryCreated ? Colors.primary + '30' : Colors.secondary + '20', Colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.titleSection}>
          <Text style={styles.completeText}>RUN COMPLETE</Text>
          <Text style={styles.congratsText}>
            {territoryCreated ? 'Territory Conquered!' : 'Great Run!'}
          </Text>
        </View>

        {territoryCreated && (
          <Animated.View 
            style={[
              styles.trophyCard,
              {
                transform: [{ scale: trophyAnim }],
                opacity: trophyAnim,
              }
            ]}
          >
            <LinearGradient
              colors={[Colors.primary + '30', Colors.primary + '10']}
              style={styles.trophyGradient}
            >
              <View style={styles.trophyIconContainer}>
                <Trophy size={40} color={Colors.primary} fill={Colors.primary} />
              </View>
              <Text style={styles.trophyTitle}>{territoryName}</Text>
              <View style={styles.trophyPoints}>
                <Zap size={18} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.trophyPointsText}>+{territoryPoints} points</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        <Animated.View 
          style={[
            styles.metricsCard,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.primaryMetric}>
            <Text style={styles.primaryValue}>{distance.toFixed(2)}</Text>
            <Text style={styles.primaryUnit}>kilometers</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: Colors.secondaryMuted }]}>
                <Clock size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.metricValue}>{formatDuration(duration)}</Text>
              <Text style={styles.metricLabel}>Duration</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: Colors.primaryMuted }]}>
                <Zap size={20} color={Colors.primary} />
              </View>
              <Text style={styles.metricValue}>
                {paceMinutes}:{paceSeconds.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.metricLabel}>Avg Pace</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: Colors.accentMuted }]}>
                <Flame size={20} color={Colors.accent} />
              </View>
              <Text style={styles.metricValue}>{calories}</Text>
              <Text style={styles.metricLabel}>Calories</Text>
            </View>
          </View>
        </Animated.View>

        {!territoryCreated && (
          <View style={styles.tipCard}>
            <MapPin size={20} color={Colors.textSecondary} />
            <Text style={styles.tipText}>
              Close your running path to create a territory next time!
            </Text>
          </View>
        )}
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleClose}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.doneButtonGradient}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  congratsText: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  trophyCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  trophyGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  trophyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  trophyPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trophyPointsText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.warning,
  },
  metricsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryMetric: {
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  primaryValue: {
    fontSize: 64,
    fontWeight: '200' as const,
    color: Colors.text,
    letterSpacing: -2,
  },
  primaryUnit: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  doneButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  doneButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.background,
    letterSpacing: 1,
  },
});
