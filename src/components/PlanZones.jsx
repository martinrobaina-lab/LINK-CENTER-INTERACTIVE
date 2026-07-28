import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUiSound } from "../hooks/useUiSound";
import "./PlanZones.css";

const SAMPLE_W = 256; // hit-test resolution (downscaled masks)

// Interactive areas over the floor plan. Each area has a mask JPG the same
// size as the plan (white = zone, black = rest). Hover highlights the mask;
// click opens a data card.
export default function PlanZones({ areas }) {
  const [hoverId, setHoverId] = useState(null);
  const [activeArea, setActiveArea] = useState(null);
  const ctxsRef = useRef({}); // id -> {ctx, w, h}
  const { playHover, playClick, playClose } = useUiSound();

  useEffect(() => {
    let alive = true;
    areas.forEach((a) => {
      const img = new Image();
      img.src = a.mask;
      img.onload = () => {
        if (!alive) return;
        const w = SAMPLE_W;
        const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        ctxsRef.current[a.id] = { ctx, w, h };
      };
    });
    return () => {
      alive = false;
      ctxsRef.current = {};
    };
  }, [areas]);

  const zoneAt = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Map to the contained image box (object-fit: contain letterboxes the container)
    const first = Object.values(ctxsRef.current)[0];
    if (!first) return null;
    const imgAR = first.w / first.h;
    const boxAR = rect.width / rect.height;
    let dispW = rect.width;
    let dispH = rect.height;
    if (boxAR > imgAR) {
      dispW = rect.height * imgAR;
    } else {
      dispH = rect.width / imgAR;
    }
    const offX = (rect.width - dispW) / 2;
    const offY = (rect.height - dispH) / 2;
    const fx = (e.clientX - rect.left - offX) / dispW;
    const fy = (e.clientY - rect.top - offY) / dispH;
    if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return null;
    for (const a of areas) {
      const s = ctxsRef.current[a.id];
      if (!s) continue;
      const px = s.ctx.getImageData(
        Math.min(s.w - 1, Math.round(fx * s.w)),
        Math.min(s.h - 1, Math.round(fy * s.h)),
        1,
        1
      ).data;
      if (px[0] + px[1] + px[2] > 380) return a; // white enough
    }
    return null;
  };

  const handleMove = (e) => {
    const z = zoneAt(e);
    if (z?.id !== hoverId) {
      if (z) playHover();
      setHoverId(z?.id ?? null);
    }
  };

  const handleClick = (e) => {
    const z = zoneAt(e);
    if (z) {
      playClick();
      setActiveArea((cur) => (cur?.id === z.id ? null : z));
    } else if (activeArea) {
      playClose();
      setActiveArea(null);
    }
  };

  if (!areas.length) return null;

  return (
    <>
      <div
        className="plan-zones"
        style={{ cursor: hoverId ? "pointer" : "default" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverId(null)}
        onClick={handleClick}
      >
        {areas.map((a) => (
          <img
            key={a.id}
            src={a.mask}
            alt=""
            draggable={false}
            className={`plan-zones__mask ${
              hoverId === a.id || activeArea?.id === a.id ? "is-lit" : ""
            }`}
          />
        ))}
      </div>

      {createPortal(
        <AnimatePresence>
          {activeArea && (
            <motion.aside
              className="plan-zones__card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="plan-zones__card-eyebrow">Zona de la planta</span>
              <h4>{activeArea.label}</h4>
              {activeArea.area && <p className="plan-zones__card-area">{activeArea.area}</p>}
              {activeArea.description && <p className="plan-zones__card-desc">{activeArea.description}</p>}
            </motion.aside>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
