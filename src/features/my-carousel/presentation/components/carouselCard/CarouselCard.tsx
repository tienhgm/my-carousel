import type { CarouselItem } from "@/features/my-carousel/models/my-carousel.model";
import styles from "./style.module.css";
import React from "react";

const CarouselCard = React.memo(
  ({
    item,
    cardWidth,
    hasMovedRef,
    onResetMoved,
  }: {
    item: CarouselItem;
    cardWidth: number;
    hasMovedRef: React.RefObject<boolean>;
    onResetMoved: () => void;
  }) => {
    const handleClick = (e: React.MouseEvent) => {
      if (hasMovedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onResetMoved();
      window.open(item.landing_page, "_blank");
    };

    return (
      <div
        className={styles["carousel-card"]}
        style={{ width: cardWidth, height: cardWidth }}
        onClick={handleClick}
      >
        <img
          src={item.image}
          alt={item.title}
          draggable={false}
          style={{ pointerEvents: "none", width: "100%", display: "block" }}
        />
        <div className={styles["card-info"]}>{item.title}</div>
      </div>
    );
  },
);

export default CarouselCard;
