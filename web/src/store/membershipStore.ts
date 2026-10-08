import { create } from 'zustand';
import type { PlanStatus } from '../types';

interface MembershipState {
  status: PlanStatus | null;
  currentPeriodEnd: string | null;
  isAdmin: boolean;
  loading: boolean;
  setFromProfile: (p: { plan_status: PlanStatus; current_period_end: string | null; is_admin: boolean } | null) => void;
  reset: () => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  status: null,
  currentPeriodEnd: null,
  isAdmin: false,
  loading: true,

  setFromProfile: (p) =>
    set({
      status: p?.plan_status ?? 'inactive',
      currentPeriodEnd: p?.current_period_end ?? null,
      isAdmin: p?.is_admin ?? false,
      loading: false,
    }),

  reset: () => set({ status: null, currentPeriodEnd: null, isAdmin: false, loading: false }),
}));

// Estado derivado: acceso = trial o active (past_due aún permite acceso mientras Stripe reintenta)
export const hasActiveAccess = (s: PlanStatus | null) =>
  s === 'active' || s === 'trial' || s === 'past_due';
