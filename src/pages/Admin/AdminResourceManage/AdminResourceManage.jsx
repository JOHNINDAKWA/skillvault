import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiFileText,
  FiImage,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { resources } from "../../../data/resources.js";
import "./AdminResourceManage.css";

const emptyResource = {
  title: "",
  slug: "",
  badge: "New",
  category: "Career",
  type: "Playbook",
  price: "",
  oldPrice: "",
  rating: "5.0",
  reviewCount: "",
  status: "Draft",
  shortDescription: "",
  description: "",
  image: "",
  gallery: ["", "", "", ""],
  benefits: ["Instant access after purchase", "Read online from your library", "Practical PDF-style resource"],
  included: ["Digital PDF resource", "Step-by-step guide", "Templates or checklists where applicable"],
  reviews: ["Very practical and easy to use."],
  fileName: "",
  featured: false,
};

function AdminResourceManage() {
  const { slug } = useParams();
  const isNewResource = !slug;

  const selectedResource = useMemo(() => {
    return resources.find((item) => item.slug === slug);
  }, [slug]);

  const [formData, setFormData] = useState(() => {
    if (selectedResource) {
      return {
        title: selectedResource.title || "",
        slug: selectedResource.slug || "",
        badge: selectedResource.badge || "New",
        category: selectedResource.category || "Career",
        type: selectedResource.type || "Playbook",
        price: selectedResource.price || "",
        oldPrice: selectedResource.oldPrice || "",
        rating: selectedResource.rating || "5.0",
        reviewCount: selectedResource.reviewCount || selectedResource.reviewsCount || "5",
        status: "Published",
        shortDescription:
          selectedResource.shortDescription ||
          selectedResource.description ||
          "",
        description: selectedResource.description || "",
        image: selectedResource.image || "",
        gallery:
          selectedResource.gallery ||
          selectedResource.images ||
          [
            selectedResource.image || "",
            selectedResource.image2 || "",
            selectedResource.image3 || "",
            selectedResource.image4 || "",
          ],
        benefits:
          selectedResource.benefits ||
          selectedResource.highlights ||
          [
            "Instant access after purchase",
            "Read online from your library",
            "Practical PDF-style resource",
          ],
        included:
          selectedResource.included ||
          selectedResource.whatsIncluded ||
          [
            "Digital PDF resource",
            "Step-by-step guide",
            "Templates or checklists where applicable",
          ],
        reviews:
          selectedResource.reviews ||
          ["Very practical and easy to use."],
        fileName: selectedResource.fileName || "Maternal-Massage-Training.pdf",
        featured: Boolean(selectedResource.featured),
      };
    }

    return emptyResource;
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (fieldName, index, value) => {
    setFormData((currentData) => {
      const updatedItems = [...currentData[fieldName]];
      updatedItems[index] = value;

      return {
        ...currentData,
        [fieldName]: updatedItems,
      };
    });
  };

  const addArrayItem = (fieldName) => {
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: [...currentData[fieldName], ""],
    }));
  };

  const removeArrayItem = (fieldName, index) => {
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: currentData[fieldName].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleMainImageFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      image: `/src/assets/images/${file.name}`,
    }));
  };

  const handleGalleryFile = (event, index) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    handleArrayChange("gallery", index, `/src/assets/images/${file.name}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      price: Number(formData.price),
      oldPrice: Number(formData.oldPrice),
      rating: Number(formData.rating),
      reviewCount: Number(formData.reviewCount),
      gallery: formData.gallery.filter(Boolean),
      benefits: formData.benefits.filter(Boolean),
      included: formData.included.filter(Boolean),
      reviews: formData.reviews.filter(Boolean),
    };

    console.log("Resource saved:", payload);
  };

  return (
    <section className="admin-resource-manage-page">
      <div className="admin-resource-manage-topbar">
        <Link to="/admin/resources">
          <FiArrowLeft />
          Resources
        </Link>

        <div className="admin-resource-manage-actions">
          {!isNewResource && selectedResource && (
            <Link to={`/product/${selectedResource.slug}`}>
              <FiEye />
              Preview
            </Link>
          )}

          {!isNewResource && (
            <button type="button" className="admin-danger-btn">
              <FiTrash2 />
              Delete
            </button>
          )}

          <button type="submit" form="resourceManageForm">
            <FiSave />
            Save Resource
          </button>
        </div>
      </div>

      <div className="admin-resource-manage-hero">
        <div>
          <span>{isNewResource ? "New Resource" : "Manage Resource"}</span>

          <h1>{isNewResource ? "Add digital resource" : "Edit resource"}</h1>

          <p>
            Manage the same content your public product page uses: cover image,
            gallery images, pricing, rating, description, benefits, included
            content, reviews, and PDF access.
          </p>
        </div>

        <div className={`admin-resource-status-pill ${formData.status.toLowerCase()}`}>
          <FiCheckCircle />
          {formData.status}
        </div>
      </div>

      <form
        id="resourceManageForm"
        className="admin-resource-manage-grid"
        onSubmit={handleSubmit}
      >
        <div className="admin-resource-form-panel">
          <div className="admin-resource-panel-heading">
            <div>
              <span>Product Page Content</span>
              <h2>Basic information</h2>
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="admin-form-field admin-form-field-full">
              <span>Resource Title</span>

              <input
                type="text"
                name="title"
                placeholder="The Kenya Job Interview Playbook"
                value={formData.title}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field admin-form-field-full">
              <span>Slug</span>

              <input
                type="text"
                name="slug"
                placeholder="kenya-job-interview-playbook"
                value={formData.slug}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field">
              <span>Badge</span>

              <input
                type="text"
                name="badge"
                placeholder="New"
                value={formData.badge}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field">
              <span>Status</span>

              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Category</span>

              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Business">Business</option>
                <option value="Money">Money</option>
                <option value="Parenting">Parenting</option>
                <option value="Health">Health</option>
                <option value="Career">Career</option>
                <option value="Templates">Templates</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Type</span>

              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Guide">Guide</option>
                <option value="Book">Book</option>
                <option value="Template">Template</option>
                <option value="Workbook">Workbook</option>
                <option value="Checklist">Checklist</option>
                <option value="Playbook">Playbook</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Price</span>

              <input
                type="number"
                name="price"
                placeholder="249"
                value={formData.price}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field">
              <span>Old Price</span>

              <input
                type="number"
                name="oldPrice"
                placeholder="399"
                value={formData.oldPrice}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field">
              <span>Rating</span>

              <input
                type="number"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                placeholder="5.0"
                value={formData.rating}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field">
              <span>Review Count</span>

              <input
                type="number"
                name="reviewCount"
                placeholder="5"
                value={formData.reviewCount}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-check">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />

              <span>Feature this resource</span>
            </label>

            <label className="admin-form-field admin-form-field-full">
              <span>Short Product Summary</span>

              <textarea
                name="shortDescription"
                rows="4"
                placeholder="This appears near the price and rating on the product page."
                value={formData.shortDescription}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field admin-form-field-full">
              <span>Full Description</span>

              <textarea
                name="description"
                rows="7"
                placeholder="This appears under the Description tab."
                value={formData.description}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="admin-resource-panel-heading admin-resource-section-heading">
            <div>
              <span>Product Images</span>
              <h2>Cover and gallery</h2>
            </div>
          </div>

          <div className="admin-image-manager">
            <div className="admin-main-image-box">
              <div className="admin-image-preview">
                {formData.image ? (
                  <img src={formData.image} alt={formData.title || "Main cover"} />
                ) : (
                  <FiImage />
                )}
              </div>

              <div className="admin-image-fields">
                <label className="admin-form-field">
                  <span>Main Image Path</span>

                  <input
                    type="text"
                    name="image"
                    placeholder="/src/assets/images/cover.png"
                    value={formData.image}
                    onChange={handleChange}
                  />
                </label>

                <label className="admin-file-picker">
                  <FiUploadCloud />
                  Choose Main Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageFile}
                  />
                </label>
              </div>
            </div>

            <div className="admin-gallery-list">
              {formData.gallery.map((imagePath, index) => (
                <div className="admin-gallery-item" key={`gallery-${index}`}>
                  <div className="admin-gallery-preview">
                    {imagePath ? <img src={imagePath} alt={`Gallery ${index + 1}`} /> : <FiImage />}
                  </div>

                  <div className="admin-gallery-fields">
                    <label className="admin-form-field">
                      <span>Gallery Image {index + 1}</span>

                      <input
                        type="text"
                        placeholder="/src/assets/images/gallery-image.png"
                        value={imagePath}
                        onChange={(event) =>
                          handleArrayChange("gallery", index, event.target.value)
                        }
                      />
                    </label>

                    <div className="admin-gallery-buttons">
                      <label className="admin-small-file-picker">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleGalleryFile(event, index)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => removeArrayItem("gallery", index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="admin-add-line-btn"
                onClick={() => addArrayItem("gallery")}
              >
                <FiPlus />
                Add Gallery Image
              </button>
            </div>
          </div>

          <div className="admin-resource-panel-heading admin-resource-section-heading">
            <div>
              <span>Sales Content</span>
              <h2>Benefits, included content, and reviews</h2>
            </div>
          </div>

          <div className="admin-list-editor-grid">
            <div className="admin-list-editor">
              <div className="admin-list-editor-heading">
                <h3>Purchase Benefits</h3>

                <button type="button" onClick={() => addArrayItem("benefits")}>
                  <FiPlus />
                  Add
                </button>
              </div>

              {formData.benefits.map((benefit, index) => (
                <div className="admin-line-input" key={`benefit-${index}`}>
                  <input
                    type="text"
                    value={benefit}
                    onChange={(event) =>
                      handleArrayChange("benefits", index, event.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() => removeArrayItem("benefits", index)}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>

            <div className="admin-list-editor">
              <div className="admin-list-editor-heading">
                <h3>What's Included</h3>

                <button type="button" onClick={() => addArrayItem("included")}>
                  <FiPlus />
                  Add
                </button>
              </div>

              {formData.included.map((item, index) => (
                <div className="admin-line-input" key={`included-${index}`}>
                  <input
                    type="text"
                    value={item}
                    onChange={(event) =>
                      handleArrayChange("included", index, event.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() => removeArrayItem("included", index)}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>

            <div className="admin-list-editor admin-list-editor-full">
              <div className="admin-list-editor-heading">
                <h3>Reviews</h3>

                <button type="button" onClick={() => addArrayItem("reviews")}>
                  <FiPlus />
                  Add
                </button>
              </div>

              {formData.reviews.map((review, index) => (
                <div className="admin-line-input" key={`review-${index}`}>
                  <input
                    type="text"
                    value={review}
                    onChange={(event) =>
                      handleArrayChange("reviews", index, event.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() => removeArrayItem("reviews", index)}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="admin-resource-side-panel">
          <div className="admin-resource-preview-card">
            <div className="admin-resource-preview-image">
              {formData.image ? (
                <img src={formData.image} alt={formData.title || "Resource"} />
              ) : (
                <FiImage />
              )}
            </div>

            <div className="admin-resource-preview-content">
              <em>{formData.badge || "New"}</em>

              <span>
                {formData.category || "Category"} / {formData.type || "Type"}
              </span>

              <h3>{formData.title || "Resource title preview"}</h3>

              <p>
                {formData.shortDescription ||
                  "A short product summary will appear here."}
              </p>

              <strong>
                {formData.price
                  ? `KSh ${Number(formData.price).toLocaleString()}`
                  : "KSh 0"}
              </strong>
            </div>
          </div>

          <div className="admin-resource-upload-card">
            <div className="admin-resource-upload-heading">
              <FiFileText />

              <div>
                <span>Resource File</span>
                <h3>PDF document</h3>
              </div>
            </div>

            <label className="admin-form-field">
              <span>PDF File Name / Path</span>

              <input
                type="text"
                name="fileName"
                placeholder="Maternal-Massage-Training.pdf"
                value={formData.fileName}
                onChange={handleChange}
              />
            </label>

            <label className="admin-file-picker admin-file-picker-full">
              <FiUploadCloud />
              Choose PDF
              <input type="file" accept="application/pdf" />
            </label>

            <p>
              For now, this stores the file reference. Later it should upload to
              secure storage and save a protected URL.
            </p>
          </div>

          <div className="admin-resource-upload-card">
            <div className="admin-resource-upload-heading">
              <FiCheckCircle />

              <div>
                <span>Client Side Match</span>
                <h3>Fields covered</h3>
              </div>
            </div>

            <ul className="admin-field-checklist">
              <li>Main image</li>
              <li>Gallery images</li>
              <li>Title, category, type</li>
              <li>Rating and reviews</li>
              <li>Price and old price</li>
              <li>Description tabs content</li>
              <li>PDF file reference</li>
            </ul>
          </div>
        </aside>
      </form>
    </section>
  );
}

export default AdminResourceManage;