import { Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';

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
  // Define inline styles (Tailwind won't work in renderToStaticMarkup)
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    minWidth: '44px',
    minHeight: '44px',
    transition: 'transform 0.2s',
    backgroundColor: isUnlocked ? 'rgb(var(--color-secondary))' : 'rgba(var(--color-secondary), 0.5)',
    border: isCurrent ? '2px solid rgb(59, 130, 246)' : '2px solid rgb(var(--color-border-default))',
    opacity: isUnlocked ? 1 : 0.5,
    cursor: isUnlocked ? 'pointer' : 'default',
    boxShadow: isCurrent ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
  };

  const iconStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'rgb(var(--color-fg-primary))',
    whiteSpace: 'nowrap',
  };

  // Simple icon SVGs
  const mapPinSvg = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `;

  const lockSvg = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  `;

  const iconHtml = `
    <div style="${Object.entries(containerStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
      <div style="${Object.entries(iconStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
        ${isUnlocked ? mapPinSvg : lockSvg}
      </div>
      <span style="${Object.entries(textStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
        ${isUnlocked ? name : '???'}
      </span>
    </div>
  `;

  const customIcon = divIcon({
    html: iconHtml,
    className: 'custom-location-marker',
    iconSize: [100, 100],
    iconAnchor: [50, 50], // Center the icon
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
