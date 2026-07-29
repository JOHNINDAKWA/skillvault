import { useMemo, useState } from "react";
import Select, { components } from "react-select";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  FiChevronDown,
  FiEye,
  FiHeart,
  FiImage,
  FiRefreshCcw,
  FiSearch,
  FiShoppingBag,
  FiStar,
  FiX,
} from "react-icons/fi";

import { useResources } from "../../hooks/useResources.js";
import { useWishlist } from "../../hooks/useWishlist.js";

import "./Resources.css";

const priceOptions = [
  { label: "All prices", value: "All" },
  { label: "Under KSh 200", value: "200" },
  { label: "Under KSh 300", value: "300" },
  { label: "Under KSh 500", value: "500" },
];

const sortOptions = [
  { label: "Featured first", value: "featured" },
  { label: "Price: low to high", value: "price-low" },
  { label: "Price: high to low", value: "price-high" },
  { label: "Highest rated", value: "rating" },
];

const selectPortalStyles = {
  menuPortal: (base) => ({
    ...base,
    zIndex: 99999,
  }),
};

function formatMoney(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-US")}`;
}

function RatingStars({ rating }) {
  const numericRating = Number(rating || 0);
  const roundedRating = Math.round(numericRating);

  return (
    <div
      className="catalogue-rating"
      aria-label={`${numericRating.toFixed(1)} star rating`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <FiStar
          key={index}
          aria-hidden="true"
          className={index < roundedRating ? "is-filled" : ""}
        />
      ))}
    </div>
  );
}

function DropdownIndicator(props) {
  return (
    <components.DropdownIndicator {...props}>
      <span className="catalogue-select-indicator-line" aria-hidden="true" />
      <FiChevronDown aria-hidden="true" />
    </components.DropdownIndicator>
  );
}

const selectComponents = {
  DropdownIndicator,
  IndicatorSeparator: () => null,
};

function Resources() {
  const location = useLocation();

  const {
    resources,
    addToBasket,
    isLoadingResources,
    resourceError,
    reloadResources,
  } = useResources();

  const {
    requestWishlist,
    isWishlisted,
    isWishlistBusy,
  } = useWishlist();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "All";

  const [selectedType, setSelectedType] = useState("All");
  const [maxPrice, setMaxPrice] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [searchTerm, setSearchTerm] = useState("");

  const menuPortalTarget =
    typeof document !== "undefined" ? document.body : null;

  const categoryOptions = useMemo(() => {
    const categories = [
      ...new Set(
        resources
          .map((resource) => resource.category)
          .filter(Boolean)
      ),
    ].sort((first, second) => first.localeCompare(second));

    return [
      { label: "All categories", value: "All" },
      ...categories.map((category) => ({
        label: category,
        value: category,
      })),
    ];
  }, [resources]);

  const typeOptions = useMemo(() => {
    const types = [
      ...new Set(
        resources
          .map((resource) => resource.type)
          .filter(Boolean)
      ),
    ].sort((first, second) => first.localeCompare(second));

    return [
      { label: "All formats", value: "All" },
      ...types.map((type) => ({
        label: type,
        value: type,
      })),
    ];
  }, [resources]);

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
  };

  const filteredResources = useMemo(() => {
    let results = [...resources];

    if (selectedCategory !== "All") {
      results = results.filter(
        (item) => item.category === selectedCategory
      );
    }

    if (selectedType !== "All") {
      results = results.filter((item) => item.type === selectedType);
    }

    if (maxPrice !== "All") {
      results = results.filter(
        (item) => Number(item.price) <= Number(maxPrice)
      );
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (normalizedSearch) {
      results = results.filter((item) => {
        const searchableText = [
          item.title,
          item.category,
          item.type,
          item.author,
          item.shortDescription,
          item.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      });
    }

    if (sortBy === "featured") {
      results.sort(
        (first, second) =>
          Number(second.featured) - Number(first.featured) ||
          first.title.localeCompare(second.title)
      );
    }

    if (sortBy === "price-low") {
      results.sort(
        (first, second) => Number(first.price) - Number(second.price)
      );
    }

    if (sortBy === "price-high") {
      results.sort(
        (first, second) => Number(second.price) - Number(first.price)
      );
    }

    if (sortBy === "rating") {
      results.sort(
        (first, second) => Number(second.rating) - Number(first.rating)
      );
    }

    return results;
  }, [
    resources,
    selectedCategory,
    selectedType,
    maxPrice,
    sortBy,
    searchTerm,
  ]);

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedType !== "All" ||
    maxPrice !== "All" ||
    Boolean(searchTerm.trim());

  const commonSelectProps = {
    unstyled: true,
    classNamePrefix: "catalogue-select",
    components: selectComponents,
    isSearchable: false,
    menuPortalTarget,
    menuPosition: "fixed",
    menuShouldScrollIntoView: false,
    styles: selectPortalStyles,
  };

  return (
    <main className="catalogue-page">
      <div className="container">
        <header className="catalogue-header">
          <div>
            <span className="catalogue-eyebrow">SkillVault library</span>

            <h1>Find a resource worth using.</h1>
          </div>

          <p>
            {filteredResources.length} resource
            {filteredResources.length === 1 ? "" : "s"} available
          </p>
        </header>

        <section
          className="catalogue-filter-panel"
          aria-label="Resource filters"
        >
          <label className="catalogue-search">
            <FiSearch aria-hidden="true" />

            <input
              type="search"
              placeholder="Search guides, templates, topics..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
              >
                <FiX aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="catalogue-select-field">
            <span>Category</span>

            <Select
              {...commonSelectProps}
              options={categoryOptions}
              value={categoryOptions.find(
                (option) => option.value === selectedCategory
              )}
              onChange={(option) =>
                handleCategoryChange(option?.value || "All")
              }
              aria-label="Filter by category"
            />
          </div>

          <div className="catalogue-select-field">
            <span>Format</span>

            <Select
              {...commonSelectProps}
              options={typeOptions}
              value={typeOptions.find(
                (option) => option.value === selectedType
              )}
              onChange={(option) => setSelectedType(option?.value || "All")}
              aria-label="Filter by resource format"
            />
          </div>

          <div className="catalogue-select-field">
            <span>Price</span>

            <Select
              {...commonSelectProps}
              options={priceOptions}
              value={priceOptions.find(
                (option) => option.value === maxPrice
              )}
              onChange={(option) => setMaxPrice(option?.value || "All")}
              aria-label="Filter by price"
            />
          </div>

          <div className="catalogue-select-field">
            <span>Sort</span>

            <Select
              {...commonSelectProps}
              options={sortOptions}
              value={sortOptions.find(
                (option) => option.value === sortBy
              )}
              onChange={(option) =>
                setSortBy(option?.value || "featured")
              }
              aria-label="Sort resources"
            />
          </div>
        </section>

        <div className="catalogue-results-bar">
          <span>
            Showing {filteredResources.length} of {resources.length}
          </span>

          {hasActiveFilters && (
            <button type="button" onClick={resetFilters}>
              Reset filters
              <FiX aria-hidden="true" />
            </button>
          )}
        </div>

        {resourceError && (
          <div className="catalogue-message" role="status">
            <div>
              <strong>The live catalogue could not be refreshed.</strong>
              <span>
                SkillVault is showing the local fallback catalogue for now.
              </span>
            </div>

            <button
              type="button"
              onClick={reloadResources}
              disabled={isLoadingResources}
            >
              <FiRefreshCcw aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {isLoadingResources && (
          <div className="catalogue-loading" role="status">
            <span className="catalogue-spinner" aria-hidden="true" />
            Refreshing the SkillVault catalogue...
          </div>
        )}

        <section className="catalogue-grid" aria-live="polite">
          {filteredResources.map((resource) => {
            const description =
              resource.shortDescription ||
              resource.description ||
              "A practical digital resource from SkillVault.";

            const hasDiscount =
              Number(resource.oldPrice) > Number(resource.price);

            const hasHoverImage =
              resource.hoverImage &&
              resource.hoverImage !== resource.image;

            const wishlisted = isWishlisted(resource.id);
            const wishlistBusy = isWishlistBusy(resource.id);

            return (
              <article
                className="catalogue-card"
                key={resource.id || resource.slug}
              >
                <div className="catalogue-card-image">
                  <Link
                    to={`/product/${resource.slug}`}
                    className="catalogue-card-image-link"
                    aria-label={`View ${resource.title}`}
                  >
                    {resource.image ? (
                      <img
                        src={resource.image}
                        alt={resource.title}
                        className="catalogue-card-main-image"
                      />
                    ) : (
                      <span className="catalogue-image-placeholder">
                        <FiImage aria-hidden="true" />
                      </span>
                    )}

                    {hasHoverImage && (
                      <img
                        src={resource.hoverImage}
                        alt=""
                        aria-hidden="true"
                        className="catalogue-card-hover-image"
                      />
                    )}
                  </Link>

                  {resource.badge && (
                    <span className="catalogue-card-badge">
                      {resource.badge}
                    </span>
                  )}

                  <div className="catalogue-card-icons">
                    <Link
                      to={`/product/${resource.slug}`}
                      aria-label={`Preview ${resource.title}`}
                    >
                      <FiEye aria-hidden="true" />
                    </Link>

                    <button
                      type="button"
                      className={wishlisted ? "is-active" : ""}
                      onClick={() =>
                        requestWishlist(
                          resource,
                          `${location.pathname}${location.search}`
                        )
                      }
                      aria-label={
                        wishlisted
                          ? `Remove ${resource.title} from wishlist`
                          : `Add ${resource.title} to wishlist`
                      }
                      aria-pressed={wishlisted}
                      disabled={wishlistBusy}
                    >
                      {wishlistBusy ? (
                        <FiRefreshCcw
                          className="catalogue-wishlist-spinner"
                          aria-hidden="true"
                        />
                      ) : (
                        <FiHeart aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="catalogue-card-body">
                  <span className="catalogue-card-category">
                    {resource.category}
                    {resource.type ? ` / ${resource.type}` : ""}
                  </span>

                  <h2>
                    <Link to={`/product/${resource.slug}`}>
                      {resource.title}
                    </Link>
                  </h2>

                  <p>{description}</p>

                  <div className="catalogue-card-meta">
                    <RatingStars rating={resource.rating} />

                    <div className="catalogue-card-price">
                      <strong>{formatMoney(resource.price)}</strong>

                      {hasDiscount && (
                        <del>{formatMoney(resource.oldPrice)}</del>
                      )}
                    </div>
                  </div>

                  <div className="catalogue-card-actions">
                    <Link to={`/product/${resource.slug}`}>
                      View details
                    </Link>

                    <button
                      type="button"
                      onClick={() => addToBasket(resource)}
                    >
                      <FiShoppingBag aria-hidden="true" />
                      Add to basket
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {!isLoadingResources && filteredResources.length === 0 && (
          <div className="catalogue-empty">
            <FiSearch aria-hidden="true" />

            <h2>No matching resources</h2>

            <p>
              Adjust the search or filters to explore a different part of the
              library.
            </p>

            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Resources;
