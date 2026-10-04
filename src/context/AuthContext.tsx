import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/client';
import { Family, Member, User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  family: Family | null;
  members: Member[];
  currentMember: Member | null;
  isManager: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  registerManager: (name: string, email: string, password: string, familyName: string) => Promise<void>;
  joinFamily: (name: string, email: string, password: string, inviteCode: string) => Promise<void>;
  logout: () => void;
  refreshMembers: () => Promise<void>;
  refreshFamily: () => Promise<void>;
  switchDemo: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const me = await api.getMe();
      setUser(me);
      if (me) {
        const [fam, mems] = await Promise.all([
          api.getFamily(me.familyId),
          api.getMembers(me.familyId),
        ]);
        setFamily(fam);
        setMembers(mems);
      } else {
        setFamily(null);
        setMembers([]);
      }
    } catch (e) {
      console.error('Failed to load initial data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      const [fam, mems] = await Promise.all([
        api.getFamily(res.user.familyId),
        api.getMembers(res.user.familyId),
      ]);
      setFamily(fam);
      setMembers(mems);
    } finally {
      setLoading(false);
    }
  };

  const registerManager = async (name: string, email: string, password: string, familyName: string) => {
    setLoading(true);
    try {
      const res = await api.registerManager(name, email, password, familyName);
      setUser(res.user);
      setFamily(res.family);
      const mems = await api.getMembers(res.family.id);
      setMembers(mems);
    } finally {
      setLoading(false);
    }
  };

  const joinFamily = async (name: string, email: string, password: string, inviteCode: string) => {
    setLoading(true);
    try {
      const res = await api.joinFamily(name, email, password, inviteCode);
      setUser(res.user);
      setFamily(res.family);
      const mems = await api.getMembers(res.family.id);
      setMembers(mems);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logoutUser();
    setUser(null);
    setFamily(null);
    setMembers([]);
  };

  const refreshMembers = async () => {
    if (user?.familyId) {
      const mems = await api.getMembers(user.familyId);
      setMembers(mems);
    }
  };

  const refreshFamily = async () => {
    if (user?.familyId) {
      const fam = await api.getFamily(user.familyId);
      setFamily(fam);
    }
  };

  const switchDemo = async (role: UserRole) => {
    setLoading(true);
    try {
      const switchedUser = await api.switchDemoUser(role);
      setUser(switchedUser);
      const [fam, mems] = await Promise.all([
        api.getFamily(switchedUser.familyId),
        api.getMembers(switchedUser.familyId),
      ]);
      setFamily(fam);
      setMembers(mems);
    } finally {
      setLoading(false);
    }
  };

  const isManager = user?.role === 'manager';
  const currentMember = members.find((m) => m.id === user?.memberId) || members[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        family,
        members,
        currentMember,
        isManager,
        loading,
        login,
        registerManager,
        joinFamily,
        logout,
        refreshMembers,
        refreshFamily,
        switchDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
