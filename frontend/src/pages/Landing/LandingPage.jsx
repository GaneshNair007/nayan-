import React from 'react';
import PalominoLanding from '../../landing/PalominoLanding';

export default function LandingPage({ onEnterCommandCenter, onSelectCamera }) {
  return (
    <PalominoLanding
      onEnterCommandCenter={onEnterCommandCenter}
      onSelectCamera={onSelectCamera}
    />
  );
}
