import React, { Fragment } from "react";
import Category from "./Category/Category";
import GeneralSchema from "./optionsSchemas/general";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";

const options = props => {
  return (
    <div className="options">
      <h1>CSGO Trader Options</h1>
      <Router>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2  options__side-nav">
              <Nav defaultActiveKey="/home" className="flex-column">
                <Link to="/">Genereal</Link>
                <Link to="/pricing">Pricing</Link>
                <Link to="/popup/">Popup</Link>
                <Link to="/trade-offer/">Trade Offer</Link>
                <Link to="/inventory/">Inventory</Link>
                <Link to="/profile/">Profile</Link>
                <Link to="/market/">Market</Link>
                <Link to="/notifications/">Notifications</Link>
                <Link to="/other/">Other</Link>
                <Link to="/backup/">Extension data backup and restore</Link>
              </Nav>
            </div>

            <div className="col-md-10">
              <Switch>
                <Route exact path="/">
                  <Category schema={GeneralSchema} />
                </Route>
                <Route path="/pricing/">
                  <div>Pricing</div>
                </Route>
                <Route path="/popup/">
                  <div>Popup</div>
                </Route>
                <Route path="/trade-offer/">
                  <div>trade-offer</div>
                </Route>
                <Route path="/inventory/">
                  <div>inventory</div>
                </Route>
                <Route path="/profile/">
                  <div>profile</div>
                </Route>
                <Route path="/market/">
                  <div>market</div>
                </Route>
                <Route path="/notifications/">
                  <div>notifications</div>
                </Route>
                <Route path="/other/">
                  <div>other</div>
                </Route>
                <Route path="/backup/">
                  <div>backup</div>
                </Route>
                <Route>
                  <Redirect to="/" />
                </Route>
              </Switch>
            </div>
          </div>
        </div>

        {window.location.search === "?page=bookmarks" ? (
          <Route>
            {console.log(<Redirect to="/bookmarks/" />)}
            <Redirect to="/bookmarks/" />
          </Route>
        ) : null}
      </Router>
    </div>
  );
};

export default options;
