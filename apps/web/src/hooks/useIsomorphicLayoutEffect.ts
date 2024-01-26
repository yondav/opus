// src/hooks/useIsomorphicLayoutEffect.ts

import { useEffect, useLayoutEffect } from 'react';

// Create a custom hook that selects the appropriate effect based on the environment (client or server)
export const useIsomorphicLayoutEffect =
  // Check if the window object is defined, indicating it's the client-side
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
