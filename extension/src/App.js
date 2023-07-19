import React, { Suspense, lazy } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

import {
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from 'react-router-dom';
import DebugRouter from './components/DebugRouter/DebugRouter';
import Navigation from './components/Navigation/Navigation';

const Bookmarks = lazy(() => import('./pages/Bookmarks/Bookmarks'));
const Popup = lazy(() => import('./pages/Popup/Popup'));
const Options = lazy(() => import('./pages/Options/Options'));
const TradeHistory = lazy(() => import('./pages/TradeHistory/TradeHistory'));

const App = () => {
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page');

  if (page === 'popup') {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Popup />
      </Suspense>
    );
  }

  return (
    <>
      <Navigation />
      <DebugRouter>
        <div className="content">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="options/*" element={<Options />} />
              <Route path="bookmarks/" element={<Bookmarks />} />
              <Route path="trade-history/*" element={<TradeHistory />} />
              <Route path="/index.html/" element={<Navigate to="options/general/" replace />} />
              <Route path="*" element={<Navigate to="options/general/" replace />} />
            </Routes>
          </Suspense>
        </div>
        {page === 'bookmarks' ? (
          <Navigate to="/bookmarks/" />
        ) : null}
        {page === 'trade-history' ? (
          <Navigate to="/trade-history/history/" />
        ) : null}
      </DebugRouter>
    </>
  );
};

export default App;
