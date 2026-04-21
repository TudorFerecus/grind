import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,

      // Cart Actions
      addToCart: (product, quantity = 1, customConfig = null) => {
        set((state) => {
          const existingItemIndex = state.cart.findIndex(
            (item) => item.product.id === product.id && 
                      JSON.stringify(item.customConfig) === JSON.stringify(customConfig)
          );

          if (existingItemIndex > -1) {
            // Item exists with same config, update quantity
            const newCart = [...state.cart];
            newCart[existingItemIndex].quantity += quantity;
            return { cart: newCart };
          }

          // Add new item
          return {
            cart: [...state.cart, { product, quantity, customConfig, id: Date.now() }],
          };
        });
      },

      removeFromCart: (cartItemId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      // UI Actions
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      // Helpers
      getCartTotal: () => {
        return get().cart.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      getCartItemsCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'forge3d-storage',
      partialize: (state) => ({ cart: state.cart }), // Only persist cart
    }
  )
);

export default useStore;
