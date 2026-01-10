import { Territory, User, Group, Activity, RankingEntry, Coordinate } from '@/types';
import Colors from '@/constants/colors';

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Runner Pro',
  email: 'runner@example.com',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop',
  level: 5,
  xp: 1250,
  xpToNextLevel: 250,
  totalPoints: 2450,
  totalDistance: 78.5,
  territoriesCount: 8,
  isPremium: false,
  createdAt: new Date('2024-01-15'),
};

export const DEFAULT_LOCATION: Coordinate = {
  latitude: -23.5505,
  longitude: -46.6333,
};

export const MOCK_TERRITORIES: Territory[] = [
  {
    id: 'territory-1',
    name: 'Central Park',
    coordinates: [
      { latitude: -23.5505, longitude: -46.6353 },
      { latitude: -23.5485, longitude: -46.6333 },
      { latitude: -23.5505, longitude: -46.6313 },
      { latitude: -23.5525, longitude: -46.6333 },
    ],
    ownerId: 'user-1',
    ownerName: 'Runner Pro',
    color: Colors.territoryColors[0],
    area: 0.15,
    conqueredAt: new Date('2024-06-10'),
    pointsValue: 150,
  },
  {
    id: 'territory-2',
    name: 'Riverside Zone',
    coordinates: [
      { latitude: -23.5545, longitude: -46.6393 },
      { latitude: -23.5525, longitude: -46.6373 },
      { latitude: -23.5545, longitude: -46.6353 },
      { latitude: -23.5565, longitude: -46.6373 },
    ],
    ownerId: 'user-2',
    ownerName: 'Speed Demon',
    color: Colors.territoryColors[1],
    area: 0.12,
    conqueredAt: new Date('2024-06-08'),
    pointsValue: 120,
  },
  {
    id: 'territory-3',
    name: 'Downtown District',
    coordinates: [
      { latitude: -23.5465, longitude: -46.6293 },
      { latitude: -23.5445, longitude: -46.6273 },
      { latitude: -23.5465, longitude: -46.6253 },
      { latitude: -23.5485, longitude: -46.6273 },
    ],
    ownerId: 'user-3',
    ownerName: 'Marathon King',
    groupId: 'group-1',
    groupName: 'Elite Runners',
    color: Colors.territoryColors[2],
    area: 0.18,
    conqueredAt: new Date('2024-06-05'),
    pointsValue: 180,
  },
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'group-1',
    name: 'Elite Runners',
    description: 'Top runners competing for territory',
    color: Colors.territoryColors[2],
    memberCount: 12,
    totalPoints: 15600,
    territoriesCount: 24,
    ownerId: 'user-3',
    members: [
      { userId: 'user-3', userName: 'Marathon King', role: 'owner', points: 5200, joinedAt: new Date('2024-01-01') },
      { userId: 'user-4', userName: 'Swift Runner', role: 'admin', points: 4100, joinedAt: new Date('2024-01-15') },
      { userId: 'user-5', userName: 'Trail Blazer', role: 'member', points: 3200, joinedAt: new Date('2024-02-01') },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'group-2',
    name: 'City Conquerers',
    description: 'Taking over the urban jungle',
    color: Colors.territoryColors[3],
    memberCount: 8,
    totalPoints: 9800,
    territoriesCount: 16,
    ownerId: 'user-6',
    members: [
      { userId: 'user-6', userName: 'Urban Legend', role: 'owner', points: 3800, joinedAt: new Date('2024-02-01') },
      { userId: 'user-7', userName: 'Street King', role: 'member', points: 2900, joinedAt: new Date('2024-02-15') },
    ],
    createdAt: new Date('2024-02-01'),
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'activity-1',
    type: 'territory_conquered',
    userId: 'user-1',
    userName: 'Runner Pro',
    description: 'conquered Central Park',
    timestamp: new Date(Date.now() - 3600000),
    metadata: { territoryId: 'territory-1', territoryName: 'Central Park' },
  },
  {
    id: 'activity-2',
    type: 'run_completed',
    userId: 'user-2',
    userName: 'Speed Demon',
    description: 'completed a 5.2 km run',
    timestamp: new Date(Date.now() - 7200000),
    metadata: { distance: 5.2 },
  },
  {
    id: 'activity-3',
    type: 'level_up',
    userId: 'user-3',
    userName: 'Marathon King',
    description: 'reached Level 8',
    timestamp: new Date(Date.now() - 14400000),
    metadata: { level: 8 },
  },
  {
    id: 'activity-4',
    type: 'territory_conquered',
    userId: 'user-4',
    userName: 'Swift Runner',
    description: 'conquered Harbor Zone',
    timestamp: new Date(Date.now() - 28800000),
    metadata: { territoryId: 'territory-4', territoryName: 'Harbor Zone' },
  },
];

export const MOCK_RANKINGS: RankingEntry[] = [
  { rank: 1, userId: 'user-3', userName: 'Marathon King', points: 5200, territoriesCount: 15, level: 8 },
  { rank: 2, userId: 'user-4', userName: 'Swift Runner', points: 4100, territoriesCount: 12, level: 7 },
  { rank: 3, userId: 'user-2', userName: 'Speed Demon', points: 3500, territoriesCount: 10, level: 6 },
  { rank: 4, userId: 'user-1', userName: 'Runner Pro', points: 2450, territoriesCount: 8, level: 5 },
  { rank: 5, userId: 'user-5', userName: 'Trail Blazer', points: 2100, territoriesCount: 7, level: 5 },
  { rank: 6, userId: 'user-6', userName: 'Urban Legend', points: 1850, territoriesCount: 6, level: 4 },
  { rank: 7, userId: 'user-7', userName: 'Street King', points: 1600, territoriesCount: 5, level: 4 },
  { rank: 8, userId: 'user-8', userName: 'Path Seeker', points: 1200, territoriesCount: 4, level: 3 },
];
