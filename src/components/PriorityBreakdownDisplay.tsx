import React, { useState } from 'react';
import { PriorityBreakdown } from '../types';
import {
  AlertTriangle,
  Users,
  Clock,
  MapPin,
  FileText,
  Calculator,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PriorityBreakdownDisplayProps {
  priority?: PriorityBreakdown;
  variant?: 'full' | 'card' | 'compact';
  showReasons?: boolean;
  className?: string;
}

export const PriorityBreakdownDisplay: React.FC<PriorityBreakdownDisplayProps> = ({
  priority,
  variant = 'full',
  showReasons = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(variant === 'full');

  if (!priority) {
    return (
      <div className={`p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 ${className}`}>
        Priority assessment pending.
      </div>
    );
  }

  const {
    severityComponent = 0,
    populationComponent = 0,
    urgencyComponent = 0,
    geographicComponent = 0,
    evidenceComponent = 0,
    totalScore = 0,
    level = 'MEDIUM',
    reasons = [],
  } = priority;

  const components = [
    {
      id: 'severity',
      name: 'Severity',
      score: severityComponent,
      max: 30,
      weight: '30%',
      icon: AlertTriangle,
      color: 'text-rose-600',
      barColor: 'bg-rose-500',
      bgLight: 'bg-rose-50',
    },
    {
      id: 'population',
      name: 'Population',
      score: populationComponent,
      max: 25,
      weight: '25%',
      icon: Users,
      color: 'text-blue-600',
      barColor: 'bg-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      id: 'urgency',
      name: 'Urgency',
      score: urgencyComponent,
      max: 20,
      weight: '20%',
      icon: Clock,
      color: 'text-amber-600',
      barColor: 'bg-amber-500',
      bgLight: 'bg-amber-50',
    },
    {
      id: 'geographic',
      name: 'Geographic',
      score: geographicComponent,
      max: 15,
      weight: '15%',
      icon: MapPin,
      color: 'text-emerald-600',
      barColor: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
    },
    {
      id: 'evidence',
      name: 'Evidence',
      score: evidenceComponent,
      max: 10,
      weight: '10%',
      icon: FileText,
      color: 'text-purple-600',
      barColor: 'bg-purple-500',
      bgLight: 'bg-purple-50',
    },
  ];

  const getBadgeStyle = () => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <div className="flex items-center gap-2">
          <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
            {totalScore}/100
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
            {level}
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-600 flex items-center gap-1.5 flex-wrap">
          <span>Sev {severityComponent}/30</span>
          <span>•</span>
          <span>Pop {populationComponent}/25</span>
          <span>•</span>
          <span>Urg {urgencyComponent}/20</span>
          <span>•</span>
          <span>Geo {geographicComponent}/15</span>
          <span>•</span>
          <span>Evi {evidenceComponent}/10</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="priority-engine-display"
      className={`bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3.5 transition-all ${className}`}
    >
      {/* Header: Title, Final Score & Level Badge */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Explainable Priority Score
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Deterministic rule engine • Never arbitrary LLM score
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            id="priority-final-score"
            className="font-mono font-extrabold text-lg sm:text-xl text-rose-600 bg-rose-50/80 px-3 py-1 rounded-xl border border-rose-200/80 shadow-xs"
          >
            {totalScore}/100
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getBadgeStyle()}`}>
            {level}
          </span>
        </div>
      </div>

      {/* Breakdown Grid: Severity 30/30, Population 22/25, Urgency 18/20, Geographic 12/15, Evidence 5/10 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
          <span>Component Breakdown</span>
          <span>Weight & Contribution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {components.map((c) => {
            const Icon = c.icon;
            const percentFilled = Math.min(100, Math.round((c.score / c.max) * 100));
            return (
              <div
                key={c.id}
                className="bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 p-2.5 rounded-xl flex flex-col justify-between transition group"
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                    <span className="text-xs font-semibold text-slate-800">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">({c.weight})</span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-mono font-bold text-slate-900">
                    {c.score}/{c.max}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{percentFilled}%</span>
                </div>

                {/* Micro visual progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full ${c.barColor} transition-all duration-300`}
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plain Text Representation (Matches verbatim example requested) */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4 border border-slate-800">
        <div className="text-emerald-400 font-bold tracking-wide">
          FINAL SCORE: {totalScore}/100
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-300 flex-wrap">
          <span>Severity <strong className="text-white">{severityComponent}/30</strong></span>
          <span className="text-slate-600">|</span>
          <span>Population <strong className="text-white">{populationComponent}/25</strong></span>
          <span className="text-slate-600">|</span>
          <span>Urgency <strong className="text-white">{urgencyComponent}/20</strong></span>
          <span className="text-slate-600">|</span>
          <span>Geographic <strong className="text-white">{geographicComponent}/15</strong></span>
          <span className="text-slate-600">|</span>
          <span>Evidence <strong className="text-white">{evidenceComponent}/10</strong></span>
        </div>
      </div>

      {/* Expandable Explainable Reasons & Audit Log */}
      {showReasons && reasons && reasons.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition py-1"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Explainable Audit Factors ({reasons.length})</span>
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
              {reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
