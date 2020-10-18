/*global google*/
import React from "react";
import FormField from "../Checkout/FormField";
import "./Logistics.css";
import { reduxForm, Field } from "redux-form";
import validator from "validator";
import { withRouter, Redirect } from "react-router-dom";
import AddressPhoneNumber from "../Account/AddressPhoneNumber";
import Footer from "../Footer/Footer";
import MiniMenuWrapper from "../MiniMenuWrapper/MiniMenuWrapper";
import Header from "../Header/Header";
import { connect } from "react-redux";
import { checkoutUser, storeLatLng } from "../../redux/actions";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import AutoComplete from "../Account/Autocomplete";
import SimpleMap from "../Account/SimpleMap";
import MobileLogo from "../Header/MobileLogo";

class Logistics extends React.Component {
  state = {
    cityLatLng: {},
    townLatLng: {},
    addressLatLng: {
      lat: -1.28585,
      lng: 36.8263
    }
  };
  componentDidMount() {
    if (!this.props.user) {
      return <Redirect to="/login" />;
    }
  }
  handleCitySelect = async selectedCity => {
    const results = await geocodeByAddress(selectedCity);
    const latlng = await getLatLng(results[0]);
    this.setState({ cityLatLng: latlng });
    this.props.change("city", selectedCity);
  };
  handleTownSelect = async selectedTown => {
    const results = await geocodeByAddress(selectedTown);
    const latlng = await getLatLng(results[0]);
    this.setState({ townLatLng: latlng });
    this.props.change("town", selectedTown);
  };
  handleAddressSelect = async selectedAddress => {
    const results = await geocodeByAddress(selectedAddress);
    const latlng = await getLatLng(results[0]);
    this.setState({ addressLatLng: latlng });
    this.props.change("address", selectedAddress);
  };
  handleReceiverCitySelect = async selectedCity => {
    const results = await geocodeByAddress(selectedCity);
    const latlng = await getLatLng(results[0]);
    this.setState({ cityLatLng: latlng });
    this.props.change("receiverCity", selectedCity);
  };
  handleReceiverTownSelect = async selectedTown => {
    const results = await geocodeByAddress(selectedTown);
    const latlng = await getLatLng(results[0]);
    this.setState({ townLatLng: latlng });
    this.props.change("receiverTown", selectedTown);
  };
  handleReceiverAddressSelect = async selectedAddress => {
    const results = await geocodeByAddress(selectedAddress);
    const latlng = await getLatLng(results[0]);
    this.setState({ addressLatLng: latlng });
    this.props.change("receiverAddress", selectedAddress);
  };

  render() {
    return (
      <div className="main">
        <div className="content">
          <MobileLogo />
          <Header />
          <div className="container mt-4">
            <div className="row">
              <div
                className="col-md-9  mx-auto box-container"
                id="logistics-form"
              >
                <h3 className="legend text-center">Logistics</h3>
                <p className="my-2">
                  Our logistics personnel will collect your goods from your
                  current location to your desired location. Fill the form below
                  and click request service.{" "}
                  <b>Note: The service is operational only within Nairobi.</b>
                </p>
                <form
                  onSubmit={this.props.handleSubmit(formValues => {
                    console.log(formValues);
                  })}
                >
                  <Field
                    type="text"
                    name="firstName"
                    label="First Name"
                    component={FormField}
                  />
                  <Field
                    type="text"
                    name="lastName"
                    label="Last Name"
                    component={FormField}
                  />
                  <Field
                    type="text"
                    name="phoneNumber"
                    label="Phone"
                    component={AddressPhoneNumber}
                  />
                  <Field
                    type="text"
                    name="itemName"
                    label="Item Name"
                    component={FormField}
                  />
                  <Field
                    type="number"
                    name="itemQuantity"
                    label="Item Quantity"
                    component={FormField}
                  />
                  <Field
                    type="text"
                    name="city"
                    label="From City"
                    className="address-location-input"
                    component={AutoComplete}
                    options={{ types: ["(cities)"] }}
                    onSelect={this.handleCitySelect}
                  />
                  <Field
                    type="text"
                    name="town"
                    label="From Town"
                    className="address-location-input"
                    component={AutoComplete}
                    options={{ types: ["(cities)"] }}
                    onSelect={this.handleTownSelect}
                  />
                  <Field
                    type="text"
                    name="address"
                    label="From Street Address"
                    className="address-location-input"
                    component={AutoComplete}
                    options={{
                      location: new google.maps.LatLng(this.state.cityLatLng),
                      radius: 1000,
                      types: ["establishment"]
                    }}
                    onSelect={this.handleToAddressSelect}
                  />

                  <Field
                    type="text"
                    name="receiverFirstName"
                    label="Receiver First Name"
                    component={FormField}
                  />
                  <Field
                    type="text"
                    name="receiverLastName"
                    label="Receiver Last Name"
                    component={FormField}
                  />
                  <Field
                    type="text"
                    name="receiverPhoneNumber"
                    label="Receiver Phone"
                    component={AddressPhoneNumber}
                  />
                  <Field
                    type="text"
                    name="receiverCity"
                    label="To City"
                    className="address-location-input"
                    component={AutoComplete}
                    options={{ types: ["(cities)"] }}
                    onSelect={this.handleReceiverCitySelect}
                  />
                  <Field
                    type="text"
                    name="receiverTown"
                    label="To Town"
                    className="address-location-input"
                    component={AutoComplete}
                    options={{ types: ["(cities)"] }}
                    onSelect={this.handleReceiverTownSelect}
                  />
                  <Field
                    type="text"
                    name="receiverAddress"
                    label="To Street Address"
                    className="address-location-input"
                    component={AutoComplete}
                    options={{
                      location: new google.maps.LatLng(this.state.cityLatLng),
                      radius: 1000,
                      types: ["establishment"]
                    }}
                    onSelect={this.handleReceiverTownSelect}
                  />
                  <SimpleMap
                    key={this.state.addressLatLng.lat}
                    addressLatLng={this.state.addressLatLng}
                    className="address-map"
                  />
                  <button
                    className="btn btn-md btn-block address-btn mt-3 "
                    disabled={
                      !this.props.valid ||
                      this.props.checkoutUserLoading ||
                      Object.keys(this.state.townLatLng).length === 0 ||
                      Object.keys(this.state.cityLatLng).length === 0
                    }
                    type="submit"
                  >
                    {this.props.checkoutUserLoading && (
                      <span
                        className="spinner-grow spinner-grow-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    )}
                    {this.props.checkoutUserLoading ? (
                      <span> {"  "}Loading...</span>
                    ) : (
                      <span>Request Service</span>
                    )}
                  </button>
                  <div style={{ color: "red", margin: "10px 0px" }}>
                    {this.props.checkoutUserError &&
                      this.props.checkoutUserError}
                    {(!this.props.pristine &&
                      Object.keys(this.state.townLatLng).length === 0) ||
                      (Object.keys(this.state.cityLatLng).length === 0 && (
                        <p>
                          Please choose a valid destination or wait for the map
                          to load if you have already chosen.
                        </p>
                      ))}
                  </div>
                </form>
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
const validate = formValues => {
  const errors = {};
  if (
    !formValues.firstName ||
    (formValues.firstName && formValues.firstName.trim().length < 2)
  ) {
    errors.firstName = "Please enter a valid first name";
  }
  if (
    !formValues.receiverFirstName ||
    (formValues.receiverFirstName &&
      formValues.receiverFirstName.trim().length < 2)
  ) {
    errors.receiverFirstName = "Please enter a valid first name";
  }
  if (
    !formValues.lastName ||
    (formValues.lastName && formValues.lastName.trim().length < 2)
  ) {
    errors.lastName = "Please enter a valid last name";
  }
  if (
    !formValues.receiverLastName ||
    (formValues.receiverLastName &&
      formValues.receiverLastName.trim().length < 2)
  ) {
    errors.receiverLastName = "Please enter a valid last name";
  }
  if (
    !formValues.phoneNumber ||
    (formValues.phoneNumber && !validator.isNumeric(formValues.phoneNumber))
  ) {
    errors.phoneNumber = "Please enter a valid phone number";
  }
  if (
    !formValues.receiverPhoneNumber ||
    (formValues.receiverPhoneNumber &&
      !validator.isNumeric(formValues.receiverPhoneNumber))
  ) {
    errors.receiverPhoneNumber = "Please enter a valid phone number";
  }
  if (
    !formValues.phoneNumber ||
    (formValues.phoneNumber && formValues.phoneNumber.length !== 9)
  ) {
    errors.phoneNumber = "Please enter a valid phone number";
  }
  if (
    !formValues.receiverPhoneNumber ||
    (formValues.receiverPhoneNumber &&
      formValues.receiverPhoneNumber.length !== 9)
  ) {
    errors.receiverPhoneNumber = "Please enter a valid phone number";
  }
  if (
    !formValues.address ||
    (formValues.address && formValues.address.trim().length < 2)
  ) {
    errors.address = "Please enter a valid address";
  }
  if (
    !formValues.receiverAddress ||
    (formValues.receiverAddress && formValues.receiverAddress.trim().length < 2)
  ) {
    errors.receiverAddress = "Please enter a valid address";
  }
  if (!formValues.city || (formValues.city && formValues.city === "choose")) {
    errors.city = "Please enter a valid city";
  }
  if (
    !formValues.receiverCity ||
    (formValues.receiverCity && formValues.receiverCity === "choose")
  ) {
    errors.receiverCity = "Please enter a valid city";
  }
  if (!formValues.town || (formValues.town && formValues.town === "choose")) {
    errors.town = "Please enter a valid town";
  }
  if (
    !formValues.receiverTown ||
    (formValues.receiverTown && formValues.receiverTown === "choose")
  ) {
    errors.receiverTown = "Please enter a valid town";
  }
  return errors;
};
const mapStateToProps = state => {
  return {
    initialValues: state.auth.user
  };
};
export default withRouter(
  connect(mapStateToProps)(
    reduxForm({ validate, form: "Logistics" })(Logistics)
  )
);
