import React from "react";
// import { AiOutlineMinusCircle } from "react-icons/ai";
// import { BsPlusCircle } from "react-icons/bs";
import "./FAQAccordion.css";
import Panel from "./Panel";
import { Link } from "react-router-dom";

class FAQAccordion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 0,
    };

    this.activateTab = this.activateTab.bind(this);
  }

  activateTab(index) {
    this.setState((prev) => ({
      activeTab: prev.activeTab === index ? -1 : index,
    }));
  }

  render() {
    const panels = [
      {
        label: "How do I buy products on Way4Biz?",
        content: (
          <div className="faq-content-section">
            <p>Way4Biz sells products on its website and buying is easy:</p>
            <p>
              Way4Biz will indicate on the relevant product catalogues when
              products are for sale.{" "}
            </p>
            <p>
              You can simply add the products to your shopping cart and proceed
              through checkout using any of Way4Biz’s available payment methods.
            </p>
            <p>
              To buy on Way4Biz will however require you to have an account so
              that it can be easy to identify you and process your order easily.
            </p>
          </div>
        ),
      },
      {
        label: "How do I register with Way4Biz?",
        content: (
          <div className="faq-content-section">
            <p>
              At Way4Biz, you can register as a buyer or as a seller. A seller
              however can use the same account to buy.
            </p>
            <p>
              On registering we will need your full name, e-mail address, a
              strong password and a valid phone number.
            </p>

            <p>
              To register as a buyer do so <Link to="/sign-in">here</Link> and
              to register as a seller do so{" "}
              <Link to="/seller/register">here</Link>.
            </p>
          </div>
        ),
      },
      {
        label: "How do I pay for products on Way4Biz?",
        content: (
          <div className="faq-content-section">
            <p>Currently Way4Biz supports mpesa and card payment.</p>
          </div>
        ),
      },
      {
        label: "What are my delivery options?",
        content: (
          <div className="faq-content-section">
            <h6>Way4Biz offers 3 convenient methods of delivery:</h6>
            <ul>
              <li>
                <p>
                  <strong>Collect - </strong>You can choose to collect from
                  Way4Biz's pickup collection near you.
                </p>
              </li>
              <li>
                <p>
                  <strong>Courier - </strong>We deliver directly to your home or
                  office.This delivery however has two modes:{" "}
                  <strong>Normal Delivery </strong>
                  which takes 3-7 days and <strong>
                    Express Delivery
                  </strong>{" "}
                  which takes 24-48hrs.
                </p>
              </li>
            </ul>
          </div>
        ),
      },
      {
        label: "What happens if an item is out of stock?",
        content: (
          <div className="faq-content-section">
            <p>
              If an item becomes out of stock, it will reflect as such on the
              site.
            </p>
            <p>
              If you have pre-ordered the item, we’ll let you know. You then
              have the option to be refunded or wait until it comes into stock
              again.
            </p>
          </div>
        ),
      },
      {
        label: "Can I pay with Cash?",
        content: (
          <div className="faq-content-section">
            <p>We currently don't offer cash on delivery.</p>
          </div>
        ),
      },
      {
        label: "What if I received a damaged product?",
        content: (
          <div className="faq-content-section">
            <p>
              If you notify us within 7 days of damage to your goods occurring
              on delivery of your order, you can return it to us at no charge
              and, if stock is available, we will do our best to immediately
              arrange a replacement. If your return request falls within this
              policy and is deemed eligible for a return, we will:
            </p>
            <ul>
              <li>
                <p>
                  replace the correct product to you (if the correct product is
                  available) or;
                </p>
              </li>

              <li>
                <p>refund you with the purchase price of the product. </p>
              </li>
            </ul>
          </div>
        ),
      },
      {
        label: "Can I return a product without accessories?",
        content: (
          <div className="faq-content-section">
            <p>
              Unfortunately not – the complete product has to be returned. This
              means that if a TV remote is not working, the TV needs to be
              returned as well, as it would need to be tested with the remote
              once fixed.
            </p>
          </div>
        ),
      },
      {
        label: "Can I change my delivery address?",
        content: (
          <div className="faq-content-section">
            <p>
              We unfortunately can’t make changes to your delivery address once
              payment has been received and you have received your Payment
              Confirmation email.
            </p>
          </div>
        ),
      },
      {
        label: "Is it safe to shop with you?",
        content: (
          <div className="faq-content-section">
            <p>
              <strong>YES! </strong>We take the security of your payment and
              personal information seriously.
            </p>
          </div>
        ),
      },
      {
        label: "What do I do if I forgot my password?",
        content: (
          <div className="faq-content-section">
            <p>
              On the Login page click on the link next to ‘Forgot password?’ and
              enter the email address that you account was registered with and
              click ‘Submit‘. We will email you a link to this email address
              which you can click on to reset your password.
            </p>
          </div>
        ),
      },
      {
        label: "Does Way4Biz ship internationally?",
        content: (
          <div className="faq-content-section">
            <p>
              Currently, Way4Biz does local shipping only but later on
              international shipping will be available.
            </p>
          </div>
        ),
      },
      {
        label: "What is Way4Biz’s return policy?",
        content: (
          <div className="faq-content-section">
            <p>
              View our Returns Policy <Link to="/return-policy">here</Link>.
            </p>
          </div>
        ),
      },
      {
        label: "Still struggling? Contact Us",
        content: (
          <div className="faq-content-section">
            <p>
              You can contact us <Link to="/contact-us">here</Link> and our
              friendly customer service team will get back to you shortly.
            </p>
          </div>
        ),
      },
    ];
    const { activeTab } = this.state;
    return (
      <div className="my-accordion" role="tablist">
        {panels.map((panel, index) => (
          <Panel
            key={index}
            activeTab={activeTab}
            index={index}
            {...panel}
            activateTab={this.activateTab.bind(null, index)}
          />
        ))}
      </div>
    );
  }
}

export default FAQAccordion;
