import React from 'react';
import { Bus, Footprints, Plane, Train, Car, Ship } from 'lucide-react';
import { TravelMode } from '../types';

interface TravelModeIconProps {
  mode: TravelMode;
  className?: string;
}

export const TravelModeIcon: React.FC<TravelModeIconProps> = ({ mode, className = 'w-3.5 h-3.5' }) => {
  switch (mode) {
    case 'bus':
      return <Bus className={className} />;
    case 'walk':
      return <Footprints className={className} />;
    case 'flight':
      return <Plane className={className} />;
    case 'train':
      return <Train className={className} />;
    case 'car':
      return <Car className={className} />;
    case 'ferry':
      return <Ship className={className} />;
    default:
      return <Footprints className={className} />;
  }
};

export const travelModeLabels: Record<TravelMode, string> = {
  bus: 'Bus',
  walk: 'Walk',
  train: 'Train',
  flight: 'Flight',
  car: 'Car',
  ferry: 'Ferry',
};
