import React, { useState } from 'react';
import { User, LogIn, ArrowRight } from 'lucide-react';

export default function JoinModal({
  roomId,
  initialName = '',
  onJoin,
  error
}) {
  const [name, setName] = useState(initialName);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setLocalError('Por favor ingresa tu nombre.');
      return;
    }
    if (cleanName.length > 30) {
      setLocalError('El nombre no puede superar los 30 caracteres.');
      return;
    }
    setLocalError('');
    onJoin(cleanName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-500/10 text-center relative overflow-hidden">
        
        {/* Adorno superior con brillo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-cyan-400" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          Unirse a la sala
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Has sido invitado a la sala <span className="font-mono font-bold text-cyan-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{roomId}</span>
        </p>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs text-left">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tu nombre o apodo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Carlos, Ana..."
                maxLength={30}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Entrar a la sala</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
