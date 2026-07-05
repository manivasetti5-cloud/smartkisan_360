import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  address?: string;
}

interface LeafletMapProps {
  center: { lat: number; lng: number };
  address?: string;
  markers?: MapMarker[];
  zoom?: number;
  mainMarkerColor?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function LeafletMap({
  center,
  address,
  markers = [],
  zoom = 11,
  mainMarkerColor = '#10b981',
  onMapClick,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const onMapClickRef = useRef(onMapClick);

  // Sync onMapClick callback
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current) return;

    // Standard dark mode map tile layer from CartoDB (free to use without keys)
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([center.lat, center.lng], zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Register click event
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;

    // Force Leaflet to recalculate container size
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center, zoom, and markers on prop change
  useEffect(() => {
    const map = mapRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    // Slowly pan/zoom or set view immediately
    map.setView([center.lat, center.lng], map.getZoom() || zoom);

    // Re-draw markers
    markerGroup.clearLayers();

    // Helper for custom styled SVG-based divIcons (extremely robust, 100% path resolution proof)
    const createCustomIcon = (color: string) => {
      return L.divIcon({
        html: `
          <div style="display: flex; justify-content: center; align-items: center; width: 32px; height: 32px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        className: 'custom-leaflet-marker-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    };

    // Main marker
    L.marker([center.lat, center.lng], {
      icon: createCustomIcon(mainMarkerColor),
    })
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 4px; color: #1e293b; max-width: 180px;">
          <strong style="color: #0f172a; display: block; margin-bottom: 3px;">Your Location Hub</strong>
          <div style="font-weight: 600; color: #475569; font-size: 10px; margin-bottom: 4px;">Lat: ${center.lat.toFixed(6)} • Lng: ${center.lng.toFixed(6)}</div>
          ${address ? `<div style="border-top: 1px dashed #cbd5e1; padding-top: 4px; color: #334155; line-height: 1.35; margin-top: 4px;">📍 ${address}</div>` : ''}
        </div>
      `)
      .addTo(markerGroup);

    // Other listings/seller markers
    markers.forEach((m) => {
      L.marker([m.lat, m.lng], {
        icon: createCustomIcon(m.color || '#16a34a'),
      })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 4px; color: #1e293b; max-width: 180px;">
            <strong style="color: #0f172a; display: block; margin-bottom: 3px;">${m.label || 'Active Offer'}</strong>
            <div style="font-weight: 600; color: #475569; font-size: 10px; margin-bottom: 4px;">Lat: ${m.lat.toFixed(6)} • Lng: ${m.lng.toFixed(6)}</div>
            ${m.address ? `<div style="border-top: 1px dashed #cbd5e1; padding-top: 4px; color: #334155; line-height: 1.35; margin-top: 4px;">📍 ${m.address}</div>` : ''}
          </div>
        `)
        .addTo(markerGroup);
    });
  }, [center.lat, center.lng, markers, mainMarkerColor]);

  return <div ref={containerRef} className="w-full h-full rounded-xl z-10" />;
}
