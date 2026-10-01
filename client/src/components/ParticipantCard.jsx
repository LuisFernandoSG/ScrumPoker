import React from 'react';
import { Crown, WifiOff, Check } from 'lucide-react';

export default function ParticipantCard({
  participant,
  isCurrentUser,
  isRevealed
}) {
  const { name, isHost, connected, hasVoted, vote } = participant;

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2 group transition-all duration-300">
      
      {/* Contenedor de la carta con perspectiva 3D (tamaño adaptable para móviles) */}
      <div className="card-perspective w-12 h-16 sm:w-16 sm:h-24 relative select-none">
        
        {/* Caso 1: Aún no ha votado */}
        {!hasVoted && (
          <div className="w-full h-full rounded-xl border border-dashed border-slate-700/80 bg-slate-900/40 flex flex-col items-center justify-center text-slate-500 shadow-inner transition-all duration-300">
            <div className="flex gap-0.5 sm:gap-1 items-center justify-center">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 animate-pulse" />
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 animate-pulse delay-150" />
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 animate-pulse delay-300" />
            </div>
            <span className="text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 text-slate-500 font-medium">Pensando</span>
          </div>
        )}

        {/* Caso 2 y 3: Ya votó (Dorso azul antes de revelar, Revelado con animación de giro tras revelar) */}
        {hasVoted && (
          <div className={`card-inner ${isRevealed ? 'is-flipped' : ''}`}>
            
            {/* Dorso de la carta (Visible antes de revelar) */}
            <div className="card-front card-pattern border-2 border-blue-500/80 shadow-md sm:shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent pointer-events-none" />
              <div className="w-5 h-7 sm:w-7 sm:h-10 rounded border border-blue-400/40 flex items-center justify-center bg-blue-950/40 backdrop-blur-sm shadow-sm">
                <span className="text-blue-300 text-[10px] sm:text-xs font-black">♠</span>
              </div>
              <div className="absolute bottom-1 right-1">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300" />
              </div>
            </div>

            {/* Frente de la carta (Visible tras revelar) */}
            <div className="card-back bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900 border-2 border-white shadow-lg sm:shadow-xl shadow-blue-500/30 flex flex-col items-center justify-center font-bold relative overflow-hidden">
              <div className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] text-blue-700 font-mono font-bold leading-none">
                {vote}
              </div>
              <span className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate max-w-full px-1">
                {vote}
              </span>
              <div className="absolute bottom-0.5 right-1 text-[8px] sm:text-[9px] text-blue-700 font-mono font-bold leading-none rotate-180">
                {vote}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Nombre y etiquetas debajo de la carta */}
      <div className="flex flex-col items-center max-w-[65px] sm:max-w-[100px]">
        <div className="flex items-center gap-0.5 sm:gap-1 max-w-full">
          {isHost && (
            <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" title="Anfitrión" />
          )}
          {!connected && (
            <WifiOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400 shrink-0" title="Desconectado" />
          )}
          <span 
            className={`text-[11px] sm:text-xs truncate ${
              isCurrentUser 
                ? 'text-cyan-300 font-semibold drop-shadow-sm' 
                : 'text-slate-300 font-medium'
            }`}
            title={name}
          >
            {name}
          </span>
        </div>

        {isCurrentUser && (
          <span className="text-[9px] sm:text-[10px] text-cyan-400/80 font-normal leading-none">
            (Tú)
          </span>
        )}
      </div>

    </div>
  );
}
