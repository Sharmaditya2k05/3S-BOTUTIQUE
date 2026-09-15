import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "../lib/api";

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  wishlist?: string[];
  createdAt?: string;
}

interface CustomerAuthContextValue {
  customer: CustomerProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; city: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; city?: string }) => Promise<void>;
  refresh: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue>({
  customer: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  refresh: async () => {},
});

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<CustomerProfile>("/customers/me");
      setCustomer(data);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<CustomerProfile>("/customers/login", { email, password });
    setCustomer(data);
  }, []);

  const register = useCallback(async (data: { name: string; email: string; phone: string; city: string; password: string }) => {
    const profile = await api.post<CustomerProfile>("/customers/register", data);
    setCustomer(profile);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/customers/logout");
    setCustomer(null);
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string; city?: string }) => {
    const updated = await api.put<CustomerProfile>("/customers/me", data);
    setCustomer((prev) => (prev ? { ...prev, ...updated } : null));
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, register, logout, updateProfile, refresh }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
