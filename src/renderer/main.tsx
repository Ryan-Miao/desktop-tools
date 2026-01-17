import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StandaloneApp from './StandaloneApp';
import './styles/global.css';
import './styles/themes.css';

// 检测是否是独立窗口
const isStandalone = window.location.hash.startsWith('#plugin-standalone/');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isStandalone ? <StandaloneApp /> : <App />}
  </React.StrictMode>
);
