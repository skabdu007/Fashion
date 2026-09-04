import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "shadow_monarch_auction_flow";
const MAX_AUCTION_PRODUCTS = 50;

const createDefaultFlow = () => ({
  productLimit: 1,
  selectedProducts: [],
  createdProducts: []
});

const sanitizeFlow = (value) => {
  const nextValue = value && typeof value === "object" ? value : {};
  const productLimit = Math.min(
    MAX_AUCTION_PRODUCTS,
    Math.max(1, Number(nextValue.productLimit || 1))
  );
  const selectedProducts = Array.isArray(nextValue.selectedProducts)
    ? nextValue.selectedProducts
        .filter(Boolean)
        .map((item) => String(item))
        .slice(0, productLimit)
    : [];
  const createdProducts = Array.isArray(nextValue.createdProducts)
    ? nextValue.createdProducts
        .filter((item) => item && item._id)
        .slice(0, productLimit)
    : [];

  return {
    productLimit,
    selectedProducts,
    createdProducts
  };
};

const AuctionFlowContext = createContext({
  flow: createDefaultFlow(),
  setProductLimit: () => {},
  toggleProduct: () => {},
  addCreatedProduct: () => {},
  setCreatedProducts: () => {},
  clearFlow: () => {},
  selectedCount: 0,
  createdCount: 0
});

const getInitialFlow = () => {
  if (typeof window === "undefined") {
    return createDefaultFlow();
  }

  try {
    return sanitizeFlow(
      JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
    );
  } catch {
    return createDefaultFlow();
  }
};

export function AuctionFlowProvider({ children }) {
  const [flow, setFlow] = useState(getInitialFlow);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
    window.dispatchEvent(new Event("auction-flow-updated"));
  }, [flow]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromStorage = (event) => {
      if (event?.key && event.key !== STORAGE_KEY) {
        return;
      }

      setFlow(getInitialFlow());
    };

    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const setProductLimit = (limit) => {
    const normalizedLimit = Math.min(MAX_AUCTION_PRODUCTS, Math.max(1, Number(limit || 1)));

    setFlow((current) => ({
      productLimit: normalizedLimit,
      selectedProducts: current.selectedProducts.slice(0, normalizedLimit),
      createdProducts: current.createdProducts.slice(0, normalizedLimit)
    }));
  };

  const toggleProduct = (productId) => {
    setFlow((current) => {
      const exists = current.selectedProducts.includes(productId);

      if (exists) {
        return {
          ...current,
          selectedProducts: current.selectedProducts.filter((id) => id !== productId)
        };
      }

      if (current.selectedProducts.length >= current.productLimit) {
        return current;
      }

      return {
        ...current,
        selectedProducts: [...current.selectedProducts, productId]
      };
    });
  };

  const addCreatedProduct = (product) => {
    if (!product?._id) {
      return;
    }

    setFlow((current) => {
      const alreadyExists = current.createdProducts.some((item) => String(item._id) === String(product._id));

      if (alreadyExists || current.createdProducts.length >= current.productLimit) {
        return current;
      }

      return {
        ...current,
        createdProducts: [...current.createdProducts, product],
        selectedProducts: [...new Set([...current.selectedProducts, product._id])].slice(0, current.productLimit)
      };
    });
  };

  const setCreatedProducts = (products) => {
    const normalizedProducts = Array.isArray(products) ? products.slice(0, MAX_AUCTION_PRODUCTS) : [];

    setFlow((current) => ({
      ...current,
      createdProducts: normalizedProducts,
      selectedProducts: normalizedProducts.map((item) => item._id).filter(Boolean).slice(0, current.productLimit)
    }));
  };

  const clearFlow = () => {
    setFlow(createDefaultFlow());
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuctionFlowContext.Provider
      value={{
        flow,
        setProductLimit,
        toggleProduct,
        addCreatedProduct,
        setCreatedProducts,
        clearFlow,
        selectedCount: flow.selectedProducts.length,
        createdCount: flow.createdProducts.length
      }}
    >
      {children}
    </AuctionFlowContext.Provider>
  );
}

export const useAuctionFlow = () => useContext(AuctionFlowContext);
