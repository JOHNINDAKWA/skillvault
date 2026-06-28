import { Routes, Route } from "react-router-dom";
import { ResourcesProvider } from "./context/ResourcesContext.jsx";

import Navbar from "./components/layout/Navbar/Navbar.jsx";
import Footer from "./components/layout/Footer/Footer.jsx";

import Home from "./pages/Home/Home.jsx";
import Resources from "./pages/Resources/Resources.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import Blog from "./pages/Blog/Blog.jsx";
import About from "./pages/About/About.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import "./App.css";
import CartNotification from "./components/ui/CartNotification/CartNotification.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";

function App() {
  return (
    <ResourcesProvider>
      <div className="app">
        <Navbar />
      <ScrollToTop /> 


        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </main>

        <Footer />
        <CartNotification />
      </div>
    </ResourcesProvider>
  );
}

export default App;