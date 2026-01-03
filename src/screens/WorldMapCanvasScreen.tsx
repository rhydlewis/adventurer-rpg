import { useNarrativeStore } from '../stores/narrativeStore';
import { OptionsMenu, Icon, MapControls } from '../components';
import { useState, useRef, useEffect } from 'react';
import { LOCATIONS } from '../data/locations';
import { canTravelToLocation } from '../utils/worldMap';

interface WorldMapCanvasScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
  onViewCharacterSheet?: () => void;
  onExit: () => void;
}

export function WorldMapCanvasScreen({
  onNavigate,
  onViewCharacterSheet,
  onExit,
}: WorldMapCanvasScreenProps) {
  const { world, campaign } = useNarrativeStore();

  // Viewport state
  const [viewport, setViewport] = useState({
    x: 0,      // Camera offset X (pixels)
    y: 0,      // Camera offset Y (pixels)
    zoom: 1.0  // Zoom level (0.5 to 2.0)
  });

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Touch state for pinch zoom
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get campaign locations with coordinates (before useEffect that uses it)
  const campaignLocations = campaign?.locations || [];
  const locationsWithCoords = campaignLocations.filter(loc => loc.coordinates);

  // Transform world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    return {
      x: centerX + (worldX * viewport.zoom) + viewport.x,
      y: centerY + (worldY * viewport.zoom) + viewport.y
    };
  };

  // Draw connection lines on canvas
  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    if (!containerRef.current || !world) return;

    const rect = containerRef.current.getBoundingClientRect();

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw each connection
    locationsWithCoords.forEach((location) => {
      if (!location.connections || !location.coordinates) return;

      const fromScreen = worldToScreen(location.coordinates.x, location.coordinates.y);
      const isFromUnlocked = canTravelToLocation(world, location.id);

      if (!isFromUnlocked) return; // Only draw from unlocked locations

      location.connections.forEach((toId) => {
        const toLocation = LOCATIONS[toId];
        if (!toLocation?.coordinates) return;

        const toScreen = worldToScreen(toLocation.coordinates.x, toLocation.coordinates.y);
        const isToUnlocked = canTravelToLocation(world, toId);
        const isCurrent = location.id === world.currentLocationId || toId === world.currentLocationId;

        // Draw line
        ctx.beginPath();
        ctx.moveTo(fromScreen.x, fromScreen.y);
        ctx.lineTo(toScreen.x, toScreen.y);

        // Style based on unlock state and current location
        if (isCurrent) {
          ctx.strokeStyle = 'rgb(59, 130, 246)'; // accent color
        } else {
          ctx.strokeStyle = 'rgb(100, 116, 139)'; // border-default
        }

        ctx.lineWidth = 2 * viewport.zoom;

        // Dashed if target is locked
        if (!isToUnlocked) {
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.stroke();
      });
    });
  };

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Auto-center on current location (on mount)
  useEffect(() => {
    if (!world?.currentLocationId || !containerRef.current) return;

    const currentLocation = locationsWithCoords.find(
      loc => loc.id === world.currentLocationId
    );

    if (!currentLocation?.coordinates) return;

    // Center viewport on current location
    // Offset is negative of world coordinates (inverted because we're moving the camera, not the world)
    setViewport({
      x: -currentLocation.coordinates.x,
      y: -currentLocation.coordinates.y,
      zoom: 1.0
    });
  }, []); // Only run on mount

  // Render canvas (connections)
  useEffect(() => {
    if (!world || !campaign) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawConnections(ctx);
  }, [viewport, world, campaign, locationsWithCoords]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;

    setViewport(prev => ({
      ...prev,
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;

    setViewport(prev => ({
      ...prev,
      zoom: Math.min(2.0, Math.max(0.5, prev.zoom + zoomDelta))
    }));
  };

  const handleZoomIn = () => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.min(2.0, prev.zoom + 0.2)
    }));
  };

  const handleZoomOut = () => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(0.5, prev.zoom - 0.2)
    }));
  };

  const handleResetZoom = () => {
    setViewport({
      x: 0,
      y: 0,
      zoom: 1.0
    });
  };

  // Touch handlers for mobile
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - start panning
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - viewport.x,
        y: e.touches[0].clientY - viewport.y
      });
    } else if (e.touches.length === 2) {
      // Two touches - start pinch zoom
      setIsPanning(false);
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setTouchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      // Single touch - pan
      setViewport(prev => ({
        ...prev,
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y
      }));
    } else if (e.touches.length === 2 && touchDistance !== null) {
      // Two touches - pinch zoom
      const newDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const delta = (newDistance - touchDistance) * 0.01;

      setViewport(prev => ({
        ...prev,
        zoom: Math.min(2.0, Math.max(0.5, prev.zoom + delta))
      }));

      setTouchDistance(newDistance);
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setTouchDistance(null);
  };

  if (!world || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <p className="text-fg-primary">No campaign loaded</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-primary overflow-hidden">
      {/* Header with Options Menu */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-4">
        <div>
          <h1 className="heading-primary text-h1 text-fg-primary mb-2">
            {campaign.title}
          </h1>
          <p className="body-secondary text-fg-muted">Canvas Map (POC)</p>
        </div>
        <OptionsMenu
          onViewCharacterSheet={onViewCharacterSheet}
          onExit={onExit}
          showMap={false}
        />
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ top: '80px' }} // Space for header
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />

        {/* Location nodes */}
        {locationsWithCoords.map((location) => {
          const screenPos = worldToScreen(
            location.coordinates!.x,
            location.coordinates!.y
          );

          const isUnlocked = canTravelToLocation(world, location.id);
          const isCurrent = world.currentLocationId === location.id;

          return (
            <div
              key={location.id}
              className="absolute"
              style={{
                left: `${screenPos.x}px`,
                top: `${screenPos.y}px`,
                transform: 'translate(-50%, -50%)', // Center on coordinates
                pointerEvents: isUnlocked ? 'auto' : 'none',
              }}
            >
              {/* Location button */}
              <button
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-lg
                  min-w-[44px] min-h-[44px]
                  transition-transform hover:scale-110
                  ${isUnlocked ? 'bg-secondary border-2 border-border-default hover:border-accent' : 'bg-secondary/50 border-2 border-border-default opacity-50'}
                  ${isCurrent ? 'border-accent shadow-lg shadow-blue-500/50' : ''}
                `}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    onNavigate({ type: 'locationHub', locationId: location.id });
                  }
                }}
              >
                {/* Icon */}
                <div className="w-8 h-8 flex items-center justify-center">
                  <Icon
                    name={isUnlocked ? 'MapPin' : 'Lock'}
                    size={20}
                    className="text-fg-primary"
                  />
                </div>

                {/* Location name */}
                <span className="text-xs text-fg-primary whitespace-nowrap">
                  {isUnlocked ? location.name : '???'}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-20">
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleResetZoom}
          currentZoom={viewport.zoom}
        />
      </div>
    </div>
  );
}
