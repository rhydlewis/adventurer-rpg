import Icon from './Icon';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  currentZoom: number;
}

/**
 * Map controls for WorldMapCanvasScreen.
 *
 * Provides zoom in/out/reset buttons for map navigation.
 * Mobile-optimized with 44x44px minimum tap targets.
 */
export function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
  currentZoom,
}: MapControlsProps) {
  const isMaxZoom = currentZoom >= 2.0;
  const isMinZoom = currentZoom <= 0.5;

  return (
    <div className="flex flex-col gap-2">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        disabled={isMaxZoom}
        className="
          flex items-center justify-center
          w-11 h-11 rounded-lg
          bg-secondary border-2 border-border-default
          hover:border-accent active:scale-95
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg
        "
        aria-label="Zoom in"
      >
        <Icon name="Plus" size={20} className="text-fg-primary" />
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="
          flex items-center justify-center
          w-11 h-11 rounded-lg
          bg-secondary border-2 border-border-default
          hover:border-accent active:scale-95
          transition-all duration-200
          shadow-lg
        "
        aria-label="Reset zoom"
      >
        <Icon name="RotateCcw" size={20} className="text-fg-primary" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        disabled={isMinZoom}
        className="
          flex items-center justify-center
          w-11 h-11 rounded-lg
          bg-secondary border-2 border-border-default
          hover:border-accent active:scale-95
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg
        "
        aria-label="Zoom out"
      >
        <Icon name="Minus" size={20} className="text-fg-primary" />
      </button>
    </div>
  );
}
