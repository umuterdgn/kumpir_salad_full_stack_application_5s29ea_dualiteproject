import { create } from 'zustand';

export interface Extra {
  name: string;
  price: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: any;
  allergens: string[];
  ingredients: string[];
  extras?: Extra[];
}

export interface CartItem {
  id: string; // Unique ID for cart item (since same product can have different extras)
  product: Product;
  quantity: number;
  note: string;
  selectedExtras: Extra[];
}

interface AppState {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, note: string, selectedExtras: Extra[]) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  cart: [],
  addToCart: (product, quantity, note, selectedExtras) => set((state) => {
    // Create a unique ID based on product and selected extras
    const extrasKey = selectedExtras.map(e => e.name).sort().join('-');
    const cartItemId = `${product._id}-${extrasKey}`;

    const existing = state.cart.find(item => item.id === cartItemId);
    if (existing) {
      return {
        cart: state.cart.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: item.quantity + quantity, note } 
            : item
        )
      };
    }
    return { cart: [...state.cart, { id: cartItemId, product, quantity, note, selectedExtras }] };
  }),
  removeFromCart: (cartItemId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== cartItemId)
  })),
  updateQuantity: (cartItemId, quantity) => set((state) => ({
    cart: state.cart.map(item => 
      item.id === cartItemId ? { ...item, quantity } : item
    )
  })),
  clearCart: () => set({ cart: [] }),
  cartTotal: () => {
    return get().cart.reduce((total, item) => {
      const extrasTotal = item.selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
      return total + ((item.product.price + extrasTotal) * item.quantity);
    }, 0);
  },
  
  token: localStorage.getItem('token'),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  }
}));
