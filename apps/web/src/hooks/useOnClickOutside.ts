// src/hooks/useOnClickOutside.ts

import type { RefObject } from 'react';

import { useEventListener } from './useEventListener';

// Define the type for the click event handler
type Handler = (event: MouseEvent) => void;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>, // Reference to the DOM element that triggers the click outside event
  handler: Handler, // Custom handler function to be called on click outside
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown' // Specify the mouse event to listen for
): void {
  // Use the useEventListener hook to handle mouse events
  useEventListener(mouseEvent, event => {
    const el = ref?.current;

    // Do nothing if clicking ref's element or descendent elements
    if (!el || el.contains(event.target as Node)) {
      return;
    }

    handler(event);
  });
}
