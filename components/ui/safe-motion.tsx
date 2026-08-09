"use client";

/**
 * SafeMotion wrapper for Framer Motion components.
 * Prevents SSR hydration mismatch by disabling initial animation
 * during server-side rendering. Only animates after client hydration.
 *
 * Usage: Replace <motion.div initial={{ opacity: 0 }} ... />
 * with:   <motion.div initial={isClient ? { opacity: 0 } : false} ... />
 *
 * Or use this hook in your component:
 *   const isClient = useIsClient();
 *   <motion.div initial={isClient ? { opacity: 0 } : false} ... />
 */

import { useState, useEffect } from "react";

export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
