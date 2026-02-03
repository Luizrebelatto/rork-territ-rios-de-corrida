import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Clock, Flame, TrendingUp, Calendar, Shield } from 'lucide-react-native';
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
  useApp();

  const totalDistance = MOCK_HISTORY.reduce((acc, run) => acc + run.distance, 0);
  const totalRuns = MOCK_HISTORY.length;
  const territoriesConquered = MOCK_HISTORY.filter(r => r.territoryCreated).length;
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
            <ChevronLeft size={26} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>History</Text>
          <View style={{ width: 46 }} />
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalDistance.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>km total</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalRuns}</Text>
            <Text style={styles.summaryLabel}>runs</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{territoriesConquered}</Text>
            <Text style={styles.summaryLabel}>territories</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {avgPaceMinutes}:{avgPaceSeconds.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.summaryLabel}>avg pace</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Calendar size={18} color={Colors.textSecondary} />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {MOCK_HISTORY.map((run) => (
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
        <View style={styles.runDateRow}>
          <Text style={styles.runDate}>{formatDate(run.date)}</Text>
          {run.territoryCreated && (
            <View style={styles.territoryBadge}>
              <Shield size={11} color={Colors.primary} />
              <Text style={styles.territoryBadgeText}>{run.territoryName}</Text>
            </View>
          )}
        </View>
        <View style={styles.runDistanceContainer}>
          <Text style={styles.runDistanceValue}>{run.distance.toFixed(1)}</Text>
          <Text style={styles.runDistanceUnit}>km</Text>
        </View>
      </View>

      <View style={styles.runStats}>
        <View style={styles.runStat}>
          <Clock size={14} color={Colors.textTertiary} />
          <Text style={styles.runStatValue}>{formatDuration(run.duration)}</Text>
        </View>
        <View style={styles.runStatDot} />
        <View style={styles.runStat}>
          <TrendingUp size={14} color={Colors.textTertiary} />
          <Text style={styles.runStatValue}>
            {paceMinutes}:{paceSeconds.toString().padStart(2, '0')} /km
          </Text>
        </View>
        <View style={styles.runStatDot} />
        <View style={styles.runStat}>
          <Flame size={14} color={Colors.textTertiary} />
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  runCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  runHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  runDateRow: {
    gap: 8,
  },
  runDate: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  territoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  territoryBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  runDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  runDistanceValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  runDistanceUnit: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  runStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  runStatValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  runStatDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
    marginHorizontal: 10,
  },
});
