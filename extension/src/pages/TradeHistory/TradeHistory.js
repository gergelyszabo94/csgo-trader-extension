import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import TradeHistoryContent from 'components/TradeHistory/TradeHistoryContent';
import CSVExport from 'components/TradeHistory/CSVExport';
import IncomingOfferHistory from 'components/TradeHistory/IncomingOfferHistory';
import SentOfferHistory from 'components/TradeHistory/SentOfferHistory';

const routes = [
  {
    to: 'history/',
    name: 'Trade History',
    component: TradeHistoryContent,
  },
  {
    to: 'history-export/',
    name: 'Trade History Export',
    component: CSVExport,
  },
  {
    to: 'incoming-offer-history/',
    name: 'Incoming Offer History',
    component: IncomingOfferHistory,
  },
  {
    to: 'sent-offer-history/',
    name: 'Sent Offer History',
    component: SentOfferHistory,
  },
];

const TradeHistory = ({ match }) => {
  return (
    <div className="options">
      <Router>
        <div className="container-fluid full-height">
          <div className="row">
            <div className="col-md-2 d-none d-md-block nav__sidebar">
              <div className="sidebar-sticky">
                <Nav
                  defaultActiveKey="/trade-history/history/"
                  className="flex-column"
                >
                  {routes.map((route) => (
                    <RouterNavLink
                      to={match.path + route.to}
                      exact={false}
                      activeClassName="sideNavActive"
                      key={route.to}
                      className="px-4 py-3"
                    >
                      {route.name}
                    </RouterNavLink>
                  ))}
                </Nav>
              </div>
            </div>
            <div className="col-md-10 ml-sm-auto col-lg-10 pt-3 px-4 options__content">
              <Switch>
                {routes.map((route) => (
                  <Route
                    path={match.path + route.to}
                    component={route.component}
                    key={route.to}
                  />
                ))}
              </Switch>
            </div>
          </div>
        </div>
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

export default TradeHistory;
