export const BRAND = {
  name: "Q-JEN",
  legalOwner: "Jerly Electronics and Cooling Services",
  trademarkNumber: "5495858",
  qciReportNumber: "VA-066652125097175",
  gemStatus: "OEM Registered VFD Seller in GeM Portal",
  cityRegion: "Madurai, Tamil Nadu, India",
  warrantySummary: "One year flexible warranty",
  tagline: "Indian-Made Variable Frequency Drives",
} as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export const DEFAULT_WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919843334303"
).replace(/\D/g, "");

export const VERIFIED_PRODUCT_DESCRIPTION = `Q-JEN VFD is designed and manufactured in our premises located in Madurai, Tamil Nadu, India. Jerly Electronics and Cooling Services (Quality Council of India Verified Manufacturer, Vendor Assessment Report No. VA-066652125097175, and an OEM registered VFD seller in GeM Portal) is a more than a decade-old company with three-decades-experienced engineers emerged from various industrial electronic service activities, and is the trademark owner of the brand Q-JEN and its logo (Trade Mark No. 5495858).

With all the experience gained from the service field, Q-JEN VFD is well designed with advanced features, excellent quality, and sustainability. The schematics and PCBs are designed by our experienced senior electronic and software engineers within our premises, and the final products are subjected to various trial running environments at our service-field customers' sites to ensure performance.

The product is offered to customers with a one year flexible warranty at an economical cost which is better than similar imported products available in the market.`;

export const VERIFIED_DEFAULT_FEATURES = [
  "Designed & manufactured in Madurai, Tamil Nadu, India",
  "In-house schematic, PCB & software engineering",
  "Field-tested across real customer trial environments",
  "One year flexible warranty",
  "QCI Verified Manufacturer (VA-066652125097175) & GeM OEM Registered Seller",
];

export const POWER_RATING_CHIPS = [
  { kw: 15, hp: 20, label: "15kW / 20HP" },
  { kw: 18.5, hp: 25, label: "18.5kW / 25HP" },
  { kw: 22, hp: 30, label: "22kW / 30HP" },
  { kw: 30, hp: 40, label: "30kW / 40HP" },
  { kw: 37, hp: 50, label: "37kW / 50HP" },
  { kw: 45, hp: 60, label: "45kW / 60HP" },
  { kw: 55, hp: 75, label: "55kW / 75HP" },
  { kw: 75, hp: 100, label: "75kW / 100HP" },
  { kw: 90, hp: 125, label: "90kW / 125HP" },
  { kw: 110, hp: 150, label: "110kW / 150HP" },
  { kw: 132, hp: 180, label: "132kW / 180HP" },
  { kw: 160, hp: 200, label: "160kW / 200HP" },
  { kw: 185, hp: 225, label: "185kW / 225HP" },
  { kw: 200, hp: 250, label: "200kW / 250HP" },
  { kw: 220, hp: 300, label: "220kW / 300HP" },
] as const;

export const INDUSTRIAL_APPLICATIONS = [
  {
    title: "Industrial Pumps & Pumping Stations",
    description:
      "Variable torque speed control for centrifugal, borewell, booster, and process water pumps.",
    icon: "Droplets",
  },
  {
    title: "HVAC Fans & Industrial Blowers",
    description:
      "Smooth airflow modulation for cooling towers, exhaust blowers, and ventilation systems.",
    icon: "Fan",
  },
  {
    title: "Conveyors & Material Handling",
    description:
      "Controlled soft start, ramp-up, and synchronized line speed for belt and roller conveyors.",
    icon: "ArrowLeftRight",
  },
  {
    title: "Air & Refrigeration Compressors",
    description:
      "Stable motor speed regulation tailored for industrial air and cooling compressor duty.",
    icon: "Gauge",
  },
  {
    title: "Textile Machinery",
    description:
      "Reliable drive control for spinning, weaving, winding, and textile processing equipment.",
    icon: "Layers",
  },
  {
    title: "Packaging & Processing Lines",
    description:
      "Repeatable speed regulation for filling, sealing, extruding, and automated packaging machines.",
    icon: "PackageCheck",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "Where are Q-JEN VFDs designed and manufactured?",
    answer:
      "Q-JEN Variable Frequency Drives are designed and manufactured in-house at our premises in Madurai, Tamil Nadu, India by Jerly Electronics and Cooling Services. Both our schematics, PCBs, and embedded software are engineered in-house by senior electronic and software engineers.",
  },
  {
    question: "What credentials and registrations does Jerly Electronics hold?",
    answer:
      "Jerly Electronics and Cooling Services is a Quality Council of India (QCI) Verified Manufacturer (Vendor Assessment Report No. VA-066652125097175), an OEM registered VFD seller on the GeM Portal, and the registered trademark owner of the Q-JEN brand and logo (Trade Mark No. 5495858).",
  },
  {
    question: "What warranty is provided with Q-JEN Variable Frequency Drives?",
    answer:
      "Q-JEN VFDs are offered with a one year flexible warranty backed directly by our engineering and industrial service team. Exact warranty terms for specific orders can be confirmed directly with us on WhatsApp.",
  },
  {
    question: "What power ratings are available in the Q-JEN VFD range?",
    answer:
      "Our catalog spans 15 industrial ratings from 15kW / 20HP up to 220kW / 300HP (15kW, 18.5kW, 22kW, 30kW, 37kW, 45kW, 55kW, 75kW, 90kW, 110kW, 132kW, 160kW, 185kW, 200kW, and 220kW).",
  },
  {
    question: "How do I get pricing, technical datasheets, or place an order?",
    answer:
      "There is no account signup or complex checkout required. Simply browse the VFD model you need, tap 'Buy on WhatsApp' or 'Get Price', and you will be connected directly to our sales & engineering desk on WhatsApp with the model details pre-filled.",
  },
  {
    question: "How are Q-JEN VFDs tested before reaching customers?",
    answer:
      "Drawing from over three decades of industrial electronic service experience, our finished drives undergo trial running across real customer service-field environments to verify operational dependability before supply.",
  },
] as const;

export function formatPowerRating(kw: number, hp: number): string {
  const kwStr = Number.isInteger(kw) ? String(kw) : String(Number(kw));
  const hpStr = Number.isInteger(hp) ? String(hp) : String(Number(hp));
  return `${kwStr}kW / ${hpStr}HP`;
}

export function slugifyProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

