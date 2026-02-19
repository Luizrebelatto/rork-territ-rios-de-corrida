import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Crown, MapPin, BarChart3, Users, Infinity, Check } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { FREE_TERRITORY_LIMIT } from '@/constants/levels';

const BG = '#0B1A0B';
const SURFACE = '#0F220F';
const BORDER_DEFAULT = '#1E361E';
const BORDER_LIGHT = '#2A4A2A';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#7A9A7A';
const TEXT_MUTED = '#4A6A4A';
const LIME = '#B8E030';
const GOLD = '#C8960C';
const GOLD_LIGHT = '#F0C040';
const GOLD_BG = '#1A1400';
const GOLD_BORDER = '#8B6914';

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Go Premium</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={20} color={TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Crown Badge */}
        <View style={styles.crownWrap}>
          <View style={styles.crownBadge}>
            <Crown size={36} color={GOLD_BG} fill={GOLD_BG} />
          </View>
        </View>

        <Text style={styles.subtitle}>
          You have conquered {userTerritories.length} of {FREE_TERRITORY_LIMIT} free territories.{'\n'}
          Upgrade to unlock unlimited conquests!
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureRow,
                index < PREMIUM_FEATURES.length - 1 && styles.featureRowBorder,
              ]}
            >
              <View style={styles.featureIcon}>
                <feature.icon size={20} color={LIME} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
              <Check size={18} color={LIME} />
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          <TouchableOpacity style={styles.planCardSelected} activeOpacity={0.8}>
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

          <TouchableOpacity style={styles.planCard} activeOpacity={0.8}>
            <Text style={styles.planDuration}>Monthly</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>$4.99</Text>
              <Text style={styles.period}>/month</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={handlePurchase}
          activeOpacity={0.85}
        >
          <Text style={styles.purchaseText}>Start Free Trial</Text>
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
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  crownWrap: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  crownBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GOLD_BORDER,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  featuresContainer: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER_DEFAULT,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: LIME + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: '500' as const,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  planCardSelected: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: LIME,
    position: 'relative',
    paddingTop: 20,
  },
  planCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: LIME,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: BG,
  },
  planDuration: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 4,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
  },
  period: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginLeft: 2,
  },
  savings: {
    fontSize: 13,
    color: LIME,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  purchaseButton: {
    backgroundColor: LIME,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  purchaseText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: BG,
  },
  trialInfo: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 14,
  },
  restoreText: {
    fontSize: 14,
    color: LIME,
    textAlign: 'center',
    fontWeight: '500' as const,
    marginBottom: 18,
  },
  terms: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
});
