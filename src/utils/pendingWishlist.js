const PENDING_WISHLIST_KEY =
  "skillvault_pending_wishlist_v1";

export function savePendingWishlist({
  resource,
  returnTo,
}) {
  const pendingItem = {
    resourceId:
      resource.id,
    slug:
      resource.slug,
    title:
      resource.title,
    returnTo:
      returnTo ||
      `/product/${resource.slug}`,
    createdAt:
      new Date()
        .toISOString(),
  };

  window.sessionStorage.setItem(
    PENDING_WISHLIST_KEY,
    JSON.stringify(
      pendingItem
    )
  );

  return pendingItem;
}

export function readPendingWishlist() {
  try {
    const value =
      window.sessionStorage.getItem(
        PENDING_WISHLIST_KEY
      );

    if (!value) {
      return null;
    }

    const parsed =
      JSON.parse(
        value
      );

    if (
      !parsed?.resourceId ||
      !parsed?.slug
    ) {
      clearPendingWishlist();
      return null;
    }

    return parsed;
  } catch {
    clearPendingWishlist();
    return null;
  }
}

export function clearPendingWishlist() {
  window.sessionStorage.removeItem(
    PENDING_WISHLIST_KEY
  );
}
