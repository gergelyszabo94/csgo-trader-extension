import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import './App.css';

function App() {
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
}

function Home() {
    return <h2>Home</h2>;
}

function Changelog() {
    return <h2>Changelog</h2>;
}

function ReleaseNotes() {
    return <h2>Release-Notes</h2>;
}

function SteamGroup() {
    return <h2>Steam Group</h2>;
}

function Prices() {
    return <h2>Prices</h2>;
}

export default App;
