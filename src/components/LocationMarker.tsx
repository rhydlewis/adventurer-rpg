import { Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import Icon from './Icon';

interface LocationMarkerProps {
  position: LatLngExpression;
  name: string;
  isUnlocked: boolean;
  isCurrent: boolean;
  onClick?: () => void;
}

export function LocationMarker({
  position,
  name,
  isUnlocked,
  isCurrent,
  onClick,
}: LocationMarkerProps) {
  // Create custom HTML icon
  const iconHtml = renderToStaticMarkup(
    <div
      className={`
        flex flex-col items-center gap-2 p-3 rounded-lg
        min-w-[44px] min-h-[44px]
        transition-transform hover:scale-110
        ${isUnlocked ? 'bg-secondary border-2 border-border-default hover:border-accent' : 'bg-secondary/50 border-2 border-border-default opacity-50'}
        ${isCurrent ? 'border-accent shadow-lg shadow-blue-500/50' : ''}
        cursor-pointer
      `}
    >
      <div className="w-8 h-8 flex items-center justify-center">
        <Icon
          name={isUnlocked ? 'MapPin' : 'Lock'}
          size={20}
          className="text-fg-primary"
        />
      </div>
      <span className="text-xs text-fg-primary whitespace-nowrap">
        {isUnlocked ? name : '???'}
      </span>
    </div>
  );

  const customIcon = divIcon({
    html: iconHtml,
    className: 'custom-location-marker',
    iconSize: [80, 80],
    iconAnchor: [40, 40], // Center the icon
  });

  return (
    <Marker
      position={position}
      icon={customIcon}
      eventHandlers={{
        click: () => {
          if (isUnlocked && onClick) {
            onClick();
          }
        },
      }}
    />
  );
}
