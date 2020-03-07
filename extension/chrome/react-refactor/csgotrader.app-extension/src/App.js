import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Bookmarks from './pages/Bookmarks/Bookmarks';
import Popup from './pages/Popup/Popup';
import Options from './pages/Options/Options';
import Navigation from './components/Navigation/Navigation';

function App(props) {
  if (window.location.search === '?page=popup') {
    return <Popup />;
  }
  return (
    <Router>
      <Navigation />
      <div className="content">
        <Switch>
          <Route path="/options/" component={Options} />
          <Route path="/bookmarks/" component={Bookmarks} />
          <Route>
            <Redirect to="/options/general/" />
          </Route>
        </Switch>
      </div>
      {window.location.search === '?page=bookmarks' ? (
        <Route>
          <Redirect to="/bookmarks/" />
        </Route>
      ) : null}
    </Router>
  );
}

export default App;
