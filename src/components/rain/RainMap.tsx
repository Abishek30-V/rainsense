import { useEffect, useState, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker,
  Marker, Popup, useMap, useMapEvents, Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, Layers, Maximize2, ZoomIn, ZoomOut, Navigation, Info, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

import { useRainMovement } from '../../hooks/useRainMovement';
import { type TrackedCell } from '../../services/rainMovementService';
import { cn } from '../../lib/utils';
import { useGeolocation } from '../../hooks/useGeolocation';

// ─── Fix default Leaflet icon paths broken by bundlers ───────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Custom Icons ─────────────────────────────────────────────────────────────
const userIcon = L.divIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
      <div style="
        width:18px;height:18px;
        background:#ef4444;border:3px solid white;border-radius:50%;
        box-shadow:0 0 0 4px rgba(239,68,68,0.3),0 2px 8px rgba(0,0,0,0.3);
        animation:userPulse 2s ease-in-out infinite;
      "></div>
      <div style="
        background:white;color:#1e293b;
        font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;
        box-shadow:0 2px 6px rgba(0,0,0,0.2);white-space:nowrap;
      ">📍 You</div>
    </div>
  `,
  className: '',
  iconSize: [70, 48],
  iconAnchor: [35, 16],
  popupAnchor: [0, -20],
});

// ─── Intensity config ─────────────────────────────────────────────────────────
const intensityConfig = {
  light:    { color: '#38bdf8', fill: '#7dd3fc', fillOpacity: 0.22, label: '🌦️ Light Rain',    emoji: '🌦️' },
  moderate: { color: '#0ea5e9', fill: '#38bdf8', fillOpacity: 0.38, label: '🌧️ Moderate Rain', emoji: '🌧️' },
  heavy:    { color: '#1d4ed8', fill: '#3b82f6', fillOpacity: 0.52, label: '⛈️ Heavy Rain',    emoji: '⛈️' },
};

// ─── Tile layers ──────────────────────────────────────────────────────────────
const tileLayers = {
  street: {
    label: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
};



// ─── Map Controls (inner component, must be inside MapContainer) ───────────────
function MapControls({
  onLocateMe,
  onToggleTile,
  showRain,
  onToggleRain,
  onFullScreen,
  isFullScreen,
}: {
  onLocateMe: () => void;
  onToggleTile: () => void;
  showRain: boolean;
  onToggleRain: () => void;
  onFullScreen?: () => void;
  isFullScreen: boolean;
}) {
  const map = useMap();

  const zoomIn  = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();

  const btnBase = "w-9 h-9 flex items-center justify-center rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 transition-all active:scale-95";

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[400] flex flex-col gap-2">
      <button onClick={zoomIn}  className={btnBase} title="Zoom In"><ZoomIn  size={16} /></button>
      <button onClick={zoomOut} className={btnBase} title="Zoom Out"><ZoomOut size={16} /></button>
      <div className="h-px bg-slate-200 dark:bg-slate-700 mx-1 my-0.5" />
      <button onClick={onLocateMe} className={cn(btnBase, "text-emerald-600 hover:text-emerald-500")} title="My Location">
        <Locate size={16} />
      </button>
      <button onClick={onToggleRain} className={cn(btnBase, showRain && "bg-sky-500 text-white border-sky-500 hover:bg-sky-400 hover:text-white dark:bg-sky-500 dark:text-white")} title="Toggle Rain Layer">
        <Navigation size={16} />
      </button>
      <button onClick={onToggleTile} className={btnBase} title="Toggle Map Style">
        <Layers size={16} />
      </button>
      {onFullScreen && !isFullScreen && (
        <button onClick={onFullScreen} className={btnBase} title="Full Screen">
          <Maximize2 size={16} />
        </button>
      )}
    </div>
  );
}

// ─── Locate button logic ──────────────────────────────────────────────────────
function LocateMeController({ trigger, onLocated }: {
  trigger: number;
  onLocated: (lat: number, lon: number) => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (trigger === 0) return;
    map.locate({ setView: true, maxZoom: 13 });
  }, [trigger, map]);

  useMapEvents({
    locationfound(e) {
      onLocated(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

// ─── Popup for rain cells ─────────────────────────────────────────────────────
function RainCellPopup({ cell, idx }: { cell: TrackedCell; idx: number }) {
  const cfg = intensityConfig[cell.current.intensity];
  return (
    <Popup>
      <div className="min-w-[150px]">
        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-100">
          <span className="text-base">{cfg.emoji}</span>
          <span className="font-bold text-slate-800 text-sm">Rain Cell {idx + 1}</span>
        </div>
        <table className="text-xs w-full">
          <tbody>
            <tr><td className="text-slate-500 pr-2 py-0.5">Intensity</td><td className="font-semibold text-slate-800">{cell.current.intensity.charAt(0).toUpperCase() + cell.current.intensity.slice(1)}</td></tr>
            <tr><td className="text-slate-500 pr-2 py-0.5">Max Precip.</td><td className="font-semibold text-sky-600">{cell.current.maxPrecipitation.toFixed(1)} mm/h</td></tr>
            <tr><td className="text-slate-500 pr-2 py-0.5">Distance</td><td className="font-semibold text-slate-700">{cell.distanceToUserKm} km</td></tr>
            {cell.classification !== 'UNCERTAIN' && cell.speedKmh !== undefined && (
              <>
                <tr><td className="text-slate-500 pr-2 py-0.5">Movement</td><td className="font-semibold text-amber-600">{cell.classification}</td></tr>
                <tr><td className="text-slate-500 pr-2 py-0.5">Speed</td><td className="font-semibold text-slate-700">{cell.speedKmh} km/h {cell.direction ? `(${cell.direction})` : ''}</td></tr>
              </>
            )}
            <tr><td className="text-slate-500 pr-2 py-0.5">Source</td><td className="font-semibold text-slate-500">Open-Meteo</td></tr>
          </tbody>
        </table>
      </div>
    </Popup>
  );
}

// ─── Main Map Content ─────────────────────────────────────────────────────────
function MapContent({
  userPos,
  showRain,
  tileLayer,
  cells,
}: {
  userPos: [number, number];
  showRain: boolean;
  tileLayer: 'street' | 'satellite';
  cells: TrackedCell[];
}) {
  const tile = tileLayers[tileLayer];

  return (
    <>
      <TileLayer attribution={tile.attribution} url={tile.url} />

      {/* User marker */}
      <Marker position={userPos} icon={userIcon}>
        <Popup>
          <div className="text-sm font-bold text-slate-800">📍 Your Location</div>
          <div className="text-xs text-slate-500">Karur, Tamil Nadu</div>
          <div className="text-xs text-sky-600 font-medium mt-1">{userPos[0].toFixed(4)}, {userPos[1].toFixed(4)}</div>
        </Popup>
      </Marker>

      {/* 1 km detection zone */}
      <Circle
        center={userPos}
        radius={1000}
        pathOptions={{
          color: '#0ea5e9', fillColor: '#0ea5e9',
          fillOpacity: 0.07, weight: 2.5, dashArray: '7,5',
        }}
      >
        <Popup>
          <div className="text-sm font-semibold text-slate-800">⭕ Your 1 km Area</div>
          <div className="text-xs text-slate-500 mt-1">Rain entering this zone triggers an alert.</div>
        </Popup>
      </Circle>

      {showRain && (
        <>
          {/* Rain cells */}
          {cells.map((cell, idx) => {
            const cfg = intensityConfig[cell.current.intensity];
            // Radius based on areaKm2, min 2500m, max 10000m
            const radiusMeters = Math.max(2500, Math.min(10000, Math.sqrt(cell.current.areaKm2 / Math.PI) * 1000));
            return (
              <Circle
                key={idx}
                center={[cell.current.latitude, cell.current.longitude] as [number, number]}
                radius={radiusMeters}
                pathOptions={{ color: cfg.color, fillColor: cfg.fill, fillOpacity: cfg.fillOpacity, weight: 1.5 }}
              >
                <RainCellPopup cell={cell} idx={idx} />
              </Circle>
            );
          })}

          {/* Movement Tails & Projections */}
          {cells.map((cell, idx) => {
            if (!cell.previous) return null;
            return (
              <div key={`movement-${idx}`}>
                {/* Tail (where it came from) */}
                <Polyline
                  positions={[
                    [cell.previous.latitude, cell.previous.longitude],
                    [cell.current.latitude, cell.current.longitude]
                  ]}
                  pathOptions={{
                    color: '#94a3b8', // slate-400
                    weight: 3,
                    dashArray: '5, 8',
                    opacity: 0.6
                  }}
                />

                {/* Projection (where it's going) */}
                {cell.projection && cell.projection.futurePositions.length > 0 && (
                  <>
                    <Polyline
                      positions={[
                        [cell.current.latitude, cell.current.longitude],
                        ...cell.projection.futurePositions.map(p => [p.latitude, p.longitude] as [number, number])
                      ]}
                      pathOptions={{
                        color: cell.projection.intersectsUserArea ? '#ef4444' : '#38bdf8', // red if hit, blue if not
                        weight: 3,
                        dashArray: '8, 8',
                        opacity: 0.8
                      }}
                    />
                    {/* Projection Markers */}
                    {cell.projection.futurePositions.map((pos, pIdx) => (
                      <CircleMarker
                        key={`proj-marker-${idx}-${pIdx}`}
                        center={[pos.latitude, pos.longitude]}
                        radius={3}
                        pathOptions={{
                          color: cell.projection!.intersectsUserArea ? '#ef4444' : '#38bdf8',
                          fillColor: '#fff',
                          fillOpacity: 1,
                          weight: 2
                        }}
                      >
                        <Popup>
                          <div className="text-xs font-semibold text-slate-800">Projected Position</div>
                          <div className="text-[10px] text-slate-500">In {pos.minutes} minutes</div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </>
                )}
              </div>
            );
          })}

          {/* Rain cell center dots */}
          {cells.map((cell, idx) => (
            <CircleMarker
              key={`dot-${idx}`}
              center={[cell.current.latitude, cell.current.longitude] as [number, number]}
              radius={4}
              pathOptions={{
                color: '#fff', fillColor: intensityConfig[cell.current.intensity].color,
                fillOpacity: 1, weight: 1.5,
              }}
            >
              <RainCellPopup cell={cell} idx={idx} />
            </CircleMarker>
          ))}
        </>
      )}
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface RainMapProps {
  onViewFullMap?: () => void;
  isFullScreen?: boolean;
  className?: string;
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function RainMap({ onViewFullMap, isFullScreen = false, className }: RainMapProps) {
  const { t } = useLanguage();
  const geo = useGeolocation();

  const fallbackLat = 10.9601;
  const fallbackLon = 78.0766;

  const initialLat = geo.lat !== null ? geo.lat : fallbackLat;
  const initialLon = geo.lon !== null ? geo.lon : fallbackLon;

  const [userPos, setUserPos]       = useState<[number, number]>([initialLat, initialLon]);
  const [tileLayer, setTileLayer]   = useState<'street' | 'satellite'>('street');
  const [showRain, setShowRain]     = useState(true);
  const [locateTrigger, setLocate]  = useState(0);
  const [showInfo, setShowInfo]     = useState(false);

  const { trackedCells, isCollecting, historyCount } = useRainMovement();

  useEffect(() => {
    if (geo.lat !== null && geo.lon !== null) {
      setUserPos([geo.lat, geo.lon]);
    }
  }, [geo.lat, geo.lon]);



  const handleLocate = useCallback(() => setLocate(n => n + 1), []);
  const handleToggleTile = () => setTileLayer(t => t === 'street' ? 'satellite' : 'street');

  const mapHeight = isFullScreen ? 'h-full' : 'h-[400px] sm:h-[480px]';

  return (
    <div className={cn(
      "relative overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl",
      isFullScreen ? "h-full rounded-none border-0" : "rounded-3xl",
      mapHeight,
      className
    )}>

      {/* ── Leaflet Map ── */}
      <MapContainer
        center={userPos}
        zoom={isFullScreen ? 13 : 11}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <LocateMeController trigger={locateTrigger} onLocated={(lat, lon) => setUserPos([lat, lon])} />
        <MapContent userPos={userPos} showRain={showRain} tileLayer={tileLayer} cells={trackedCells} />

        {/* Map controls — rendered inside MapContainer so useMap() works */}
        <MapControls
          onLocateMe={handleLocate}
          onToggleTile={handleToggleTile}
          showRain={showRain}
          onToggleRain={() => setShowRain(v => !v)}
          onFullScreen={onViewFullMap}
          isFullScreen={isFullScreen}
        />
      </MapContainer>

      {/* ── Top bar overlay ── */}
      <div className="absolute top-0 left-0 right-0 z-[400] pointer-events-none">
        <div className="flex items-start justify-between p-3 gap-2">
          {/* Title pill */}
          <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">{t('map.title')}</span>
            <span className="text-[10px] text-slate-400">· Live</span>
          </div>

          {/* Tile label badge */}
          <div className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-semibold text-slate-600 dark:text-slate-300 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {tileLayer === 'street' ? '🗺️ Street' : '🛰️ Satellite'}
          </div>
        </div>
      </div>

      {/* ── Geolocation Overlay ── */}
      {geo.loading && (
        <div className="absolute inset-0 z-[500] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Locating you...</p>
        </div>
      )}

      {!geo.loading && geo.error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[400] bg-amber-100 dark:bg-amber-900/90 text-amber-800 dark:text-amber-100 px-4 py-2 rounded-xl text-xs font-medium shadow-lg flex flex-col items-center gap-1 w-max max-w-[90%] text-center border border-amber-200 dark:border-amber-700/50">
          <span className="font-bold">⚠️ {geo.error}</span>
          <span>Using mock location for demonstration.</span>
        </div>
      )}

      {/* ── Bottom info card ── */}
      <div className="absolute bottom-0 left-0 right-0 z-[400] pointer-events-none">
        <div className="p-3 flex items-end justify-between gap-2">

          {/* Rain status card - Movement pending */}
          <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 px-4 py-3 max-w-xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${isCollecting ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {isCollecting ? 'Collecting Data...' : 'Movement Calculated'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {isCollecting 
                ? `Need 2 observations to track movement. Currently have ${historyCount}. Updates every 15m.` 
                : trackedCells.length > 0 
                  ? "Displaying spatial rainfall vectors."
                  : "No precipitation detected in your 40km grid."}
            </p>
          </div>

          {/* Legend + Info toggle */}
          <div className="pointer-events-auto flex flex-col gap-2 items-end">
            <button
              onClick={() => setShowInfo(v => !v)}
              className="w-8 h-8 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md text-slate-500 hover:text-sky-600 transition-colors"
            >
              {showInfo ? <X size={14} /> : <Info size={14} />}
            </button>

            {/* Legend panel */}
            {showInfo && (
              <div className="bg-white/97 dark:bg-slate-900/97 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 text-xs space-y-1.5 min-w-[160px]">
                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Legend</p>
                {Object.values(intensityConfig).map(cfg => (
                  <div key={cfg.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: cfg.color, backgroundColor: cfg.fill + 'aa' }} />
                    <span className="text-slate-600 dark:text-slate-300">{cfg.label}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-dashed border-sky-400 shrink-0" style={{ backgroundColor: '#0ea5e910' }} />
                    <span className="text-slate-600 dark:text-slate-300">1 km Zone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">Your Location</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Global CSS for user pulse animation ── */}
      <style>{`
        @keyframes userPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(239,68,68,0.3), 0 2px 8px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0.1), 0 2px 8px rgba(0,0,0,0.3); }
        }
        .leaflet-popup-content { margin: 10px 14px !important; }
        .leaflet-popup-content-wrapper { border-radius: 14px !important; }
      `}</style>
    </div>
  );
}
