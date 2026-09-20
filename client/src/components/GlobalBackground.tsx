import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { resolveAssetUrl } from '../utils/assets';

export const GlobalBackground: React.FC = () => {
  const { settings } = useSettings();
  const bgType = settings.backgroundType || 'default';
  const overlayOpacity = (settings.backgroundOverlayOpacity ?? 60) / 100;
  const blurAmount = settings.backgroundBlur ?? 0;

  if (bgType === 'video' && settings.backgroundVideoUrl) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-slate-950">
        <video
          key={settings.backgroundVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-all duration-700"
          style={{
            filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
            transform: blurAmount > 0 ? 'scale(1.05)' : undefined
          }}
          src={resolveAssetUrl(settings.backgroundVideoUrl)}
        />
        <div
          className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        />
      </div>
    );
  }

  if (bgType === 'image' && settings.backgroundImageUrl) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url("${resolveAssetUrl(settings.backgroundImageUrl)}")`,
            filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
            transform: blurAmount > 0 ? 'scale(1.05)' : undefined
          }}
        />
        <div
          className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        />
      </div>
    );
  }

  if (bgType === 'gradient' && settings.backgroundGradient) {
    return (
      <div
        className="fixed inset-0 pointer-events-none -z-20 transition-all duration-700"
        style={{ background: settings.backgroundGradient }}
      >
        <div
          className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
          style={{ opacity: overlayOpacity * 0.5 }}
        />
      </div>
    );
  }

  if (bgType === 'color' && settings.backgroundColor) {
    return (
      <div
        className="fixed inset-0 pointer-events-none -z-20 transition-colors duration-500"
        style={{ backgroundColor: settings.backgroundColor }}
      />
    );
  }

  return null;
};
