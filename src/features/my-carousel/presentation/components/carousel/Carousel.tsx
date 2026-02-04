import React, { useMemo } from "react";
import styles from "./style.module.css";
import CarouselCard from "../carouselCard/CarouselCard";
import type { CarouselItem } from "@/features/my-carousel/models/my-carousel.model";
import { useCarouselDrag } from "@/features/my-carousel/hooks/useCarouselDrag";
import { useCarouselResize } from "@/features/my-carousel/hooks/useCarouselResize";

interface Props {
  data: CarouselItem[];
  size: number;
  perView?: number;
  playTime?: number;
  buffer?: number;
}

const Carousel: React.FC<Props> = ({
  data,
  size = 300,
  perView = 2.5,
  playTime = 3000,
  buffer = 3,
}) => {
  const slideCount = data.length;
  const { viewportRef, computedSize, isReady } = useCarouselResize({
    size,
    perView,
  });
  const {
    containerRef,
    currentIndex,
    isAnimatingRef,
    hasMoved,
    resetMoved,
    moveSlide,
    handlers,
  } = useCarouselDrag({ size: computedSize, playTime });

  const visibleItems = useMemo(() => {
    const items = [];
    const start = currentIndex - buffer;
    const end = currentIndex + buffer + Math.ceil(perView);

    for (let i = start; i <= end; i++) {
      const dataIdx = ((i % slideCount) + slideCount) % slideCount;
      items.push({ item: data[dataIdx], virtualIdx: i });
    }
    return items;
  }, [currentIndex, data, slideCount, perView, buffer]);

  return (
    <div
      ref={viewportRef}
      className={styles["carousel-viewport"]}
      style={{
        maxWidth: `${size * perView}px`,
        height: `${computedSize}px`,
        opacity: isReady ? 1 : 0,
        visibility: isReady ? "visible" : "hidden",
      }}
      {...handlers.viewport}
    >
      <button
        className={`${styles["nav-btn"]} ${styles["prev"]}`}
        onClick={() => !isAnimatingRef.current && moveSlide(currentIndex - 1)}
      >
        &#10094;
      </button>

      <div
        ref={containerRef}
        className={styles["carousel-container"]}
        style={{
          transform: `translateX(${-currentIndex * computedSize}px)`,
        }}
        {...handlers.container}
      >
        {visibleItems.map(({ item, virtualIdx }) => (
          <div
            key={`${item.id}-${virtualIdx}`}
            style={{
              position: "absolute",
              width: `${computedSize}px`,
              transform: `translateX(${virtualIdx * computedSize}px)`,
            }}
          >
            <CarouselCard
              item={item}
              cardWidth={computedSize}
              hasMovedRef={hasMoved}
              onResetMoved={resetMoved}
            />
          </div>
        ))}
      </div>

      <button
        className={`${styles["nav-btn"]} ${styles["next"]}`}
        onClick={() => !isAnimatingRef.current && moveSlide(currentIndex + 1)}
      >
        &#10095;
      </button>
    </div>
  );
};

export default Carousel;
