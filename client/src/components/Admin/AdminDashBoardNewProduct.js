import React from "react";

import "./AdminDashBoardNewProduct.css";
import AdminDashBoardHeader from "./AdminDashBoardHeader";
import AdminDashboardSecondaryHeader from "./AdminDashboardSecondaryHeader";
import { Link } from "react-router-dom";

class AdminDashBoardNewProduct extends React.Component {
  render() {
    return (
      <div className="container-fluid p-0">
        <AdminDashBoardHeader />
        <AdminDashboardSecondaryHeader />
        <div className="container box-container mt-4">
          <h3 className="my-2" style={{ textAlign: "center" }}>
            New Products
          </h3>
          <div className="container my-1">
            <div className="row y">
              <div className="col-lg-3">
                <h6>Owner</h6>
              </div>
              <div className="col-lg-3">
                <h6>Name</h6>
              </div>
              <div className="col-lg-3">
                <h6>Date Added</h6>
              </div>
              <div className="col-lg-3">
                <h6>Review</h6>
              </div>
            </div>
          </div>

          <div className="container">
            {/* mapping here */}
            <div className="row admin-new-product box-container py-2">
              <div className="col-lg-3">
                <strong className="x mr-1">Owner:</strong>
                John Doe
              </div>
              <div className="col-lg-3">
                <strong className="x mr-1">Name:</strong>
                Great Beer
              </div>
              <div className="col-lg-3">
                <strong className="x mr-1">Date Added:</strong>
                1/1/1
              </div>
              <div className="col-lg-3">
                <Link to="/" className="review-new-product">
                  Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminDashBoardNewProduct;
