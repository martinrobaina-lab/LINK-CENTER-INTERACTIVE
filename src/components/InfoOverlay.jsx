import { motion } from "framer-motion";
import { useEffect } from "react";
import { project } from "../data/project";
import "./InfoOverlay.css";

const MAP_SRC =
  "https://www.google.com/maps?q=Av.+Aviadores+del+Chaco+2654,+Asunci%C3%B3n,+Paraguay&z=16&output=embed";

// In-app overlay for "Ubicación" (embedded map) and "Contacto" (contact card).
export default function InfoOverlay({ type, onClose }) {
  const isMap = type === "map";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="info-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="info-overlay__close"
        data-cursor-hover
        onClick={onClose}
        aria-label="Cerrar"
      >
        ×
      </button>

      <motion.div
        className={`info-overlay__panel ${isMap ? "info-overlay__panel--map" : ""}`}
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {isMap ? (
          <>
            <div className="info-overlay__head">
              <span className="info-overlay__eyebrow">Ubicación</span>
              <h3>{project.location}</h3>
            </div>
            <div className="info-overlay__map">
              <iframe
                src={MAP_SRC}
                title="Ubicación Link Center"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </>
        ) : (
          <>
            <div className="info-overlay__head">
              <span className="info-overlay__eyebrow">Contacto comercial</span>
              <h3>Coordiná tu visita</h3>
            </div>
            <ul className="info-overlay__rows">
              <li>
                <span className="info-overlay__label">Dirección</span>
                <span className="info-overlay__value">{project.location}</span>
              </li>
              <li>
                <span className="info-overlay__label">Web</span>
                <span className="info-overlay__value">linkcenter.com.py</span>
              </li>
              <li>
                <span className="info-overlay__label">Teléfono</span>
                <span className="info-overlay__value">+595 — a definir</span>
              </li>
              <li>
                <span className="info-overlay__label">E-mail</span>
                <span className="info-overlay__value">a definir</span>
              </li>
            </ul>
            <p className="info-overlay__note">
              {project.architect} · {project.certification}
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
