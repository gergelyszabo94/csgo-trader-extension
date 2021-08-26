import 'bootstrap/dist/css/bootstrap.min.css';

import React, { Suspense, lazy } from 'react';
import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import './App.scss';
import Navigation from './components/Navigation';

const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Popup = lazy(() => import('./pages/Popup'));
const Options = lazy(() => import('./pages/Options'));
const TradeHistory = lazy(() => import('./pages/TradeHistory'));

function App() {
    if (window.location.search === '?page=popup') {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <Popup />
            </Suspense>
        );
    }
    return (
        <Router>
            <Navigation />
            <div className='content'>
                <Suspense fallback={<div>Loading...</div>}>
                    <Switch>
                        <Route path='/options/' component={Options} />
                        <Route path='/bookmarks/' component={Bookmarks} />
                        <Route path='/trade-history/' component={TradeHistory} />
                        <Route>
                            <Redirect to='/options/general/' />
                        </Route>
                    </Switch>
                </Suspense>
            </div>
            {window.location.search === '?page=bookmarks' ? (
                <Route>
                    <Redirect to='/bookmarks/' />
                </Route>
            ) : null}
            {window.location.search === '?page=trade-history' ? (
                <Route>
                    <Redirect to='/trade-history/history' />
                </Route>
            ) : null}
        </Router>
    );
}

export default App;
