import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import 'leaflet/dist/leaflet.css';
import Website from './Website';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Website />
    </BrowserRouter>
  </StrictMode>
);
