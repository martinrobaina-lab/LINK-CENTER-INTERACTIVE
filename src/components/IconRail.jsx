import { motion } from "framer-motion";
import { media } from "../data/project";
import { useUiSound } from "../hooks/useUiSound";
import "./IconRail.css";

const icons = {
  masterplan: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="4" width="15" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="7" cy="8.5" r="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 14l4.5-4 3 2.6L14.5 8l2.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  orbit: (
    <svg viewBox="0 0 20 20" fill="none">
      <ellipse cx="10" cy="10" rx="7.5" ry="3.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="1.7" fill="currentColor" />
      <path d="M4.2 7.3C3 8.4 2.5 9.4 3 10.3c1 1.7 5 2.3 7.6 1.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="4" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.3 7.4l4.2 2.6-4.2 2.6V7.4z" fill="currentColor" />
    </svg>
  ),
  fullscreen: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 7.5V3h4.5M12.5 3H17v4.5M17 12.5V17h-4.5M7.5 17H3v-4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M4 9.5L10 4l6 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 8.5V16h9V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  location: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M10 17.5s-5.5-4.6-5.5-8.7A5.5 5.5 0 0 1 10 3.3a5.5 5.5 0 0 1 5.5 5.5c0 4.1-5.5 8.7-5.5 8.7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.8" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 6l6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function RailButton({ icon, label, active, onClick, playHover, playClick }) {
  return (
    <button
      type="button"
      data-cursor-hover
      className={`icon-rail__btn ${active ? "is-active" : ""}`}
      onMouseEnter={playHover}
      onClick={() => {
        playClick();
        onClick();
      }}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

export default function IconRail({
  hasZone,
  onMasterplan,
  onGallery,
  onOrbit,
  onHome,
  onClose,
  onOpenVideo,
  onLocation,
  onContact,
  closeVisible,
}) {
  const { playHover, playClick } = useUiSound();

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <>
      <motion.button
        type="button"
        data-cursor-hover
        className="icon-rail__brand"
        onMouseEnter={playHover}
        onClick={() => {
          playClick();
          onHome();
        }}
        aria-label="Volver al inicio"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src={media.logoWhite} alt="Link Center" />
      </motion.button>

    <motion.nav
      className="icon-rail"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="icon-rail__panel">
        <RailButton icon={icons.masterplan} label="Masterplan" active={!hasZone} onClick={onMasterplan} playHover={playHover} playClick={playClick} />
        <RailButton icon={icons.gallery} label="Galería" onClick={onGallery} playHover={playHover} playClick={playClick} />
        <RailButton icon={icons.orbit} label="Vista 360°" onClick={onOrbit} playHover={playHover} playClick={playClick} />
        <RailButton icon={icons.video} label="Video institucional" onClick={onOpenVideo} playHover={playHover} playClick={playClick} />
        <RailButton icon={icons.location} label="Ubicación" onClick={onLocation} playHover={playHover} playClick={playClick} />
        <RailButton icon={icons.contact} label="Contacto" onClick={onContact} playHover={playHover} playClick={playClick} />
        <RailButton icon={icons.fullscreen} label="Pantalla completa" onClick={toggleFullscreen} playHover={playHover} playClick={playClick} />

        <div className="icon-rail__spacer" />

        <RailButton icon={icons.home} label="Volver al inicio" onClick={onHome} playHover={playHover} playClick={playClick} />
        {closeVisible && (
          <RailButton icon={icons.close} label="Cerrar" onClick={onClose} playHover={playHover} playClick={playClick} />
        )}
      </div>
    </motion.nav>
    </>
  );
}
