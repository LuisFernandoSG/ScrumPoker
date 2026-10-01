import React, { useState, useEffect } from 'react';
import { Copy, Check, Volume2, VolumeX, LogOut, Crown, Wifi, Settings2, Link, ChevronDown } from 'lucide-react';
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
  const [copiedLanLink, setCopiedLanLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [lanInfo, setLanInfo] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Obtener la IP LAN del backend para compartir en la misma red Wi-Fi
  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.lanIp && data.lanIp !== 'localhost') {
          setLanInfo(data);
        }
      })
      .catch(() => { });
  }, []);

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/sala/${roomId}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopiedLink(true);
      setShowShareMenu(false);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopyLanLink = () => {
    if (!lanInfo?.lanIp) return;
    const lanUrl = `http://${lanInfo.lanIp}:${lanInfo.clientPort || 5173}/sala/${roomId}`;
    navigator.clipboard.writeText(lanUrl).then(() => {
      setCopiedLanLink(true);
      setShowShareMenu(false);
      setTimeout(() => setCopiedLanLink(false), 2500);
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
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">

        {/* Logo y Nombre de App */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white text-xl font-black">♠</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              PokerScrum
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isConnected ? 'En línea' : 'Reconectando...'}</span>
            </div>
          </div>
        </div>

        {/* Información de la sala y botones para compartir */}
        {roomId && (
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner relative">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-slate-400">Sala:</span>
              <button
                onClick={handleCopyCode}
                title="Copiar código de sala"
                className="font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700 hover:border-cyan-500/50"
              >
                <span>{roomId}</span>
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>

            {/* <div className="h-4 w-px bg-slate-800" /> */}

            {/* Menú de Copiar Enlaces (Local y LAN / Wi-Fi)
            <div className="relative">
              <div className="flex items-center">
                <button
                  onClick={lanInfo?.lanIp ? handleCopyLanLink : handleCopyLink}
                  id="copy-invite-link-btn"
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-200 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 hover:border-blue-500 text-blue-200 px-2.5 py-1 rounded-l-lg transition-all shadow-sm"
                  title="Copiar link de invitación"
                >
                  {copiedLink || copiedLanLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">
                        {copiedLanLink ? '¡Link LAN copiado!' : '¡Link copiado!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Link className="w-3.5 h-3.5 text-blue-400" />
                      <span className="hidden sm:inline">
                        {lanInfo?.lanIp ? 'Invitar por LAN/Wi-Fi' : 'Copiar invitación'}
                      </span>
                      <span className="sm:hidden">Invitar</span>
                    </>
                  )}
                </button>

                {lanInfo?.lanIp && (
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="bg-blue-600/40 hover:bg-blue-600/60 border-y border-r border-blue-500/40 text-blue-200 px-1.5 py-1 rounded-r-lg transition-colors"
                    title="Opciones de invitación"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdown de opciones de enlace */}
            {/* {showShareMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in">
                <div className="text-[10px] text-slate-400 px-2 py-1 uppercase font-bold tracking-wider">
                  Compartir invitación
                </div>

                {lanInfo?.lanIp && (
                  <button
                    onClick={handleCopyLanLink}
                    className="w-full text-left p-2 rounded-xl hover:bg-blue-600/20 text-xs text-slate-200 flex items-start gap-2 transition-colors"
                  >
                    <Wifi className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-cyan-300">Enlace LAN (Misma Red / Wi-Fi)</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        http://{lanInfo.lanIp}:{lanInfo.clientPort || 5173}/sala/{roomId}
                      </div>
                    </div>
                  </button>
                )}

                <button
                  onClick={handleCopyLink}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-xs text-slate-300 flex items-start gap-2 transition-colors mt-1"
                >
                  <Link className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-200">Enlace Localhost</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {window.location.origin}/sala/{roomId}
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div> */}

            {/* Badge de LAN IP si está disponible */}
            {/* {lanInfo?.lanIp && (
              <span className="hidden md:flex items-center gap-1 text-[11px] text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-lg font-mono">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>LAN: {lanInfo.lanIp}</span>
              </span>
            )} */}
          </div>
        )}

        {/* Acciones de usuario y controles */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Botón de configuración de cartas (solo anfitrión) */}
          {currentUser?.isHost && (
            <button
              onClick={onOpenDeckConfig}
              id="deck-config-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-xl transition-all shadow-sm"
              title="Configurar baraja y valores de cartas"
            >
              <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Cartas: {deckTemplate || 'Personalizada'}</span>
              <span className="sm:hidden">Cartas</span>
            </button>
          )}

          {/* Toggle de sonido */}
          <button
            onClick={handleSoundToggle}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            title={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
            aria-label="Toggle sonido"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Perfil del usuario actual */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-xs text-white">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 max-w-[100px] sm:max-w-[130px] truncate leading-tight">
                  {currentUser.name}
                </span>
                {currentUser.isHost && (
                  <span className="text-[10px] text-amber-400 font-medium flex items-center gap-0.5 leading-none">
                    <Crown className="w-2.5 h-2.5 inline" /> Anfitrión
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Botón de salir si está en una sala */}
          {roomId && (
            <button
              onClick={onLeaveRoom}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/40 hover:border-rose-700/60"
              title="Salir de la sala"
              aria-label="Salir de la sala"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header >
  );
}
