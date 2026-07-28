import { useEffect, useRef, useState } from "react";
import "./PositionEditor.css";

// Modo editor de posiciones (Ctrl+E). Herramienta interna para ajustar
// hotspots sin iterar con capturas: se arrastran los puntos sobre el video
// y "Copiar" deja las coordenadas listas para pegar en project.js / el chat.
export default function PositionEditor({ zones, frame, edits, onChange }) {
  const [active, setActive] = useState(false);
  const [freePoint, setFreePoint] = useState(null); // click en zona vacía
  const [copied, setCopied] = useState(false);
  const dragId = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setActive((a) => !a);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!active) return;
    const toPct = (e) => {
      if (!frame) return null;
      const x = ((e.clientX - frame.left) / frame.width) * 100;
      const y = ((e.clientY - frame.top) / frame.height) * 100;
      return {
        x: Math.min(100, Math.max(0, Math.round(x * 10) / 10)),
        y: Math.min(100, Math.max(0, Math.round(y * 10) / 10)),
      };
    };
    const onMove = (e) => {
      if (!dragId.current) return;
      const p = toPct(e);
      if (p) onChange((prev) => ({ ...prev, [dragId.current]: p }));
    };
    const onUp = () => {
      dragId.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [active, frame, onChange]);

  if (!active || !frame) return null;

  const pos = (zone) => edits[zone.id] ?? zone.hotspot;

  const handleLayerClick = (e) => {
    if (e.target !== e.currentTarget) return;
    const x = Math.round(((e.clientX - frame.left) / frame.width) * 1000) / 10;
    const y = Math.round(((e.clientY - frame.top) / frame.height) * 1000) / 10;
    setFreePoint({ x, y });
  };

  const copyAll = async () => {
    const lines = zones.map((z) => {
      const p = pos(z);
      return `${z.id}: hotspot: { x: ${p.x}, y: ${p.y} }`;
    });
    if (freePoint) lines.push(`punto-libre: { x: ${freePoint.x}, y: ${freePoint.y} }`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard bloqueado — las coordenadas quedan visibles en el panel
    }
  };

  return (
    <div className="pos-editor">
      <div
        className="pos-editor__layer"
        style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }}
        onClick={handleLayerClick}
      >
        {zones.map((zone) => {
          const p = pos(zone);
          const moved = edits[zone.id] != null;
          return (
            <div
              key={zone.id}
              className={`pos-editor__marker ${moved ? "is-moved" : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onPointerDown={(e) => {
                e.preventDefault();
                dragId.current = zone.id;
              }}
            >
              <span className="pos-editor__ring" />
              <span className="pos-editor__tag">
                {zone.short} · {p.x}, {p.y}
              </span>
            </div>
          );
        })}
        {freePoint && (
          <div
            className="pos-editor__marker pos-editor__marker--free"
            style={{ left: `${freePoint.x}%`, top: `${freePoint.y}%` }}
          >
            <span className="pos-editor__ring" />
            <span className="pos-editor__tag">
              libre · {freePoint.x}, {freePoint.y}
            </span>
          </div>
        )}
      </div>

      <div className="pos-editor__panel">
        <strong>Editor de posiciones</strong>
        <p>
          Arrastrá los puntos hasta donde van. Click en zona vacía = punto libre para
          elementos nuevos. <kbd>Ctrl+E</kbd> para salir.
        </p>
        <ul>
          {zones.map((zone) => {
            const p = pos(zone);
            return (
              <li key={zone.id} className={edits[zone.id] ? "is-moved" : ""}>
                <span>{zone.short}</span>
                <code>
                  x: {p.x} · y: {p.y}
                </code>
              </li>
            );
          })}
          {freePoint && (
            <li className="is-moved">
              <span>Punto libre</span>
              <code>
                x: {freePoint.x} · y: {freePoint.y}
              </code>
            </li>
          )}
        </ul>
        <div className="pos-editor__actions">
          <button type="button" onClick={copyAll}>
            {copied ? "¡Copiado!" : "Copiar coordenadas"}
          </button>
          <button
            type="button"
            className="pos-editor__reset"
            onClick={() => {
              onChange({});
              setFreePoint(null);
            }}
          >
            Restaurar
          </button>
        </div>
      </div>
    </div>
  );
}
