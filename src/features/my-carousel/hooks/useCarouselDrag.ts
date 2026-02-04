import { useRef, useState, useCallback, useEffect } from "react";

const SLIDE_SPEED = 300;
const MIN_DRAG_DISTANCE = 40;
const VELOCITY_THRESHOLD = 0.3;
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
  const startTime = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);

  const applyStyles = useCallback((translate: number, duration: number) => {
    if (!containerRef.current) return;

    containerRef.current.style.transition =
      duration > 0
        ? `transform ${duration}ms cubic-bezier(0.165, 0.84, 0.44, 1)`
        : "none";

    containerRef.current.style.transform = `translateX(${translate}px)`;
    currentTranslate.current = translate;
  }, []);

  const moveSlide = useCallback(
    (nextIndex: number, speed = SLIDE_SPEED) => {
      isAnimatingRef.current = true;
      setCurrentIndex(nextIndex);
      const targetTranslate = -nextIndex * size;
      applyStyles(targetTranslate, speed);
      prevTranslate.current = targetTranslate;
    },
    [applyStyles, size],
  );

  const handleStart = (clientX: number) => {
    if (!containerRef.current) return;
    hasMoved.current = false;
    isDragging.current = true;
    containerRef.current.parentElement?.classList.add("is-dragging");
    startX.current = clientX;
    startTime.current = Date.now();

    const matrix = new DOMMatrixReadOnly(
      window.getComputedStyle(containerRef.current).transform,
    );
    const currentActualX = matrix.m41;

    containerRef.current.style.transition = "none";
    containerRef.current.style.transform = `translateX(${currentActualX}px)`;

    prevTranslate.current = currentActualX;
    currentTranslate.current = currentActualX;
    isAnimatingRef.current = false;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;

    const diff = clientX - startX.current;
    if (Math.abs(diff) > 5) hasMoved.current = true;

    const rawTranslate = prevTranslate.current + diff;

    const minTranslate = -(currentIndex + 2) * size - size * 1.2;
    const maxTranslate = -(currentIndex - 2) * size + size * 1.2;

    currentTranslate.current = Math.min(
      maxTranslate,
      Math.max(minTranslate, rawTranslate),
    );

    containerRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
  };

  const handleEnd = (clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;
    isDragging.current = false;
    containerRef.current.parentElement?.classList.remove("is-dragging");

    const diff = clientX - startX.current;
    const absDiff = Math.abs(diff);
    const timeElapsed = Date.now() - startTime.current;
    const velocity = diff / timeElapsed;
    const absVelocity = Math.abs(velocity);
    const direction = diff > 0 ? -1 : 1;

    let nextIndex = currentIndex;

    if (absDiff < MIN_DRAG_DISTANCE) {
      nextIndex = currentIndex;
    } else {
      const dragDistanceInSlides = absDiff / size;

      if (dragDistanceInSlides <= 1.0) {
        nextIndex = currentIndex + direction;
      } else {
        nextIndex =
          dragDistanceInSlides > 1.3
            ? currentIndex + direction * 2
            : currentIndex + direction;
      }

      if (absVelocity > VELOCITY_THRESHOLD && dragDistanceInSlides > 0.7) {
        nextIndex = currentIndex + direction * 2;
      }
    }

    const finalNextIndex = Math.max(
      currentIndex - 2,
      Math.min(currentIndex + 2, nextIndex),
    );

    const jumpCount = Math.abs(finalNextIndex - currentIndex);

    let dynamicSpeed = Math.max(300, 550 - absVelocity * 100);
    if (jumpCount > 1) dynamicSpeed += 150;

    moveSlide(finalNextIndex, Math.min(400, dynamicSpeed));
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
        onTransitionEnd: () => {
          isAnimatingRef.current = false;
          prevTranslate.current = -currentIndex * size;
        },
      },
    },
  };
}
