import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Territory, Group, Activity, Coordinate, RunSession } from '@/types';
import { MOCK_USER, MOCK_TERRITORIES, MOCK_GROUPS, MOCK_ACTIVITIES, MOCK_RANKINGS, DEFAULT_LOCATION } from '@/mocks/data';
import Colors from '@/constants/colors';
import { getLevelInfo, FREE_TERRITORY_LIMIT, POINTS_PER_KM, POINTS_PER_TERRITORY } from '@/constants/levels';

const STORAGE_KEYS = {
  USER: 'territoryrun_user',
  HAS_ONBOARDED: 'territoryrun_onboarded',
  TERRITORIES: 'territoryrun_territories',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [territories, setTerritories] = useState<Territory[]>(MOCK_TERRITORIES);
  const [groups] = useState<Group[]>(MOCK_GROUPS);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [currentRun, setCurrentRun] = useState<RunSession | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinate>(DEFAULT_LOCATION);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedUser, storedOnboarded, storedTerritories] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.TERRITORIES),
      ]);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }

      if (storedOnboarded === 'true') {
        setHasOnboarded(true);
      }

      if (storedTerritories) {
        setTerritories(JSON.parse(storedTerritories));
      }
    } catch (error) {
      console.log('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (googleUser?: { name: string; email: string; avatar?: string }) => {
    const newUser: User = {
      ...MOCK_USER,
      id: `user-${Date.now()}`,
      name: googleUser?.name || 'Runner',
      email: googleUser?.email || 'runner@example.com',
      avatar: googleUser?.avatar || MOCK_USER.avatar,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalPoints: 0,
      totalDistance: 0,
      territoriesCount: 0,
      isPremium: false,
      createdAt: new Date(),
    };

    setUser(newUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    console.log('User logged in:', newUser.name);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    setHasOnboarded(false);
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.HAS_ONBOARDED]);
    console.log('User logged out');
  }, []);

  const completeOnboarding = useCallback(async () => {
    setHasOnboarded(true);
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, 'true');
    console.log('Onboarding completed');
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    console.log('Profile updated');
  }, [user]);

  const upgradeToPremium = useCallback(async () => {
    if (!user) return;
    const updatedUser = { ...user, isPremium: true };
    setUser(updatedUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    console.log('Upgraded to premium');
  }, [user]);

  const startRun = useCallback(() => {
    const newRun: RunSession = {
      id: `run-${Date.now()}`,
      userId: user?.id || '',
      path: [userLocation],
      distance: 0,
      duration: 0,
      pace: 0,
      startTime: new Date(),
      status: 'active',
    };
    setCurrentRun(newRun);
    console.log('Run started');
    return newRun;
  }, [user, userLocation]);

  const updateRunPath = useCallback((newPoint: Coordinate) => {
    setCurrentRun(prev => {
      if (!prev) return prev;

      const updatedPath = [...prev.path, newPoint];
      const distance = calculatePathDistance(updatedPath);
      const duration = (Date.now() - prev.startTime.getTime()) / 1000;
      const pace = duration > 0 && distance > 0 ? duration / 60 / distance : 0;

      return {
        ...prev,
        path: updatedPath,
        distance,
        duration,
        pace,
      };
    });
  }, []);

  const endRun = useCallback(async () => {
    if (!currentRun || !user) return null;

    const completedRun = {
      ...currentRun,
      status: 'completed' as const,
      endTime: new Date(),
    };

    const isClosedPath = checkIfPathClosed(completedRun.path);
    let newTerritory: Territory | null = null;

    if (isClosedPath && completedRun.path.length >= 4) {
      const canCreateTerritory = user.isPremium || 
        territories.filter(t => t.ownerId === user.id).length < FREE_TERRITORY_LIMIT;

      if (canCreateTerritory) {
        newTerritory = {
          id: `territory-${Date.now()}`,
          name: `Zone ${territories.length + 1}`,
          coordinates: completedRun.path,
          ownerId: user.id,
          ownerName: user.name,
          ownerAvatar: user.avatar,
          color: Colors.territoryColors[territories.length % Colors.territoryColors.length],
          area: calculatePolygonArea(completedRun.path),
          conqueredAt: new Date(),
          pointsValue: Math.round(calculatePolygonArea(completedRun.path) * 1000),
        };

        const updatedTerritories = [...territories, newTerritory];
        setTerritories(updatedTerritories);
        await AsyncStorage.setItem(STORAGE_KEYS.TERRITORIES, JSON.stringify(updatedTerritories));

        const xpGained = POINTS_PER_TERRITORY + Math.round(completedRun.distance * POINTS_PER_KM);
        const newXp = user.xp + xpGained;
        const levelInfo = getLevelInfo(newXp);

        await updateProfile({
          xp: newXp,
          level: levelInfo.level,
          totalPoints: user.totalPoints + newTerritory.pointsValue,
          totalDistance: user.totalDistance + completedRun.distance,
          territoriesCount: user.territoriesCount + 1,
        });

        const newActivity: Activity = {
          id: `activity-${Date.now()}`,
          type: 'territory_conquered',
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          description: `conquered ${newTerritory.name}`,
          timestamp: new Date(),
          metadata: { territoryId: newTerritory.id, territoryName: newTerritory.name },
        };
        setActivities(prev => [newActivity, ...prev]);
      }
    } else {
      const xpGained = Math.round(completedRun.distance * POINTS_PER_KM);
      if (xpGained > 0) {
        const newXp = user.xp + xpGained;
        const levelInfo = getLevelInfo(newXp);
        await updateProfile({
          xp: newXp,
          level: levelInfo.level,
          totalDistance: user.totalDistance + completedRun.distance,
        });
      }
    }

    setCurrentRun(null);
    console.log('Run ended, territory created:', !!newTerritory);
    return { run: completedRun, territory: newTerritory };
  }, [currentRun, user, territories, updateProfile]);

  const userTerritories = useMemo(() => 
    territories.filter(t => t.ownerId === user?.id),
    [territories, user?.id]
  );

  const canCreateTerritory = useMemo(() => 
    user?.isPremium || userTerritories.length < FREE_TERRITORY_LIMIT,
    [user?.isPremium, userTerritories.length]
  );

  return {
    user,
    isAuthenticated,
    hasOnboarded,
    isLoading,
    territories,
    groups,
    activities,
    currentRun,
    userLocation,
    userTerritories,
    canCreateTerritory,
    rankings: MOCK_RANKINGS,
    login,
    logout,
    completeOnboarding,
    updateProfile,
    upgradeToPremium,
    startRun,
    updateRunPath,
    endRun,
    setUserLocation,
  };
});

function calculatePathDistance(path: Coordinate[]): number {
  let distance = 0;
  for (let i = 1; i < path.length; i++) {
    distance += haversineDistance(path[i - 1], path[i]);
  }
  return distance;
}

function haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371;
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function checkIfPathClosed(path: Coordinate[]): boolean {
  if (path.length < 4) return false;
  const first = path[0];
  const last = path[path.length - 1];
  const distance = haversineDistance(first, last);
  return distance < 0.05;
}

function calculatePolygonArea(coords: Coordinate[]): number {
  if (coords.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    area += coords[i].longitude * coords[j].latitude;
    area -= coords[j].longitude * coords[i].latitude;
  }
  return Math.abs(area / 2) * 111 * 111;
}
