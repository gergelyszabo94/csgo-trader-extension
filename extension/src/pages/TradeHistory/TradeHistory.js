import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Nav } from 'react-bootstrap';

import TradeHistoryContent from 'components/TradeHistory/TradeHistoryContent';
import CSVExport from 'components/TradeHistory/CSVExport';
import IncomingOfferHistory from 'components/TradeHistory/IncomingOfferHistory';
import SentOfferHistory from 'components/TradeHistory/SentOfferHistory';
import CustomNavLink from 'components/Navigation/CustomNavLink';

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

const TradeHistory = () => {
  return (
    <div className="options">
      <div className="container-fluid full-height">
        <div className="row">
          <div className="col-md-2 d-none d-md-block nav__sidebar">
            <div className="sidebar-sticky">
              <Nav
                defaultActiveKey="/trade-history/history/"
                className="flex-column"
              >
                {routes.map((route) => (
                  <CustomNavLink
                    to={route.to}
                    key={route.to}
                    title={route.name}
                    activeClassName="sideNavActive"
                    className="px-4 py-3"
                  />
                ))}
              </Nav>
            </div>
          </div>
          <div className="col-md-10 ml-sm-auto col-lg-10 pt-3 px-4 options__content">
            <Routes>
              {routes.map((route) => (
                <Route
                  path={route.to}
                  element={<route.component />}
                  key={route.to}
                />
              ))}
              <Route path="*" element={<Navigate to="history/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;
