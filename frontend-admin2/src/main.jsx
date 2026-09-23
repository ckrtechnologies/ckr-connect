import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './core/store/index.js';
import App from './App.jsx';
import './core/theme/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter basename="/admin">
      <App />
    </BrowserRouter>
  </Provider>
);
