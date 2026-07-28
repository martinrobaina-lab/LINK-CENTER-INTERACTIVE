import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useUiSound } from "../hooks/useUiSound";
import "./Viewer360.css";

// Real spherical 360 viewer: the equirectangular photo is mapped onto the
// inside of a sphere and the camera sits at its center, so dragging actually
// rotates the view in 3D (curved perspective) instead of scrolling a flat
// strip sideways. Renders locally with three.js — no external panorama
// platform/service involved.
export default function Viewer360({ src, onClose }) {
  const { playClose } = useUiSound();
  const mountRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const close = () => {
    playClose();
    onClose();
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      85,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );

    // Sphere with inverted normals (scale.x = -1) so the texture is visible
    // from inside instead of outside.
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1);

    const texture = new THREE.TextureLoader().load(src);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Spherical camera orientation driven by yaw/pitch, updated via drag.
    let lon = 0;
    let lat = 0;
    let targetLon = 0;
    let targetLat = 0;
    const FOV_MIN = 40;
    const FOV_MAX = 100;

    const updateCamera = () => {
      lon += (targetLon - lon) * 0.08;
      lat += (targetLat - lat) * 0.08;
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target);
    };

    let raf;
    const animate = () => {
      updateCamera();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // Pointer drag → yaw/pitch (mouse + touch)
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let startLon = 0;
    let startLat = 0;

    const onPointerDown = (e) => {
      isDown = true;
      setDragging(true);
      startX = e.clientX;
      startY = e.clientY;
      startLon = targetLon;
      startLat = targetLat;
    };
    const onPointerMove = (e) => {
      if (!isDown) return;
      targetLon = startLon - (e.clientX - startX) * 0.18;
      targetLat = THREE.MathUtils.clamp(startLat + (e.clientY - startY) * 0.18, -85, 85);
    };
    const onPointerUp = () => {
      isDown = false;
      setDragging(false);
    };
    const onWheel = (e) => {
      e.preventDefault();
      camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.04, FOV_MIN, FOV_MAX);
      camera.updateProjectionMatrix();
    };

    mount.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("wheel", onWheel, { passive: false });

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      mount.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [src]);

  return (
    <motion.div
      className="viewer-360"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button type="button" className="viewer-360__close" data-cursor-hover onClick={close} aria-label="Cerrar">
        × Cerrar
      </button>

      <div
        ref={mountRef}
        className={`viewer-360__canvas ${dragging ? "is-dragging" : ""}`}
      />
    </motion.div>
  );
}
