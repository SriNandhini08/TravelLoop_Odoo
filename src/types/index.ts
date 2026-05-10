export interface Trip {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  shareId?: string;
  isPublic?: boolean;
  bannerUrl?: string;
  members?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Stop {
  id: string;
  tripId: string;
  city: string;
  startDate: string;
  endDate: string;
}

export interface Activity {
  id: string;
  tripId: string;
  stopId: string;
  title: string;
  cost: number;
  category: string;
  time?: string; // e.g. "10:00 AM"
  date?: string; // specific date within the stop
}

export interface Note {
  id: string;
  tripId: string;
  content: string;
}

export interface ChecklistItem {
  id: string;
  tripId: string;
  item: string;
  completed: boolean;
}

export interface Contact {
  id: string;
  tripId: string;
  name: string;
  phone: string;
  category: string;
  description?: string;
}

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  photoURL?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
