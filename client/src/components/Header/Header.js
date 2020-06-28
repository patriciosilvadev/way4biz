import React from "react";
import "./Header.css";
import Logo from "./Logo";
import Search from "./Search";
import Icons from "./Icons";

class Header extends React.Component {
  render() {
    return (
      <div className="header d-flex primary-background">
        <Logo id="logo" />
        <Search id="header-search" />
        <Icons id="header-icons" />
      </div>
    );
  }
}

export default Header;