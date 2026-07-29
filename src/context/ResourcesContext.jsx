import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { resources as localResources } from "../data/resources.js";
import { resourceService } from "../services/resourceService.js";
import { normalizeRemoteResource } from "../utils/resourceMapper.js";

export const ResourcesContext = createContext(null);

const BASKET_STORAGE_KEY = "skillvault_basket_items";
const BASKET_STORAGE_VERSION = 2;

function normalizeCatalogue(remoteResources) {
  const localBySlug = new Map(
    localResources.map((resource) => [resource.slug, resource])
  );

  return remoteResources.map((resource) =>
    normalizeRemoteResource(
      resource,
      localBySlug.get(resource.slug)
    )
  );
}

function getResourceIdentifier(resource) {
  if (!resource) {
    return "";
  }

  return String(resource.slug || resource.id || "");
}

function deduplicateResources(resources) {
  const uniqueResources = new Map();

  for (const resource of resources) {
    const identifier = getResourceIdentifier(resource);

    if (!identifier || uniqueResources.has(identifier)) {
      continue;
    }

    uniqueResources.set(identifier, resource);
  }

  return [...uniqueResources.values()];
}

function findMatchingResource(catalogue, basketItem) {
  if (!basketItem) {
    return null;
  }

  return (
    catalogue.find(
      (resource) =>
        (basketItem.slug && resource.slug === basketItem.slug) ||
        (basketItem.id !== undefined &&
          basketItem.id !== null &&
          resource.id === basketItem.id)
    ) || null
  );
}

function reconcileBasketItems(currentItems, catalogue) {
  return deduplicateResources(
    currentItems.map((item) => {
      const matchingResource = findMatchingResource(catalogue, item);

      /*
       * Keep the stored basket item when it is not present in the latest
       * catalogue response. This prevents a temporary API issue, an empty
       * response, or a delayed publication sync from deleting the basket.
       */
      if (!matchingResource) {
        return item;
      }

      /*
       * Preserve any locally stored fields while refreshing catalogue data
       * such as price, title, image, badge, and availability.
       */
      return {
        ...item,
        ...matchingResource,
      };
    })
  );
}

function parseStoredBasketValue(storedValue) {
  if (!storedValue) {
    return [];
  }

  const parsedValue = JSON.parse(storedValue);

  /*
   * Current format:
   * {
   *   version: 2,
   *   items: [full resource objects]
   * }
   */
  if (
    parsedValue &&
    typeof parsedValue === "object" &&
    !Array.isArray(parsedValue) &&
    Array.isArray(parsedValue.items)
  ) {
    return parsedValue.items.filter(
      (item) => item && typeof item === "object"
    );
  }

  /*
   * Backward compatibility:
   * Older versions stored an array containing only slugs or IDs.
   */
  if (Array.isArray(parsedValue)) {
    return parsedValue
      .map((storedItem) => {
        if (storedItem && typeof storedItem === "object") {
          return storedItem;
        }

        return (
          localResources.find(
            (resource) =>
              String(resource.slug) === String(storedItem) ||
              String(resource.id) === String(storedItem)
          ) || null
        );
      })
      .filter(Boolean);
  }

  return [];
}

function getStoredBasketItems() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(
      BASKET_STORAGE_KEY
    );

    return deduplicateResources(
      parseStoredBasketValue(storedValue)
    );
  } catch (error) {
    console.error("Failed to load basket:", error);
    return [];
  }
}

function saveBasketItems(items) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      BASKET_STORAGE_KEY,
      JSON.stringify({
        version: BASKET_STORAGE_VERSION,
        items,
      })
    );
  } catch (error) {
    console.error("Failed to save basket:", error);
  }
}

export function ResourcesProvider({ children }) {
  const [catalogue, setCatalogue] = useState(localResources);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [resourceError, setResourceError] = useState("");

  /*
   * Basket state is restored synchronously before the first render.
   * This prevents the initial empty state from overwriting localStorage.
   */
  const [basketItems, setBasketItems] = useState(getStoredBasketItems);

  const [cartNotice, setCartNotice] = useState({
    isOpen: false,
    resource: null,
    alreadyInBasket: false,
  });

  const loadResources = useCallback(async () => {
    setIsLoadingResources(true);
    setResourceError("");

    try {
      const response = await resourceService.listPublished();
      const remoteResources = response?.data?.resources;

      if (!Array.isArray(remoteResources)) {
        throw new Error(
          "The resources catalogue returned an invalid response."
        );
      }

      const remoteCatalogue = normalizeCatalogue(remoteResources);

      /*
       * Do not replace a valid local catalogue with an empty API response.
       * The fallback also allows stored basket items to remain usable.
       */
      const nextCatalogue =
        remoteCatalogue.length > 0
          ? remoteCatalogue
          : localResources;

      setCatalogue(nextCatalogue);

      setBasketItems((currentItems) =>
        reconcileBasketItems(currentItems, nextCatalogue)
      );
    } catch (error) {
      setCatalogue(localResources);

      setBasketItems((currentItems) =>
        reconcileBasketItems(currentItems, localResources)
      );

      setResourceError(
        error?.message ||
          "The resources catalogue could not be loaded."
      );
    } finally {
      setIsLoadingResources(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  /*
   * Save complete resource snapshots rather than only slugs.
   * The cart can therefore render immediately after a reload even before
   * the catalogue API finishes loading.
   */
  useEffect(() => {
    saveBasketItems(basketItems);
  }, [basketItems]);

  /*
   * Keep the basket synchronized when the same website is open in another
   * browser tab.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorageChange = (event) => {
      if (event.key !== BASKET_STORAGE_KEY) {
        return;
      }

      try {
        const incomingItems = deduplicateResources(
          parseStoredBasketValue(event.newValue)
        );

        setBasketItems((currentItems) => {
          const currentSerialized = JSON.stringify(currentItems);
          const incomingSerialized = JSON.stringify(incomingItems);

          return currentSerialized === incomingSerialized
            ? currentItems
            : reconcileBasketItems(incomingItems, catalogue);
        });
      } catch (error) {
        console.error(
          "Failed to synchronize basket across tabs:",
          error
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [catalogue]);

  const closeCartNotice = useCallback(() => {
    setCartNotice({
      isOpen: false,
      resource: null,
      alreadyInBasket: false,
    });
  }, []);

  const addToBasket = useCallback(
    (resource) => {
      if (!resource) {
        return;
      }

      const resourceIdentifier = getResourceIdentifier(resource);

      if (!resourceIdentifier) {
        console.error(
          "Cannot add a resource without an ID or slug to the basket."
        );

        return;
      }

      const alreadyInBasket = basketItems.some(
        (item) =>
          getResourceIdentifier(item) === resourceIdentifier
      );

      if (!alreadyInBasket) {
        setBasketItems((currentItems) =>
          deduplicateResources([...currentItems, resource])
        );
      }

      setCartNotice({
        isOpen: true,
        resource,
        alreadyInBasket,
      });
    },
    [basketItems]
  );

  const removeFromBasket = useCallback((resourceIdentifier) => {
    setBasketItems((currentItems) =>
      currentItems.filter(
        (item) =>
          String(item.id) !== String(resourceIdentifier) &&
          String(item.slug) !== String(resourceIdentifier)
      )
    );
  }, []);

  const clearBasket = useCallback(() => {
    setBasketItems([]);
  }, []);

  const {
    basketTotal,
    basketOldTotal,
    basketSavings,
  } = useMemo(() => {
    const total = basketItems.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );

    const oldTotal = basketItems.reduce(
      (sum, item) =>
        sum +
        Number(item.oldPrice || item.price || 0),
      0
    );

    return {
      basketTotal: total,
      basketOldTotal: oldTotal,
      basketSavings: Math.max(oldTotal - total, 0),
    };
  }, [basketItems]);

  const value = useMemo(
    () => ({
      resources: catalogue,

      isLoadingResources,
      resourceError,
      reloadResources: loadResources,

      basketItems,
      basketCount: basketItems.length,
      basketTotal,
      basketOldTotal,
      basketSavings,

      cartNotice,

      addToBasket,
      removeFromBasket,
      clearBasket,
      closeCartNotice,
    }),
    [
      catalogue,
      isLoadingResources,
      resourceError,
      loadResources,
      basketItems,
      basketTotal,
      basketOldTotal,
      basketSavings,
      cartNotice,
      addToBasket,
      removeFromBasket,
      clearBasket,
      closeCartNotice,
    ]
  );

  return (
    <ResourcesContext.Provider value={value}>
      {children}
    </ResourcesContext.Provider>
  );
}