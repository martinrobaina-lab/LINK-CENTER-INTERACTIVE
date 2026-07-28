import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { zones } from "../data/project";
import { useUiSound } from "../hooks/useUiSound";
import PositionEditor from "./PositionEditor";
import "./Masterplan.css";

export default function Masterplan({ onOpenPrimary, onOpenGallery }) {
  const [activeInfo, setActiveInfo] = useState(null);
  const [zoomZone, setZoomZone] = useState(null);
  const [hotspotEdits, setHotspotEdits] = useState({}); // overrides en vivo del editor Ctrl+E
  const [videoEnded, setVideoEnded] = useState(false);
  const [frame, setFrame] = useState(null); // rendered video box in px
  const videoRef = useRef(null);
  const videoBgRef = useRef(null);
  const { playHover, playClick, playOpen } = useUiSound();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // Autoplay bloqueado — mostramos hotspots directamente
      setVideoEnded(true);
    });
  }, []);

  // Hotspots are anchored to the video content, not the viewport:
  // compute the rendered (object-fit: contain) box of the video.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const compute = () => {
      if (!v.videoWidth || !v.videoHeight) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(vw / v.videoWidth, vh / v.videoHeight);
      const w = v.videoWidth * scale;
      const h = v.videoHeight * scale;
      setFrame({ left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h });
    };
    compute();
    v.addEventListener("loadedmetadata", compute);
    window.addEventListener("resize", compute);
    return () => {
      v.removeEventListener("loadedmetadata", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const handleVideoEnded = () => {
    videoBgRef.current?.pause();
    setVideoEnded(true);
  };

  const handleHotspot = (zone) => {
    if (zoomZone) return;
    if (zone.primary) {
      playOpen();
      setActiveInfo(null);
      setZoomZone(zone);
    } else {
      playClick();
      setActiveInfo((current) => (current?.id === zone.id ? null : zone));
    }
  };

  const handleZoomComplete = () => {
    if (!zoomZone) return;
    onOpenPrimary(zoomZone);
    // reset silently once the unit panel fully covers the stage
    setTimeout(() => setZoomZone(null), 600);
  };

  const origin =
    zoomZone && frame
      ? `${frame.left + (zoomZone.hotspot.x / 100) * frame.width}px ${
          frame.top + (zoomZone.hotspot.y / 100) * frame.height
        }px`
      : zoomZone
      ? `${zoomZone.hotspot.x}% ${zoomZone.hotspot.y}%`
      : "50% 50%";
  const show = videoEnded && !zoomZone;

  return (
    <div className="masterplan">
      <motion.div
        className="masterplan__canvas"
        style={{ transformOrigin: origin }}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={
          zoomZone
            ? {
                scale: [1, 1.06, 6.5],
                opacity: 1,
                filter: [
                  "blur(0px) brightness(1)",
                  "blur(0px) brightness(1)",
                  "blur(16px) brightness(2.2)",
                ],
              }
            : { scale: 1, opacity: 1, filter: "blur(0px) brightness(1)" }
        }
        transition={
          zoomZone
            ? { duration: 1.6, times: [0, 0.22, 1], ease: [0.7, 0, 0.85, 1] }
            : { duration: 1.6, ease: [0.16, 1, 0.3, 1] }
        }
        onAnimationComplete={handleZoomComplete}
      >
        <div className={`masterplan__scene ${videoEnded ? "is-idle" : ""}`}>
          <video
            ref={videoBgRef}
            className="masterplan__video-bg"
            src="/video/sumergirse.mp4"
            muted
            loop
            autoPlay
            playsInline
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
          />
          <video
            ref={videoRef}
            className="masterplan__video"
            src="/video/sumergirse.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnded}
            style={{ pointerEvents: "none" }}
          />
          <motion.div
            className="masterplan__vignette"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: videoEnded ? 1 : 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          <div
            className="masterplan__hotspot-layer"
            style={
              frame
                ? { left: frame.left, top: frame.top, width: frame.width, height: frame.height }
                : undefined
            }
          >
          {zones.map((zone, index) => (
            <motion.button
              key={zone.id}
              type="button"
              data-cursor-hover
              className={`hotspot ${zone.primary ? "hotspot--primary" : "hotspot--secondary"} ${
                activeInfo?.id === zone.id ? "is-open" : ""
              }`}
              style={{
                left: `${(hotspotEdits[zone.id] ?? zone.hotspot).x}%`,
                top: `${(hotspotEdits[zone.id] ?? zone.hotspot).y}%`,
                pointerEvents: show ? "auto" : "none",
              }}
              onMouseEnter={playHover}
              onClick={() => handleHotspot(zone)}
              initial={false}
              animate={show ? "show" : "hide"}
            >
              <motion.span
                className="hotspot__chip"
                variants={{
                  hide: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.4 + index * 0.16, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                <span className="hotspot__num">{String(index + 1).padStart(2, "0")}</span>
                <span className="hotspot__label">{zone.short}</span>
                {zone.primary && <span className="hotspot__cta">Explorar →</span>}
              </motion.span>
              <motion.span
                className="hotspot__stem"
                variants={{
                  hide: { scaleY: 0, opacity: 0 },
                  show: {
                    scaleY: 1,
                    opacity: 1,
                    transition: { delay: 0.25 + index * 0.16, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              />
              <motion.span
                className="hotspot__anchor"
                variants={{
                  hide: { scale: 0, opacity: 0 },
                  show: {
                    scale: 1,
                    opacity: 1,
                    transition: { delay: 0.08 + index * 0.16, type: "spring", stiffness: 320, damping: 18 },
                  },
                }}
              >
                <span className="hotspot__pulse" />
                <span className="hotspot__dot" />
              </motion.span>
            </motion.button>
          ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="masterplan__flash"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={zoomZone ? { opacity: [0, 0, 0.95, 0] } : { opacity: 0 }}
        transition={
          zoomZone ? { duration: 1.9, times: [0, 0.62, 0.82, 1], ease: "easeOut" } : { duration: 0.2 }
        }
      />

      <motion.div
        className="masterplan__fade"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: zoomZone ? 1 : 0 }}
        transition={{ duration: zoomZone ? 0.5 : 0.3, ease: "easeIn", delay: zoomZone ? 1.15 : 0 }}
      />

      <PositionEditor
        zones={zones}
        frame={frame}
        edits={hotspotEdits}
        onChange={setHotspotEdits}
      />

      <AnimatePresence>
        {activeInfo && (
          <motion.aside
            className="zone-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              className="zone-card__close"
              data-cursor-hover
              onClick={() => setActiveInfo(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <span className="zone-card__eyebrow">Zona del complejo</span>
            <h3>{activeInfo.label}</h3>
            <p>{activeInfo.description}</p>
            {activeInfo.gallery && (
              <button
                type="button"
                className="zone-card__gallery"
                data-cursor-hover
                onClick={() => {
                  playClick();
                  onOpenGallery(activeInfo.gallery, 0);
                }}
              >
                Ver imágenes →
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
