import React from "react";

import "./OrderPaymentSuccess.css";
import Header from "../Header/Header";
import { Link } from "react-router-dom";
import Footer from "../Footer/Footer";
import MiniMenuWrapper from "../MiniMenuWrapper/MiniMenuWrapper";
import { BsCheckCircle } from "react-icons/bs";

class OrderPaymentSuccess extends React.Component {
  render() {
    return (
      <div className="main">
        <div className="content">
          <Header />
          <div className="container">
            <div className="row">
              <div className="col-md-9 col-lg-8 mx-auto">
                <div className="box-container py-3 pl-2 pr-1 successful-order">
                  <div className="d-flex align-items-center justify-content-center">
                    <BsCheckCircle
                      style={{ fontSize: "100px", color: "#4BB543" }}
                    />
                  </div>
                  <h3 className="my-3" style={{ textAlign: "center" }}>
                    We've got it!
                  </h3>
                  <h6 className="order-placement-top">
                    Your order has been placed.We have also sent you an email
                    confirmation.You can check the status of{" "}
                    <Link to="/" className="mx-1" id="check-order-status">
                      Order 12345678
                    </Link>{" "}
                    at any time from your account.
                  </h6>
                  <h5 className="mt-4 mb-2">Order Summary</h5>
                  <div style={{ borderBottom: "1px solid #d4d4d4" }}></div>
                  {/* mapping here */}
                  <div className="row align-items-center">
                    <div className="col-3">
                      <img src="/1.jpg" width="100%" alt="1.jpg" />
                    </div>
                    <div className="col-9">
                      <h6 className="order-item-name mb-2">
                        Great Beer Of Congo
                      </h6>
                      <p>Qty:1 @ ksh.1,000 each</p>
                    </div>
                  </div>
                  {/* mapping ends here */}
                  <div style={{ borderBottom: "1px solid #d4d4d4" }}></div>
                  <div className="order-amounts mt-3">
                    <div>
                      <h5>Order Subtotal</h5>
                      <p>Ksh.1,500</p>
                    </div>
                    <div>
                      <h5>Shipping Cost</h5>
                      <p>Ksh.100</p>
                    </div>
                    <div className="mt-3" style={{ color: "#f76b1a" }}>
                      <h5>
                        <strong>Order Total</strong>
                      </h5>
                      <p>
                        <strong>Ksh.1,600</strong>
                      </p>
                    </div>
                  </div>
                  <div
                    style={{ borderBottom: "3px solid #000" }}
                    className="my-3"
                  ></div>
                  <h5 className="mb-2">Payment Information</h5>
                  <div className="order-payment-info">
                    <div>
                      <h5>Visa</h5>
                      <p>***********5678</p>
                    </div>
                    <div>
                      <h5>Amount</h5>
                      <p>Ksh.1,600</p>
                    </div>
                  </div>
                  <div
                    style={{ borderBottom: "1px solid #d4d4d4" }}
                    className="my-3"
                  ></div>
                  <h5 className="mb-2">Shipping Address</h5>
                  <div>
                    <div>
                      <h6>Ongata Rongai</h6>
                    </div>
                    <div>
                      <h6>Nyotu</h6>
                    </div>
                  </div>
                  <div
                    style={{ borderBottom: "1px solid #d4d4d4" }}
                    className="my-3"
                  ></div>
                  <h5 className="mb-2">For Help</h5>
                  <div id="order-help">
                    <h6>
                      View all order details <Link to="/">here</Link> or contact{" "}
                      <Link to="/">Customer Service.</Link>
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <MiniMenuWrapper />
      </div>
    );
  }
}

export default OrderPaymentSuccess;