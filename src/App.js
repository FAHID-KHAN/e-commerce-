import React, { Component } from "react";
import { Switch, Route, Link, BrowserRouter as Router } from "react-router-dom";
import AddProduct from "./Components/AddProduct";
import Cart from "./Components/Cart";
import Login from "./Components/Login";
import ProductList from "./Components/ProductList";
import Context from "./Context/Context";
import axios from "axios";
import jwt_decode from "jwt-decode";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      cart: {},
      products: []
    };
    this.routerRef = React.createRef();
  }
  async componentDidMount() {
    let user = localStorage.getItem("user");
    const products = await axios.get("http://localhost:3001/products");
    user = user ? JSON.parse(user) : null;
    this.setState({ user, products: products.data });
  }
  componentDidMount() {
    let user = localStorage.getItem("user");
    user = user ? JSON.parse(user) : null;
    this.setState({ user });
  }
  addProduct = (product, callback) => {
    let products = this.state.products.slice();
    products.push(product);
    this.setState({ products }, () => callback && callback());
  };
  login = async (email, password) => {
    const res = await axios
      .post("http://localhost:3001/login", { email, password })
      .catch(res => {
        return { status: 401, message: "Unauthorized" };
      });

    if (res.status === 200) {
      const { email } = jwt_decode(res.data.accessToken);
      const user = {
        email,
        token: res.data.accessToken,
        accessLevel: email === "admin@example.com" ? 0 : 1
      };

      this.setState({ user });
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  };

  logout = e => {
    e.preventDefault();
    this.setState({ user: null });
    localStorage.removeItem("user");
  };
  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          login: this.login,
          addProduct: this.addProduct,
          clearCart: this.clearCart,
          checkout: this.checkout
        }}
      >
        <Router ref={this.routerRef}>
          <div className="App">
            <nav
              className="navbar container"
              role="navigation"
              aria-label="main navigation"
            >
              <div className="navbar-brand">
                <b className="navbar-item is-size-4">Fahid's E-Commerce</b>
                <label
                  role="button"
                  class="navbar-burger burger"
                  area-label="menu"
                  aria-expanded="false"
                  data-target="navbarBasicExample"
                  onClick={e => {
                    e.preventDefault();
                    this.setState({ showMenu: !this.state.showMenu });
                  }}
                >
                  <span area-hidden="true"></span>
                  <span area-hidden="true"></span>
                  <span area-hidden="true"></span>
                </label>
              </div>
              <div
                className={`navbar-menu ${
                  this.state.showMenu ? "is-active" : ""
                }`}
              >
                <Link to="/products" className="navbar-item">
                  Products
                </Link>
                {this.state.user && this.state.user.accessLevel < 1 && (
                  <Link to="/add-product" className="navbar-item">
                    Add Product
                  </Link>
                )}
                <Link to="/cart" className="navbar-item">
                  Cart
                  <span
                    className="tag is-primary"
                    style={{ marginLeft: "5px" }}
                  >
                    {Object.keys(this.state.cart).length}
                  </span>
                </Link>
                {!this.state.user ? (
                  <Link to="/login" className="navbar-item">
                    Login
                  </Link>
                ) : (
                  <Link to="/" onClick={this.logout} className="navbar-item">
                    Logout
                  </Link>
                )}
              </div>
            </nav>
            <Switch>
              <Route exact path="/" component={ProductList} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/cart" component={Cart} />
              <Route exact path="/add-product" component={AddProduct} />
              <Route exact path="/products" component={ProductList} />
            </Switch>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}
