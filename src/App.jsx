import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import "./App.css";
import CustomCursor from "./components/CustomCursor";
import DesignMode from "./components/DesignMode";
import IconRail from "./components/IconRail";
import InfoOverlay from "./components/InfoOverlay";
import IntroScreen from "./components/IntroScreen";
import Masterplan from "./components/Masterplan";
import MediaGallery from "./components/MediaGallery";
import MediaRail from "./components/MediaRail";
import UnitPanel from "./components/UnitPanel";
import Viewer360 from "./components/Viewer360";
import { media, zones } from "./data/project";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [openZone, setOpenZone] = useState(null); // primary zone with unit panel open
  const [gallery, setGallery] = useState(null); // { items, startIndex }
  const [pano, setPano] = useState(null); // src of active 360 viewer
  const [overlay, setOverlay] = useState(null); // 'map' | 'contact'

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => setIntroGone(true), 1000);
  };

  const goHome = () => {
    setOpenZone(null);
    setGallery(null);
    setPano(null);
    setOverlay(null);
    setIntroGone(false);
    setEntered(false);
  };

  const openGalleryFromPaths = (paths, startIndex = 0) => {
    setOverlay(null);
    setPano(null);
    setGallery({
      items: paths.map((src) => ({ type: "image", src })),
      startIndex,
    });
  };

  const openVideo = () => {
    setOverlay(null);
    setPano(null);
    setGallery({
      items: [{ type: "video", src: media.institutionalVideo, caption: "Video institucional" }],
      startIndex: 0,
    });
  };

  const railGallery = () => {
    const source = openZone ?? zones.find((z) => z.primary);
    if (source?.gallery) openGalleryFromPaths(source.gallery, 0);
  };

  const railOrbit = () => {
    setOverlay(null);
    setGallery(null);
    setPano(media.panos["torre-corporativa"]);
  };

  const openLocation = () => setOverlay("map");

  const openContact = () => setOverlay("contact");

  const railClose = () => {
    if (overlay) return setOverlay(null);
    if (pano) return setPano(null);
    if (gallery) return setGallery(null);
    if (openZone) return setOpenZone(null);
  };

  return (
    <div className="app">
      <div className="app__grain" aria-hidden="true" />
      <CustomCursor />

      {!introGone && <IntroScreen onEnter={handleEnter} />}

      {entered && (
        <>
          <IconRail
            hasZone={Boolean(openZone)}
            onMasterplan={() => {
              setOpenZone(null);
              setOverlay(null);
              setPano(null);
              setGallery(null);
            }}
            onGallery={railGallery}
            onOrbit={railOrbit}
            onHome={goHome}
            onClose={railClose}
            onOpenVideo={openVideo}
            onLocation={openLocation}
            onContact={openContact}
            closeVisible={Boolean(pano || gallery || openZone || overlay)}
          />

          {!openZone && <MediaRail onOpenVideo={openVideo} />}

          <main className="app__stage">
            <Masterplan onOpenPrimary={setOpenZone} onOpenGallery={openGalleryFromPaths} />

            <AnimatePresence>
              {openZone && (
                <UnitPanel zone={openZone} onClose={() => setOpenZone(null)} onOpenGallery={openGalleryFromPaths} />
              )}
            </AnimatePresence>
          </main>
        </>
      )}

      <AnimatePresence>
        {gallery && (
          <MediaGallery
            items={gallery.items}
            startIndex={gallery.startIndex}
            onClose={() => setGallery(null)}
            onOpen360={(src) => setPano(src)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{pano && <Viewer360 src={pano} onClose={() => setPano(null)} />}</AnimatePresence>

      <AnimatePresence>
        {overlay && <InfoOverlay type={overlay} onClose={() => setOverlay(null)} />}
      </AnimatePresence>

      <DesignMode />
    </div>
  );
}
