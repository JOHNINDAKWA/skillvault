import { Outlet } from "react-router-dom";

import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";

function PublicLayout() {
  return (
    <div className="app public-layout">
      <Navbar />

      <main className="app-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default PublicLayout;