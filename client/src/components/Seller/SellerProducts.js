import React from "react";

import "./SellerProducts.css";

import SellerDashBoardMenu from "./SellerDashBoardMenu";
import SellerDashBoardHeader from "./SellerDashBoardHeader";

class SellerProcucts extends React.Component {
  render() {
    return (
      <div className="container-fluid dashboard-wrapper">
        <SellerDashBoardHeader />
        <div className="row no-gutters">
          <div className="col-md-3">
            <SellerDashBoardMenu />
          </div>
          <div className="col-md-9">
            <div className="product-contentm">
              <h1>hey</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SellerProcucts;
