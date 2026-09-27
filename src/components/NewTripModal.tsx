import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, Compass, Plus, Sparkles } from 'lucide-react';
import { Trip, DayPlan, Origin } from '../types';
import { useI18n } from '../lib/i18n';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: Trip) => void;
}

interface DestinationPreset {
  name: string;
  nameEn: string;
  nameJa: string;
  originName: string;
  originNameEn: string;
  originNameJa: string;
  lat: number;
  lng: number;
  tags: string[];
  emoji: string;
}

const DESTINATION_PRESETS: DestinationPreset[] = [
  {
    name: '도쿄 (Tokyo)',
    nameEn: 'Tokyo, Japan',
    nameJa: '東京 (Tokyo)',
    originName: '도쿄역 / 신주쿠 호텔',
    originNameEn: 'Tokyo Station / Shinjuku Hotel',
    originNameJa: '東京駅 / 新宿ホテル',
    lat: 35.6812,
    lng: 139.7671,
    tags: ['도심 탐방', '미식', '쇼핑'],
    emoji: '🗼',
  },
  {
    name: '교토 & 오사카',
    nameEn: 'Kyoto & Osaka',
    nameJa: '京都・大阪',
    originName: '교토역 / 난바 호텔',
    originNameEn: 'Kyoto Station / Namba Hotel',
    originNameJa: '京都駅 / 難波ホテル',
    lat: 34.9858,
    lng: 135.7588,
    tags: ['전통문화', '신사', '식도락'],
    emoji: '🏮',
  },
  {
    name: '제주도 (Jeju)',
    nameEn: 'Jeju Island',
    nameJa: '済州島 (Jeju)',
    originName: '제주국제공항 / 제주시',
    originNameEn: 'Jeju Int Airport / Downtown',
    originNameJa: '済州国際空港 / 市内',
    lat: 33.5066,
    lng: 126.4932,
    tags: ['해안 드라이브', '자연', '힐링'],
    emoji: '🌴',
  },
  {
    name: '파리 (Paris)',
    nameEn: 'Paris, France',
    nameJa: 'パリ (Paris)',
    originName: '에펠탑 근처 호텔',
    originNameEn: 'Eiffel Tower / Central Hotel',
    originNameJa: 'エッフェル塔周辺ホテル',
    lat: 48.8566,
    lng: 2.3522,
    tags: ['미술관', '카페', '낭만'],
    emoji: '🥐',
  },
  {
    name: '뉴욕 (New York)',
    nameEn: 'New York City',
    nameJa: 'ニューヨーク (NYC)',
    originName: '맨해튼 타임스퀘어',
    originNameEn: 'Manhattan Times Square',
    originNameJa: 'マンハッタン・タイムズスクエア',
    lat: 40.7580,
    lng: -73.9855,
    tags: ['브로드웨이', '스카이라인', '센트럴파크'],
    emoji: '🗽',
  },
  {
    name: '시드니 (Sydney)',
    nameEn: 'Sydney, Australia',
    nameJa: 'シドニー (Sydney)',
    originName: '시드니 하버 / 서큘러키',
    originNameEn: 'Circular Quay / Meriton Suites',
    originNameJa: 'シドニー・ハーバー周辺',
    lat: -33.8688,
    lng: 151.2093,
    tags: ['해안 산책', '오페라하우스', '휴양'],
    emoji: '🏙️',
  },
];

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
}) => {
  const { t, language } = useI18n();

  // Get tomorrow's date formatted as YYYY-MM-DD
  const getInitialStartDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [title, setTitle] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<DestinationPreset | null>(DESTINATION_PRESETS[0]);
  const [customDestination, setCustomDestination] = useState('');
  const [customOrigin, setCustomOrigin] = useState('');
  const [startDate, setStartDate] = useState(getInitialStartDate);
  const [durationDays, setDurationDays] = useState(3);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: DestinationPreset) => {
    setSelectedPreset(preset);
    setCustomDestination('');
    if (!title || DESTINATION_PRESETS.some(p => title.includes(p.name.split(' ')[0]))) {
      const defaultTitles: Record<string, string> = {
        ko: `${preset.name.split(' ')[0]} ${durationDays}박 ${durationDays + 1}일 여행`,
        en: `${preset.nameEn.split(',')[0]} ${durationDays}-Day Trip`,
        ja: `${preset.nameJa.split(' ')[0]} ${durationDays}日間の旅`,
      };
      setTitle(defaultTitles[language] || `${preset.nameEn.split(',')[0]} Trip`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tripId = 'trip-' + Date.now().toString(36);
    const finalTitle = title.trim() || (
      selectedPreset 
        ? `${selectedPreset.name.split(' ')[0]} ${durationDays}일 여행` 
        : (customDestination.trim() || '나의 여행 계획')
    );

    const baseOrigin: Origin = selectedPreset
      ? {
          name: language === 'ja' ? selectedPreset.originNameJa : (language === 'ko' ? selectedPreset.originName : selectedPreset.originNameEn),
          lat: selectedPreset.lat,
          lng: selectedPreset.lng,
        }
      : {
          name: customOrigin.trim() || customDestination.trim() || '출발 호텔 / 숙소',
          lat: 37.5665, // default Seoul fallback if purely custom without coordinates
          lng: 126.9780,
        };

    // Generate days
    const days: DayPlan[] = [];
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const baseDate = new Date(startYear, startMonth - 1, startDay);

    for (let i = 0; i < durationDays; i++) {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + i);
      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const dayTitles: Record<string, string> = {
        ko: `${i + 1}일차: ${selectedPreset ? selectedPreset.name.split(' ')[0] : '도심'} 탐방 및 산책`,
        en: `Day ${i + 1}: Exploration & Highlights`,
        ja: `${i + 1}日目: 市内観光＆散策`,
      };

      days.push({
        id: `day-${i + 1}-${Date.now().toString(36)}`,
        date: dateStr,
        dayNumber: i + 1,
        title: dayTitles[language] || `Day ${i + 1}: Highlights`,
        origin: { ...baseOrigin },
        tags: selectedPreset?.tags || ['자유여행', '탐방'],
        notes: language === 'ko' 
          ? `${i + 1}일차 여행 계획입니다. 사이드바에서 '+ 경유지 추가' 또는 '지도 클릭 모드'로 가고 싶은 장소를 등록하세요.`
          : language === 'ja'
          ? `${i + 1}日目の旅程です。「+ 経由地追加」または「地図クリックモード」で行きたい場所を登録しましょう。`
          : `Day ${i + 1} itinerary. Add stops via "+ Add Waypoint" or map click mode.`,
        waypoints: [],
      });
    }

    const newTrip: Trip = {
      id: tripId,
      title: finalTitle,
      days,
      activeDayId: days[0].id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <div 
      id="new-trip-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div 
        id="new-trip-modal-container"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden text-neutral-900 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {t('newTripModalTitle')}
              </h2>
              <p className="text-xs text-neutral-500">
                {t('newTripModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            id="close-new-trip-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1. Trip Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('tripTitleLabel')}</span>
            </label>
            <input
              id="new-trip-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === 'ja' 
                  ? '例: 東京3泊4日グルメ旅、パリ芸術散歩' 
                  : language === 'ko'
                  ? '예: 도쿄 3박 4일 자유여행, 파리 감성 투어'
                  : 'e.g. Tokyo 4-Day Journey, Paris Art Tour'
              }
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* 2. Destination Preset Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('popularDestinations')}</span>
              </span>
              <span className="text-[11px] font-normal text-neutral-400">
                {language === 'ko' ? '클릭 시 해당 도시로 지도 이동' : language === 'ja' ? '選択で地図が自動移動' : 'Flies map to city'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DESTINATION_PRESETS.map((p) => {
                const isSelected = selectedPreset?.name === p.name;
                const displayName = language === 'ja' ? p.nameJa : (language === 'ko' ? p.name : p.nameEn);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200/80 text-neutral-700'
                    }`}
                  >
                    <span className="text-base">{p.emoji}</span>
                    <span className="truncate">{displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Duration & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('startDate')}</span>
              </label>
              <input
                id="new-trip-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Duration Days */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('tripDaysCount')}</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDurationDays(num)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      durationDays === num
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    {num}{language === 'ko' ? '일' : language === 'ja' ? '日' : 'd'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Explanation */}
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/70 text-xs text-neutral-600 space-y-1">
            <div className="font-bold text-neutral-800 flex items-center gap-1">
              <span>💡</span>
              <span>{language === 'ko' ? '여행 생성 안내' : language === 'ja' ? '日程作成のご案内' : 'Trip Planning Tip'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              {language === 'ko'
                ? `생성 후 사이드바 상단의 [Day 1] ~ [Day ${durationDays}] 탭과 [+ 일차 추가]로 일정을 자유롭게 늘리고, 원하는 명소를 지도에 등록하여 여행을 완성하세요.`
                : language === 'ja'
                ? `作成後、サイドバー上部の [Day 1] 〜 [Day ${durationDays}] 탭や [+ 日程追加] で日程を自由に拡張し、地図にスポットを登録できます。`
                : `After creating, switch between days or add more days in the sidebar tab bar, and start pinning your favorite stops on the map.`}
            </p>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              id="submit-create-new-trip-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('createTripBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
