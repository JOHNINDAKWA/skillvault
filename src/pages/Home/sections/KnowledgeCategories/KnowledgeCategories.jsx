import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import book1 from "../../../../assets/images/book1.png";
import book2 from "../../../../assets/images/book2.png";
import book3 from "../../../../assets/images/book3.png";
import book4 from "../../../../assets/images/book4.png";
import book5 from "../../../../assets/images/book5.png";
import book6 from "../../../../assets/images/book6.png";
import book7 from "../../../../assets/images/book7.png";

import "./KnowledgeCategories.css";

const categories = [
  {
    title: "Career Playbooks",
    image: book1,
    path: "/resources?category=Career",
  },
  {
    title: "Business Toolkits",
    image: book2,
    path: "/resources?category=Business",
  },
  {
    title: "Money Resources",
    image: book3,
    path: "/resources?category=Money",
  },
  {
    title: "Tech Skills",
    image: book4,
    path: "/resources?category=Technology",
  },
  {
    title: "Student Success",
    image: book5,
    path: "/resources?category=Education",
  },
  {
    title: "Templates & Planners",
    image: book6,
    path: "/resources?category=Templates",
  },
  {
    title: "AI Productivity",
    image: book7,
    path: "/resources?category=AI",
  },
];

function KnowledgeCategories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const carouselItems = useMemo(() => {
    return [...categories, ...categories];
  }, []);

  const getItemsPerView = () => {
    if (window.innerWidth <= 480) {
      return 1;
    }

    if (window.innerWidth <= 900) {
      return 2;
    }

    return 4;
  };

  const nextSlide = () => {
    setTransitionEnabled(true);
    setActiveIndex((current) => current + 1);
  };

  const previousSlide = () => {
    if (activeIndex === 0) {
      setTransitionEnabled(false);
      setActiveIndex(categories.length);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransitionEnabled(true);
          setActiveIndex(categories.length - 1);
        });
      });

      return;
    }

    setTransitionEnabled(true);
    setActiveIndex((current) => current - 1);
  };

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView());
    };

    updateItemsPerView();

    window.addEventListener("resize", updateItemsPerView);

    return () => {
      window.removeEventListener("resize", updateItemsPerView);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeIndex === categories.length) {
      const resetTimer = setTimeout(() => {
        setTransitionEnabled(false);
        setActiveIndex(0);

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setTransitionEnabled(true);
          });
        });
      }, 760);

      return () => clearTimeout(resetTimer);
    }

    return undefined;
  }, [activeIndex]);

  return (
    <section className="knowledge-categories-section">
      <div className="container">
        <div className="knowledge-heading">
          <h2>
            Explore Practical Resources For
            <br />
            What You Want To
            <br />
            <span>Learn Next?</span>
          </h2>
        </div>

        <div className="knowledge-slider">
          <button
            type="button"
            className="knowledge-arrow knowledge-arrow-left"
            onClick={previousSlide}
            aria-label="Previous category"
          >
            <FiChevronLeft />
          </button>

          <div className="knowledge-window">
            <div
              className={`knowledge-track ${
                transitionEnabled ? "" : "no-transition"
              }`}
              style={{
                transform: `translateX(calc(-${activeIndex} * ((100% - (var(--knowledge-gap) * (${itemsPerView} - 1))) / ${itemsPerView} + var(--knowledge-gap))))`,
              }}
            >
              {carouselItems.map((item, index) => (
                <Link
                  to={item.path}
                  className="knowledge-item"
                  key={`${item.title}-${index}`}
                  style={{
                    flexBasis: `calc((100% - (var(--knowledge-gap) * (${itemsPerView} - 1))) / ${itemsPerView})`,
                  }}
                >
                  <div className="knowledge-image">
                    <img src={item.image} alt={item.title} />
                  </div>

                  <h3>{item.title}</h3>
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="knowledge-arrow knowledge-arrow-right"
            onClick={nextSlide}
            aria-label="Next category"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}

export default KnowledgeCategories;