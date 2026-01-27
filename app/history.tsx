import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Clock, Zap, Flame, TrendingUp, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { RunHistory } from '@/types';

const MOCK_HISTORY: RunHistory[] = [
  { id: '1', date: new Date(Date.now() - 86400000), distance: 5.2, duration: 1860, pace: 5.96, calories: 234, territoryCreated: true, territoryName: 'Central Park' },
  { id: '2', date: new Date(Date.now() - 172800000), distance: 3.8, duration: 1380, pace: 6.05, calories: 171, territoryCreated: false },
  { id: '3', date: new Date(Date.now() - 259200000), distance: 7.1, duration: 2700, pace: 6.34, calories: 320, territoryCreated: true, territoryName: 'Riverside' },
  { id: '4', date: new Date(Date.now() - 345600000), distance: 4.5, duration: 1620, pace: 6.00, calories: 203, territoryCreated: false },
  { id: '5', date: new Date(Date.now() - 518400000), distance: 6.2, duration: 2280, pace: 6.13, calories: 279, territoryCreated: true, territoryName: 'Downtown' },
  { id: '6', date: new Date(Date.now() - 604800000), distance: 3.2, duration: 1140, pace: 5.94, calories: 144, territoryCreated: false },
];

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  const totalDistance = MOCK_HISTORY.reduce((acc, run) => acc + run.distance, 0);
  const totalRuns = MOCK_HISTORY.length;
  const avgPace = MOCK_HISTORY.reduce((acc, run) => acc + run.pace, 0) / totalRuns;
  const avgPaceMinutes = Math.floor(avgPace);
  const avgPaceSeconds = Math.round((avgPace - avgPaceMinutes) * 60);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.surfaceLight, Colors.background]}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Run History</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalDistance.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Total km</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalRuns}</Text>
            <Text style={styles.summaryLabel}>Runs</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {avgPaceMinutes}:{avgPaceSeconds.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.summaryLabel}>Avg Pace</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={Colors.textSecondary} />
          <Text style={styles.sectionTitle}>Recent Runs</Text>
        </View>

        {MOCK_HISTORY.map((run, index) => (
          <RunCard key={run.id} run={run} formatDuration={formatDuration} formatDate={formatDate} />
        ))}
      </ScrollView>
    </View>
  );
}

function RunCard({ 
  run, 
  formatDuration, 
  formatDate 
}: { 
  run: RunHistory; 
  formatDuration: (s: number) => string;
  formatDate: (d: Date) => string;
}) {
  const paceMinutes = Math.floor(run.pace);
  const paceSeconds = Math.round((run.pace - paceMinutes) * 60);

  return (
    <TouchableOpacity style={styles.runCard} activeOpacity={0.7}>
      <View style={styles.runHeader}>
        <View style={styles.runDateContainer}>
          <Text style={styles.runDate}>{formatDate(run.date)}</Text>
          {run.territoryCreated && (
            <View style={styles.territoryBadge}>
              <MapPin size={12} color={Colors.primary} />
              <Text style={styles.territoryBadgeText}>{run.territoryName}</Text>
            </View>
          )}
        </View>
        <View style={styles.runDistance}>
          <Text style={styles.runDistanceValue}>{run.distance.toFixed(1)}</Text>
          <Text style={styles.runDistanceUnit}>km</Text>
        </View>
      </View>

      <View style={styles.runStats}>
        <View style={styles.runStat}>
          <Clock size={16} color={Colors.textTertiary} />
          <Text style={styles.runStatValue}>{formatDuration(run.duration)}</Text>
        </View>
        <View style={styles.runStat}>
          <TrendingUp size={16} color={Colors.textTertiary} />
          <Text style={styles.runStatValue}>
            {paceMinutes}:{paceSeconds.toString().padStart(2, '0')} /km
          </Text>
        </View>
        <View style={styles.runStat}>
          <Flame size={16} color={Colors.textTertiary} />
          <Text style={styles.runStatValue}>{run.calories} cal</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  runCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  runHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  runDateContainer: {
    gap: 8,
  },
  runDate: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  territoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  territoryBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  runDistance: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  runDistanceValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  runDistanceUnit: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  runStats: {
    flexDirection: 'row',
    gap: 20,
  },
  runStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  runStatValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
