import { createContext, useEffect, useMemo, useState } from "react";
import { resources } from "../data/resources.js";

export const ResourcesContext = createContext(null);

const BASKET_STORAGE_KEY = "skillvault_basket_items";

function getStoredBasketItems() {
  try {
    const storedItems = localStorage.getItem(BASKET_STORAGE_KEY);

    if (!storedItems) {
      return [];
    }

    const storedIds = JSON.parse(storedItems);

    if (!Array.isArray(storedIds)) {
      return [];
    }

    return storedIds
      .map((id) => resources.find((resource) => resource.id === id))
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to load basket from localStorage:", error);
    return [];
  }
}

export function ResourcesProvider({ children }) {
  const [basketItems, setBasketItems] = useState(() => getStoredBasketItems());

  const [cartNotice, setCartNotice] = useState({
    isOpen: false,
    resource: null,
    alreadyInBasket: false,
  });

  useEffect(() => {
    try {
      const basketIds = basketItems.map((item) => item.id);
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basketIds));
    } catch (error) {
      console.error("Failed to save basket to localStorage:", error);
    }
  }, [basketItems]);

  const closeCartNotice = () => {
    setCartNotice({
      isOpen: false,
      resource: null,
      alreadyInBasket: false,
    });
  };

  const addToBasket = (resource) => {
    let alreadyInBasket = false;

    setBasketItems((currentItems) => {
      const exists = currentItems.some((item) => item.id === resource.id);

      if (exists) {
        alreadyInBasket = true;
        return currentItems;
      }

      return [...currentItems, resource];
    });

    setCartNotice({
      isOpen: true,
      resource,
      alreadyInBasket,
    });
  };

  const removeFromBasket = (resourceId) => {
    setBasketItems((currentItems) =>
      currentItems.filter((item) => item.id !== resourceId)
    );
  };

  const clearBasket = () => {
    setBasketItems([]);
  };

  const basketTotal = basketItems.reduce((total, item) => {
    return total + item.price;
  }, 0);

  const basketOldTotal = basketItems.reduce((total, item) => {
    return total + item.oldPrice;
  }, 0);

  const basketSavings = basketOldTotal - basketTotal;

  const value = useMemo(
    () => ({
      resources,
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
    [basketItems, basketTotal, basketOldTotal, basketSavings, cartNotice]
  );

  return (
    <ResourcesContext.Provider value={value}>
      {children}
    </ResourcesContext.Provider>
  );
}