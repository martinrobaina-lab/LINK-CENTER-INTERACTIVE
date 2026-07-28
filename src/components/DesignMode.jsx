import { useEffect, useRef, useState } from "react";
import "./DesignMode.css";

// Modo diseño (Ctrl+D). Permite arrastrar los bloques de la interfaz para
// probar composiciones, estilo editor de páginas. Aplica desplazamientos con
// la propiedad CSS `translate` (independiente de `transform`, así no pelea
// con las animaciones de framer-motion). Nada se guarda: "Copiar" exporta los
// offsets para pasarlos al chat y fijarlos en el CSS de cada componente.
const EDITABLES = [
  { selector: ".icon-rail", name: "menu-izquierdo" },
  { selector: ".media-rail", name: "media-rail" },
  { selector: ".zone-card", name: "tarjeta-zona" },
  { selector: ".intro__logo", name: "intro-logo" },
  { selector: ".intro__title", name: "intro-titulo" },
  { selector: ".intro__enter", name: "intro-boton" },
  { selector: ".intro__hint", name: "intro-hint" },
  { selector: ".info-overlay", name: "overlay-info" },
  { selector: ".media-gallery__frame", name: "galeria-marco" },
  { selector: ".masterplan__hotspot-layer", name: "capa-hotspots" },
];

const SNAP = 6; // px de tolerancia del imán

export default function DesignMode() {
  const [active, setActive] = useState(false);
  const [offsets, setOffsets] = useState({}); // name -> { x, y } en px
  const [copied, setCopied] = useState(false);
  const [guides, setGuides] = useState({ v: [], h: [] }); // líneas de alineación visibles
  const drag = useRef(null); // { name, el, startX, startY, baseX, baseY, rect0, targets }

  useEffect(() => {
    const onKey = (e) => {
      // Ctrl+. — evita atajos nativos del navegador (Ctrl+D = favoritos)
      if (e.ctrlKey && e.key === ".") {
        e.preventDefault();
        setActive((a) => !a);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("design-mode", active);
    return () => document.body.classList.remove("design-mode");
  }, [active]);

  // Re-aplica los offsets a elementos que se montan/desmontan (overlays, cards)
  useEffect(() => {
    const apply = () => {
      for (const { selector, name } of EDITABLES) {
        const off = offsets[name];
        if (!off) continue;
        document.querySelectorAll(selector).forEach((el) => {
          el.style.translate = `${off.x}px ${off.y}px`;
        });
      }
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [offsets]);

  useEffect(() => {
    if (!active) return;

    const onDown = (e) => {
      if (e.target.closest(".design-mode__panel")) return;
      for (const { selector, name } of EDITABLES) {
        const el = e.target.closest(selector);
        if (el) {
          e.preventDefault();
          e.stopPropagation();
          const base = offsets[name] ?? { x: 0, y: 0 };
          // objetivos de alineación: pantalla (bordes, centro) + los demás bloques
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const targets = { v: [0, vw / 2, vw], h: [0, vh / 2, vh] };
          for (const other of EDITABLES) {
            document.querySelectorAll(other.selector).forEach((o) => {
              if (o === el || el.contains(o) || o.contains(el)) return;
              const r = o.getBoundingClientRect();
              if (!r.width || !r.height) return;
              targets.v.push(r.left, r.left + r.width / 2, r.right);
              targets.h.push(r.top, r.top + r.height / 2, r.bottom);
            });
          }
          drag.current = {
            name,
            el,
            startX: e.clientX,
            startY: e.clientY,
            baseX: base.x,
            baseY: base.y,
            rect0: el.getBoundingClientRect(),
            targets,
          };
          return;
        }
      }
    };
    const onMove = (e) => {
      if (!drag.current) return;
      const d = drag.current;
      let dx = e.clientX - d.startX;
      let dy = e.clientY - d.startY;
      const shown = { v: [], h: [] };

      // imán: pega bordes/centro del bloque a los objetivos (Alt = libre)
      if (!e.altKey) {
        const r = d.rect0;
        const edgesV = [r.left + dx, r.left + r.width / 2 + dx, r.right + dx];
        const edgesH = [r.top + dy, r.top + r.height / 2 + dy, r.bottom + dy];
        let bestV = null;
        for (const t of d.targets.v)
          for (const edge of edgesV) {
            const diff = t - edge;
            if (Math.abs(diff) <= SNAP && (bestV === null || Math.abs(diff) < Math.abs(bestV.diff)))
              bestV = { diff, line: t };
          }
        let bestH = null;
        for (const t of d.targets.h)
          for (const edge of edgesH) {
            const diff = t - edge;
            if (Math.abs(diff) <= SNAP && (bestH === null || Math.abs(diff) < Math.abs(bestH.diff)))
              bestH = { diff, line: t };
          }
        if (bestV) {
          dx += bestV.diff;
          shown.v.push(bestV.line);
        }
        if (bestH) {
          dy += bestH.diff;
          shown.h.push(bestH.line);
        }
      }

      const x = Math.round(d.baseX + dx);
      const y = Math.round(d.baseY + dy);
      d.el.style.translate = `${x}px ${y}px`;
      setGuides(shown);
      setOffsets((prev) => ({ ...prev, [d.name]: { x, y } }));
    };
    const onUp = () => {
      drag.current = null;
      setGuides({ v: [], h: [] });
    };
    // captura: el arrastre gana antes de que los botones reciban el click
    const onClickCapture = (e) => {
      if (e.target.closest(".design-mode__panel")) return;
      if (EDITABLES.some(({ selector }) => e.target.closest(selector))) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("click", onClickCapture, true);
    };
  }, [active, offsets]);

  const reset = () => {
    for (const { selector } of EDITABLES) {
      document.querySelectorAll(selector).forEach((el) => {
        el.style.translate = "";
      });
    }
    setOffsets({});
  };

  const copyAll = async () => {
    const lines = Object.entries(offsets)
      .filter(([, o]) => o.x !== 0 || o.y !== 0)
      .map(([name, o]) => `${name}: ${o.x}px, ${o.y}px`);
    if (!lines.length) return;
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard bloqueado — los valores quedan visibles en el panel
    }
  };

  if (!active) return null;

  const moved = Object.entries(offsets).filter(([, o]) => o.x !== 0 || o.y !== 0);

  return (
    <>
      {guides.v.map((x) => (
        <div key={`v${x}`} className="design-mode__guide design-mode__guide--v" style={{ left: x }} />
      ))}
      {guides.h.map((y) => (
        <div key={`h${y}`} className="design-mode__guide design-mode__guide--h" style={{ top: y }} />
      ))}
    <div className="design-mode__panel">
      <strong>Modo diseño</strong>
      <p>
        Arrastrá cualquier bloque resaltado; el imán lo alinea con la pantalla y los
        demás bloques (<kbd>Alt</kbd> = movimiento libre). Nada queda guardado hasta
        pasar los valores al chat. <kbd>Ctrl+.</kbd> para salir.
      </p>
      {moved.length > 0 ? (
        <ul>
          {moved.map(([name, o]) => (
            <li key={name}>
              <span>{name}</span>
              <code>
                {o.x}px, {o.y}px
              </code>
            </li>
          ))}
        </ul>
      ) : (
        <p className="design-mode__empty">Todavía no moviste nada.</p>
      )}
      <div className="design-mode__actions">
        <button type="button" onClick={copyAll} disabled={!moved.length}>
          {copied ? "¡Copiado!" : "Copiar posiciones"}
        </button>
        <button type="button" className="design-mode__reset" onClick={reset}>
          Restaurar
        </button>
      </div>
    </div>
    </>
  );
}
