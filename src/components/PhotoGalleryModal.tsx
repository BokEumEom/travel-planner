import React from 'react';
import { X, Camera, MapPin, ExternalLink } from 'lucide-react';
import { DayPlan } from '../types';
import { useI18n } from '../lib/i18n';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDay: DayPlan;
}

const GALLERY_PHOTOS: Record<string, Array<{ title: string; location: string; url: string }>> = {
  'day-1': [
    {
      title: 'Sydney Opera House at Dusk',
      location: 'Bennelong Point, Sydney',
      url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Circular Quay Ferries',
      location: 'Sydney Harbour',
      url: 'https://images.unsplash.com/photo-1524293581917-878a6d017cba?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Royal Botanic Garden Promenade',
      location: 'Mrs Macquaries Road',
      url: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&q=80',
    },
  ],
  'day-2': [
    {
      title: 'Bondi Beach Waves & Coastline',
      location: 'Bondi Beach, Sydney',
      url: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Bondi Icebergs Ocean Pool',
      location: 'South Bondi',
      url: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80',
    },
  ],
  'day-3': [
    {
      title: 'Christchurch Botanic Gardens',
      location: 'Rolleston Ave, Christchurch',
      url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Southern Alps Aerial Flight',
      location: 'Tasman Sea Crossing',
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  isOpen,
  onClose,
  activeDay,
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  const photos = GALLERY_PHOTOS[activeDay.id] || GALLERY_PHOTOS['day-1'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4">
      <div 
        id="photos-modal-container"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">{t('photoGalleryTitle')}</h3>
              <p className="text-xs text-neutral-500">
                {activeDay.title || activeDay.date}
              </p>
            </div>
          </div>
          <button
            id="close-photos-modal-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {photos.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-xl overflow-hidden border border-neutral-200/80 bg-neutral-50 shadow-2xs hover:shadow-md transition-all"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={item.url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-neutral-900 truncate">{item.title}</h4>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
