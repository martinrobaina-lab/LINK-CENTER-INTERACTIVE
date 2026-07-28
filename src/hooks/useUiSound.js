import { useCallback, useRef } from "react";

// Synthesized UI sounds via Web Audio API — no audio files to load/bundle.
export function useUiSound() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    ({ freq = 880, duration = 0.08, type = "sine", gain = 0.05, glideTo }) => {
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (glideTo) {
          osc.frequency.linearRampToValueAtTime(glideTo, ctx.currentTime + duration);
        }
        amp.gain.setValueAtTime(gain, ctx.currentTime);
        amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(amp).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // audio unavailable — fail silently, UI still works
      }
    },
    [getCtx]
  );

  const playHover = useCallback(() => tone({ freq: 660, duration: 0.05, gain: 0.03 }), [tone]);
  const playClick = useCallback(
    () => tone({ freq: 520, glideTo: 780, duration: 0.09, gain: 0.06, type: "triangle" }),
    [tone]
  );
  const playOpen = useCallback(
    () => tone({ freq: 300, glideTo: 620, duration: 0.16, gain: 0.05, type: "sine" }),
    [tone]
  );
  const playClose = useCallback(
    () => tone({ freq: 500, glideTo: 260, duration: 0.14, gain: 0.05, type: "sine" }),
    [tone]
  );

  return { playHover, playClick, playOpen, playClose };
}
