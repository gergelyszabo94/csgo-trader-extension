import React, {useState} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactGA from 'react-ga';

import Navigation from './components/Navigation/Navigation';
import Home from './containers/Home/Home';
import Changelog from './containers/Changelog/Changelog';
import ReleaseNotes from './containers/ReleaseNotes/ReleaseNotes';
import SteamGroup from './containers/SteamGroup/SteamGroup';
import Prices from './containers/Prices/Prices';

import './App.css';

ReactGA.initialize('UA-48407333-4');

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
                            gAnalytic={ReactGA}
                        />
                    </Route>
                    <Route path="/release-notes">
                        <ReleaseNotes
                            setActiveNav={setActiveNav}
                            gAnalytic={ReactGA}
                        />
                    </Route>
                    <Route path="/group">
                        <SteamGroup
                            setActiveNav={setActiveNav}
                            gAnalytic={ReactGA}
                        />
                    </Route>
                    <Route path="/prices">
                        <Prices
                            setActiveNav={setActiveNav}
                            gAnalytic={ReactGA}
                        />
                    </Route>
                    <Route path="/">
                        <Home
                            setActiveNav={setActiveNav}
                            gAnalytic={ReactGA}
                        />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

export default App;
