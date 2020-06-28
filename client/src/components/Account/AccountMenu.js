import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import "./AccountMenu.css";

export class AccountMenu extends Component {
  render() {
    return (
      <div className="box-container account-menu-container">
        <div className="account-menu-wrapper">
          <NavLink activeClassName="active" to="/account" className="navlink">
            My Account
          </NavLink>
        </div>
        <br />
        <div className="account-menu-wrapper">
          <NavLink activeClassName="active" to="/orders" className="navlink">
            Orders
          </NavLink>
        </div>
        <br />
        <div className="account-menu-wrapper">
          <NavLink activeClassName="active" to="/wishlist" className="navlink">
            Wishlist
          </NavLink>
        </div>
      </div>
    );
  }
}

export default AccountMenu;