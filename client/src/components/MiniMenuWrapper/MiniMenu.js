import React from "react";
import { NavLink } from "react-router-dom";
import Tooltip from "react-png-tooltip";
import { IconContext } from "react-icons";
import {
  AiOutlineHome,
  AiOutlineBars,
  AiOutlineUser,
  AiOutlineHeart
} from "react-icons/ai";
import { FaOpencart, FaStore } from "react-icons/fa";

import { connect } from "react-redux";

import "./MiniMenu.css";
import { GoClippy } from "react-icons/go";

class MiniMenu extends React.Component {
  render() {
    return (
      <div id="mini-menu">
        <div className="container-fluid">
          <div className="row flex-wrap">
            <NavLink to="/" exact className="primary-link col-3">
              <div className="mini-menu-item">
                {/* <div className="flaticon-home mini-menu-icon"></div> */}
                <IconContext.Provider value={{ className: "mini-menu-icon" }}>
                  <div className="icon-container">
                    <AiOutlineHome />
                  </div>
                </IconContext.Provider>
                <p>Home</p>
              </div>
            </NavLink>

            <NavLink to="/categories" className="primary-link col-3">
              <div className="mini-menu-item">
                {/* <div className="flaticon-category mini-menu-icon"></div> */}
                <IconContext.Provider value={{ className: "mini-menu-icon" }}>
                  <div className="icon-container">
                    <AiOutlineBars />
                  </div>
                </IconContext.Provider>
                <p>Categories</p>
              </div>
            </NavLink>

            <NavLink to="/cart" className="primary-link col-3">
              <div className="mini-menu-item mini-cart">
                {/* <div className="flaticon-shopping-cart mini-menu-icon">
                  <span className="badge">0</span>
                </div> */}
                <IconContext.Provider value={{ className: "mini-menu-icon" }}>
                  <div className="icon-container">
                    <FaOpencart />
                    <span className="badge">
                      {this.props.cart
                        .map(item => item.quantity)
                        .reduce((cur, acc) => cur + acc, 0)}
                    </span>
                  </div>
                </IconContext.Provider>
                <p>Cart</p>
              </div>
            </NavLink>

            {this.props.user ? (
              <div className="col-3" id="account-mini-link-wrapper">
                <Tooltip
                  className="primary-link tool-tip"
                  tooltip={
                    <div className="mini-menu-item">
                      {/* <div className="flaticon-user mini-menu-icon"></div> */}
                      <IconContext.Provider
                        value={{ className: "mini-menu-icon" }}
                      >
                        <div className="icon-container">
                          <AiOutlineUser />
                        </div>
                      </IconContext.Provider>
                      <p>Account</p>
                    </div>
                  }
                >
                  <div className="account-mini-links">
                    <NavLink
                      className="primary-link"
                      to="/account"
                      activeClassName="active"
                      exact
                    >
                      <AiOutlineUser />
                      <span className="ml-2">My Account</span>
                    </NavLink>
                    <NavLink className="primary-link" to="/orders">
                      <GoClippy />
                      <span className="ml-2">Orders</span>
                    </NavLink>
                    <NavLink className="primary-link" to="/wishlist">
                      <AiOutlineHeart />
                      <span className="ml-2">Wishlist</span>
                    </NavLink>
                    {this.props.user.storeName && (
                      <NavLink className="primary-link" to="/seller-dashboard">
                        <FaStore />
                        <span className="ml-2">My Store</span>
                      </NavLink>
                    )}
                    <a className="mini-logout-link" href="/api/logout">
                      Logout
                    </a>
                  </div>
                </Tooltip>
              </div>
            ) : (
              <NavLink to="/sign-in" className="primary-link col-3">
                <div className="mini-menu-item">
                  {/* <div className="flaticon-user mini-menu-icon"></div> */}
                  <IconContext.Provider value={{ className: "mini-menu-icon" }}>
                    <div className="icon-container">
                      <AiOutlineUser />
                    </div>
                  </IconContext.Provider>
                  <p>Account</p>
                </div>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    cart: state.cartReducer.cart
  };
};

export default connect(mapStateToProps)(MiniMenu);
