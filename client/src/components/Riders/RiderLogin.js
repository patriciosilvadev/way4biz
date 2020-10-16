import React from "react";
import "./RiderLogin.css";
import { reduxForm, Field } from "redux-form";
import AuthField from "../Authenticate/AuthField";
import validator from "validator";
import { connect } from "react-redux";
import { riderLogIn } from "../../redux/actions";
import { withRouter, Link } from "react-router-dom";
import MobileLogo from "../Header/MobileLogo";
import AuthHeader from "../Authenticate/AuthHeader";

class RiderLogin extends React.Component {
  render() {
    return (
      <div>
        <MobileLogo />
        <AuthHeader />
        <div className="form-primary-error">
          {this.props.riderLoginError && this.props.riderLoginError}
        </div>
        <form
          className="login-form"
          onSubmit={this.props.handleSubmit((formValues) => {
            return this.props.riderLogIn(formValues, this.props.history);
          })}
        >
          <Field type="text" name="email" label="Email" component={AuthField} />
          <Field
            type="password"
            name="password"
            label="Password"
            component={AuthField}
          />
          <button
            className="btn btn-md btn-block auth-btn mt-3 primary-button"
            disabled={!this.props.valid || this.props.riderLoginLoading}
            type="submit"
          >
            {this.props.riderLoginLoading && (
              <span
                className="spinner-grow spinner-grow-sm"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            {this.props.riderLoginLoading ? (
              <span> {"  "}Loading...</span>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
        <br />
        <div className="login-auth-links-wrapper">
          <p className="forgot-password-link-wrapper">
            <Link style={{ color: "#f76b1a" }} to="/password/reset">
              Forgot password?
            </Link>
          </p>
          <p className="forgot-password-link-wrapper">
            <Link
              style={{ color: "#f76b1a" }}
              className="float-right"
              to="/rider/register"
            >
              Sign Up
            </Link>
          </p>
        </div>
        {/* <a
          href="/auth/google"
          className="btn btn-md btn-block mt-3 secondary-google"
          type="submit"
        >
          Sign In With Google
        </a> */}
      </div>
    );
  }
}

const validate = (formValues) => {
  const errors = {};
  if (
    !formValues.email ||
    (formValues.email.trim() && !validator.isEmail(formValues.email.trim()))
  ) {
    errors.email = "Please enter a valid email";
  }
  if (
    !formValues.password ||
    (formValues.password && formValues.password.trim().length < 6)
  ) {
    errors.password =
      "Please enter a password with a minimum of six characters";
  }
  return errors;
};
const mapStateToProps = (state) => {
  return {
    riderLoginError: state.riders.riderLoginError,
    riderLoginLoading: state.riders.riderLoginLoading,
  };
};
export default withRouter(
  reduxForm({ validate, destroyOnUnmount: false, form: "RiderLogin" })(
    connect(mapStateToProps, { riderLogIn })(RiderLogin)
  )
);
