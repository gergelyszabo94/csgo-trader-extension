import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Home from './containers/Home/Home'
import Changelog from './containers/Changelog/Changelog'
import ReleaseNotes from './containers/ReleaseNotes/ReleaseNotes'
import SteamGroup from './containers/SteamGroup/SteamGroup'
import Prices from './containers/Prices/Prices'

import './App.css';

const App = () => {
  return (
    <Router>
        <div>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/changelog">Changelog</Link>
                    </li>
                    <li>
                        <Link to="/release-notes">Release-Notes</Link>
                    </li>
                    <li>
                        <Link to="/group">Steam Group</Link>
                    </li>
                    <li>
                        <Link to="/prices">Prices</Link>
                    </li>
                </ul>
            </nav>
            <Switch>
                <Route path="/changelog">
                    <Changelog />
                </Route>
                <Route path="/release-notes">
                    <ReleaseNotes />
                </Route>
                <Route path="/group">
                    <SteamGroup />
                </Route>
                <Route path="/prices">
                    <Prices />
                </Route>
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </div>
    </Router>
  );
};

export default App;
