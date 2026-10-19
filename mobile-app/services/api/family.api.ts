import { apiClient } from './client';

export interface PairedMember {
  id: string;
  name: string;
  email?: string;
  relationship: string;
  status: 'ACTIVE' | 'PENDING' | 'REVOKED';
  permissions: {
    milestones: boolean;
    appointments: boolean;
    kicks: boolean;
    emergency: boolean;
  };
  connectedDate: string;
  pairedAt?: string;
  avatarColor?: string;
}

export interface MotherLiveData {
  success: boolean;
  isPaired: boolean;
  relationship: string;
  pairedSince?: string;
  permissions: {
    milestones: boolean;
    appointments: boolean;
    kicks: boolean;
    emergency: boolean;
  };
  mother: {
    id: string;
    name: string;
    email: string;
    nickname: string;
    currentWeek: number;
    currentDay: number;
    trimester: number;
    daysRemaining: number;
    dueDate?: string;
    bloodGroup: string;
    height: number;
    heightFt?: string;
    currentWeight: number;
    prePregnancyWeight: number;
    weightGainedKg: number;
    motherAge: number;
    doctorName: string;
    hospitalName: string;
    doctorPhone: string;
    emergencyContactName: string;
    emergencyContactRelation: string;
    emergencyContactPhone: string;
    medicalNotes: string;
  };
  today: {
    dateStr: string;
    steps: number;
    stepGoal: number;
    distanceKm: number;
    caloriesKcal: number;
    activeMinutes: number;
    stepPercentage: number;
    sleepMinutes: number;
    sleepQuality: string;
    sleepHoursFormatted: string;
    waterMl: number;
    waterGoalMl: number;
    waterPercentage: number;
    waterGlasses: number;
    kicks: {
      count: number;
      durationSeconds: number;
      durationFormatted: string;
      reachedTen: boolean;
      startTime?: string;
      notes?: string;
      recordedAt: string;
    } | null;
  };
  clinicalAlerts: {
    hasUrgentSymptom: boolean;
    recentSymptoms: Array<{
      id: string;
      symptoms: string[];
      severity?: string;
      notes?: string;
      isUrgent: boolean;
      createdAt: string;
      dateStr: string;
    }>;
  };
  appointments: Array<{
    id: string;
    title: string;
    doctorName: string;
    hospitalName: string;
    doctorPhone: string;
    appointmentDate: string;
    timeStr: string;
    notes?: string;
    status: string;
    dateStr: string;
  }>;
  routineChecklist: {
    week: number;
    tasks: Array<{
      id: string;
      title: string;
      category: string;
      timeOfDay?: string;
      isCompleted: boolean;
    }>;
    totalTasks: number;
    completedTasks: number;
  };
  doctorNotes: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    dateStr?: string;
  }>;
}

export interface PendingRequest {
  id: string;
  caregiverId: string;
  name: string;
  email: string;
  relationship: string;
  status: 'Pending';
  permissions: {
    milestones: boolean;
    appointments: boolean;
    kicks: boolean;
    emergency: boolean;
  };
  requestedAt: string;
  connectedDate: string;
}

export const familyApi = {
  /**
   * Get mother's active code, paired members, and pending link requests
   */
  getMyCode: async (): Promise<{
    success: boolean;
    pairingCode: string;
    status: string;
    pairedMembers: PairedMember[];
    pendingRequests: PendingRequest[];
  }> => {
    const res = await apiClient.get('/family/my-code');
    return res.data;
  },

  /**
   * Generate a fresh code
   */
  generateNewCode: async (relationship?: string): Promise<{
    success: boolean;
    message: string;
    pairingCode: string;
  }> => {
    const res = await apiClient.post('/family/generate-code', { relationship });
    return res.data;
  },

  /**
   * Mother explicitly approves a pending caregiver request
   */
  acceptRequest: async (pairingId: string): Promise<{ success: boolean; message: string; pairing: any }> => {
    const res = await apiClient.post(`/family/requests/${pairingId}/accept`);
    return res.data;
  },

  /**
   * Mother rejects a pending caregiver request
   */
  rejectRequest: async (pairingId: string): Promise<{ success: boolean; message: string; pairing: any }> => {
    const res = await apiClient.post(`/family/requests/${pairingId}/reject`);
    return res.data;
  },

  /**
   * Retrieve caregiver security audit logs
   */
  getAuditLogs: async (): Promise<{
    success: boolean;
    data: Array<{ id: string; action: string; user: string; timeStr: string }>;
  }> => {
    const res = await apiClient.get('/family/audit-logs');
    return res.data;
  },

  /**
   * Caregiver submits code to request pairing
   */
  pairWithMother: async (
    pairingCode: string,
    relationship?: string,
  ): Promise<{
    success: boolean;
    status: string;
    message: string;
    pairing: any;
    mother: { name: string; email: string };
  }> => {
    const res = await apiClient.post('/family/pair', {
      pairingCode: pairingCode.trim().toUpperCase(),
      relationship,
    });
    return res.data;
  },

  /**
   * Caregiver checks if linked or pending
   */
  getCaregiverStatus: async (): Promise<{
    isPaired: boolean;
    status: 'ACTIVE' | 'PENDING' | 'NONE';
    pairing: any;
    mother: any;
  }> => {
    const res = await apiClient.get('/family/status');
    return res.data;
  },

  /**
   * Caregiver retrieves live data of paired mother
   */
  getMotherData: async (): Promise<MotherLiveData> => {
    const res = await apiClient.get('/family/mother-data');
    return res.data;
  },

  /**
   * Unlink a pairing
   */
  unlinkPairing: async (pairingId: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/family/unlink/${pairingId}`);
    return res.data;
  },

  /**
   * Update permissions
   */
  updatePermissions: async (
    pairingId: string,
    permissions: { milestones?: boolean; appointments?: boolean; kicks?: boolean; emergency?: boolean },
  ): Promise<{ success: boolean; message: string; permissions: any }> => {
    const res = await apiClient.patch(`/family/permissions/${pairingId}`, permissions);
    return res.data;
  },
};

