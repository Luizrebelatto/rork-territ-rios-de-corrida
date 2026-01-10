export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Territory {
  id: string;
  name: string;
  coordinates: Coordinate[];
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  groupId?: string;
  groupName?: string;
  color: string;
  area: number;
  conqueredAt: Date;
  pointsValue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalPoints: number;
  totalDistance: number;
  territoriesCount: number;
  isPremium: boolean;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  color: string;
  memberCount: number;
  totalPoints: number;
  territoriesCount: number;
  members: GroupMember[];
  createdAt: Date;
  ownerId: string;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'owner' | 'admin' | 'member';
  points: number;
  joinedAt: Date;
}

export interface RunSession {
  id: string;
  userId: string;
  path: Coordinate[];
  distance: number;
  duration: number;
  pace: number;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'paused';
  territoryCreated?: Territory;
}

export interface Activity {
  id: string;
  type: 'territory_conquered' | 'territory_lost' | 'level_up' | 'run_completed' | 'group_joined';
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  timestamp: Date;
  metadata?: {
    territoryId?: string;
    territoryName?: string;
    distance?: number;
    level?: number;
    groupName?: string;
  };
}

export interface RankingEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  territoriesCount: number;
  level: number;
}
