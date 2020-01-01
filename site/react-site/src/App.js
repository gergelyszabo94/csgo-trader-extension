import React, {useState} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Navigation from './components/Navigation/Navigation';
import Home from './containers/Home/Home';
import Changelog from './containers/Changelog/Changelog';
import ReleaseNotes from './containers/ReleaseNotes/ReleaseNotes';
import SteamGroup from './containers/SteamGroup/SteamGroup';
import Prices from './containers/Prices/Prices';

import './App.css';

const App = () => {
    const [activeNav, setActiveNav] = useState('');

    return (
        <Router>
            <div>
                <Navigation
                    activeNav={activeNav}
                />
                <Switch>
                    <Route path="/changelog">
                        <Changelog
                            setActiveNav={setActiveNav}
                        />
                    </Route>
                    <Route path="/release-notes">
                        <ReleaseNotes
                            setActiveNav={setActiveNav}
                        />
                    </Route>
                    <Route path="/group">
                        <SteamGroup
                            setActiveNav={setActiveNav}
                        />
                    </Route>
                    <Route path="/prices">
                        <Prices
                            setActiveNav={setActiveNav}
                        />
                    </Route>
                    <Route path="/">
                        <Home
                            setActiveNav={setActiveNav}
                        />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

export default App;
