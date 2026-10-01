import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, BarChart2, CheckCircle2, HelpCircle, ArrowDown, ArrowUp, TrendingUp, Tag } from 'lucide-react';
import { playRevealSound } from '../utils/audio';

export default function VotingStats({
  stats,
  isRevealed
}) {
  useEffect(() => {
    if (isRevealed) {
      playRevealSound();
      if (stats?.agreement) {
        // Disparar confetti festivo si hubo acuerdo unánime
        confetti({
          particleCount: 80,
          spread: 70,
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
    <div className="w-full max-w-2xl mx-auto px-4 my-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-slate-900/90 border-2 border-blue-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-md">
        
        {/* Banner de Consenso si todos coincidieron */}
        {agreement && (
          <div className="mb-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-emerald-300 text-xs sm:text-sm font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>¡Consenso unánime en el equipo! Todos eligieron el mismo valor.</span>
          </div>
        )}

        {/* Fila principal: PROMEDIO DESTACADO o MODA DESTACADA (para tallas) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          
          {/* 1. Tarjeta Destacada */}
          <div className="sm:col-span-1 bg-gradient-to-br from-blue-950/80 to-slate-950 border border-blue-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            
            <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold mb-1">
              {hasNumericVotes ? 'Promedio' : 'Voto Frecuente (Moda)'}
            </span>

            {hasNumericVotes ? (
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400">
                {average}
              </div>
            ) : hasValidVotes ? (
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-400">
                {mode || '—'}
              </div>
            ) : (
              <span className="text-xs sm:text-sm font-semibold text-amber-400/90 py-2">
                Sin votos válidos
              </span>
            )}

            <span className="text-[11px] text-slate-400 mt-1">
              {hasNumericVotes 
                ? 'Redondeado a 1 decimal' 
                : hasValidVotes 
                  ? 'Estimación cualitativa' 
                  : 'Solo dudas o sin votos'
              }
            </span>
          </div>

          {/* 2. Métricas estadísticas secundarias */}
          <div className="sm:col-span-2 grid grid-cols-3 gap-2">
            
            {/* Moda (Voto más frecuente) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-cyan-400" /> Moda
              </span>
              <span className="text-lg sm:text-xl font-bold text-cyan-300 mt-1 truncate max-w-full px-1">
                {mode || '—'}
              </span>
              <span className="text-[10px] text-slate-500">Más votado</span>
            </div>

            {/* Mínimo (o total válidos si es no numérico) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center gap-1">
                {hasNumericVotes ? (
                  <><ArrowDown className="w-3 h-3 text-emerald-400" /> Mínimo</>
                ) : (
                  <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Válidos</>
                )}
              </span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">
                {hasNumericVotes ? (min !== null ? min : '—') : totalVotes}
              </span>
              <span className="text-[10px] text-slate-500">
                {hasNumericVotes ? 'Menor voto' : 'Participantes'}
              </span>
            </div>

            {/* Máximo (o dudas si es no numérico) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center gap-1">
                {hasNumericVotes ? (
                  <><ArrowUp className="w-3 h-3 text-rose-400" /> Máximo</>
                ) : (
                  <><HelpCircle className="w-3 h-3 text-amber-400" /> Dudas (?)</>
                )}
              </span>
              <span className={`text-lg sm:text-xl font-bold mt-1 ${hasNumericVotes ? 'text-rose-400' : 'text-amber-400'}`}>
                {hasNumericVotes ? (max !== null ? max : '—') : questionMarkCount}
              </span>
              <span className="text-[10px] text-slate-500">
                {hasNumericVotes ? 'Mayor voto' : 'Con interrogación'}
              </span>
            </div>

          </div>

        </div>

        {/* 3. Desglose y distribución de votos */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Total votos: <strong className="text-slate-200">{totalVotes}</strong></span>
            {questionMarkCount > 0 && hasNumericVotes && (
              <span className="bg-amber-950/40 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                <HelpCircle className="w-3 h-3" /> {questionMarkCount} con duda (?)
              </span>
            )}
          </div>

          {/* Gráfico simple de frecuencias */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(voteDistribution).map(([val, count]) => (
              <div 
                key={val}
                className="bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono text-[11px]"
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
