import { motion } from "framer-motion";
import { useState } from "react";
import { media, project } from "../data/project";
import { useUiSound } from "../hooks/useUiSound";
import "./IntroScreen.css";

export default function IntroScreen({ onEnter }) {
  const { playOpen } = useUiSound();
  const [leaving, setLeaving] = useState(false);

  const enter = () => {
    if (leaving) return;
    playOpen();
    setLeaving(true);
    onEnter();
  };

  return (
    <motion.div
      className="intro"
      style={{ pointerEvents: leaving ? "none" : "auto" }}
      animate={leaving ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <video
        className="intro__video"
        src={media.video}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="intro__overlay" />

      <div className="intro__content">
        <motion.img
          src={media.logoWhite}
          alt={project.name}
          className="intro__logo"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.p
          className="intro__eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {project.location}
        </motion.p>
        <motion.h1
          className="intro__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Un nuevo horizonte
          <br />
          <em>para Asunción</em>
        </motion.h1>

        <motion.button
          type="button"
          className="intro__enter"
          data-cursor-hover
          onClick={enter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="intro__enter-line" />
          Ingresar a la experiencia
          <span className="intro__enter-line" />
        </motion.button>
      </div>

      <motion.span
        className="intro__hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 3, duration: 1 }}
      >
        Experiencia interactiva de ventas
      </motion.span>
    </motion.div>
  );
}
