import React from "react";
import "./App.scss";
import Bookmarks from "./pages/Bookmarks/Bookmarks";
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
  if (window.location.search === "?page=popup") {
    return <Popup />;
  } else {
    return (
      <Router>
        {window.location.search === "?page=bookmarks" ? (
          <Route>
            <Redirect to="/bookmarks/" />
          </Route>
        ) : null}
        <Navigation />
        <div className="content">
          <Switch>
            <Route exact path="/">
              <Options />
            </Route>
            <Route path="/bookmarks">
              <Bookmarks />
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
