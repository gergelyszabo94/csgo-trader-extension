import React from "react";
import "./App.scss";
import Home from "./pages/Home/Home";
import Popup from "./pages/Popup/Popup";
import Navigation from "./components/Navigation/Navigation";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

function App() {
  if (window.location.search === "?popup") {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <Popup />
          </Route>
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>
    );
  } else {
    return (
      <Router>
        <Navigation />
        <div className="content">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/popup">
              <Popup />
            </Route>
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
