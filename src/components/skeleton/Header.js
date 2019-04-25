import React from 'react';
import {Nav, Navbar, NavItem} from 'react-bootstrap';
import {browserHistory} from 'react-router';
import {LinkContainer, IndexLinkContainer} from 'react-router-bootstrap';
import {t} from '../util.js';
import {AddIcon} from '../controls.js';
import { Button } from '../controls/Button.js';

function logout() {
  //setstate / fire logout action?
  sessionStorage.removeItem('jwt');
};

const Header = () => (
  <Navbar>
  <Navbar.Header>
      <Navbar.Brand>
        <a href="https://itenium.be" target="_blank" style={{marginTop: -4}}>
          <img src="/img/itenium.png" role="presentation" />
        </a>
      </Navbar.Brand>
    </Navbar.Header>
    <Nav>
    <IndexLinkContainer to="/quotations" data-tst="link-quotations">
      <NavItem eventKey={4}>{t('nav.quotations')}</NavItem>
    </IndexLinkContainer>
      <IndexLinkContainer to="/" data-tst="link-invoices">
        <NavItem eventKey={1}>{t('title')}</NavItem>
      </IndexLinkContainer>
      <LinkContainer to={{pathname: '/clients'}} data-tst="link-clients">
        <NavItem eventKey={3} href="#">{t('nav.clients')}</NavItem>
      </LinkContainer>
      <LinkContainer to={{pathname: '/config'}} data-tst="link-config">
        <NavItem eventKey={2} href="#">{t('nav.config')}</NavItem>
      </LinkContainer>
        {!!sessionStorage.jwt ? (
          <Button data-tst='logout' onClick={logout}>Logout</Button>
        ) : null}
    </Nav>
    <button
      className="btn btn-success"
      style={{top: 8, position: 'absolute', right: 35}}
      onClick={() => browserHistory.push('/invoice/create')}>
      <AddIcon size={1} style={{marginRight: 15}} data-tst="invoice-create" />
      {t('invoice.createNew')}
    </button>
  </Navbar>
);

export default Header;
