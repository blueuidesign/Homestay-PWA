// Điểm vào của app (EN1).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { dangKyServiceWorker } from './pwa/dangKySw';
import './styles.css';

const goc = document.getElementById('root');
if (!goc) throw new Error('Thiếu thẻ #root trong index.html');
createRoot(goc).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD) dangKyServiceWorker();
