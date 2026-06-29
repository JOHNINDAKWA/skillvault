import { Routes, Route } from "react-router-dom";
import { ResourcesProvider } from "./context/ResourcesContext.jsx";

import PublicLayout from "./components/layout/PublicLayout/PublicLayout.jsx";
import AccountLayout from "./components/layout/AccountLayout/AccountLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout/AdminLayout.jsx";

import Home from "./pages/Home/Home.jsx";
import Resources from "./pages/Resources/Resources.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import Blog from "./pages/Blog/Blog.jsx";
import About from "./pages/About/About.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";

import AccountDashboard from "./pages/Account/AccountDashboard/AccountDashboard.jsx";
import MyLibrary from "./pages/Account/MyLibrary/MyLibrary.jsx";
import Reader from "./pages/Account/Reader/Reader.jsx";
import Receipts from "./pages/Account/Receipts/Receipts.jsx";
import Wishlist from "./pages/Account/Wishlist/Wishlist.jsx";
import Profile from "./pages/Account/Profile/Profile.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard.jsx";
import AdminResources from "./pages/Admin/AdminResources/AdminResources.jsx";
import AdminOrders from "./pages/Admin/AdminOrders/AdminOrders.jsx";
import AdminCustomers from "./pages/Admin/AdminCustomers/AdminCustomers.jsx";
import AdminAnalytics from "./pages/Admin/AdminAnalytics/AdminAnalytics.jsx";
import AdminSettings from "./pages/Admin/AdminSettings/AdminSettings.jsx";
import AdminResourceManage from "./pages/Admin/AdminResourceManage/AdminResourceManage.jsx";

import ScrollToTop from "./components/ScrollToTop.jsx";
import CartNotification from "./components/ui/CartNotification/CartNotification.jsx";

import "./App.css";

function App() {
  return (
    <ResourcesProvider>
      <ScrollToTop />

      <Routes>
        <Route element={<PublicLayout />}>
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
        </Route>

        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<AccountDashboard />} />
          <Route path="library" element={<MyLibrary />} />
          <Route path="reader/:slug" element={<Reader />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
        </Route>

     <Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="resources" element={<AdminResources />} />
  <Route path="resources/new" element={<AdminResourceManage />} />
  <Route path="resources/:slug/edit" element={<AdminResourceManage />} />
  <Route path="orders" element={<AdminOrders />} />
  <Route path="customers" element={<AdminCustomers />} />
  <Route path="analytics" element={<AdminAnalytics />} />
  <Route path="settings" element={<AdminSettings />} />
</Route>

      </Routes>

      <CartNotification />
    </ResourcesProvider>
  );
}

export default App;
