"use client";

import type { Product } from "@/src/data/products";
import { createContext, useContext, useMemo, useReducer } from "react";

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CustomerDetails = {
  name: string;
  city: string;
  state: string;
  notes: string;
};

type CartState = {
  items: CartItem[];
  customer: CustomerDetails;
};

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "UPDATE_CUSTOMER"; updates: Partial<CustomerDetails> }
  | { type: "CLEAR" };

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  customer: CustomerDetails;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateCustomer: (updates: Partial<CustomerDetails>) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const initialState: CartState = {
  items: [],
  customer: {
    name: "",
    city: "",
    state: "",
    notes: "",
  },
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.product.id === action.product.id
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product.id !== action.productId
        ),
      };
    }
    case "UPDATE_QUANTITY": {
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.product.id === action.productId
              ? { ...item, quantity: action.quantity }
              : item
          )
          .filter((item) => item.quantity > 0),
      };
    }
    case "UPDATE_CUSTOMER": {
      return {
        ...state,
        customer: { ...state.customer, ...action.updates },
      };
    }
    case "CLEAR": {
      return initialState;
    }
    default:
      return state;
  }
}

type CartProviderProps = {
  children: React.ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = state.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    return {
      items: state.items,
      totalItems,
      customer: state.customer,
      addItem: (product) => dispatch({ type: "ADD_ITEM", product }),
      removeItem: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
      updateQuantity: (productId, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
      updateCustomer: (updates) =>
        dispatch({ type: "UPDATE_CUSTOMER", updates }),
      clearCart: () => dispatch({ type: "CLEAR" }),
    };
  }, [state.items, state.customer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }

  return context;
}
