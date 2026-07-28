import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUiSound } from "../hooks/useUiSound";
import "./MediaGallery.css";

// items: [{ type: "image" | "video" | "360", src, caption }]
export default function MediaGallery({ items, startIndex = 0, onClose, onOpen360 }) {
  const [index, setIndex] = useState(startIndex);
  const { playClick, playClose } = useUiSound();
  const item = items[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const go = (dir) => {
    setIndex((current) => {
      const next = current + dir;
      if (next < 0 || next >= items.length) return current;
      playClick();
      return next;
    });
  };

  const handleClose = () => {
    playClose();
    onClose();
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -80) go(1);
    else if (info.offset.x > 80) go(-1);
  };

  return (
    <motion.div
      className="media-gallery"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button type="button" className="media-gallery__close" data-cursor-hover onClick={handleClose} aria-label="Cerrar">
        × Cerrar
      </button>

      <div className="media-gallery__stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="media-gallery__frame"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {item.type === "video" && (
              <video src={item.src} controls autoPlay playsInline className="media-gallery__media" />
            )}
            {item.type === "image" && (
              <img src={item.src} alt={item.caption || ""} draggable={false} className="media-gallery__media" />
            )}
            {item.type === "360" && (
              <button
                type="button"
                data-cursor-hover
                className="media-gallery__pano-trigger"
                onClick={() => onOpen360(item.src)}
              >
                <img src={item.src} alt={item.caption || "Tour 360°"} draggable={false} className="media-gallery__media" />
                <span className="media-gallery__pano-badge">Ver tour 360°</span>
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {items.length > 1 && (
        <div className="media-gallery__nav">
          <button type="button" data-cursor-hover onClick={() => go(-1)} disabled={index === 0}>
            ‹
          </button>
          <div className="media-gallery__dots">
            {items.map((_, i) => (
              <span key={i} className={i === index ? "is-active" : ""} />
            ))}
          </div>
          <button type="button" data-cursor-hover onClick={() => go(1)} disabled={index === items.length - 1}>
            ›
          </button>
        </div>
      )}
    </motion.div>
  );
}
