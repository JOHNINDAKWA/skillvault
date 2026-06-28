import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiCreditCard,
  FiHeart,
  FiShoppingCart,
  FiStar,
} from "react-icons/fi";

import { useResources } from "../../hooks/useResources.js";
import "./ProductDetails.css";

const productTabs = [
  {
    id: "description",
    label: "Description",
  },
  {
    id: "included",
    label: "What’s Included",
  },
  {
    id: "reviews",
    label: "Reviews",
  },
];

function RatingStars({ rating }) {
  return (
    <div className="product-rating" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }, (_, index) => (
        <FiStar
          key={index}
          className={index < rating ? "star-filled" : "star-muted"}
        />
      ))}
    </div>
  );
}

function ProductDetails() {
  const { slug } = useParams();
  const { resources, addToBasket } = useResources();

  const [activeTab, setActiveTab] = useState("description");

  const product = useMemo(() => {
    return resources.find((item) => item.slug === slug);
  }, [resources, slug]);

  const relatedResources = useMemo(() => {
    if (!product) {
      return [];
    }

    return resources
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
  }, [resources, product]);

  const fallbackRelated = useMemo(() => {
    if (!product) {
      return [];
    }

    return resources.filter((item) => item.id !== product.id).slice(0, 4);
  }, [resources, product]);

  const finalRelatedResources =
    relatedResources.length > 0 ? relatedResources : fallbackRelated;

  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const productImages = [
      product.image,
      product.hoverImage,
      ...resources
        .filter((item) => item.id !== product.id)
        .slice(0, 3)
        .map((item) => item.image),
    ];

    return [...new Set(productImages)].slice(0, 5);
  }, [product, resources]);

  const [selectedImage, setSelectedImage] = useState(null);

  if (!product) {
    return (
      <section className="product-details-page">
        <div className="container">
          <div className="product-not-found">
            <h1>Resource not found</h1>
            <p>
              The resource you are looking for may have been moved, renamed, or
              removed.
            </p>

            <Link to="/resources">Back To Resources</Link>
          </div>
        </div>
      </section>
    );
  }

  const mainImage = selectedImage || product.image;

  const renderTabContent = () => {
    if (activeTab === "description") {
      return (
        <div className="product-tab-content-inner">
          <h3>About this resource</h3>

          <p>
            {product.description} This resource is designed for people who want
            practical, easy-to-use knowledge without wasting time searching
            through long articles or scattered advice.
          </p>

          <p>
            It is written in a simple, action-focused format so you can read,
            apply, and return to it whenever you need guidance. It works well
            for self-study, planning, preparation, and personal improvement.
          </p>
        </div>
      );
    }

    if (activeTab === "included") {
      return (
        <div className="product-tab-content-inner">
          <h3>What you get</h3>

          <div className="product-included-grid">
            <div>
              <FiCheck />
              Practical step-by-step guide
            </div>

            <div>
              <FiCheck />
              Editable checklist or planner sections
            </div>

            <div>
              <FiCheck />
              Real examples and simple explanations
            </div>

            <div>
              <FiCheck />
              Online reading access after purchase
            </div>

            <div>
              <FiCheck />
              Mobile-friendly PDF format
            </div>

            <div>
              <FiCheck />
              Lifetime access from your library
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="product-tab-content-inner">
        <h3>Customer feedback</h3>

        <div className="product-review-list">
          <div className="product-review">
            <div>
              <strong>Brian M.</strong>
              <RatingStars rating={5} />
            </div>

            <p>
              Very practical and easy to follow. I liked that it focused on real
              steps instead of theory.
            </p>
          </div>

          <div className="product-review">
            <div>
              <strong>Faith W.</strong>
              <RatingStars rating={4} />
            </div>

            <p>
              The examples made it easier to apply. I would recommend this to
              someone who wants something direct and useful.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="product-details-page">
      <div className="container">
        <div className="product-details-layout">
          <div className="product-gallery">
            <div className="product-main-image">
              <img src={mainImage} alt={product.title} />
            </div>

            <div className="product-thumbnails">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={mainImage === image ? "is-active" : ""}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img src={image} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <aside className="product-summary">
            <span className="product-badge">{product.badge}</span>

            <p className="product-category">
              {product.category} / {product.type}
            </p>

            <h1>{product.title}</h1>

            <div className="product-rating-row">
              <RatingStars rating={product.rating} />
              <span>{product.rating}.0 rating</span>
            </div>

            <p className="product-short-description">{product.description}</p>

            <div className="product-price-row">
              <span>KSh {product.price}</span>
              <del>KSh {product.oldPrice}</del>
            </div>

            <div className="product-summary-list">
              <div>
                <FiCheck />
                Instant access after purchase
              </div>

              <div>
                <FiCheck />
                Read online from your library
              </div>

              <div>
                <FiCheck />
                Practical PDF-style resource
              </div>
            </div>

            <div className="product-action-buttons">
              <button type="button" className="product-icon-button">
                <FiHeart />
                Add to Wishlist
              </button>

              <button
                type="button"
                className="product-icon-button"
                onClick={() => addToBasket(product)}
              >
                <FiShoppingCart />
                Add to Cart
              </button>

              <button type="button" className="product-buy-button">
                <FiCreditCard />
                Buy it Now
              </button>
            </div>
          </aside>
        </div>

        <div className="product-tabs-section">
          <div className="product-tabs-nav">
            {productTabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={activeTab === tab.id ? "is-active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="product-tab-content">{renderTabContent()}</div>
        </div>

        <div className="related-resources-section">
          <div className="related-heading">
            <span>Related Resources</span>

            <h2>
              More Resources You
              <br />
              May Find Useful
            </h2>
          </div>

          <div className="related-grid">
            {finalRelatedResources.map((item) => (
              <article className="related-card" key={item.id}>
                <Link to={`/product/${item.slug}`} className="related-image">
                  <img src={item.image} alt={item.title} />
                </Link>

                <div className="related-content">
                  <span>{item.category}</span>

                  <h3>
                    <Link to={`/product/${item.slug}`}>{item.title}</Link>
                  </h3>

                  <div className="related-bottom">
                    <strong>KSh {item.price}</strong>

                    <Link to={`/product/${item.slug}`}>
                      View
                      <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;