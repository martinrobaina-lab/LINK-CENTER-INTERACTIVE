export const project = {
  name: "Link Center",
  tagline: "Un nuevo horizonte para Asunción",
  location: "Av. Aviadores del Chaco 2654 · Asunción, Paraguay",
  coords: "25.2856° S · 57.5669° W",
  totalArea: "116.563 m²",
  architect: "Gómez Platero Arquitectura & Urbanismo",
  certification: "LEED Core & Shell, Oro (en proceso)",
  award: "Premio Plata · Premios LADI 2026, categoría Usos Mixtos",
};

// zones ordered by sales priority — torre-corporativa is primary (full unit panel),
// the rest render as lightweight info cards on the masterplan.
export const zones = [
  {
    id: "torre-corporativa",
    label: "Torre Corporativa Triple A",
    short: "Torre Corporativa",
    primary: true,
    hotspot: { x: 36.1, y: 27.6 },
    gallery: [
      "/images/renders/render-03.jpg",
      "/images/renders/render-01.jpg",
      "/images/renders/render-06.jpg",
      "/images/renders/render-02.jpg",
    ],
    description:
      "34 niveles y 137 metros de altura. Plantas libres de geometría trapezoidal con núcleos centrales compactos, de aproximadamente 1.400 m² útiles cada una, con visuales de 360° sobre la ciudad. Certificación LEED Core & Shell, Oro (en proceso).",
    stats: [
      { label: "Niveles", value: "34 · 137 m de altura" },
      { label: "Planta libre", value: "≈ 1.400 m² útiles" },
      { label: "Amenities", value: "Executive club, skybar y skygarden" },
      { label: "Certificación", value: "LEED Core & Shell, Oro (en proceso)" },
    ],
  },
  {
    id: "paseo-comercial",
    label: "Paseo Comercial Abierto",
    short: "Paseo Comercial",
    primary: false,
    hotspot: { x: 41.9, y: 73 },
    description:
      "Plaza comercial elevada presidida por un gran atrio cubierto, que conecta el hall de la torre corporativa con el paseo comercial del World Trade Center. El basamento aprovecha el desnivel natural del terreno (10 m) para generar plazas, terrazas y paseos ajardinados.",
  },
  {
    id: "torres-residenciales",
    label: "Torres Residenciales",
    short: "Residencial",
    primary: false,
    hotspot: { x: 48.7, y: 54.6 },
    gallery: ["/images/renders/render-05.jpg"],
    description:
      "Unidades de alta gama con generosas alturas interiores y amenities propios, integradas al mismo sistema de plazas y terrazas del basamento comercial.",
  },
  {
    id: "hotel",
    label: "Hotel",
    short: "Hotel",
    primary: false,
    hotspot: { x: 64.1, y: 71.4 },
    description:
      "Hotel de categoría internacional integrado al complejo, con acceso directo desde el paseo comercial y amenities de primer nivel compartidos con las torres residenciales.",
  },
];

// floor plates for the corporate tower (34 niveles / 137 m)
// statuses: Disponible | Reservado | Vendido | Amenities
const RESERVED  = new Set([3, 6, 9, 13, 17, 20, 24, 27, 30]);
const VENDIDO   = new Set([4, 8, 16, 22, 26]);
const AMENITIES = new Set([34]);

export const floors = Array.from({ length: 34 }, (_, i) => {
  const num = i + 1;
  const isAmenities = AMENITIES.has(num);
  const isReserved  = RESERVED.has(num);
  const isVendido   = VENDIDO.has(num);

  // area narrows slightly in upper third (trapezoidal geometry)
  const area = isAmenities
    ? "1.150 m²"
    : num >= 28
    ? "1.200 m²"
    : num >= 20
    ? "1.320 m²"
    : "1.400 m²";

  const status = isAmenities
    ? "Amenities"
    : isVendido
    ? "Vendido"
    : isReserved
    ? "Reservado"
    : "Disponible";

  const label = num === 34 ? "Piso 34 — Amenities" : `Piso ${num}`;

  return {
    id: `piso-${num}`,
    label,
    area,
    status,
    plan: "/images/floorplan-torre-corporativa-lines.png",
    gallery: [
      "/images/renders/render-01.jpg",
      "/images/renders/render-03.jpg",
      num >= 28 ? "/images/exterior-skybar.webp" : "/images/aerea-nocturna.webp",
    ],
  };
});

// Interactive areas over the corporate floor plan.
// mask: JPG same size as the plan — white = zone, black = rest.
// Drop mask files in public/images/plan-zones/ and add one entry per zone.
export const planAreas = [
  {
    id: "sector-oeste",
    label: "Sector Oeste",
    area: "≈ 470 m²",
    description: "Planta libre con visuales al poniente y acceso directo al núcleo de circulación.",
    mask: "/images/plan-zones/sector-oeste.jpg",
  },
  {
    id: "sector-sureste",
    label: "Sector Sureste",
    area: "≈ 480 m²",
    description: "Planta libre con orientación sureste y frente vidriado sobre la avenida.",
    mask: "/images/plan-zones/sector-sureste.jpg",
  },
  {
    id: "sector-noreste",
    label: "Sector Noreste",
    area: "≈ 450 m²",
    description: "Planta libre con visuales al río y salas de reuniones perimetrales.",
    mask: "/images/plan-zones/sector-noreste.jpg",
  },
];

export const media = {
  video: "/video/link-center.mp4",
  // Video institucional (galería, botón "Video" del rail). Independiente del
  // video de intro/media-rail para poder cambiar uno sin afectar al otro.
  institutionalVideo: "/video/institucional.mp4",
  hero: "/images/exterior-skybar.webp",
  logoWhite: "/images/logo-white.svg",
  logoDark: "/images/logo-dark.svg",
  panos: {
    "torre-corporativa": "/panos/lobby-torre-corporativa.jpg",
  },
};
