import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initAuthListener } from './store/authStore';
import './index.css';

// Inicializa sesión persistente + listener onAuthStateChange antes del render
initAuthListener();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
