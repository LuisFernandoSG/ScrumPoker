import React from 'react';
import { Lock, Settings2 } from 'lucide-react';
import { playCardSelectSound } from '../utils/audio';

const DEFAULT_SERIES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '?'];

export default function VotingDeck({
  selectedVote,
  onVote,
  isRevealed,
  deck = DEFAULT_SERIES,
  deckTemplate,
  isHost,
  onOpenDeckConfig,
}) {
  const cardsToRender = Array.isArray(deck) && deck.length > 0 ? deck : DEFAULT_SERIES;

  const handleSelectCard = (val) => {
    if (isRevealed) return;
    playCardSelectSound();
    onVote(val);
  };

  return (
    <div className="w-full bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 p-3 sm:p-4 fixed bottom-0 left-0 right-0 z-30 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Cabecera del deck / aviso si está bloqueado */}
        <div className="flex items-center justify-between w-full mb-2 px-1 text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">
              Elige tu estimación:
            </span>
            {deckTemplate && (
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-[11px] text-cyan-400/90 font-mono">
                {deckTemplate}
              </span>
            )}
            {isHost && (
              <button
                onClick={onOpenDeckConfig}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 transition-colors"
                title="Cambiar baraja o cantidad de cartas"
              >
                <Settings2 className="w-3 h-3" />
                <span>Cambiar cartas</span>
              </button>
            )}
          </div>

          {isRevealed && (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-800/50 text-[11px]">
              <Lock className="w-3 h-3" />
              <span>Votación cerrada por revelación</span>
            </span>
          )}

          {selectedVote && !isRevealed && (
            <span className="text-cyan-400 font-medium">
              Has votado: <strong className="text-white text-sm bg-blue-600/60 px-2 py-0.5 rounded border border-blue-500/50">{selectedVote}</strong>
            </span>
          )}
        </div>

        {/* Fila de cartas con scroll horizontal fluido */}
        <div className="w-full flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-2 px-2 custom-scrollbar">
          {cardsToRender.map((val, idx) => {
            const isSelected = selectedVote === val;
            
            return (
              <button
                key={`${val}-${idx}`}
                onClick={() => handleSelectCard(val)}
                disabled={isRevealed}
                id={`card-btn-${val}`}
                className={`
                  shrink-0 min-w-[46px] px-2 h-16 sm:min-w-[52px] sm:h-20 rounded-xl font-bold flex flex-col items-center justify-between p-1.5 transition-all duration-200 select-none
                  ${isRevealed 
                    ? 'opacity-40 cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-500' 
                    : isSelected
                      ? 'bg-blue-600 text-white border-2 border-cyan-300 shadow-xl shadow-blue-500/50 -translate-y-2 scale-105'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-blue-500/60 hover:-translate-y-1.5 hover:shadow-md hover:shadow-blue-500/20'
                  }
                `}
                title={isRevealed ? 'Votación bloqueada' : `Votar ${val}`}
              >
                {/* Esquina superior */}
                <span className={`text-[10px] sm:text-xs font-mono font-bold self-start leading-none ${isSelected ? 'text-cyan-200' : 'text-slate-400'}`}>
                  {val}
                </span>

                {/* Número / texto central */}
                <span className={`text-sm sm:text-lg font-black tracking-tight px-1 truncate max-w-[60px] ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                  {val}
                </span>

                {/* Esquina inferior invertida */}
                <span className={`text-[10px] sm:text-xs font-mono font-bold self-end leading-none rotate-180 ${isSelected ? 'text-cyan-200' : 'text-slate-400'}`}>
                  {val}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
