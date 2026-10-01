import React, { useState, useEffect } from 'react';
import { Tag, Edit3, Check, Sparkles } from 'lucide-react';

export default function TaskEditor({
  taskName = '',
  isHost = false,
  onUpdateTask,
}) {
  const [localTask, setLocalTask] = useState(taskName);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setLocalTask(taskName || '');
    }
  }, [taskName, isEditing]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isHost) {
      onUpdateTask(localTask);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (isHost) {
      onUpdateTask(localTask);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setLocalTask(taskName || '');
      setIsEditing(false);
    }
  };

  // return (
  //   <div className="w-full max-w-xl mx-auto px-4 mb-2">
  //     <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-md backdrop-blur-sm">

  //       {isHost ? (
  //         // Vista editable para el Anfitrión
  //         <form onSubmit={handleSubmit} className="flex items-center gap-2">
  //           <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
  //             <Tag className="w-4 h-4" />
  //           </div>

  //           <div className="flex-1 relative">
  //             <input
  //               type="text"
  //               value={localTask}
  //               onChange={(e) => {
  //                 setLocalTask(e.target.value);
  //                 setIsEditing(true);
  //                 // Sincronización en tiempo real conforme escribe
  //                 onUpdateTask(e.target.value);
  //               }}
  //               onBlur={handleBlur}
  //               onKeyDown={handleKeyDown}
  //               placeholder="Escribe el nombre de la tarea / historia (ej. PROJ-101)..."
  //               maxLength={120}
  //               className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all"
  //             />
  //           </div>

  //           <button
  //             type="submit"
  //             className="p-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition-colors"
  //             title="Guardar nombre de tarea"
  //           >
  //             <Check className="w-3.5 h-3.5" />
  //           </button>
  //         </form>
  //       ) : (
  //         // Vista de solo lectura para los demás participantes
  //         <div className="flex items-center gap-2.5 px-2">
  //           <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
  //             <Tag className="w-4 h-4" />
  //           </div>
  //           <div className="flex-1 truncate">
  //             {taskName && taskName.trim() ? (
  //               <span className="text-xs sm:text-sm font-semibold text-slate-200">
  //                 {taskName}
  //               </span>
  //             ) : (
  //               <span className="text-xs sm:text-sm text-slate-500 italic">
  //                 No issue selected (Esperando que el anfitrión elija tarea)
  //               </span>
  //             )}
  //           </div>
  //         </div>
  //       )}

  //     </div>
  //   </div>
  // );
}
