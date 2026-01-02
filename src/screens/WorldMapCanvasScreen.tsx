import { useNarrativeStore } from '../stores/narrativeStore';
import { OptionsMenu, Icon } from '../components';
import { useState, useRef, useEffect } from 'react';
import { canTravelToLocation } from '../utils/worldMap';

interface WorldMapCanvasScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
  onViewCharacterSheet?: () => void;
  onExit: () => void;
}

export function WorldMapCanvasScreen({
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

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Debug: Draw viewport info
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw viewport info
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(`Viewport: x=${viewport.x.toFixed(0)}, y=${viewport.y.toFixed(0)}, zoom=${viewport.zoom.toFixed(2)}`, 10, 20);
  }, [viewport]);

  if (!world || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <p className="text-fg-primary">No campaign loaded</p>
      </div>
    );
  }

  // Get campaign locations with coordinates
  const campaignLocations = campaign.locations || [];
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
    </div>
  );
}
