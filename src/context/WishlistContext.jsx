import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  resources as localResources,
} from "../data/resources.js";

import {
  useAuth,
} from "../hooks/useAuth.js";

import {
  wishlistService,
} from "../services/wishlistService.js";

import {
  clearPendingWishlist,
  readPendingWishlist,
} from "../utils/pendingWishlist.js";

import {
  normalizeRemoteResource,
} from "../utils/resourceMapper.js";

export const WishlistContext =
  createContext(null);

function normalizeWishlistResource(
  resource
) {
  const fallback =
    localResources.find(
      (item) =>
        item.slug ===
        resource.slug
    );

  return {
    ...normalizeRemoteResource(
      resource,
      fallback
    ),

    savedAt:
      resource.savedAt ||
      null,
  };
}

export function WishlistProvider({
  children,
}) {
  const {
    user,
  } = useAuth();

  const [
    wishlistItems,
    setWishlistItems,
  ] = useState([]);

  const [
    isWishlistLoading,
    setIsWishlistLoading,
  ] = useState(false);

  const [
    wishlistError,
    setWishlistError,
  ] = useState("");

  const [
    busyResourceIds,
    setBusyResourceIds,
  ] = useState(
    new Set()
  );

  const [
    loginPrompt,
    setLoginPrompt,
  ] = useState(null);

  const [
    wishlistNotice,
    setWishlistNotice,
  ] = useState(null);

  const activeSyncId =
    useRef(0);

  const wishlistedIds =
    useMemo(
      () =>
        new Set(
          wishlistItems.map(
            (item) =>
              item.id
          )
        ),
      [wishlistItems]
    );

  const loadWishlist =
    useCallback(async () => {
      if (
        !user ||
        user.mustChangePassword
      ) {
        setWishlistItems([]);
        setWishlistError("");
        setIsWishlistLoading(false);
        return [];
      }

      const syncId =
        activeSyncId.current +
        1;

      activeSyncId.current =
        syncId;

      setIsWishlistLoading(true);
      setWishlistError("");

      try {
        const response =
          await wishlistService.listWishlist();

        const normalizedItems =
          response.data.resources.map(
            normalizeWishlistResource
          );

        if (
          activeSyncId.current ===
          syncId
        ) {
          setWishlistItems(
            normalizedItems
          );
        }

        return normalizedItems;
      } catch (error) {
        if (
          activeSyncId.current ===
          syncId
        ) {
          setWishlistError(
            error.message
          );
        }

        return [];
      } finally {
        if (
          activeSyncId.current ===
          syncId
        ) {
          setIsWishlistLoading(false);
        }
      }
    }, [
      user?.id,
      user?.mustChangePassword,
    ]);

  useEffect(() => {
    if (
      !user ||
      user.mustChangePassword
    ) {
      activeSyncId.current += 1;
      setWishlistItems([]);
      setWishlistError("");
      setIsWishlistLoading(false);
      return;
    }

    let isCancelled =
      false;

    async function synchronizeWishlist() {
      setIsWishlistLoading(true);
      setWishlistError("");

      const pendingItem =
        readPendingWishlist();

      if (pendingItem) {
        try {
          const response =
            await wishlistService.addResource(
              pendingItem.resourceId
            );

          clearPendingWishlist();

          if (!isCancelled) {
            setWishlistNotice({
              type: "success",
              title:
                "Added to your wishlist",
              message:
                `${pendingItem.title || response.data.resource.title} is now saved to your account.`,
            });
          }
        } catch (error) {
          if (!isCancelled) {
            setWishlistNotice({
              type: "error",
              title:
                "Wishlist not updated",
              message:
                error.message,
            });
          }
        }
      }

      if (!isCancelled) {
        await loadWishlist();
      }
    }

    synchronizeWishlist();

    return () => {
      isCancelled = true;
    };
  }, [
    user?.id,
    user?.mustChangePassword,
    loadWishlist,
  ]);

  const setResourceBusy =
    useCallback(
      (
        resourceId,
        isBusy
      ) => {
        setBusyResourceIds(
          (currentIds) => {
            const nextIds =
              new Set(
                currentIds
              );

            if (isBusy) {
              nextIds.add(
                resourceId
              );
            } else {
              nextIds.delete(
                resourceId
              );
            }

            return nextIds;
          }
        );
      },
      []
    );

  const addToWishlist =
    useCallback(
      async (resource) => {
        setResourceBusy(
          resource.id,
          true
        );

        setWishlistError("");

        try {
          const response =
            await wishlistService.addResource(
              resource.id
            );

          const savedResource =
            normalizeWishlistResource(
              response.data.resource
            );

          setWishlistItems(
            (currentItems) => {
              const alreadyExists =
                currentItems.some(
                  (item) =>
                    item.id ===
                    savedResource.id
                );

              return alreadyExists
                ? currentItems
                : [
                    savedResource,
                    ...currentItems,
                  ];
            }
          );

          setWishlistNotice({
            type: "success",
            title:
              "Added to your wishlist",
            message:
              `${savedResource.title} is now saved to your account.`,
          });

          return savedResource;
        } catch (error) {
          setWishlistError(
            error.message
          );

          setWishlistNotice({
            type: "error",
            title:
              "Wishlist not updated",
            message:
              error.message,
          });

          throw error;
        } finally {
          setResourceBusy(
            resource.id,
            false
          );
        }
      },
      [setResourceBusy]
    );

  const removeFromWishlist =
    useCallback(
      async (resource) => {
        setResourceBusy(
          resource.id,
          true
        );

        setWishlistError("");

        try {
          await wishlistService.removeResource(
            resource.id
          );

          setWishlistItems(
            (currentItems) =>
              currentItems.filter(
                (item) =>
                  item.id !==
                  resource.id
              )
          );

          setWishlistNotice({
            type: "info",
            title:
              "Removed from wishlist",
            message:
              `${resource.title} has been removed from your saved resources.`,
          });
        } catch (error) {
          setWishlistError(
            error.message
          );

          setWishlistNotice({
            type: "error",
            title:
              "Wishlist not updated",
            message:
              error.message,
          });

          throw error;
        } finally {
          setResourceBusy(
            resource.id,
            false
          );
        }
      },
      [setResourceBusy]
    );

  const requestWishlist =
    useCallback(
      async (
        resource,
        returnTo
      ) => {
        if (!user) {
          setLoginPrompt({
            resource,
            returnTo:
              returnTo ||
              `/product/${resource.slug}`,
          });

          return {
            requiresLogin: true,
          };
        }

        if (
          user.mustChangePassword
        ) {
          setWishlistNotice({
            type: "info",
            title:
              "Finish securing your account",
            message:
              "Change your temporary password before saving resources.",
          });

          return {
            requiresPasswordChange:
              true,
          };
        }

        if (
          busyResourceIds.has(
            resource.id
          )
        ) {
          return {
            busy: true,
          };
        }

        if (
          wishlistedIds.has(
            resource.id
          )
        ) {
          await removeFromWishlist(
            resource
          );

          return {
            removed: true,
          };
        }

        await addToWishlist(
          resource
        );

        return {
          added: true,
        };
      },
      [
        user,
        busyResourceIds,
        wishlistedIds,
        addToWishlist,
        removeFromWishlist,
      ]
    );

  const isWishlisted =
    useCallback(
      (resourceId) =>
        wishlistedIds.has(
          resourceId
        ),
      [wishlistedIds]
    );

  const isWishlistBusy =
    useCallback(
      (resourceId) =>
        busyResourceIds.has(
          resourceId
        ),
      [busyResourceIds]
    );

  const dismissLoginPrompt =
    useCallback(() => {
      setLoginPrompt(null);
    }, []);

  const dismissWishlistNotice =
    useCallback(() => {
      setWishlistNotice(null);
    }, []);

  const value =
    useMemo(
      () => ({
        wishlistItems,
        wishlistCount:
          wishlistItems.length,
        isWishlistLoading,
        wishlistError,
        loginPrompt,
        wishlistNotice,
        requestWishlist,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        isWishlistBusy,
        reloadWishlist:
          loadWishlist,
        dismissLoginPrompt,
        dismissWishlistNotice,
      }),
      [
        wishlistItems,
        isWishlistLoading,
        wishlistError,
        loginPrompt,
        wishlistNotice,
        requestWishlist,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        isWishlistBusy,
        loadWishlist,
        dismissLoginPrompt,
        dismissWishlistNotice,
      ]
    );

  return (
    <WishlistContext.Provider
      value={value}
    >
      {children}
    </WishlistContext.Provider>
  );
}
