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
        label: "How do i buy products on Way4Biz?",
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
        label: "How do i register with Way4Biz?",
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
        label: "They Fail Poorly and Often",
        content:
          'When your icon font fails, the browser treats it like any other font and replaces it with a fallback. Best-case scenario, you\'ve chosen your fallback characters carefully and something weird-looking but communicative still loads. Worse-case scenario (and far more often), the user sees something completely incongruous, usually the dreaded "missing character" glyph.',
      },
      {
        label: "They're a Nightmare if You're Dyslexic",
        content:
          "Many dyslexic people find it helpful to swap out a website's typeface for something like OpenDyslexic. But icon fonts get replaced as well, which makes for a frustratingly broken experience.",
      },
      {
        label: "There's Already a Better Way",
        content:
          "SVG is awesome for icons! It's a vector image format with optional support for CSS, JavaScript, reusability, accessibility and a bunch more. It was made for this sort of thing.",
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
