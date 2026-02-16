import { Tabs, useRouter } from 'expo-router';
import { Map, Trophy, Users, User, Play } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Platform, View, TouchableOpacity, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

const BG_TAB = '#182414';
const ACTIVE_TINT = '#B8E030';
const INACTIVE_TINT = '#6A7A6A';
const ACTIVE_ICON_BG = '#2A3D1E';
const LIME = '#B8E030';
const LIME_TEXT = '#0B1A0B';

function RunButton() {
  const router = useRouter();
  const { canCreateTerritory } = useApp();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!canCreateTerritory) {
      router.push('/paywall');
      return;
    }
    router.push('/run');
  };

  return (
    <TouchableOpacity style={styles.runButton} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.runButtonCircle}>
        <Play size={26} color={LIME_TEXT} fill={LIME_TEXT} />
      </View>
      <Text style={styles.runButtonLabel}>Start Run</Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_TINT,
        tabBarInactiveTintColor: INACTIVE_TINT,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="rankings"
        options={{
          title: 'Rankings',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Trophy size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Map size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="run-tab"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarButton: () => <RunButton />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Users size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: BG_TAB,
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 6,
    height: Platform.OS === 'ios' ? 88 : 68,
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabBarItem: {
    paddingTop: 4,
  },
  iconContainer: {
    width: 44,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  iconContainerActive: {
    backgroundColor: ACTIVE_ICON_BG,
  },

  // Run button
  runButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  runButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: LIME,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    ...Platform.select({
      ios: {
        shadowColor: LIME,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  runButtonLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: LIME,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
