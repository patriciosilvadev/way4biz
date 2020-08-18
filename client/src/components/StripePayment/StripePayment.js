import React from "react";

import "../Checkout/MpesaPayment.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import MiniMenuWrapper from "../MiniMenuWrapper/MiniMenuWrapper";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { makeOrder } from "../../redux/actions";
import StripePaymentButton from "./StripePaymentButton";
import MobileLogo from "../Header/MobileLogo";
import { Elements, ElementsConsumer } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE);
class StripePayment extends React.Component {
  render() {
    if (!this.props.order) return <Redirect to="/checkout" />;
    if (this.props.order && !this.props.order.formValues)
      return <Redirect to="/checkout" />;
    if (
      this.props.order &&
      this.props.order.formValues &&
      !this.props.order.formValues.payment
    )
      return <Redirect to="/checkout" />;
    if (
      !this.props.distance ||
      (this.props.distance && Object.keys(this.props.distance).length === 0)
    )
      return <Redirect to="/checkout" />;
    return (
      <div className="main">
        <div className="content">
          <MobileLogo />
          <Header />
          <div className="container mt-3">
            <div className="row">
              <div className="col-md-9 col-lg-8 mx-auto">
                <div className="box-container py-3 pl-2 pr-1">
                  <h6 className="mb-2">
                    <Link id="change-payment-method" to="/checkout">
                      Change Payment Method
                    </Link>
                  </h6>
                  <h3>Card Payment</h3>
                  <ul className="my-1 mpesa-payment-guide">
                    <li>
                      <p>
                        Ensure you have enough money in your bank account to
                        make payment for your order.
                      </p>
                    </li>
                    <li>
                      <p>
                        We recommend you disable ad blocker in your browser if
                        you have it enabled.
                      </p>
                    </li>
                    <li>
                      <p>
                        <strong>
                          Once you initiate payment don't leave this page. Wait
                          until you are redirected.
                        </strong>
                      </p>
                    </li>
                  </ul>
                  <Elements stripe={stripePromise}>
                    <ElementsConsumer>
                      {({ stripe, elements }) => (
                        <StripePaymentButton
                          email={this.props.user.email}
                          cart={this.props.order.cart}
                          order={this.props.order}
                          distance={this.props.distance}
                          stripe={stripe}
                          elements={elements}
                        />
                      )}
                    </ElementsConsumer>
                  </Elements>
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
const mapStateToProps = (state) => {
  return {
    order: state.cartReducer.order,
    distance: state.detailsPersist.distance,
    user: state.auth.user,
  };
};
export default connect(mapStateToProps, { makeOrder })(StripePayment);
