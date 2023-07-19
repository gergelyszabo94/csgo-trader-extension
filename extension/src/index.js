import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  // for some reason routing with navigate
  // based on query params in App.js only works
  // when the whole app is wrapped in a router
  <Router>
    <App />
  </Router>,
);
