import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { floors, planAreas, zones } from "../data/project";
import PlanZones from "./PlanZones";
import { useUiSound } from "../hooks/useUiSound";
import "./UnitPanel.css";

const PLAN_3D = "/images/floorplan-torre-corporativa-3d.jpg";

export default function UnitPanel({ zone, onClose, onOpenGallery }) {
  const [activeFloor, setActiveFloor] = useState(0);
  const [view3d, setView3d] = useState(false);
  const { playHover, playClick, playClose } = useUiSound();
  const floor = floors[activeFloor];
  const towerBg = zones.find((z) => z.id === "torre-corporativa")?.gallery?.[1];

  const close = () => {
    playClose();
    onClose();
  };

  const selectFloor = (index) => {
    if (index === activeFloor) return;
    playClick();
    setActiveFloor(index);
  };

  return (
    <motion.div
      className="unit-panel"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="unit-panel__backdrop" style={{ backgroundImage: `url(${towerBg})` }} />
      <div className="unit-panel__scrim" />

      <button type="button" className="unit-panel__close" data-cursor-hover onClick={close} aria-label="Volver al masterplan">
        ×
      </button>

      <div className="unit-panel__stage">
        <motion.span
          key={`ghost-${floor.id}`}
          className="unit-panel__ghost-num"
          aria-hidden="true"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeFloor + 1}
        </motion.span>
        <div className="unit-panel__plan-wrap">
          <AnimatePresence mode="sync">
            <motion.div
              key={`${floor.id}-${view3d ? "3d" : "2d"}`}
              className={`unit-panel__plan-card ${view3d ? "is-photo" : ""}`}
              initial={
                view3d
                  ? { opacity: 0, scale: 0.985 }
                  : { filter: "brightness(0)", scale: 0.985 }
              }
              animate={
                view3d
                  ? { opacity: 1, scale: 1 }
                  : { filter: "brightness(1)", scale: 1 }
              }
              exit={
                view3d
                  ? { opacity: 0, scale: 1.005 }
                  : { filter: "brightness(0)", scale: 1.005 }
              }
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={view3d ? PLAN_3D : floor.plan}
                alt={`Plano ${floor.label}`}
                className="unit-panel__plan"
                draggable={false}
              />
              <PlanZones areas={planAreas} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="unit-panel__viewtoggle">
        {["2D", "3D"].map((mode) => {
          const is3d = mode === "3D";
          return (
            <button
              key={mode}
              type="button"
              data-cursor-hover
              className={view3d === is3d ? "is-on" : ""}
              onMouseEnter={playHover}
              onClick={() => {
                if (view3d !== is3d) {
                  playClick();
                  setView3d(is3d);
                }
              }}
            >
              {mode}
            </button>
          );
        })}
      </div>

      <motion.div
        className="unit-panel__panel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="unit-panel__eyebrow">{zone.label}</span>
        <h2>Plantas disponibles</h2>
        {zone.stats && (
          <ul className="unit-panel__stats">
            {zone.stats.map((s) => (
              <li key={s.label}>
                <span className="unit-panel__stats-label">{s.label}</span>
                <span className="unit-panel__stats-value">{s.value}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="unit-panel__divider" />

        <span className="floor-panel__label">Nivel</span>
        <p className="floor-panel__summary">
          {floors.filter((f) => f.status === "Disponible").length} disponibles ·{" "}
          {floors.filter((f) => f.status === "Reservado").length} reservados
        </p>
        <div className="floor-panel__grid">
          {floors.map((f, index) => {
            const statusClass = f.status.toLowerCase().replace(/\s.*/, ""); // "disponible"|"reservado"|"vendido"|"amenities"
            const isVendido = f.status === "Vendido";
            return (
              <button
                key={f.id}
                type="button"
                data-cursor-hover
                disabled={isVendido}
                className={`floor-chip ${index === activeFloor ? "is-active" : ""} floor-chip--${statusClass}`}
                onMouseEnter={isVendido ? undefined : playHover}
                onClick={() => selectFloor(index)}
                title={`${f.label} · ${f.status}`}
              >
                {String(index + 1)}
              </button>
            );
          })}
        </div>
        <div className="floor-panel__legend">
          <span className="legend-dot legend-dot--disponible" /> Disponible
          <span className="legend-dot legend-dot--reservado" /> Reservado
          <span className="legend-dot legend-dot--vendido" /> Vendido
          <span className="legend-dot legend-dot--amenities" /> Amenities
        </div>

        <div className="floor-panel__detail">
          <div>
            <p className="floor-panel__floor-name">{floor.label}</p>
            <p className="floor-panel__area">
              {floor.area} · {floor.status}
            </p>
          </div>
          <button
            type="button"
            data-cursor-hover
            className="floor-panel__gallery-btn"
            onClick={() => onOpenGallery(floor.gallery, 0)}
          >
            Ver galería →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
