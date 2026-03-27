import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Zap, Share2, X, Shield, Grid3x3, TrendingUp, Star } from 'lucide-react-native';
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
    cellsConquered: string;
  }>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const trophyAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const statsSlideAnim = useRef(new Animated.Value(40)).current;

  const distance = parseFloat(params.distance || '0');
  const duration = parseInt(params.duration || '0', 10);
  const territoryCreated = params.territoryCreated === 'true';
  const territoryName = params.territoryName || '';
  const territoryPoints = parseInt(params.territoryPoints || '0', 10);
  const cellsConquered = parseInt(params.cellsConquered || '0', 10);

  const pace = duration > 0 && distance > 0 ? duration / 60 / distance : 0;
  const paceMinutes = Math.floor(pace);
  const paceSeconds = Math.round((pace - paceMinutes) * 60);
  const xpEarned = Math.round(distance * 10) + (territoryCreated ? 50 : 0) + cellsConquered * 5;

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
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(statsSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    if (territoryCreated) {
      setTimeout(() => {
        Animated.spring(trophyAnim, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }).start();
        
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    }
  }, [fadeAnim, scaleAnim, slideAnim, trophyAnim, confettiAnim, statsSlideAnim, territoryCreated]);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `🏃 Just ran ${distance.toFixed(2)} km in ${formatDuration(duration)}! ${territoryCreated ? `🏆 Conquered "${territoryName}" (+${territoryPoints} pts)` : `📍 Conquered ${cellsConquered} cells`} #TerritoryRun`,
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
        colors={[
          territoryCreated ? Colors.primary + '20' : Colors.secondary + '15',
          Colors.background,
          Colors.background,
        ]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={22} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.titleSection}>
          <View style={styles.completeBadge}>
            <Star size={14} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.completeText}>RUN COMPLETE</Text>
          </View>
          <Animated.Text 
            style={[
              styles.congratsText,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {territoryCreated ? 'Territory\nConquered!' : 'Great Run!'}
          </Animated.Text>
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
              colors={[Colors.primary + '25', Colors.primary + '08']}
              style={styles.trophyGradient}
            >
              <View style={styles.trophyIconRing}>
                <View style={styles.trophyIconContainer}>
                  <Shield size={32} color={Colors.primary} fill={Colors.primary + '40'} />
                </View>
              </View>
              <Text style={styles.trophyTitle}>{territoryName}</Text>
              <View style={styles.trophyStatsRow}>
                <View style={styles.trophyStat}>
                  <Zap size={16} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.trophyStatText}>+{territoryPoints}</Text>
                  <Text style={styles.trophyStatLabel}>pts</Text>
                </View>
                <View style={styles.trophyStatDivider} />
                <View style={styles.trophyStat}>
                  <Grid3x3 size={16} color={Colors.secondary} />
                  <Text style={styles.trophyStatText}>{cellsConquered}</Text>
                  <Text style={styles.trophyStatLabel}>cells</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        <Animated.View 
          style={[
            styles.metricsCard,
            { transform: [{ translateY: statsSlideAnim }] }
          ]}
        >
          <View style={styles.primaryMetric}>
            <Text style={styles.primaryValue}>{distance.toFixed(2)}</Text>
            <Text style={styles.primaryUnit}>KILOMETERS</Text>
          </View>

          <View style={styles.metricsGrid}>
            <MetricItem 
              icon={<Clock size={18} color={Colors.secondary} />}
              value={formatDuration(duration)}
              label="Duration"
              color={Colors.secondary}
            />
            <MetricItem 
              icon={<TrendingUp size={18} color={Colors.tertiary} />}
              value={`${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`}
              label="Avg Pace"
              color={Colors.tertiary}
            />
          </View>
        </Animated.View>

        <View style={styles.xpCard}>
          <LinearGradient
            colors={[Colors.warningMuted, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.xpGradient}
          >
            <View style={styles.xpContent}>
              <Zap size={20} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.xpValue}>+{xpEarned} XP</Text>
            </View>
            <Text style={styles.xpLabel}>earned this run</Text>
          </LinearGradient>
        </View>

        {!territoryCreated && cellsConquered > 0 && (
          <View style={styles.cellsCard}>
            <Grid3x3 size={20} color={Colors.secondary} />
            <View style={styles.cellsInfo}>
              <Text style={styles.cellsValue}>{cellsConquered} cells conquered</Text>
              <Text style={styles.cellsHint}>Close your path to claim territory!</Text>
            </View>
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
            colors={[Colors.primary, Colors.primaryDark] as const}
            style={styles.doneButtonGradient}
          >
            <Text style={styles.doneButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetricItem({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
  color: string;
}) {
  return (
    <View style={styles.metricItem}>
      <View style={[styles.metricIcon, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    marginBottom: 28,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warningMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  completeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.warning,
    letterSpacing: 2,
  },
  congratsText: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 42,
  },
  trophyCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  trophyGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  trophyIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  trophyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  trophyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trophyStatText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  trophyStatLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  trophyStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  metricsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  primaryMetric: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
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
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
    letterSpacing: 3,
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
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  xpCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  xpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.warning + '25',
    borderRadius: 16,
  },
  xpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  xpValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.warning,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  cellsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cellsInfo: {
    flex: 1,
  },
  cellsValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  cellsHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.background,
    letterSpacing: 0.5,
  },
});
