import { create } from 'zustand';
import type { PlanStatus, Profile } from '../types';

interface MembershipState {
  status: PlanStatus | null;
  trialEndDate: string | null;
  isAdmin: boolean;
  loading: boolean;
  setFromProfile: (p: Profile | null) => void;
  reset: () => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  status: null,
  trialEndDate: null,
  isAdmin: false,
  loading: true,

  setFromProfile: (p) =>
    set({
      // El trial solo cuenta si no venció (coherente con la RLS de membership_content)
      status:
        p?.plan_status === 'trial' && p.trial_end_date && new Date(p.trial_end_date) < new Date()
          ? 'expired'
          : (p?.plan_status ?? 'inactive'),
      trialEndDate: p?.trial_end_date ?? null,
      isAdmin: p?.is_admin ?? false,
      loading: false,
    }),

  reset: () => set({ status: null, trialEndDate: null, isAdmin: false, loading: false }),
}));

// Estado derivado: acceso = trial o active (past_due aún permite acceso mientras Stripe reintenta)
export const hasActiveAccess = (s: PlanStatus | null) =>
  s === 'active' || s === 'trial' || s === 'past_due';
