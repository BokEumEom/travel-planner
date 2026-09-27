import React from 'react';
import { 
  X, 
  HelpCircle, 
  Compass, 
  Calendar, 
  MapPin, 
  ArrowUpDown, 
  Users, 
  FileDown, 
  Check, 
  MousePointerClick,
  CloudSun,
  HardDrive
} from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  const steps = [
    {
      icon: Compass,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: t('guideStep1Title'),
      desc: t('guideStep1Desc'),
    },
    {
      icon: Calendar,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      title: t('guideStep2Title'),
      desc: t('guideStep2Desc'),
    },
    {
      icon: MapPin,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      title: t('guideStep3Title'),
      desc: t('guideStep3Desc'),
    },
    {
      icon: ArrowUpDown,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      title: t('guideStep4Title'),
      desc: t('guideStep4Desc'),
    },
    {
      icon: Users,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      title: t('guideStep5Title'),
      desc: t('guideStep5Desc'),
    },
    {
      icon: HardDrive,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      title: t('storageInfo'),
      desc: t('autoSaveNotice'),
    },
  ];

  return (
    <div 
      id="help-guide-modal-overlay" 
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="help-guide-modal-content"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-neutral-200/90 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 leading-tight">
                {t('helpGuideTitle')}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t('helpGuideSubtitle')}
              </p>
            </div>
          </div>
          <button
            id="help-guide-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-xl border border-neutral-200/70 bg-neutral-50/40 hover:bg-neutral-50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${step.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-neutral-900 leading-tight mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Quick Shortcuts / Tips Bar */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3 text-xs text-emerald-900">
            <MousePointerClick className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">Tip:</span> {t('autoSavedTooltip')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/80 flex items-center justify-end">
          <button
            id="help-guide-confirm-btn"
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t('gotIt')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
