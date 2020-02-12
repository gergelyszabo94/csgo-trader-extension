import React from "react";

import Notifications from 'components/Options/Categories/Notifications';
import General from 'components/Options/Categories/General';
import Pricing from 'components/Options/Categories/Pricing';
import Other from 'components/Options/Categories/Other';
import BackupRestore from 'components/Options/Categories/BackupRestore';
import Inventory from 'components/Options/Categories/Inventory';
import Market from 'components/Options/Categories/Market';
import Popup from 'components/Options/Categories/Popup';
import Profile from 'components/Options/Categories/Profile';
import TradeOffer from 'components/Options/Categories/TradeOffer';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";

const routes = [
  {
    to: 'general/',
    name: 'General',
    component: General
  },
  {
    to: 'pricing/',
    name: 'Pricing',
    component: Pricing
  },
  {
    to: 'popup/',
    name: 'Popup',
    component: Popup
  },
  {
    to: 'trade-offer/',
    name: 'Trade Offer',
    component: TradeOffer
  },
  {
    to: 'inventory/',
    name: 'Inventory',
    component: Inventory
  },
  {
    to: 'profile/',
    name: 'Profile',
    component: Profile
  },
  {
    to: 'market/',
    name: 'Market',
    component: Market
  },
  {
    to: 'notifications/',
    name: 'Notifications',
    component: Notifications
  },
  {
    to: 'other/',
    name: 'Other',
    component: Other
  },
  {
    to: 'backup-restore/',
    name: 'Data backup and restore',
    component: BackupRestore
  }
];

const options = ({match}) => {
  return (
    <div className="options">
      <h1>CSGO Trader Options</h1>
      <Router>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2  options__side-nav">
              <Nav defaultActiveKey="/home" className="flex-column">
                {
                  routes.map(route => {
                    return (
                        <Link to={match.path + route.to} key={route.to}>{route.name}</Link>
                    )
                  })
                }
              </Nav>
            </div>
            <div className="col-md-10">
              <Switch>
                {
                  routes.map(route => {
                    return (
                        <Route path={match.path + route.to} component={route.component} key={route.to}/>
                    )
                  })
                }
              </Switch>
            </div>
          </div>
        </div>

        {window.location.search === "?page=bookmarks" ? (
          <Route>
            <Redirect to="/bookmarks/" />
          </Route>
        ) : null}
      </Router>
    </div>
  );
};

export default options;
