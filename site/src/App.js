import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import React, {Fragment}  from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import ReactGA from 'react-ga';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';

import Navigation from './components/Navigation/Navigation';
import Footer from './components/Footer/Footer';
import Home from './containers/Home/Home';
import Changelog from './containers/Changelog/Changelog';
import ReleaseNotes from './containers/ReleaseNotes/ReleaseNotes';
import SteamGroup from './containers/SteamGroup/SteamGroup';
import Privacy from './containers/Privacy/Privacy';
import Faq from './containers/Faq/Faq';

ReactGA.initialize('UA-48407333-4');

library.add(fab);

const App = () => {
    return (
        <Router>
            <Fragment>
                <Navigation/>
                <div className='content'>
                    <Switch>
                        <Route exact path='/'>
                            <Home
                                gAnalytic={ReactGA}
                            />
                        </Route>
                        <Route path='/changelog'>
                            <Changelog
                                gAnalytic={ReactGA}
                            />
                        </Route>
                        <Route path='/release-notes'>
                            <ReleaseNotes
                                gAnalytic={ReactGA}
                            />
                        </Route>
                        <Route path='/group'>
                            <SteamGroup
                                gAnalytic={ReactGA}
                            />
                        </Route>
                        <Route path='/privacy'>
                            <Privacy
                                gAnalytic={ReactGA}
                            />
                        </Route>
                        <Route path='/faq'>
                            <Faq
                                gAnalytic={ReactGA}
                            />
                        </Route>
                        <Route>
                            <Redirect to='/'/>
                        </Route>
                    </Switch>
                </div>
                <Footer/>
            </Fragment>
        </Router>
    );
};

export default App;
