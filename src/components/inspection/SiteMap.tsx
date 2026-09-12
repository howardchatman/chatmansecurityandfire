/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

// The map on the report cover: the site, pinned, with a little context around
// it so the customer recognises the block.
//
// With a Google Maps key it is one Static Maps image, which is what prints
// most reliably. Without one it is a 3×2 grid of OpenStreetMap tiles laid out
// around the geocoded point — same look, no key, no library.

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const ZOOM = 16;
const TILE = 256;

interface Props {
  address: string;
  /** Rendered size in CSS px. The image is fetched at 2× for print. */
  width?: number;
  height?: number;
  className?: string;
}

export default function SiteMap({ address, width = 300, height = 190, className = "" }: Props) {
  const [point, setPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (GOOGLE_KEY || !address) return;
    let live = true;
    fetch(`/api/geocode?q=${encodeURIComponent(address)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => live && setPoint(j.data))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [address]);

  if (GOOGLE_KEY) {
    const src =
      `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}` +
      `&zoom=${ZOOM}&size=${width}x${height}&scale=2&maptype=roadmap` +
      `&markers=color:red%7C${encodeURIComponent(address)}&key=${GOOGLE_KEY}`;
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`} style={{ width, height }}>
        <img src={src} alt={`Map of ${address}`} width={width} height={height} className="block" />
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-gray-100 text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <MapPin className="w-6 h-6" />
        <span className="text-[10px]">Map unavailable</span>
      </div>
    );
  }

  if (!point) {
    return <div className={`bg-gray-100 animate-pulse ${className}`} style={{ width, height }} />;
  }

  return <TileMap lat={point.lat} lon={point.lon} width={width} height={height} className={className} />;
}

/** Web-Mercator tile coordinates (fractional) for a point at a zoom. */
function tileXY(lat: number, lon: number, z: number) {
  const n = 2 ** z;
  const x = ((lon + 180) / 360) * n;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
  return { x, y };
}

function TileMap({
  lat,
  lon,
  width,
  height,
  className,
}: {
  lat: number;
  lon: number;
  width: number;
  height: number;
  className: string;
}) {
  const { x, y } = tileXY(lat, lon, ZOOM);
  // Pixel position of the point within the world at this zoom, then the
  // top-left of our viewport so the point lands dead centre.
  const px = x * TILE;
  const py = y * TILE;
  const left = px - width / 2;
  const top = py - height / 2;
  const x0 = Math.floor(left / TILE);
  const y0 = Math.floor(top / TILE);
  const x1 = Math.floor((left + width) / TILE);
  const y1 = Math.floor((top + height) / TILE);

  const tiles: Array<{ tx: number; ty: number }> = [];
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) tiles.push({ tx, ty });

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`} style={{ width, height }}>
      {tiles.map(({ tx, ty }) => (
        <img
          key={`${tx}-${ty}`}
          src={`https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`}
          alt=""
          width={TILE}
          height={TILE}
          className="absolute max-w-none"
          style={{ left: tx * TILE - left, top: ty * TILE - top }}
        />
      ))}
      {/* the pin — its tip sits on the point */}
      <svg
        viewBox="0 0 24 32"
        width={22}
        height={30}
        className="absolute"
        style={{ left: width / 2 - 11, top: height / 2 - 30 }}
      >
        <path
          d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"
          fill="#E53935"
          stroke="#fff"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="4.5" fill="#fff" />
      </svg>
      <span className="absolute bottom-0 right-0 bg-white/80 text-[7px] text-gray-600 px-1 leading-3">
        © OpenStreetMap contributors
      </span>
    </div>
  );
}
