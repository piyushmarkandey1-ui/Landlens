'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User, UserRole } from './types';

// Demo users for each role
export const DEMO_USERS: Record<UserRole, User> = {
  citizen: {
    id: 'U_CIT', name: 'Priya Mehta', email: 'priya.mehta@example.com',
    role: 'citizen',
  },
  revenue_officer: {
    id: 'U_REV', name: 'Suresh Kumar Patle', email: 'suresh.patle@revenue.cg.gov.in',
    role: 'revenue_officer', department: 'Board of Revenue', district: 'Raipur',
  },
  planning_officer: {
    id: 'U_PLN', name: 'Rani Dubey', email: 'rani.dubey@rda.cg.gov.in',
    role: 'planning_officer', department: 'Raipur Development Authority', district: 'Raipur',
  },
  registration_officer: {
    id: 'U_REG', name: 'Meena Chandel', email: 'meena.chandel@registration.cg.gov.in',
    role: 'registration_officer', department: 'Registration Department', district: 'Raipur',
  },
  district_admin: {
    id: 'U_DIS', name: 'R.K. Sharma IAS', email: 'rk.sharma@collector.raipur.gov.in',
    role: 'district_admin', department: 'District Collectorate', district: 'Raipur',
  },
  system_admin: {
    id: 'U_SYS', name: 'Priya Gupta', email: 'priya.gupta@nic.in',
    role: 'system_admin', department: 'NIC / IT Cell', district: 'Raipur',
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  citizen: 'Citizen',
  revenue_officer: 'Revenue Officer',
  planning_officer: 'Planning Officer',
  registration_officer: 'Registration Officer',
  district_admin: 'District Administrator',
  system_admin: 'System Administrator',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  citizen: 'text-emerald-400 bg-emerald-400/10',
  revenue_officer: 'text-amber-400 bg-amber-400/10',
  planning_officer: 'text-blue-400 bg-blue-400/10',
  registration_officer: 'text-violet-400 bg-violet-400/10',
  district_admin: 'text-cyan-400 bg-cyan-400/10',
  system_admin: 'text-rose-400 bg-rose-400/10',
};

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, login: () => {}, logout: () => {}, isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((role: UserRole) => {
    setUser(DEMO_USERS[role]);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Role permissions
export const PERMISSIONS = {
  citizen: ['view_public_parcels', 'view_land_use', 'view_restrictions', 'submit_service_request', 'track_request', 'view_ai_explanation'],
  revenue_officer: ['view_all_parcels', 'view_ror', 'view_ownership', 'view_mutations', 'create_workflow', 'view_conflicts', 'view_audit', 'view_encumbrance', 'resolve_conflict'],
  planning_officer: ['view_all_parcels', 'view_zoning', 'view_masterplan', 'view_building_permissions', 'view_infrastructure', 'view_restrictions', 'create_workflow', 'update_zoning'],
  registration_officer: ['view_all_parcels', 'view_registrations', 'view_transactions', 'verify_registration', 'view_encumbrance', 'view_audit'],
  district_admin: ['view_all_parcels', 'view_analytics', 'view_workflows', 'escalate_workflows', 'view_performance', 'view_conflicts', 'view_audit', 'view_all_data'],
  system_admin: ['all'],
} as const;

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = PERMISSIONS[role] as readonly string[];
  return perms.includes('all') || perms.includes(permission);
}
