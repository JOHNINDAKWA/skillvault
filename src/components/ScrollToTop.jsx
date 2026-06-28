import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Extract the current pathname from the URL
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the window to the top-left corner
    window.scrollTo(0, 0);
  }, [pathname]); // This runs every time the path changes

  return null; // This component doesn't render any UI
};

export default ScrollToTop;