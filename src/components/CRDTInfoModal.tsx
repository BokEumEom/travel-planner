import React from 'react';
import { X, Wifi, ShieldCheck, Cpu, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import { Trip, Collaborator } from '../types';
import { useI18n } from '../lib/i18n';

interface CRDTInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  peerId: string;
  opCount: number;
  peers: Collaborator[];
  trip: Trip;
}

export const CRDTInfoModal: React.FC<CRDTInfoModalProps> = ({
  isOpen,
  onClose,
  peerId,
  opCount,
  peers,
  trip,
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4">
      <div 
        id="crdt-info-modal-container"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">{t('crdtModalTitle')}</h3>
              <p className="text-xs text-neutral-500">
                {t('crdtModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-medium">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('nodeClientId')}</span>
              </div>
              <div className="font-mono text-neutral-900 font-bold truncate">{peerId}</div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-medium">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Synchronized Ops</span>
              </div>
              <div className="font-mono text-emerald-600 font-bold">{opCount} operations</div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-medium">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('lwwResolutionTitle')}</span>
              </div>
              <div className="font-semibold text-neutral-900">LWW-CRDT + List</div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Network Protocol</span>
              </div>
              <div className="font-semibold text-emerald-700">BroadcastChannel P2P</div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs space-y-1.5 text-emerald-950">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('crdtEngineOverviewTitle')}</span>
            </div>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed">
              {t('crdtEngineOverviewDesc')}
            </p>
          </div>
        </div>

        <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
