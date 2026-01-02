import { useNarrativeStore } from '../stores/narrativeStore';
import { OptionsMenu } from '../components';
import { useState, useRef, useEffect } from 'react';

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
      </div>
    </div>
  );
}
