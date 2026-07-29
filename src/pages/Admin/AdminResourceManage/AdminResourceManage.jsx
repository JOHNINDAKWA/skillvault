import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiChevronRight,
  FiEye,
  FiFileText,
  FiImage,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { adminResourceService } from "../../../services/adminResourceService.js";

import "./AdminResourceManage.css";

const emptyResource = {
  id: null,
  title: "",
  slug: "",
  badge: "New",
  category: "Career",
  type: "Playbook",
  author: "SkillVault Resource Desk",
  price: "",
  oldPrice: "",
  rating: "5",
  reviewCount: "0",
  status: "draft",
  shortDescription: "",
  description: "",
  coverImage: {
    url: null,
    path: null,
  },
  gallery: [],
  benefits: [
    "Instant access after purchase",
    "Read online from your library",
    "Practical PDF-style resource",
  ],
  included: [
    "Digital PDF resource",
    "Step-by-step guide",
    "Templates or checklists where applicable",
  ],
  reviews: [
    "Very practical and easy to use.",
  ],
  pdfFile: {
    name: null,
    path: null,
  },
  featured: false,
};

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function statusLabel(status) {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatMoney(value) {
  return `KSh ${Number(value || 0).toLocaleString("en-US")}`;
}

function AdminResourceManage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const isNewResource = !slug;

  const [formData, setFormData] = useState(emptyResource);
  const [isLoading, setIsLoading] = useState(!isNewResource);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);

  const slugEditedManually = useRef(false);
  const previewUrls = useRef(new Set());

  useEffect(() => {
    if (isNewResource) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function loadResource() {
      try {
        const response = await adminResourceService.getResource(slug);
        const resource = response.data.resource;

        if (isMounted) {
          setFormData({
            ...emptyResource,
            ...resource,
            price: String(resource.price),
            oldPrice:
              resource.oldPrice === null
                ? ""
                : String(resource.oldPrice),
            rating: String(resource.rating),
            reviewCount: String(resource.reviewCount),
          });
        }
      } catch (error) {
        if (isMounted) {
          setPageError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadResource();

    return () => {
      isMounted = false;
    };
  }, [isNewResource, slug]);

  useEffect(() => {
    return () => {
      for (const previewUrl of previewUrls.current) {
        URL.revokeObjectURL(previewUrl);
      }

      previewUrls.current.clear();
    };
  }, []);

  const mainImageSource =
    mainImagePreview || formData.coverImage?.url || "";

  const galleryDisplayItems = useMemo(() => {
    const stored = (formData.gallery || []).map((image) => ({
      kind: "stored",
      image,
    }));

    const pending = galleryFiles.map((item) => ({
      kind: "pending",
      image: {
        url: item.previewUrl,
        path: null,
      },
      fileId: item.id,
    }));

    return [...stored, ...pending];
  }, [formData.gallery, galleryFiles]);

  const completedSections = useMemo(() => {
    let completed = 0;

    if (
      formData.title.trim() &&
      formData.slug.trim() &&
      formData.author.trim()
    ) {
      completed += 1;
    }

    if (
      formData.price !== "" &&
      formData.shortDescription.trim() &&
      formData.description.trim()
    ) {
      completed += 1;
    }

    if (mainImageSource) {
      completed += 1;
    }

    if (
      formData.benefits.some((item) => item.trim()) &&
      formData.included.some((item) => item.trim())
    ) {
      completed += 1;
    }

    if (pdfFile || formData.pdfFile?.name) {
      completed += 1;
    }

    return completed;
  }, [
    formData,
    mainImageSource,
    pdfFile,
  ]);

  const completionPercent = Math.round(
    (completedSections / 5) * 100
  );

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    if (name === "slug") {
      slugEditedManually.current = true;
    }

    setFormData((currentData) => {
      const updated = {
        ...currentData,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      if (
        name === "title" &&
        isNewResource &&
        !slugEditedManually.current
      ) {
        updated.slug = createSlug(value);
      }

      return updated;
    });

    setPageError("");
    setSuccessMessage("");
  };

  const handleArrayChange = (
    fieldName,
    index,
    value
  ) => {
    setFormData((currentData) => {
      const updatedItems = [
        ...currentData[fieldName],
      ];

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
      [fieldName]: [
        ...currentData[fieldName],
        "",
      ],
    }));
  };

  const removeArrayItem = (
    fieldName,
    index
  ) => {
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]:
        currentData[fieldName].filter(
          (_, itemIndex) => itemIndex !== index
        ),
    }));
  };

  const handleMainImageFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
      previewUrls.current.delete(mainImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    previewUrls.current.add(previewUrl);

    setMainImageFile(file);
    setMainImagePreview(previewUrl);
  };

  const handleGalleryFiles = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const additions = selectedFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);

      previewUrls.current.add(previewUrl);

      return {
        id: crypto.randomUUID(),
        file,
        previewUrl,
      };
    });

    setGalleryFiles((currentFiles) => [
      ...currentFiles,
      ...additions,
    ]);

    event.target.value = "";
  };

  const removeGalleryItem = (
    item,
    index
  ) => {
    if (item.kind === "stored") {
      setFormData((currentData) => ({
        ...currentData,
        gallery: currentData.gallery.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      }));

      return;
    }

    setGalleryFiles((currentFiles) =>
      currentFiles.filter((fileItem) => {
        if (fileItem.id === item.fileId) {
          URL.revokeObjectURL(fileItem.previewUrl);
          previewUrls.current.delete(fileItem.previewUrl);

          return false;
        }

        return true;
      })
    );
  };

  const handlePdfFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPdfFile(file);
  };

  const uploadPendingFiles = async () => {
    let coverImage = formData.coverImage || {
      url: null,
      path: null,
    };

    if (mainImageFile) {
      const response =
        await adminResourceService.uploadImage(
          mainImageFile
        );

      coverImage = response.data.image;
    }

    const uploadedGallery = await Promise.all(
      galleryFiles.map(async (item) => {
        const response =
          await adminResourceService.uploadImage(
            item.file
          );

        return response.data.image;
      })
    );

    let storedPdf = formData.pdfFile || {
      name: null,
      path: null,
    };

    if (pdfFile) {
      const response =
        await adminResourceService.uploadPdf(pdfFile);

      storedPdf = response.data.file;
    }

    return {
      coverImage,
      gallery: [
        ...(formData.gallery || []),
        ...uploadedGallery,
      ],
      pdfFile: storedPdf,
    };
  };

  const buildPayload = (uploadedFiles) => ({
    title: formData.title.trim(),
    slug: formData.slug.trim(),
    badge: formData.badge.trim() || null,
    category: formData.category,
    type: formData.type,
    author: formData.author.trim(),
    price: Number(formData.price),
    oldPrice:
      formData.oldPrice === ""
        ? null
        : Number(formData.oldPrice),
    rating: Number(formData.rating),
    reviewCount: Number(formData.reviewCount),
    status: formData.status,
    shortDescription:
      formData.shortDescription.trim() || null,
    description:
      formData.description.trim() || null,
    coverImage: uploadedFiles.coverImage,
    gallery: uploadedFiles.gallery,
    benefits: formData.benefits
      .map((item) => item.trim())
      .filter(Boolean),
    included: formData.included
      .map((item) => item.trim())
      .filter(Boolean),
    reviews: formData.reviews
      .map((item) => item.trim())
      .filter(Boolean),
    pdfFile: uploadedFiles.pdfFile,
    featured: formData.featured,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    setPageError("");
    setSuccessMessage("");

    try {
      const uploadedFiles = await uploadPendingFiles();
      const payload = buildPayload(uploadedFiles);

      const response = isNewResource
        ? await adminResourceService.createResource(payload)
        : await adminResourceService.updateResource(
            formData.id,
            payload
          );

      const savedResource = response.data.resource;

      setFormData({
        ...emptyResource,
        ...savedResource,
        price: String(savedResource.price),
        oldPrice:
          savedResource.oldPrice === null
            ? ""
            : String(savedResource.oldPrice),
        rating: String(savedResource.rating),
        reviewCount: String(savedResource.reviewCount),
      });

      setMainImageFile(null);

      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
        previewUrls.current.delete(mainImagePreview);
      }

      setMainImagePreview("");

      for (const item of galleryFiles) {
        URL.revokeObjectURL(item.previewUrl);
        previewUrls.current.delete(item.previewUrl);
      }

      setGalleryFiles([]);
      setPdfFile(null);
      setSuccessMessage(response.message);

      if (isNewResource) {
        navigate(
          `/admin/resources/${savedResource.slug}/edit`,
          {
            replace: true,
          }
        );
      }
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!formData.id) {
      return;
    }

    setIsDeleting(true);
    setPageError("");

    try {
      await adminResourceService.deleteResource(
        formData.id
      );

      navigate("/admin/resources", {
        replace: true,
      });
    } catch (error) {
      setPageError(error.message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <section
        className="arm-loading"
        role="status"
        aria-live="polite"
      >
        <span className="arm-spinner" aria-hidden="true" />
        <h1>Loading resource</h1>
        <p>Please wait while the resource details are prepared.</p>
      </section>
    );
  }

  return (
    <main className="arm-page">
      <div className="arm-topbar">
        <Link to="/admin/resources" className="arm-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to resources
        </Link>

        <div className="arm-topbar-actions">
          {!isNewResource &&
            formData.status === "published" && (
              <Link
                to={`/product/${formData.slug}`}
                className="arm-preview-link"
              >
                <FiEye aria-hidden="true" />
                Preview
              </Link>
            )}

          {!isNewResource && (
            <button
              type="button"
              className="arm-delete-button"
              onClick={() => setShowDeleteModal(true)}
            >
              <FiTrash2 aria-hidden="true" />
              Delete
            </button>
          )}

          <button
            type="submit"
            form="resourceManageForm"
            className="arm-save-button"
            disabled={isSaving}
          >
            {isSaving ? (
              <span
                className="arm-spinner arm-spinner-light"
                aria-hidden="true"
              />
            ) : (
              <FiSave aria-hidden="true" />
            )}

            {isSaving ? "Saving..." : "Save resource"}
          </button>
        </div>
      </div>

      {pageError && (
        <div className="arm-message arm-message-error" role="alert">
          <span>{pageError}</span>
          <button
            type="button"
            onClick={() => setPageError("")}
            aria-label="Dismiss error"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="arm-message arm-message-success" role="status">
          <FiCheckCircle aria-hidden="true" />
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success message"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="arm-hero">
        <div>
          <span>
            {isNewResource
              ? "New resource"
              : "Resource editor"}
          </span>

          <h1>
            {isNewResource
              ? "Add a digital resource"
              : "Edit resource"}
          </h1>

          <p>
            Manage product content, pricing, images, customer benefits,
            publishing status, and the protected PDF file.
          </p>
        </div>

        <div className="arm-hero-status">
          <span
            className={`arm-status arm-status-${formData.status}`}
          >
            <span aria-hidden="true" />
            {statusLabel(formData.status)}
          </span>

          <div className="arm-completion">
            <div>
              <span>Completion</span>
              <strong>{completionPercent}%</strong>
            </div>

            <span className="arm-completion-track">
              <span
                style={{
                  width: `${completionPercent}%`,
                }}
              />
            </span>
          </div>
        </div>
      </section>

      <form
        id="resourceManageForm"
        className="arm-layout"
        onSubmit={handleSubmit}
      >
        <div className="arm-main">
          <section
            className="arm-section"
            id="basic-information"
          >
            <div className="arm-section-heading">
              <span>01</span>

              <div>
                <h2>Basic information</h2>
                <p>
                  Add the core catalogue details that customers will see
                  when browsing this resource.
                </p>
              </div>
            </div>

            <div className="arm-form-grid">
              <label className="arm-field arm-field-full">
                <span>Resource title</span>

                <input
                  type="text"
                  name="title"
                  placeholder="The Kenya Job Interview Playbook"
                  value={formData.title}
                  onChange={handleChange}
                  minLength="2"
                  disabled={isSaving}
                  required
                />
              </label>

              <label className="arm-field arm-field-full">
                <span>Slug</span>

                <div className="arm-input-prefix">
                  <span>/product/</span>

                  <input
                    type="text"
                    name="slug"
                    placeholder="kenya-job-interview-playbook"
                    value={formData.slug}
                    onChange={handleChange}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    disabled={isSaving}
                    required
                  />
                </div>
              </label>

              <label className="arm-field">
                <span>Badge</span>

                <input
                  type="text"
                  name="badge"
                  placeholder="New"
                  value={formData.badge}
                  onChange={handleChange}
                  disabled={isSaving}
                />
              </label>

              <label className="arm-field">
                <span>Status</span>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <label className="arm-field">
                <span>Category</span>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="Career">Career</option>
                  <option value="Business">Business</option>
                  <option value="Money">Money</option>
                  <option value="AI">AI</option>
                  <option value="Education">Education</option>
                  <option value="Templates">Templates</option>
                  <option value="Health">Health</option>
                  <option value="Parenting">Parenting</option>
                </select>
              </label>

              <label className="arm-field">
                <span>Type</span>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="Guide">Guide</option>
                  <option value="Book">Book</option>
                  <option value="Template">Template</option>
                  <option value="Workbook">Workbook</option>
                  <option value="Checklist">Checklist</option>
                  <option value="Playbook">Playbook</option>
                  <option value="Toolkit">Toolkit</option>
                  <option value="Planner">Planner</option>
                  <option value="Bundle">Bundle</option>
                </select>
              </label>

              <label className="arm-field arm-field-full">
                <span>Author or desk</span>

                <input
                  type="text"
                  name="author"
                  placeholder="SkillVault Resource Desk"
                  value={formData.author}
                  onChange={handleChange}
                  disabled={isSaving}
                  required
                />
              </label>

              <label className="arm-feature-toggle arm-field-full">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  disabled={isSaving}
                />

                <span className="arm-toggle">
                  <span />
                </span>

                <span>
                  <strong>Feature this resource</strong>
                  <small>
                    Highlight it in featured areas across the store.
                  </small>
                </span>
              </label>
            </div>
          </section>

          <section className="arm-section" id="pricing-content">
            <div className="arm-section-heading">
              <span>02</span>

              <div>
                <h2>Pricing and sales content</h2>
                <p>
                  Set the selling price and write the product copy shown
                  on the public resource page.
                </p>
              </div>
            </div>

            <div className="arm-form-grid">
              <label className="arm-field">
                <span>Price</span>

                <div className="arm-input-prefix arm-money-input">
                  <span>KSh</span>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="1"
                    placeholder="249"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={isSaving}
                    required
                  />
                </div>
              </label>

              <label className="arm-field">
                <span>Old price</span>

                <div className="arm-input-prefix arm-money-input">
                  <span>KSh</span>

                  <input
                    type="number"
                    name="oldPrice"
                    min="0"
                    step="1"
                    placeholder="399"
                    value={formData.oldPrice}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>
              </label>

              <label className="arm-field">
                <span>Rating</span>

                <input
                  type="number"
                  name="rating"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                  disabled={isSaving}
                  required
                />
              </label>

              <label className="arm-field">
                <span>Review count</span>

                <input
                  type="number"
                  name="reviewCount"
                  min="0"
                  step="1"
                  value={formData.reviewCount}
                  onChange={handleChange}
                  disabled={isSaving}
                  required
                />
              </label>

              <label className="arm-field arm-field-full">
                <span>Short product summary</span>

                <textarea
                  name="shortDescription"
                  rows="4"
                  placeholder="Write a concise summary that explains the value of this resource."
                  value={formData.shortDescription}
                  onChange={handleChange}
                  disabled={isSaving}
                />
              </label>

              <label className="arm-field arm-field-full">
                <span>Full description</span>

                <textarea
                  name="description"
                  rows="8"
                  placeholder="Write the full product description, audience, outcomes, and key details."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSaving}
                />
              </label>
            </div>
          </section>

          <section className="arm-section" id="images">
            <div className="arm-section-heading">
              <span>03</span>

              <div>
                <h2>Cover and gallery images</h2>
                <p>
                  Upload the main product cover and supporting gallery
                  images used on the public product page.
                </p>
              </div>
            </div>

            <div className="arm-cover-manager">
              <div className="arm-cover-preview">
                {mainImageSource ? (
                  <img
                    src={mainImageSource}
                    alt={formData.title || "Main cover"}
                  />
                ) : (
                  <span>
                    <FiImage aria-hidden="true" />
                    No cover image
                  </span>
                )}
              </div>

              <div className="arm-cover-details">
                <span>Main cover image</span>

                <h3>
                  {mainImageFile?.name ||
                    formData.coverImage?.path ||
                    "Choose a clear product cover"}
                </h3>

                <p>
                  Use a high-quality JPG, PNG, WEBP, or GIF file. The
                  image should remain clear on both desktop and mobile.
                </p>

                <label className="arm-upload-button">
                  <FiUploadCloud aria-hidden="true" />
                  Choose main image

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleMainImageFile}
                    disabled={isSaving}
                  />
                </label>
              </div>
            </div>

            <div className="arm-gallery-heading">
              <div>
                <h3>Gallery images</h3>
                <p>
                  Add supporting visuals, previews, and inside-page
                  samples.
                </p>
              </div>

              <label className="arm-secondary-upload">
                <FiPlus aria-hidden="true" />
                Add gallery images

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleGalleryFiles}
                  disabled={isSaving}
                />
              </label>
            </div>

            {galleryDisplayItems.length > 0 ? (
              <div className="arm-gallery-grid">
                {galleryDisplayItems.map((item, index) => (
                  <article
                    className="arm-gallery-item"
                    key={
                      item.kind === "stored"
                        ? item.image.path || item.image.url
                        : item.fileId
                    }
                  >
                    <img
                      src={item.image.url}
                      alt={`Gallery ${index + 1}`}
                    />

                    <div>
                      <span>
                        {item.kind === "stored"
                          ? "Uploaded"
                          : "Pending upload"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeGalleryItem(
                            item,
                            item.kind === "stored"
                              ? index
                              : index - formData.gallery.length
                          )
                        }
                        disabled={isSaving}
                        aria-label={`Remove gallery image ${index + 1}`}
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="arm-gallery-empty">
                <FiImage aria-hidden="true" />
                <p>No gallery images added yet.</p>
              </div>
            )}
          </section>

          <section className="arm-section" id="sales-content">
            <div className="arm-section-heading">
              <span>04</span>

              <div>
                <h2>Benefits, included content, and reviews</h2>
                <p>
                  Structure the supporting information customers use to
                  decide whether this resource is right for them.
                </p>
              </div>
            </div>

            <div className="arm-list-grid">
              {[
                ["benefits", "Purchase benefits"],
                ["included", "What is included"],
                ["reviews", "Customer reviews"],
              ].map(([fieldName, heading]) => (
                <div
                  className={`arm-list-editor ${
                    fieldName === "reviews"
                      ? "arm-list-editor-full"
                      : ""
                  }`}
                  key={fieldName}
                >
                  <div className="arm-list-editor-heading">
                    <div>
                      <h3>{heading}</h3>
                      <span>
                        {formData[fieldName].length} item
                        {formData[fieldName].length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => addArrayItem(fieldName)}
                      disabled={isSaving}
                    >
                      <FiPlus aria-hidden="true" />
                      Add item
                    </button>
                  </div>

                  <div className="arm-list-items">
                    {formData[fieldName].map((item, index) => (
                      <div
                        className="arm-list-item"
                        key={`${fieldName}-${index}`}
                      >
                        <span className="arm-list-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <input
                          type="text"
                          value={item}
                          onChange={(event) =>
                            handleArrayChange(
                              fieldName,
                              index,
                              event.target.value
                            )
                          }
                          disabled={isSaving}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem(fieldName, index)
                          }
                          disabled={isSaving}
                          aria-label={`Remove ${heading} item ${index + 1}`}
                        >
                          <FiX aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="arm-section" id="pdf-file">
            <div className="arm-section-heading">
              <span>05</span>

              <div>
                <h2>Protected PDF file</h2>
                <p>
                  Upload the private file customers receive after a
                  completed purchase.
                </p>
              </div>
            </div>

            <div className="arm-pdf-card">
              <span className="arm-pdf-icon">
                <FiFileText aria-hidden="true" />
              </span>

              <div>
                <span>Current file</span>

                <strong>
                  {pdfFile?.name ||
                    formData.pdfFile?.name ||
                    "No PDF uploaded"}
                </strong>

                <p>
                  The PDF is stored privately and becomes available only
                  after a successful payment.
                </p>
              </div>

              <label className="arm-upload-button">
                <FiUploadCloud aria-hidden="true" />
                Choose PDF

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfFile}
                  disabled={isSaving}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="arm-sidebar">
          <div className="arm-sidebar-card arm-preview-card">
            <div className="arm-sidebar-heading">
              <div>
                <span>Live preview</span>
                <h2>Product card</h2>
              </div>

              <FiEye aria-hidden="true" />
            </div>

            <div className="arm-preview-image">
              {mainImageSource ? (
                <img
                  src={mainImageSource}
                  alt={formData.title || "Resource"}
                />
              ) : (
                <FiImage aria-hidden="true" />
              )}
            </div>

            <div className="arm-preview-content">
              <div className="arm-preview-topline">
                <span>
                  {formData.category || "Category"} /{" "}
                  {formData.type || "Type"}
                </span>

                <em>{formData.badge || "New"}</em>
              </div>

              <h3>
                {formData.title || "Resource title preview"}
              </h3>

              <p>
                {formData.shortDescription ||
                  "A short product summary will appear here."}
              </p>

              <div className="arm-preview-price">
                <strong>{formatMoney(formData.price)}</strong>

                {formData.oldPrice && (
                  <del>
                    {formatMoney(formData.oldPrice)}
                  </del>
                )}
              </div>
            </div>
          </div>

          <nav
            className="arm-sidebar-card arm-section-nav"
            aria-label="Resource editor sections"
          >
            <div className="arm-sidebar-heading">
              <div>
                <span>Editor sections</span>
                <h2>Page structure</h2>
              </div>
            </div>

            {[
              ["basic-information", "Basic information"],
              ["pricing-content", "Pricing and content"],
              ["images", "Cover and gallery"],
              ["sales-content", "Sales content"],
              ["pdf-file", "Protected PDF"],
            ].map(([target, label], index) => (
              <a href={`#${target}`} key={target}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {label}
                <FiChevronRight aria-hidden="true" />
              </a>
            ))}
          </nav>

          <div className="arm-sidebar-card arm-checklist-card">
            <div className="arm-sidebar-heading">
              <div>
                <span>Storage status</span>
                <h2>Connected fields</h2>
              </div>

              <FiCheckCircle aria-hidden="true" />
            </div>

            <ul>
              {[
                "Database catalogue record",
                "Public cover image",
                "Public gallery images",
                "Private PDF file",
                "Publishing status",
                "Pricing and descriptions",
                "Benefits and reviews",
              ].map((item) => (
                <li key={item}>
                  <span>
                    <FiCheck aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </form>

      {showDeleteModal && (
        <div className="arm-modal-backdrop">
          <div
            className="arm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-delete-title"
          >
            <button
              type="button"
              className="arm-modal-close"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              aria-label="Close deletion confirmation"
            >
              <FiX aria-hidden="true" />
            </button>

            <span className="arm-modal-icon">
              <FiTrash2 aria-hidden="true" />
            </span>

            <span className="arm-modal-eyebrow">
              Delete resource
            </span>

            <h2 id="manage-delete-title">
              Delete {formData.title}?
            </h2>

            <p>
              The database record and all uploaded storage files will be
              removed permanently. This action cannot be undone.
            </p>

            <div className="arm-modal-actions">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="is-danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <span
                    className="arm-spinner arm-spinner-light"
                    aria-hidden="true"
                  />
                )}

                {isDeleting
                  ? "Deleting..."
                  : "Delete resource"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminResourceManage;
