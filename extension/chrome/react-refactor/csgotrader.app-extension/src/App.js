import React from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.scss";

import Bookmarks from "./pages/Bookmarks/Bookmarks";
import Popup from "./pages/Popup/Popup";
import Options from "./pages/Options/Options";
import Navigation from "./components/Navigation/Navigation";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

function App(props) {
  if (window.location.search === "?page=popup") {
    return <Popup />;
  } else {
    return (
      <Router>
        <Navigation />
        <div className="content">
          <Switch>
            <Route exact path="/">
              <Options />
            </Route>
            <Route path="/bookmarks/">
              <Bookmarks />
            </Route>
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </div>
        {window.location.search === "?page=bookmarks" ? (
          <Route>
            {console.log(<Redirect to="/bookmarks/" />)}
            <Redirect to="/bookmarks/" />
          </Route>
        ) : null}
      </Router>
    );
  }
}

export default App;
