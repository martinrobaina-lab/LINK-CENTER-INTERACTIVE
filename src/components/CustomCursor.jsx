import { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import "./CustomCursor.css";

export default function CustomCursor() {
  const [isTouch, setIsTouch] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(touch);
    document.body.classList.toggle("touch-device", touch);
    if (touch) return;

    // 1:1 tracking, no spring lag — reads as a normal, calm pointer.
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (isTouch) return null;

  return (
    <motion.svg
      className="custom-cursor-arrow"
      style={{ translateX: x, translateY: y }}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 2 L4 20 L9 15.5 L12.5 21.5 L15 20 L11.7 14.2 L18 13.3 Z" />
    </motion.svg>
  );
}
