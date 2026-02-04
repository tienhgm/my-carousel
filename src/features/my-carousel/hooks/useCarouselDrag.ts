import { useRef, useState, useCallback, useEffect } from "react";

const SLIDE_SPEED = 300;
const MIN_DRAG_DISTANCE = 40;

interface UseCarouselDragProps {
  size: number;
  playTime?: number;
}

export function useCarouselDrag({
  size,
  playTime = 3000,
}: UseCarouselDragProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isPaused = useRef(false);
  const isAnimatingRef = useRef(false);
  const hasMoved = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const applyStyles = useCallback(
    (index: number, duration: number) => {
      if (!containerRef.current) return;

      containerRef.current.style.transition =
        duration > 0
          ? `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
          : "none";

      containerRef.current.style.transform = `translateX(${-index * size}px)`;
    },
    [size],
  );

  const moveSlide = useCallback(
    (nextIndex: number, speed = SLIDE_SPEED) => {
      isAnimatingRef.current = true;
      setCurrentIndex(nextIndex);
      applyStyles(nextIndex, speed);
    },
    [applyStyles],
  );

  const handleStart = (clientX: number) => {
    if (!containerRef.current || isAnimatingRef.current) return;
    isDragging.current = true;
    containerRef.current.parentElement?.classList.add("is-dragging");
    hasMoved.current = false;
    startX.current = clientX;

    const matrix = new DOMMatrixReadOnly(
      window.getComputedStyle(containerRef.current).transform,
    );
    currentX.current = matrix.m41;

    containerRef.current.style.transition = "none";
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;

    const diff = clientX - startX.current;
    if (Math.abs(diff) > 5) hasMoved.current = true;

    containerRef.current.style.transform = `translateX(${currentX.current + diff}px)`;
  };

  const handleEnd = (clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;

    isDragging.current = false;
    containerRef.current.parentElement?.classList.remove("is-dragging");
    const matrix = new DOMMatrixReadOnly(
      window.getComputedStyle(containerRef.current).transform,
    );
    const currentActualX = matrix.m41;
    const closestIndex = Math.round(-currentActualX / size);
    const diff = clientX - startX.current;

    if (Math.abs(diff) > MIN_DRAG_DISTANCE) {
      const direction = diff > 0 ? -1 : 1;
      moveSlide(
        closestIndex === currentIndex ? currentIndex + direction : closestIndex,
      );
    } else {
      moveSlide(currentIndex);
    }
  };

  const resetMoved = () => {
    hasMoved.current = false;
    isAnimatingRef.current = false;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused.current || isDragging.current || isAnimatingRef.current)
        return;
      moveSlide(currentIndex + 1);
    }, playTime);

    return () => clearInterval(timer);
  }, [currentIndex, moveSlide, playTime]);

  return {
    containerRef,
    currentIndex,
    isAnimatingRef,
    hasMoved,
    resetMoved,
    moveSlide,
    handlers: {
      viewport: {
        onMouseEnter: () => (isPaused.current = true),
        onMouseLeave: (e: React.MouseEvent) => {
          isPaused.current = false;
          if (isDragging.current) handleEnd(e.clientX);
        },
        onMouseMove: (e: React.MouseEvent) => handleMove(e.clientX),
        onMouseUp: (e: React.MouseEvent) => handleEnd(e.clientX),
      },
      container: {
        onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX),
        onTouchStart: (e: React.TouchEvent) =>
          handleStart(e.touches[0].clientX),
        onTouchMove: (e: React.TouchEvent) => handleMove(e.touches[0].clientX),
        onTouchEnd: (e: React.TouchEvent) =>
          handleEnd(e.changedTouches[0].clientX),
        onTransitionEnd: () => (isAnimatingRef.current = false),
      },
    },
  };
}
