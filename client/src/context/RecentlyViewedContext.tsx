import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface RecentlyViewedContextValue {
  recentIds: string[];
  addViewed: (productId: string) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue>({
  recentIds: [],
  addViewed: () => {},
});

const STORAGE_KEY = "3s_recently_viewed";
const MAX_ITEMS = 10;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_ITEMS);
    }
  } catch {}
  return [];
}

function saveRecent(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>(() => loadRecent());

  const addViewed = useCallback((productId: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const next = [productId, ...filtered].slice(0, MAX_ITEMS);
      saveRecent(next);
      return next;
    });
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ recentIds, addViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}
