import React from 'react';
import { createRoot } from 'react-dom/client';
import PilotApp from './PilotApp';
import './pilot.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><PilotApp /></React.StrictMode>);
