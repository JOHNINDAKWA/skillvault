import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiEye,
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiSliders,
  FiSearch,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

import { useResources } from "../../hooks/useResources.js";
import { resourceCategories, resourceTypes } from "../../data/resources.js";
import "./Resources.css";

const priceOptions = [
  {
    label: "All Prices",
    value: "All",
  },
  {
    label: "Under KSh 200",
    value: "200",
  },
  {
    label: "Under KSh 300",
    value: "300",
  },
  {
    label: "Under KSh 500",
    value: "500",
  },
];

function RatingStars({ rating }) {
  return (
    <div className="resource-rating" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }, (_, index) => (
        <FiStar
          key={index}
          className={index < rating ? "star-filled" : "star-muted"}
        />
      ))}
    </div>
  );
}

function Resources() {
  const { resources, addToBasket } = useResources();

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";

  const [selectedType, setSelectedType] = useState("All");
  const [maxPrice, setMaxPrice] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleCategoryChange = (category) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (category === "All") {
      nextSearchParams.delete("category");
    } else {
      nextSearchParams.set("category", category);
    }

    setSearchParams(nextSearchParams);
  };

  const resetFilters = () => {
    setSelectedType("All");
    setMaxPrice("All");
    setSortBy("featured");
    setSearchTerm("");
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  const filteredResources = useMemo(() => {
    let results = [...resources];

    if (selectedCategory !== "All") {
      results = results.filter((item) => item.category === selectedCategory);
    }

    if (selectedType !== "All") {
      results = results.filter((item) => item.type === selectedType);
    }

    if (maxPrice !== "All") {
      results = results.filter((item) => item.price <= Number(maxPrice));
    }

    if (searchTerm.trim()) {
      const searchValue = searchTerm.toLowerCase();

      results = results.filter((item) => {
        return (
          item.title.toLowerCase().includes(searchValue) ||
          item.category.toLowerCase().includes(searchValue) ||
          item.type.toLowerCase().includes(searchValue) ||
          item.description.toLowerCase().includes(searchValue)
        );
      });
    }

    if (sortBy === "price-low") {
      results.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      results.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    }

    return results;
  }, [resources, selectedCategory, selectedType, maxPrice, sortBy, searchTerm]);

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedType !== "All" ||
    maxPrice !== "All" ||
    searchTerm.trim();

  const selectedPriceLabel =
    priceOptions.find((option) => option.value === maxPrice)?.label ||
    "All Prices";

  return (
    <section className="resources-page">
      <div className="container">
        <div className="resources-header">
          <span>Explore Practical Resources</span>

          <div className="resources-header-row">
            <div className="resources-count">
              {filteredResources.length} item
              {filteredResources.length === 1 ? "" : "s"} found
            </div>
          </div>
        </div>

        <div className="resources-layout">
          <div className="resources-main">
            <div className="resources-toolbar">
              <label className="resources-search">
                <FiSearch />
                <input
                  type="search"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <label className="resources-sort">
                <span>Sort by</span>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </label>
            </div>

            <div className="resources-grid">
              {filteredResources.map((resource) => (
                <article className="resource-card" key={resource.id}>
                  <div className="resource-image-box">
                    <Link
                      to={`/product/${resource.slug}`}
                      className="resource-image-link"
                    >
                      <img
                        src={resource.image}
                        alt={resource.title}
                        className="resource-main-image"
                      />

                      <img
                        src={resource.hoverImage}
                        alt=""
                        aria-hidden="true"
                        className="resource-hover-image"
                      />
                    </Link>

                    <span className="resource-badge">{resource.badge}</span>

                    <div className="resource-icons">
                      <button type="button" aria-label="Preview resource">
                        <FiEye />
                      </button>

                      <button type="button" aria-label="Save resource">
                        <FiHeart />
                      </button>
                    </div>
                  </div>

                  <div className="resource-card-content">
                    <span className="resource-category">
                      {resource.category} / {resource.type}
                    </span>

                    <h2>
                      <Link to={`/product/${resource.slug}`}>
                        {resource.title}
                      </Link>
                    </h2>

                    <RatingStars rating={resource.rating} />

                    <p className="resource-description">
                      {resource.description}
                    </p>

                    <div className="resource-price-row">
                      <span>KSh {resource.price}</span>
                      <del>KSh {resource.oldPrice}</del>
                    </div>

                    <div className="resource-actions">
                      <Link
                        to={`/product/${resource.slug}`}
                        className="resource-btn resource-btn-light"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        className="resource-btn resource-btn-red"
                        onClick={() => addToBasket(resource)}
                      >
                        <FiShoppingCart />
                        Add To Basket
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="resources-empty">
                <h3>No resources found</h3>

                <p>
                  Try changing the category, resource type, price range, or
                  search word.
                </p>

                <button type="button" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          <aside className="resources-filter">
            <div className="filter-title">
              <div>
                <FiSliders />
                <h2>Refine</h2>
              </div>

              <div className="filter-title-actions">
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="filter-clear-small"
                    onClick={resetFilters}
                  >
                    Clear
                    <FiX />
                  </button>
                )}

                <button
                  type="button"
                  className={`filter-mobile-toggle ${
                    mobileFiltersOpen ? "is-open" : ""
                  }`}
                  onClick={() =>
                    setMobileFiltersOpen((currentState) => !currentState)
                  }
                >
                  More Filters
                  <FiChevronDown />
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="filter-active-box">
                <span>Active filters</span>

                <div className="filter-active-tags">
                  {selectedCategory !== "All" && <em>{selectedCategory}</em>}
                  {selectedType !== "All" && <em>{selectedType}</em>}
                  {maxPrice !== "All" && <em>{selectedPriceLabel}</em>}
                  {searchTerm.trim() && <em>Search: {searchTerm}</em>}
                </div>
              </div>
            )}

            <div className="filter-group filter-category-group">
              <h3>Category</h3>

              <div className="filter-chip-row">
                {resourceCategories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={selectedCategory === category ? "is-active" : ""}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`filter-extra-options ${
                mobileFiltersOpen ? "is-open" : ""
              }`}
            >
              <div className="filter-group">
                <h3>Resource Type</h3>

                <div className="filter-line-list">
                  {resourceTypes.map((type) => (
                    <button
                      type="button"
                      key={type}
                      className={selectedType === type ? "is-active" : ""}
                      onClick={() => setSelectedType(type)}
                    >
                      <span />
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>Price Range</h3>

                <div className="filter-line-list">
                  {priceOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={maxPrice === option.value ? "is-active" : ""}
                      onClick={() => setMaxPrice(option.value)}
                    >
                      <span />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="filter-reset-btn"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Resources;