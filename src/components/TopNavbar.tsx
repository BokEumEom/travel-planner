import React, { useState } from 'react';
import { 
  Link2, 
  Columns, 
  Camera, 
  FileDown, 
  Cloud, 
  MoreHorizontal, 
  Check, 
  Copy, 
  Users, 
  Compass, 
  RotateCcw,
  Languages,
  HelpCircle,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { Trip } from '../types';
import { useI18n } from '../lib/i18n';

interface TopNavbarProps {
  trip: Trip;
  isSplitView: boolean;
  onToggleSplitView: () => void;
  onExportMarkdown: () => void;
  onOpenPhotos: () => void;
  onOpenHelp: () => void;
  onResetTrip: () => void;
  onSelectTripPreset: (tripId: string) => void;
  availableTrips: Trip[];
  crdtOpCount: number;
  activePeersCount: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  trip,
  isSplitView,
  onToggleSplitView,
  onExportMarkdown,
  onOpenPhotos,
  onOpenHelp,
  onResetTrip,
  onSelectTripPreset,
  availableTrips,
  crdtOpCount,
  activePeersCount,
}) => {
  const { t, language, setLanguage, toggleLanguage } = useI18n();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isTripMenuOpen, setIsTripMenuOpen] = useState(false);
  const [isCloudMenuOpen, setIsCloudMenuOpen] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <header 
      id="top-browser-navbar"
      className="h-11 bg-white border-b border-neutral-200/80 px-3 sm:px-4 flex items-center justify-between z-30 select-none shrink-0"
    >
      {/* Left: App Branding & Trip Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight text-neutral-900 hidden sm:inline">
            Travel Planner
          </span>
        </div>

        <div className="h-4 w-[1px] bg-neutral-200 mx-0.5 hidden sm:block" />

        {/* Trip Switcher Dropdown */}
        <div className="relative">
          <button
            id="trip-presets-dropdown-btn"
            type="button"
            onClick={() => setIsTripMenuOpen(!isTripMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-800 bg-neutral-100/90 hover:bg-neutral-200/70 rounded-lg border border-neutral-200/80 transition-all active:scale-95 cursor-pointer max-w-[190px] sm:max-w-[280px]"
            title={t('presetItineraries')}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{trip.title}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-0.5" />
          </button>

          {isTripMenuOpen && (
            <div 
              className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-neutral-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95"
              onClick={() => setIsTripMenuOpen(false)}
            >
              <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {t('presetItineraries')}
              </div>
              {availableTrips.map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => onSelectTripPreset(tItem.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 ${
                    tItem.id === trip.id ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-neutral-700'
                  }`}
                >
                  <span className="truncate">{tItem.title}</span>
                  {tItem.id === trip.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              ))}
              <div className="border-t border-neutral-100 my-1 pt-1">
                <button
                  onClick={onResetTrip}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('resetDefaultTrip')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Row */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Help Guide Button */}
        <button
          id="navbar-help-btn"
          type="button"
          onClick={onOpenHelp}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:text-emerald-800 bg-neutral-100/90 hover:bg-emerald-50 rounded-lg border border-neutral-200/80 transition-colors cursor-pointer mr-0.5"
          title={t('helpGuide')}
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">{t('helpGuide')}</span>
        </button>
        {/* Language Switcher Button (KO / EN) */}
        <div className="flex items-center bg-neutral-100/90 p-0.5 rounded-lg border border-neutral-200/70 text-xs font-semibold mr-1">
          <button
            id="lang-toggle-ko-btn"
            type="button"
            onClick={() => setLanguage('ko')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
              language === 'ko'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="한국어로 언어 변경"
          >
            KO
          </button>
          <button
            id="lang-toggle-en-btn"
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
              language === 'en'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Switch to English"
          >
            EN
          </button>
        </div>

        {/* 1. Share / Link icon */}
        <button
          id="navbar-share-btn"
          onClick={handleCopyLink}
          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors relative"
          title={t('shareTrip')}
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
          {copiedLink && (
            <span className="absolute -bottom-7 right-0 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded shadow-md whitespace-nowrap">
              {t('linkCopied')}
            </span>
          )}
        </button>

        {/* 2. Split Screen / Two overlapping squares (Collaborative CRDT Peer Mode) */}
        <button
          id="navbar-split-view-btn"
          onClick={onToggleSplitView}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            isSplitView
              ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
              : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'
          }`}
          title={t('splitViewDesc')}
        >
          <Columns className="w-4 h-4" />
          <span className="hidden md:inline text-[11px] font-semibold">
            {isSplitView ? t('splitViewActive') : t('splitView')}
          </span>
        </button>

        {/* 3. Camera / Photo gallery icon */}
        <button
          id="navbar-photos-btn"
          onClick={onOpenPhotos}
          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors"
          title={t('photos')}
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* 4. Export / Markdown icon */}
        <button
          id="navbar-export-btn"
          onClick={onExportMarkdown}
          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors"
          title={t('exportMarkdown')}
        >
          <FileDown className="w-4 h-4" />
        </button>

        {/* 5. Cloud icon (CRDT status) */}
        <div className="relative">
          <button
            id="navbar-cloud-btn"
            onClick={() => setIsCloudMenuOpen(!isCloudMenuOpen)}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors relative"
            title={t('crdtStatus')}
          >
            <Cloud className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </button>

          {isCloudMenuOpen && (
            <div 
              className="absolute right-0 top-full mt-1.5 w-68 bg-white rounded-xl shadow-xl border border-neutral-200/90 p-3 z-50 animate-in fade-in zoom-in-95 text-xs"
              onClick={() => setIsCloudMenuOpen(false)}
            >
              <div className="font-bold text-neutral-800 flex items-center justify-between mb-2">
                <span>{t('crdtStatus')}</span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {t('crdtLiveActive')}
                </span>
              </div>
              <div className="space-y-1.5 text-neutral-600">
                <div className="flex justify-between">
                  <span className="text-neutral-400">{t('broadcastChannel')}</span>
                  <span className="font-mono text-[11px] text-neutral-800">vibetrip_crdt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{t('conflictResolution')}</span>
                  <span className="font-semibold text-neutral-800">LWW-CRDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{t('syncedOps')}</span>
                  <span className="font-mono text-[11px] text-emerald-600 font-bold">{crdtOpCount} ops</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{t('connectedPeers')}</span>
                  <span className="font-semibold text-neutral-800">{activePeersCount} node(s)</span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 mt-2.5 pt-2 border-t border-neutral-100">
                {t('crdtExplainer')}
              </p>
            </div>
          )}
        </div>

        {/* User Collaborator Pill */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-200">
          <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
            U
          </div>
          <span className="text-xs font-semibold text-neutral-700 hidden lg:inline">
            unixzii
          </span>
        </div>
      </div>
    </header>
  );
};

