import React, { useState } from 'react';
import { Settings2, Check, X, Sparkles, Layers, Sliders } from 'lucide-react';

export const PRESET_TEMPLATES = [
  {
    id: 'sequential',
    name: 'Secuencial (1 al 13)',
    description: 'Serie correlativa clásica del 1 al 13',
    cards: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '?']
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci Estándar',
    description: 'La serie ágil más popular (0, 1, 2, 3, 5, 8, 13, 21...)',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?']
  },
  {
    id: 'scrum',
    name: 'Scrum / Fibonacci Modificado',
    description: 'Con medios puntos y valores altos (0.5, 20, 40, 100)',
    cards: ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?']
  },
  {
    id: 'tshirt',
    name: 'Tallas de Camiseta (T-Shirt)',
    description: 'Estimación cualitativa: XS, S, M, L, XL, XXL',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?']
  },
  {
    id: 'powersOfTwo',
    name: 'Potencias de 2 (Binario)',
    description: 'Escala exponencial: 1, 2, 4, 8, 16, 32, 64',
    cards: ['1', '2', '4', '8', '16', '32', '64', '?']
  }
];

export default function DeckConfigModal({
  isOpen,
  onClose,
  currentDeck = [],
  currentTemplate = 'Secuencial (1 al 13)',
  onSaveDeck,
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    const found = PRESET_TEMPLATES.find(t => t.name === currentTemplate);
    return found ? found.id : 'custom';
  });

  const [cardsList, setCardsList] = useState(currentDeck);
  const [customInput, setCustomInput] = useState(() => currentDeck.join(', '));
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setCardsList([...template.cards]);
    setCustomInput(template.cards.join(', '));
    setError('');
  };

  const handleSelectCustom = () => {
    setSelectedTemplateId('custom');
    setError('');
  };

  const handleCustomInputChange = (e) => {
    const val = e.target.value;
    setCustomInput(val);
    setSelectedTemplateId('custom');

    const parsed = val
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    setCardsList(parsed);
  };

  const handleSave = () => {
    const finalCards = cardsList.filter(Boolean);
    if (finalCards.length < 2) {
      setError('Debes configurar al menos 2 cartas para poder votar.');
      return;
    }
    if (finalCards.length > 30) {
      setError('El límite máximo es de 30 cartas por baraja.');
      return;
    }

    let templateName = 'Personalizada';
    if (selectedTemplateId !== 'custom') {
      const found = PRESET_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (found) templateName = found.name;
    }

    onSaveDeck(finalCards, templateName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-500/10 text-left relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Configurar Baraja de Cartas
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona una plantilla estándar o personaliza los valores de voto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
          
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* 1. Selector de Plantillas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Plantillas por defecto
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-cyan-400 text-white shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-xs text-white">
                        {tmpl.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                      {tmpl.description}
                    </p>
                    <div className="flex items-center gap-1 overflow-x-hidden text-[10px] font-mono text-cyan-300/80">
                      {tmpl.cards.slice(0, 8).join(', ')}...
                    </div>
                  </button>
                );
              })}

              {/* Opción Personalizada */}
              <button
                type="button"
                onClick={handleSelectCustom}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedTemplateId === 'custom'
                    ? 'bg-blue-600/20 border-cyan-400 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-semibold text-xs text-white flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Personalizada
                  </span>
                  {selectedTemplateId === 'custom' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Escribe tus propios valores separados por comas
                </p>
              </button>
            </div>
          </div>

          {/* 2. Campo de edición personalizada */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Valores de las cartas (separados por comas)
            </label>
            <input
              type="text"
              value={customInput}
              onChange={handleCustomInputChange}
              placeholder="Ej: 1, 2, 3, 5, 8, 13, 21, ?, ☕"
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Puedes escribir números, texto corto (ej. XS, S, M) o emojis (ej. ☕).
            </span>
          </div>

          {/* 3. Vista previa interactiva de las cartas resultantes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Vista previa ({cardsList.length} cartas)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800 max-h-36 overflow-y-auto custom-scrollbar">
              {cardsList.map((card, idx) => (
                <div
                  key={`${card}-${idx}`}
                  className="w-9 h-13 rounded-lg bg-blue-600/30 border border-blue-400/50 text-cyan-200 font-bold text-xs flex flex-col items-center justify-center p-1 shadow-sm font-mono"
                >
                  <span>{card}</span>
                </div>
              ))}
              {cardsList.length === 0 && (
                <span className="text-xs text-slate-500 italic p-2">
                  No hay cartas configuradas.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Botones de acción */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            id="save-deck-btn"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar a la sala</span>
          </button>
        </div>

      </div>
    </div>
  );
}
