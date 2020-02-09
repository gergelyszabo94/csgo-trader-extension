import React from "react";
import "./App.scss";
import Home from "./pages/Home/Home";
import Popup from "./pages/Popup/Popup";
import Options from "./pages/Options/Options";
import Navigation from "./components/Navigation/Navigation";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useHistory
} from "react-router-dom";

function App(props) {
  if (window.location.search === "?popup") {
    return (
      <Popup/>
    );
  } else {
    return (
      <Router>
        <Navigation />
        <div className="content">
          <Switch>
            <Route exact path="/">
              <Options />
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
