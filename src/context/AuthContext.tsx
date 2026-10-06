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
      const res = await api.getMe();
      const me = res.user || res;
      setUser(me);
      if (me) {
        const [fam, mems] = await Promise.all([
          api.getFamily(),
          api.getMembers(),
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
      const res = await api.login(email, password || '');
      api.setToken(res.token);
      setUser(res.user);
      const [fam, mems] = await Promise.all([
        api.getFamily(),
        api.getMembers(),
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
      api.setToken(res.token);
      setUser(res.user);
      setFamily(res.family);
      const mems = await api.getMembers();
      setMembers(mems);
    } finally {
      setLoading(false);
    }
  };

  const joinFamily = async (name: string, email: string, password: string, inviteCode: string) => {
    setLoading(true);
    try {
      const res = await api.joinFamily(name, email, password, inviteCode);
      api.setToken(res.token);
      setUser(res.user);
      const fam = await api.getFamily();
      setFamily(fam);
      const mems = await api.getMembers();
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
    const mems = await api.getMembers();
    setMembers(mems);
  };

  const refreshFamily = async () => {
    const fam = await api.getFamily();
    setFamily(fam);
  };

  const switchDemo = async (role: UserRole) => {
    setLoading(true);
    try {
      const res = await api.switchDemoUser(role);
      const switchedUser = res.user || res;
      setUser(switchedUser);
      const [fam, mems] = await Promise.all([
        api.getFamily(),
        api.getMembers(),
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