import React from "react";
import { Link } from "react-router-dom";

import "./Market.css";
import { connect } from "react-redux";

class Market extends React.Component {
  render() {
    return (
      <div className="container-fluid market">
        <div className="col market-head">
          <h1>Selling</h1>
        </div>
        <div className="products-section">
          {this.props.products.length !== 0 &&
            this.props.products.map(product => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="product"
                title={product.name}
              >
                <img src={product.imageUrl} alt={product.name} />
                <div>
                  <p className="product-name">{product.name}</p>
                  <strong className="price">
                    Ksh.{product.price.toLocaleString()}
                  </strong>
                </div>
              </Link>
            ))}
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    products: state.product.products
  };
};
export default connect(mapStateToProps)(Market);
