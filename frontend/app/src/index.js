import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Metamask from './Metamask';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Metamask />
  </React.StrictMode>,
);

reportWebVitals();
