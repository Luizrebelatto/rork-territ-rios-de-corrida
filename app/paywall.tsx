import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Crown, MapPin, BarChart3, Users, Infinity, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { FREE_TERRITORY_LIMIT } from '@/constants/levels';

const PREMIUM_FEATURES = [
  { icon: Infinity, text: 'Unlimited territories' },
  { icon: BarChart3, text: 'Advanced statistics & analytics' },
  { icon: MapPin, text: 'Priority territory claims' },
  { icon: Users, text: 'Create unlimited groups' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { upgradeToPremium, userTerritories } = useApp();

  const handlePurchase = async () => {
    await upgradeToPremium();
    router.back();
  };

  const handleRestore = async () => {
    console.log('Restore purchases');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.backgroundSecondary, Colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity 
        style={[styles.closeButton, { top: insets.top + 16 }]}
        onPress={() => router.back()}
      >
        <X size={24} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={[Colors.warning, Colors.warning + 'CC']}
            style={styles.crownBadge}
          >
            <Crown size={40} color={Colors.background} fill={Colors.background} />
          </LinearGradient>
          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.subtitle}>
            You have conquered {userTerritories.length} of {FREE_TERRITORY_LIMIT} free territories. 
            Upgrade to unlock unlimited conquests!
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <feature.icon size={22} color={Colors.primary} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
              <Check size={20} color={Colors.primary} />
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <TouchableOpacity style={styles.planCard} activeOpacity={0.8}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>
            <Text style={styles.planDuration}>Annual</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>$29.99</Text>
              <Text style={styles.period}>/year</Text>
            </View>
            <Text style={styles.savings}>Save 50%</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.planCard, styles.planCardSecondary]} activeOpacity={0.8}>
            <Text style={styles.planDuration}>Monthly</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>$4.99</Text>
              <Text style={styles.period}>/month</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.purchaseButton}
          onPress={handlePurchase}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.purchaseGradient}
          >
            <Text style={styles.purchaseText}>Start Free Trial</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.trialInfo}>7-day free trial, then $29.99/year</Text>

        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service. Subscription auto-renews unless cancelled.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  crownBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    position: 'relative',
  },
  planCardSecondary: {
    borderColor: Colors.border,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  planDuration: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  period: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  savings: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  purchaseButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  purchaseGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  purchaseText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  trialInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 15,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500' as const,
    marginBottom: 20,
  },
  terms: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
