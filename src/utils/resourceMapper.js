export function normalizeRemoteResource(
  resource,
  localFallback = null
) {
  const galleryUrls = (
    resource.gallery || []
  )
    .map((image) => image?.url)
    .filter(Boolean);

  const fallbackGallery =
    Array.isArray(
      localFallback?.gallery
    )
      ? localFallback.gallery
      : [];

  const image =
    resource.coverImage?.url ||
    localFallback?.image ||
    "";

  const hoverImage =
    galleryUrls[0] ||
    resource.coverImage?.url ||
    localFallback?.hoverImage ||
    localFallback?.image ||
    "";

  return {
    id: resource.id,
    slug: resource.slug,
    badge:
      resource.badge ||
      localFallback?.badge ||
      "",

    title: resource.title,
    category: resource.category,
    type: resource.type,
    author:
      resource.author ||
      localFallback?.author ||
      "SkillVault Resource Desk",

    price: Number(
      resource.price || 0
    ),

    oldPrice:
      resource.oldPrice === null ||
      resource.oldPrice === undefined
        ? Number(
            localFallback?.oldPrice ||
              resource.price ||
              0
          )
        : Number(
            resource.oldPrice
          ),

    rating: Number(
      resource.rating || 0
    ),

    reviewCount: Number(
      resource.reviewCount || 0
    ),

    image,
    hoverImage,

    gallery:
      galleryUrls.length > 0
        ? galleryUrls
        : fallbackGallery,

    shortDescription:
      resource.shortDescription ||
      localFallback?.shortDescription ||
      localFallback?.description ||
      "",

    description:
      resource.description ||
      localFallback?.description ||
      "",

    benefits:
      Array.isArray(
        resource.benefits
      )
        ? resource.benefits
        : [],

    included:
      Array.isArray(
        resource.included
      )
        ? resource.included
        : [],

    reviews:
      Array.isArray(
        resource.reviews
      )
        ? resource.reviews
        : [],

    featured:
      Boolean(
        resource.featured
      ),

    status:
      resource.status,

    pdfFile:
      resource.pdfFile || {
        name: null,
        path: null,
      },

    createdAt:
      resource.createdAt,

    updatedAt:
      resource.updatedAt,
  };
}
