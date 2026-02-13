import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const content = document.querySelector(".main-content");
    if (content) {
      content.scrollTo({
        top: 0,
        behavior: "auto"
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;