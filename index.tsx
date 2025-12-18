
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log('[TreadPro] Módulos cargados, iniciando montaje...');

const render = () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error('[TreadPro] No se encontró el elemento raíz.');
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('[TreadPro] App montada exitosamente.');
  } catch (err) {
    console.error('[TreadPro] Error al renderizar:', err);
    const text = document.getElementById('loading-text');
    if (text) text.innerText = 'Error fatal al iniciar.';
  }
};

// Asegurar que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', render);
} else {
  render();
}
