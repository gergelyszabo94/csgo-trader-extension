import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactGA from 'react-ga';

import Navigation from './components/Navigation/Navigation';
import Home from './containers/Home/Home';
import Changelog from './containers/Changelog/Changelog';
import ReleaseNotes from './containers/ReleaseNotes/ReleaseNotes';
import SteamGroup from './containers/SteamGroup/SteamGroup';
import Prices from './containers/Prices/Prices';
import Privacy from './containers/Privacy/Privacy';

ReactGA.initialize('UA-48407333-4');

const App = () => {
    return (
        <Router>
            <div>
                <Navigation/>
                <Switch>
                    <Route exact path="/">
                        <Home
                            gAnalytic={ReactGA}
                        />
                    </Route>
                    <Route path="/changelog">
                        <Changelog
                            gAnalytic={ReactGA}
                        />
                    </Route>
                    <Route path="/release-notes">
                        <ReleaseNotes
                            gAnalytic={ReactGA}
                        />
                    </Route>
                    <Route path="/group">
                        <SteamGroup
                            gAnalytic={ReactGA}
                        />
                    </Route>
                    <Route path="/prices">
                        <Prices
                            gAnalytic={ReactGA}
                        />
                    </Route>
                    <Route path="/privacy">
                        <Privacy
                            gAnalytic={ReactGA}
                        />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

export default App;
