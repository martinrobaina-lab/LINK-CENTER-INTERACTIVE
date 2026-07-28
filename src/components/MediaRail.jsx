import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { media } from "../data/project";
import { useUiSound } from "../hooks/useUiSound";
import "./MediaRail.css";

// Width of the empty band between the contained masterplan video and the
// right edge of the screen. Falls back to 280px until metadata loads.
function useBandWidth() {
  const [width, setWidth] = useState(280);

  useEffect(() => {
    const compute = () => {
      const v = document.querySelector(".masterplan__video");
      if (!v || !v.videoWidth || !v.videoHeight) return;
      const scale = Math.min(window.innerWidth / v.videoWidth, window.innerHeight / v.videoHeight);
      const renderedW = v.videoWidth * scale;
      const band = Math.round((window.innerWidth - renderedW) / 2);
      if (band > 120) setWidth(band);
    };

    compute();
    const v = document.querySelector(".masterplan__video");
    v?.addEventListener("loadedmetadata", compute);
    window.addEventListener("resize", compute);
    return () => {
      v?.removeEventListener("loadedmetadata", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return width;
}

export default function MediaRail({ onOpenVideo }) {
  const { playHover, playClick } = useUiSound();
  const videoRef = useRef(null);
  const width = useBandWidth();

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <motion.aside
      className="media-rail"
      style={{ width }}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        data-cursor-hover
        className="media-rail__video-btn"
        onMouseEnter={playHover}
        onClick={() => {
          playClick();
          onOpenVideo();
        }}
        aria-label="Ver video institucional a pantalla completa"
      >
        <video
          ref={videoRef}
          className="media-rail__video"
          src={media.video}
          muted
          loop
          playsInline
        />
        <span className="media-rail__led" aria-hidden="true" />
        <span className="media-rail__scanline" aria-hidden="true" />
      </button>
    </motion.aside>
  );
}
