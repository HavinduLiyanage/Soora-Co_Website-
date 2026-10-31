"use client";
import { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultSettings, type StoreSettings } from "@/lib/admin/schema";
const StoreContext = createContext(defaultSettings);
export const useStore = () => useContext(StoreContext);
export function StoreProvider({
  settings,
  children,
}: {
  settings: StoreSettings;
  children: React.ReactNode;
}) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);
  return (
    <StoreContext.Provider value={settings}>{children}</StoreContext.Provider>
  );
}
