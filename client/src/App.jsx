import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Room from './pages/Room';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Extraer el ID de la sala si la ruta es /sala/:roomId
  const roomMatch = currentPath.match(/^\/sala\/([A-Za-z0-9_-]+)/);
  const roomId = roomMatch ? roomMatch[1].toUpperCase() : null;

  if (roomId) {
    return (
      <Room
        roomId={roomId}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  return (
    <Home
      onNavigateToRoom={(code) => navigate(`/sala/${code}`)}
    />
  );
}
