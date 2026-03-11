import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Assuming Tailwind is set up here
import { AppProvider } from './context/AppContext.jsx'; // 1. Import the Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap the App component with the Provider */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);