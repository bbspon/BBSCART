import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const CART_KEY = "bbscart_cart_v1";

// Cart item: { productId, name, image, price, qty, variantId|null }
// Meta: { vendorId }  -> lock cart to today’s assigned vendor
const initialState = {
  items: [],
  meta: { vendorId: null },
  loaded: false,
};

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return initialState;
    return { ...initialState, ...parsed, loaded: true };
  } catch {
    return initialState;
  }
}

function saveCart(state) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify({ items: state.items, meta: state.meta })
  );
}

function reducer(state, action) {
  switch (action.type) {
    case "LOAD": {
      const s = loadCart();
      return { ...state, ...s, loaded: true };
    }
    case "SET_VENDOR": {
      const vendorId = action.vendorId || null;
      const next = { ...state, meta: { vendorId } };
      saveCart(next);
      return next;
    }
    case "CLEAR": {
      const next = { ...state, items: [], meta: { vendorId: null } };
      saveCart(next);
      return next;
    }
    case "ADD": {
      const { item, vendorId, replaceIfDifferentVendor = true } = action;

      // Enforce vendor lock
      if (state.meta.vendorId && state.meta.vendorId !== vendorId) {
        if (!replaceIfDifferentVendor) return state;
        const cleared = { items: [], meta: { vendorId }, loaded: state.loaded };
        const withNew = {
          ...cleared,
          items: [
            {
              ...item,
              price: Number(item.price) || 0,
              qty: item.qty || 1,
              image: item.image || "",
            },
          ],
        };
        saveCart(withNew);
        return withNew;
      }

      const meta = state.meta.vendorId ? state.meta : { vendorId };

      const items = [...state.items];
      const ix = items.findIndex(
        (it) =>
          it.productId === item.productId &&
          String(it.variantId || "") === String(item.variantId || "")
      );

      if (ix >= 0) {
        const merged = {
          ...items[ix],
          qty: items[ix].qty + (item.qty || 1),
          price: Number(item.price) || Number(items[ix].price) || 0, // <-- normalize price
        };
        items[ix] = merged;
      } else {
        items.push({
          ...item,
          price: Number(item.price) || 0,
          image: item.image || "",
          qty: item.qty || 1,
        });
      }

      const next = { ...state, items, meta };
      saveCart(next);
      return next;
    }

    case "REMOVE": {
      const items = state.items.filter((it, i) => i !== action.index);
      const meta = items.length ? state.meta : { vendorId: null };
      const next = { ...state, items, meta };
      saveCart(next);
      return next;
    }
    case "SET_QTY": {
      const items = [...state.items];
      if (!items[action.index]) return state;
      items[action.index] = {
        ...items[action.index],
        qty: Math.max(1, action.qty),
      };
      const next = { ...state, items };
      saveCart(next);
      return next;
    }
    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "LOAD" });
  }, []);

  const totalCount = useMemo(
    () => state.items.reduce((sum, it) => sum + it.qty, 0),
    [state.items]
  );
  const totalPrice = useMemo(
    () =>
      state.items.reduce(
        (sum, it) => sum + it.qty * (Number(it.price) || 0),
        0
      ),
    [state.items]
  );

  // Define the API functions here
  const setVendor = (vendorId) => dispatch({ type: "SET_VENDOR", vendorId });
  const clear = () => dispatch({ type: "CLEAR" });
  const addItem = (
    { productId, name, image, price, qty = 1, variantId = null },
    vendorId
  ) => {
    dispatch({
      type: "ADD",
      item: { productId, name, image, price, qty, variantId },
      vendorId,
    });
  };
  const removeAt = (index) => dispatch({ type: "REMOVE", index });
  const setQty = (index, qty) => dispatch({ type: "SET_QTY", index, qty });

  return (
    <CartContext.Provider
      value={{
        state,
        totalCount,
        totalPrice,
        setVendor,
        clear,
        addItem,
        removeAt,
        setQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

function getTotalPrice(items) {
  return items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
    0
  );
}
