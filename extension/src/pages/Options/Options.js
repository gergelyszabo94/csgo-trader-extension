import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import CustomNavLink from 'components/Navigation/CustomNavLink';

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
import Friends from 'components/Options/Categories/Friends/Friends';
import WebChat from 'components/Options/Categories/WebChat';
import OfferAutomation from 'components/Options/Categories/OfferAutomation/OfferAutomation';
import Safety from 'components/Options/Categories/Safety';

const routes = [
  {
    to: 'general/',
    name: 'General',
    component: General,
  },
  {
    to: 'pricing/',
    name: 'Pricing',
    component: Pricing,
  },
  {
    to: 'trade-offer/',
    name: 'Trade Offer',
    component: TradeOffer,
  },
  {
    to: 'offer-automation/',
    name: 'Trade Offer Automation',
    component: OfferAutomation,
  },
  {
    to: 'inventory/',
    name: 'Inventory',
    component: Inventory,
  },
  {
    to: 'profile/',
    name: 'Profile',
    component: Profile,
  },
  {
    to: 'market/',
    name: 'Market',
    component: Market,
  },
  {
    to: 'friends-invites/',
    name: 'Friends, Groups and Invites',
    component: Friends,
  },
  {
    to: 'popup/',
    name: 'Popup',
    component: Popup,
  },
  {
    to: 'notifications/',
    name: 'Notifications',
    component: Notifications,
  },
  {
    to: 'safety/',
    name: 'Safety',
    component: Safety,
  },
  {
    to: 'webchat/',
    name: 'Web Chat',
    component: WebChat,
  },
  {
    to: 'other/',
    name: 'Other',
    component: Other,
  },
  {
    to: 'backup-restore/',
    name: 'Data backup and restore',
    component: BackupRestore,
  },
];

const Options = () => {
  return (
    <div className="options">
      <div className="container-fluid full-height">
        <div className="row">
          <div className="col-md-2 d-none d-md-block nav__sidebar">
            <div className="sidebar-sticky">
              <Nav
                defaultActiveKey="/options/general/"
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
              <Route path="*" element={<Navigate to="general/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;
