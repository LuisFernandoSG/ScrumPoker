import React, { useState, useEffect } from 'react';
import { Copy, Check, Volume2, VolumeX, LogOut, Crown, Wifi, Settings2, Share2, Link } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../utils/audio';

export default function Header({
  roomId,
  currentUser,
  isConnected,
  onLeaveRoom,
  deckTemplate,
  onOpenDeckConfig
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [lanInfo, setLanInfo] = useState(null);

  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.lanIp && data.lanIp !== 'localhost') {
          setLanInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleShare = async () => {
    // Si el usuario está en localhost pero hay una IP LAN disponible, preferir la URL accesible por otros
    const currentOrigin = window.location.origin;
    let shareUrl = `${currentOrigin}/sala/${roomId}`;
    
    if (window.location.hostname === 'localhost' && lanInfo?.lanIp) {
      shareUrl = `http://${lanInfo.lanIp}:${lanInfo.clientPort || 5173}/sala/${roomId}`;
    }

    // Intentar usar la API nativa de compartir de móviles (WhatsApp, Slack, Telegram, etc.)
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'Planning Poker | PokerScrum',
          text: `¡Únete a la estimación en la sala ${roomId}!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Si el usuario canceló el share nativo, ignorar
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback estándar al portapapeles
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  return (
    <header className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-2 sm:px-4 py-2 sm:py-2.5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Izquierda: Logo y Estado de Conexión */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="text-white text-base sm:text-lg font-black leading-none">♠</span>
          </div>
          <div className="hidden xs:block sm:block">
            <h1 className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent leading-none">
              PokerScrum
            </h1>
          </div>
          <span 
            className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} 
            title={isConnected ? 'Conectado' : 'Reconectando...'}
          />
        </div>

        {/* Centro: Código de Sala y Botón de Invitar */}
        {roomId && (
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1 shadow-inner">
            <button
              onClick={handleCopyCode}
              title="Toca para copiar código"
              className="font-mono font-bold text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 active:scale-95 transition-transform"
            >
              <span>{roomId}</span>
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>

            <button
              onClick={handleShare}
              id="mobile-share-btn"
              className="flex items-center gap-1 text-[11px] font-medium bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 px-2 py-0.5 rounded-lg active:scale-95 transition-all shadow-sm"
              title="Compartir enlace de invitación"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3 text-cyan-300" />
                  <span className="hidden sm:inline">Invitar</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Derecha: Configuración de Cartas, Sonido, Perfil y Salir */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Botón de configuración de cartas (solo anfitrión) */}
          {currentUser?.isHost && (
            <button
              onClick={onOpenDeckConfig}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-800/60 rounded-xl transition-all shadow-sm active:scale-95"
              title={`Cartas: ${deckTemplate || 'Personalizada'}`}
            >
              <Settings2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden md:inline truncate max-w-[100px]">{deckTemplate}</span>
            </button>
          )}

          {/* Toggle de sonido */}
          <button
            onClick={handleSoundToggle}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            title={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
            aria-label="Sonido"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Avatar del usuario actual */}
          {currentUser && (
            <div 
              className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl"
              title={`${currentUser.name} ${currentUser.isHost ? '(Anfitrión)' : ''}`}
            >
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-[10px] text-white shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[80px] truncate">
                {currentUser.name}
              </span>
              {currentUser.isHost && (
                <Crown className="w-3 h-3 text-amber-400 shrink-0" />
              )}
            </div>
          )}

          {/* Botón de salir */}
          {roomId && (
            <button
              onClick={onLeaveRoom}
              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/30"
              title="Salir de la sala"
              aria-label="Salir"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
