import React, { Fragment } from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import router from "./router.js";
import logo from "../../assets/images/cstlogo48.png";
import "./Navigation.css";

const navigation = props => {
  let collapseShow = props.isPopup ? "show" : "";
  return (
    <Fragment>
      <Navbar expand="lg" bg="dark" variant="dark">
        <LinkContainer to="/" exact={true} activeClassName="active" key="/">
          <Navbar.Brand>
            <img
              src={logo}
              className="d-inline-block navlogo"
              alt="CSGO Trader Extension logo"
            />
            CSGO Trader Extension
          </Navbar.Brand>
        </LinkContainer>
        {props.isPopup ? null : (
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        )}
        <Navbar.Collapse id="responsive-navbar-nav" className={collapseShow}>
          <Nav className="mr-auto">
            {router.map(element => {
              return (
                <RouterNavLink
                  to={element.path}
                  exact={true}
                  activeClassName="active"
                  key={element.path}
                >
                  {element.title}
                </RouterNavLink>
              );
            })}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Fragment>
  );
};

// workaround from here: https://github.com/react-bootstrap/react-router-bootstrap/issues/242#issuecomment-480330910
const RouterNavLink = ({ children, ...props }) => (
  <LinkContainer {...props}>
    <Nav.Link active={false}>{children}</Nav.Link>
  </LinkContainer>
);

export default navigation;
