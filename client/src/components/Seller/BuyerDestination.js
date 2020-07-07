import React, { Component } from "react";
import { fetchBuyerForSeller } from "../../redux/actions";
import { connect } from "react-redux";

export class BuyerDestination extends Component {
  componentDidMount() {
    this.props.fetchBuyerForSeller(this.props.buyerId);
  }
  render() {
    return <div>Rongai</div>;
  }
}

export default connect(null, { fetchBuyerForSeller })(BuyerDestination);
