import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    };

    scrollToTop();
    window.addEventListener("scroll-to-top", scrollToTop);

    return () => {
      window.removeEventListener("scroll-to-top", scrollToTop);
    };
  }, [pathname]);

  return null;
}

export default ScrollToTop;