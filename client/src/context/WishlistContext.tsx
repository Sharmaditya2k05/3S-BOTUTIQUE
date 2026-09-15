import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from "react";

interface WishlistContextValue {
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  ids: string[];
  count: number;
}

const WishlistContext = createContext<WishlistContextValue>({
  toggle: () => {},
  has: () => false,
  ids: [],
  count: 0,
});

const STORAGE_KEY = "3s_wishlist";

function loadWishlist(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveWishlist(items: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...items]));
  } catch {}
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Set<string>>(() => loadWishlist());

  useEffect(() => {
    saveWishlist(items);
  }, [items]);

  const toggle = useCallback((id: string) => {
    setItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => items.has(id), [items]);

  const ids = useMemo(() => [...items], [items]);

  return (
    <WishlistContext.Provider value={{ toggle, has, ids, count: items.size }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
