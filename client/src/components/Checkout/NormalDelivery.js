import React from "react";

import "./NormalDelivery.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import MiniMenuWrapper from "../MiniMenuWrapper/MiniMenuWrapper";
import { Link } from "react-router-dom";
import { IconContext } from "react-icons";
import { BsArrowLeft } from "react-icons/bs";

class NormalDelivery extends React.Component {
  render() {
    return (
      <div className="main">
        <div className="content">
          <Header />
          <div className="container mt-4 box-container py-3">
            <div className="d-flex align-items-center">
              <div style={{ flex: "1" }}>
                <IconContext.Provider
                  value={{ className: "arrow-icon ml-3 my-2" }}
                >
                  <div className="d-flex align-items-center">
                    {/* goback() */}
                    <div onClick={() => this.props.history.goBack()}>
                      <BsArrowLeft />
                    </div>
                  </div>
                </IconContext.Provider>
              </div>

              <h3 className="ml-1" style={{ flex: "2" }}>
                Normal delivery
              </h3>
            </div>{" "}
            <h6 className="my-3">
              This kind of shipping takes an average of 3-7 days. It is cheaper
              than express.The price is calculated based on distance.
            </h6>
            <p>
              <Link to="/express-delivery" style={{ color: "#f76b1a" }}>
                About express shipping
              </Link>
            </p>
          </div>
        </div>
        <Footer />
        <MiniMenuWrapper />
      </div>
    );
  }
}

export default NormalDelivery;
