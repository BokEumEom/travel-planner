import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Sparkles } from 'lucide-react';
import { Trip } from '../types';
import { useI18n } from '../lib/i18n';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, trip }) => {
  const { t, formatDayNumber } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    let md = `# ✈️ ${trip.title}\n\n`;
    md += `> ${t('crdtLiveActive')}\n\n`;

    trip.days.forEach((day) => {
      md += `## 📅 ${formatDayNumber(day.dayNumber)} - ${day.date}: ${day.title || t('dayPlan')}\n\n`;
      md += `- **${t('origin')}:** ${day.origin.name}\n`;
      md += `- **${t('tags')}:** ${day.tags.map((t) => `#${t}`).join(', ') || 'None'}\n\n`;
      if (day.notes) {
        md += `### ${t('dayPlan')}\n${day.notes}\n\n`;
      }
      md += `### ${t('waypoints')}\n`;
      day.waypoints.forEach((wp, idx) => {
        md += `${idx + 1}. **${wp.name}** [${wp.travelMode.toUpperCase()}]\n`;
        if (wp.notes) md += `   - *Note:* ${wp.notes}\n`;
        if (wp.estimatedDuration) md += `   - *Transit time:* ${wp.estimatedDuration}\n`;
      });
      md += `\n---\n\n`;
    });

    return md;
  };

  const markdownContent = generateMarkdown();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-itinerary.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4">
      <div 
        id="export-modal-container"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">{t('exportItinerary')}</h3>
              <p className="text-xs text-neutral-500">
                {t('exportDesc')}
              </p>
            </div>
          </div>
          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-neutral-800 bg-neutral-50 rounded-lg m-5 border border-neutral-200 whitespace-pre-wrap select-all leading-relaxed">
          {markdownContent}
        </div>

        <div className="px-5 py-3.5 bg-white border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Notion & Markdown compatible</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-markdown-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('copied') : t('copyMarkdown')}</span>
            </button>
            <button
              id="download-markdown-btn"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('downloadMd')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
