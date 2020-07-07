import React from "react";

import "./SellerOrderDetails.css";
import SellerDashBoardHeader from "./SellerDashBoardHeader";
import SellerDashBoardMenu from "./SellerDashBoardMenu";
import { IconContext } from "react-icons";
import { BsArrowLeft } from "react-icons/bs";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

class SellerOrderDetails extends React.Component {
  render() {
    return (
      <div className="container-fluid dashboard-wrapper">
        <SellerDashBoardHeader />
        <div className="row no-gutters">
          <div className="col-md-3">
            <SellerDashBoardMenu />
          </div>
          <div className="col-lg-9 mt-3">
            <div className="container-fluid">
              <div className="row">
                <div>
                  <IconContext.Provider
                    value={{ className: "arrow-icon ml-3 my-2" }}
                  >
                    <div>
                      <Link to="/seller-orders">
                        <BsArrowLeft />
                      </Link>
                    </div>
                  </IconContext.Provider>
                </div>
              </div>
            </div>

            <div className="container-fluid seller-db-order-details-wrapper">
              <div className="row">
                <div className="col">
                  <h3>Ordered Items</h3>
                </div>
              </div>
              <div className="row y my-2">
                <h6 className="col-lg-5">Item</h6>
                <h6 className="col-lg-2">Quantity</h6>
                <h6 className="col-lg-2">Amount</h6>
                <h6 className="col-lg-3">Buyer Destination</h6>
              </div>
              <div className="container-fluid seller-orders-wrapper">
                {/* mapping here */}
                {this.props.sellerOrderDetails &&
                  this.props.sellerOrderDetails.productSellerData &&
                  this.props.sellerOrderDetails.productSellerData.length !==
                    0 &&
                  this.props.sellerOrderDetails.productSellerData.map(data => (
                    <div
                      className="row box-container seller-order-wrapper"
                      key={data._id}
                    >
                      <div className="col-md-6 col-lg-5 d-flex align-items-center">
                        <img
                          height="100px"
                          src={data.imageUrl}
                          alt={data.name}
                        />
                        <p>
                          <strong>{data.name}</strong>
                        </p>
                      </div>
                      <div className="col-md-6 col-lg-2">
                        <p>
                          <strong className="x mr-2">Qty:</strong>
                          {this.props.sellerOrderDetails.items.map(item => {
                            const prodExist = data._id === item.product;
                            if (prodExist) {
                              return item.quantity;
                            }
                          })}
                        </p>
                      </div>
                      <div className="col-md-6 col-lg-2">
                        <p>
                          <strong className="mr-2 x">Amount:</strong>ksh.
                          {data.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <p id="buyer-destination">
                          <strong className="mr-2 x">Destination:</strong>
                          {`${this.props.sellerOrderDetails.buyer[0].address}/${this.props.sellerOrderDetails.buyer[0].town}/${this.props.sellerOrderDetails.buyer[0].city}`}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    sellerOrderDetails: state.detailsPersist.sellerOrderDetails
  };
};
export default connect(mapStateToProps)(SellerOrderDetails);
