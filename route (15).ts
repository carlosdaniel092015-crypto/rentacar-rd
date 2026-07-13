"use client";

import { useEffect } from "react";

export default function NativeAppShell() {
  useEffect(() => {
    let touchStartY = 0;

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const isPinching = event.touches.length > 1;
      const isPullingDownAtTop =
        window.scrollY <= 0 && (event.touches[0]?.clientY ?? 0) > touchStartY;

      if (isPinching || isPullingDownAtTop) event.preventDefault();
    };

    const preventGestureZoom = (event: Event) => event.preventDefault();

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("gesturestart", preventGestureZoom);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("gesturestart", preventGestureZoom);
    };
  }, []);

  return null;
}
