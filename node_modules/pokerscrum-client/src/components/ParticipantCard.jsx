import React from 'react';
import { Crown, WifiOff, Check } from 'lucide-react';

export default function ParticipantCard({
  participant,
  isCurrentUser,
  isRevealed
}) {
  const { name, isHost, connected, hasVoted, vote } = participant;

  return (
    <div className="flex flex-col items-center gap-2 group transition-all duration-300">
      
      {/* Contenedor de la carta con perspectiva 3D */}
      <div className="card-perspective w-14 h-20 sm:w-16 sm:h-24 relative select-none">
        
        {/* Caso 1: Aún no ha votado */}
        {!hasVoted && (
          <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-700/80 bg-slate-900/40 flex flex-col items-center justify-center text-slate-500 shadow-inner transition-all duration-300">
            <div className="flex gap-1 items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse delay-300" />
            </div>
            <span className="text-[10px] mt-1 text-slate-500 font-medium">Pensando</span>
          </div>
        )}

        {/* Caso 2 y 3: Ya votó (Dorso azul antes de revelar, Revelado con animación de giro tras revelar) */}
        {hasVoted && (
          <div className={`card-inner ${isRevealed ? 'is-flipped' : ''}`}>
            
            {/* Dorso de la carta (Visible antes de revelar) */}
            <div className="card-front card-pattern border-2 border-blue-500/80 shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Resplandor y detalles sutiles */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent pointer-events-none" />
              <div className="w-7 h-10 rounded border border-blue-400/40 flex items-center justify-center bg-blue-950/40 backdrop-blur-sm shadow-sm">
                <span className="text-blue-300 text-xs font-black">♠</span>
              </div>
              <div className="absolute bottom-1 right-1">
                <Check className="w-3.5 h-3.5 text-cyan-300" />
              </div>
            </div>

            {/* Frente de la carta (Visible tras revelar) */}
            <div className="card-back bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900 border-2 border-white shadow-xl shadow-blue-500/30 flex flex-col items-center justify-center font-bold relative overflow-hidden">
              <div className="absolute top-1 left-1.5 text-[9px] text-blue-700 font-mono font-bold leading-none">
                {vote}
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {vote}
              </span>
              <div className="absolute bottom-1 right-1.5 text-[9px] text-blue-700 font-mono font-bold leading-none rotate-180">
                {vote}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Nombre y etiquetas debajo de la carta */}
      <div className="flex flex-col items-center max-w-[90px] sm:max-w-[110px]">
        <div className="flex items-center gap-1">
          {isHost && (
            <Crown className="w-3 h-3 text-amber-400 shrink-0" title="Anfitrión de la sala" />
          )}
          {!connected && (
            <WifiOff className="w-3 h-3 text-rose-400 shrink-0" title="Desconectado (esperando reconexión)" />
          )}
          <span 
            className={`text-xs font-medium truncate ${
              isCurrentUser 
                ? 'text-cyan-300 font-semibold drop-shadow-sm' 
                : 'text-slate-300'
            }`}
            title={name}
          >
            {name}
          </span>
        </div>

        {isCurrentUser && (
          <span className="text-[10px] text-cyan-400/80 font-normal">
            (Tú)
          </span>
        )}
      </div>

    </div>
  );
}
