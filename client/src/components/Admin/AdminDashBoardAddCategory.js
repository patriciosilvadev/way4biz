import React from "react";

import "./AdminDashBoardAddCategory.css";
import AdminDashBoardHeader from "./AdminDashBoardHeader";
import AdminDashboardSecondaryHeader from "./AdminDashboardSecondaryHeader";
import { IconContext } from "react-icons/lib";
import { AiOutlineSearch } from "react-icons/ai";
import { addNewCategory } from "../../redux/actions";
import { connect } from "react-redux";

class AdminDashBoardAddCategory extends React.Component {
  state = {
    main: "",
    subcategories: [],
    typing: ""
  };
  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  handleTypingSubmit = e => {
    if (this.state.typing !== "") {
      return this.setState({
        subcategories: [...this.state.subcategories, this.state.typing],
        typing: ""
      });
    }
  };
  handleSubmit = e => {
    e.preventDefault();
    if (this.state.main !== "" && this.state.subcategories.length !== 0) {
      this.props.addNewCategory({
        main: this.state.main,
        subcategories: this.state.subcategories
      });
    }
  };
  render() {
    return (
      <div className="container-fluid p-0">
        <AdminDashBoardHeader />
        <AdminDashboardSecondaryHeader />
        <div className="container mt-4">
          <div className="box-container">
            <h3 className="my-2" style={{ textAlign: "center" }}>
              Add Category
            </h3>
            <div className="container">
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label htmlFor="add-category">Category</label>
                  <input
                    name="main"
                    className="form-control"
                    type="text"
                    placeholder="Category Name"
                    id="add-category"
                    value={this.state.main}
                    onChange={this.handleChange}
                  />
                  <label htmlFor="sub-categories">Sub Categories</label>
                  <div className="input-group">
                    <input
                      name="typing"
                      type="text"
                      onChange={this.handleChange}
                      className="form-control header-input-search"
                      placeholder="e.g iPhone"
                      value={this.state.typing}
                    />
                    <div
                      className="input-group-append"
                      onClick={this.handleTypingSubmit}
                    >
                      <button
                        id="header-search-btn"
                        disabled={this.state.typing === ""}
                      >
                        <div className="icon-container">
                          <span>Enter</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  {this.state.subcategories.length !== 0 &&
                    this.state.subcategories.map((sub, index) => (
                      <React.Fragment key={index}>
                        <p>
                          {sub}{" "}
                          <strong
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              this.setState({
                                subcategories: this.state.subcategories.filter(
                                  (s, i) => i !== index
                                )
                              })
                            }
                          >
                            X
                          </strong>
                        </p>
                      </React.Fragment>
                    ))}
                </div>
                <button
                  type="submit"
                  className="btn btn-md btn-primary"
                  disabled={
                    this.state.main === "" &&
                    this.state.subcategories.length === 0
                  }
                >
                  Add Category
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, { addNewCategory })(AdminDashBoardAddCategory);
