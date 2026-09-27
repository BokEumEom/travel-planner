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
  ChevronDown,
  Plus,
  HardDrive,
  Trash2
} from 'lucide-react';
import { Trip } from '../types';
import { PRESET_TRIPS } from '../data/initialTrip';
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
  onOpenNewTripModal: () => void;
  onDeleteCustomTrip?: (tripId: string) => void;
  availableTrips: Trip[];
  crdtOpCount: number;
  activePeersCount: number;
  saveStatus?: 'saving' | 'saved' | 'idle';
  lastSavedAt?: number | null;
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
  onOpenNewTripModal,
  onDeleteCustomTrip,
  availableTrips,
  crdtOpCount,
  activePeersCount,
  saveStatus = 'saved',
  lastSavedAt,
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

        {/* Trip Switcher Dropdown & Create New Trip */}
        <div className="flex items-center gap-1.5">
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
                {/* Create New Trip inside dropdown */}
                <div className="p-1 border-b border-neutral-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTripMenuOpen(false);
                      onOpenNewTripModal();
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('createNewTrip')}</span>
                  </button>
                </div>

                {/* Custom User Trips */}
                {availableTrips.some((tItem) => !PRESET_TRIPS.some((p) => p.id === tItem.id)) && (
                  <div className="border-b border-neutral-100 pb-1 mb-1">
                    <div className="px-3 py-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center justify-between">
                      <span>{language === 'ko' ? '내 저장된 여행' : language === 'ja' ? '保存した旅行' : 'My Saved Trips'}</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 rounded font-mono">Persistent</span>
                    </div>
                    {availableTrips
                      .filter((tItem) => !PRESET_TRIPS.some((p) => p.id === tItem.id))
                      .map((tItem) => (
                        <div
                          key={tItem.id}
                          className={`w-full px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 group ${
                            tItem.id === trip.id ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-neutral-700'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectTripPreset(tItem.id)}
                            className="flex-1 text-left truncate flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="truncate">{tItem.title}</span>
                          </button>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {tItem.id === trip.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            {onDeleteCustomTrip && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(language === 'ko' ? '이 여행 일정을 삭제하시겠습니까?' : language === 'ja' ? 'この旅行日程を削除しますか？' : 'Delete this custom trip?')) {
                                    onDeleteCustomTrip(tItem.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-100 text-neutral-400 hover:text-rose-600 rounded transition-opacity cursor-pointer"
                                title="Delete Trip"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  {t('presetItineraries')}
                </div>
                {availableTrips
                  .filter((tItem) => PRESET_TRIPS.some((p) => p.id === tItem.id))
                  .map((tItem) => (
                    <button
                      key={tItem.id}
                      onClick={() => onSelectTripPreset(tItem.id)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 cursor-pointer ${
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

          {/* Quick "+ New Trip" Button */}
          <button
            id="navbar-create-new-trip-btn"
            type="button"
            onClick={onOpenNewTripModal}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
            title={t('createNewTrip')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('createNewTrip')}</span>
          </button>
        </div>
      </div>

      {/* Right Row */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Storage Persistence Status Badge */}
        <div
          id="navbar-storage-status"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-neutral-100/90 border border-neutral-200/80 text-neutral-700 transition-all select-none mr-0.5"
          title={t('autoSavedTooltip')}
        >
          {saveStatus === 'saving' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-700 font-semibold">{t('savingChanges')}</span>
            </>
          ) : (
            <>
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="text-emerald-700 font-semibold">{t('savedLocally')}</span>
            </>
          )}
        </div>

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
        {/* Language Switcher Button (KO / EN / JA) */}
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
          <button
            id="lang-toggle-ja-btn"
            type="button"
            onClick={() => setLanguage('ja')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
              language === 'ja'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="日本語に言語変更"
          >
            JA
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

              {/* Browser Storage Persistence Status */}
              <div className="mt-2.5 pt-2 border-t border-neutral-100 space-y-1 text-neutral-600">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-emerald-600" />
                    <span>{t('storageInfo')}</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                {lastSavedAt && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-neutral-400">Auto-saved</span>
                    <span className="text-neutral-500 font-mono">
                      {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100">
                {t('autoSaveNotice')}
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

