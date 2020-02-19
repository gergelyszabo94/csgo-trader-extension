/* globals trackEvent*/

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

import './Options.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Nav } from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";

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
  trackEvent({
    type: 'pageview',
    action: 'ExtensionOptionsView'
  });


  return (
    <div className="options">
      <h1>CSGO Trader Options</h1>
      <Router>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2  options__side-nav">
              <Nav defaultActiveKey="/options/general/" className="flex-column">
                {
                  routes.map(route => {
                    return (
                        <RouterNavLink to={match.path + route.to} exact={false} activeClassName='sideNavActive' key={route.to}>{route.name}</RouterNavLink>
                        // <Link to={match.path + route.to} key={route.to}>{route.name}</Link>
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

// workaround from here: https://github.com/react-bootstrap/react-linkr-bootstrap/issues/242#issuecomment-480330910
const RouterNavLink = ({ children, ...props }) => (
    <LinkContainer {...props}>
      <Nav.Link active={false}>{children}</Nav.Link>
    </LinkContainer>
);

export default options;
