import { useState, useLayoutEffect, useRef } from "react";

interface ResizeProps {
  size: number;
  perView: number;
}

export function useCarouselResize({ size, perView }: ResizeProps) {
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!viewportRef.current) return;

    const initialWidth = viewportRef.current.offsetWidth;
    setViewportWidth(initialWidth);

    const observer = new ResizeObserver(([entry]) => {
      setViewportWidth(Math.round(entry.contentRect.width));
    });

    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  const computedSize = (() => {
    if (viewportWidth === null) return size;

    const maxWidth = size * perView;
    return viewportWidth < maxWidth ? viewportWidth / perView : size;
  })();

  return {
    viewportRef,
    computedSize,
    isReady: viewportWidth !== null,
  };
}
