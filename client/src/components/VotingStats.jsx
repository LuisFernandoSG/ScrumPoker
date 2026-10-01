import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, HelpCircle, ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import { playRevealSound } from '../utils/audio';

export default function VotingStats({
  stats,
  isRevealed
}) {
  useEffect(() => {
    if (isRevealed) {
      playRevealSound();
      if (stats?.agreement) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b']
        });
      }
    }
  }, [isRevealed, stats?.agreement]);

  if (!isRevealed || !stats) {
    return null;
  }

  const {
    hasValidVotes,
    hasNumericVotes,
    average,
    mode,
    min,
    max,
    totalVotes,
    questionMarkCount,
    agreement,
    voteDistribution = {}
  } = stats;

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 my-2 sm:my-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-900/95 border border-blue-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl shadow-blue-500/10 backdrop-blur-md">
        
        {/* Banner de Consenso si todos coincidieron */}
        {agreement && (
          <div className="mb-3 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-xl p-2 flex items-center justify-center gap-1.5 text-emerald-300 text-[11px] sm:text-sm font-bold shadow-sm text-center">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>¡Consenso unánime en el equipo!</span>
          </div>
        )}

        {/* Fila principal: PROMEDIO DESTACADO o MODA DESTACADA (para tallas) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 items-center">
          
          {/* 1. Tarjeta Destacada */}
          <div className="sm:col-span-1 bg-gradient-to-br from-blue-950/80 to-slate-950 border border-blue-500/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-300 font-semibold mb-0.5 sm:mb-1">
              {hasNumericVotes ? 'Promedio' : 'Moda'}
            </span>

            {hasNumericVotes ? (
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400">
                {average}
              </div>
            ) : hasValidVotes ? (
              <div className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-400">
                {mode || '—'}
              </div>
            ) : (
              <span className="text-xs font-semibold text-amber-400/90 py-1">
                Sin votos válidos
              </span>
            )}

            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1">
              {hasNumericVotes 
                ? '1 decimal' 
                : hasValidVotes 
                  ? 'Estimación cualitativa' 
                  : 'Solo dudas'
              }
            </span>
          </div>

          {/* 2. Métricas estadísticas secundarias */}
          <div className="sm:col-span-2 grid grid-cols-3 gap-1.5 sm:gap-2">
            
            {/* Moda (Voto más frecuente) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-medium flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" /> Moda
              </span>
              <span className="text-sm sm:text-xl font-bold text-cyan-300 mt-0.5 sm:mt-1 truncate max-w-full px-0.5">
                {mode || '—'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500">Más votado</span>
            </div>

            {/* Mínimo (o total válidos si es no numérico) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-medium flex items-center gap-0.5">
                {hasNumericVotes ? (
                  <><ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" /> Mínimo</>
                ) : (
                  <><CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" /> Válidos</>
                )}
              </span>
              <span className="text-sm sm:text-xl font-bold text-emerald-400 mt-0.5 sm:mt-1">
                {hasNumericVotes ? (min !== null ? min : '—') : totalVotes}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500">
                {hasNumericVotes ? 'Menor' : 'Total'}
              </span>
            </div>

            {/* Máximo (o dudas si es no numérico) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-medium flex items-center gap-0.5">
                {hasNumericVotes ? (
                  <><ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" /> Máximo</>
                ) : (
                  <><HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" /> Dudas</>
                )}
              </span>
              <span className={`text-sm sm:text-xl font-bold mt-0.5 sm:mt-1 ${hasNumericVotes ? 'text-rose-400' : 'text-amber-400'}`}>
                {hasNumericVotes ? (max !== null ? max : '—') : questionMarkCount}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500">
                {hasNumericVotes ? 'Mayor' : 'Con (?)'}
              </span>
            </div>

          </div>

        </div>

        {/* 3. Desglose y distribución de votos */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5 text-[11px] sm:text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Votos: <strong className="text-slate-200">{totalVotes}</strong></span>
            {questionMarkCount > 0 && hasNumericVotes && (
              <span className="bg-amber-950/40 text-amber-300 border border-amber-800/40 px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
                <HelpCircle className="w-2.5 h-2.5" /> {questionMarkCount} dudas (?)
              </span>
            )}
          </div>

          {/* Gráfico simple de frecuencias */}
          <div className="flex items-center gap-1 flex-wrap">
            {Object.entries(voteDistribution).map(([val, count]) => (
              <div 
                key={val}
                className="bg-slate-800/80 border border-slate-700 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono text-[10px]"
              >
                <span className="text-cyan-400 font-bold">{val}:</span>
                <span className="text-slate-200 font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
