import React from "react";
import { IconContext } from "react-icons";
import { BsArrowLeft } from "react-icons/bs";
import { withRouter } from "react-router-dom";

import "./ProductReviewsWrapper.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
// import ProductReviews from "./ProductReviews";
import MiniMenuWrapper from "../MiniMenuWrapper/MiniMenuWrapper";
import Rating from "./Rating";
import { connect } from "react-redux";
import { fetchProductReviews } from "../../redux/actions";
import ScreenLoader from "../Pages/ScreenLoader";
import NoReviews from "./NoReviews";

class ProductReviewsWrapper extends React.Component {
  componentDidMount() {
    this.props.fetchProductReviews(this.props.match.params.productId);
  }
  render() {
    if (this.props.fetchOrdersLoading) return <ScreenLoader />;
    return (
      <div className="main">
        <div className="content">
          <Header />
          <div id="product-reviews-wrapper" className="box-container">
            <IconContext.Provider value={{ className: "arrow-icon ml-3 my-2" }}>
              <div className="d-flex align-items-center review-wrapper">
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => this.props.history.goBack()}
                  className="reviews-link"
                >
                  <BsArrowLeft />
                  <span
                    style={{
                      //   fontWeight: "bold",
                      fontSize: "25px",
                      textDecoration: "none",
                      color: "#000"
                    }}
                    className="ml-2 "
                  >
                    Customer Reviews
                  </span>
                </div>
              </div>
            </IconContext.Provider>
            {/* <ProductReviews /> */}
            <div style={{ borderTop: "1px solid #d4d4d4" }}>
              {/* mapping here */}
              {this.props.productReviews.length !== 0 &&
                this.props.productReviews.map(prod => (
                  <div className="buyer-review-wrapper" key={prod._id}>
                    <Rating size={15} clickable={false} value={prod.rating} />

                    <h5>
                      <strong>{prod.title}</strong>
                    </h5>
                    <p>{prod.body}</p>
                    <p className="my-2 lead" style={{ fontSize: "15px" }}>
                      By{" "}
                      {prod.userSeller
                        ? prod.userSeller.firstName
                        : prod.user.firstName}
                      <span className="ml-2">
                        on {new Date(prod.createdAt).toLocaleString()}{" "}
                      </span>
                    </p>
                  </div>
                ))}
              {this.props.productReviews.length === 0 && <NoReviews />}
            </div>
          </div>
        </div>
        <Footer />
        <MiniMenuWrapper />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    productReviews: state.product.productReviews,
    fetchOrdersLoading: state.auth.fetchOrdersLoading
  };
};
export default withRouter(
  connect(mapStateToProps, { fetchProductReviews })(ProductReviewsWrapper)
);
