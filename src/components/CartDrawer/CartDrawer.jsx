import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';

const CartDrawer = () => {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, getCartTotal } = useStore();
  const { t } = useTranslation();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-base-300/60 backdrop-blur-sm z-[100] transition-opacity" 
        onClick={closeCart} 
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-base-100 shadow-2xl z-[101] flex flex-col transform transition-transform duration-300 ease-in-out sm:rounded-l-3xl border-l border-base-200">
        
        <div className="flex items-center justify-between p-6 border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
               <ShoppingBag size={24} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-base-content">{t('cart.title')}</h2>
          </div>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={closeCart}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-base-100/50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-base-content/60 space-y-4">
              <ShoppingBag size={64} className="text-base-content/20 mb-2" />
              <p className="text-lg">{t('cart.empty')}</p>
              <button 
                className="btn btn-primary mt-4" 
                onClick={closeCart}
              >
                {t('cart.startShopping')}
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-4 p-4 bg-base-100 rounded-2xl border border-base-200 shadow-sm relative group">
                  <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl bg-base-200" />
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base-content leading-tight mb-1">{item.product.name}</h4>
                      <p className="text-primary font-semibold text-sm">{item.product.price} RON</p>
                    </div>
                    
                    {item.customConfig && (
                      <div className="badge badge-primary badge-sm mt-1">
                        {t('cart.customConfig')}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-base-200 rounded-lg p-1 border border-base-300">
                        <button 
                          className="btn btn-ghost btn-xs btn-square"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button className="btn btn-ghost btn-xs btn-square" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      <button 
                        className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFromCart(item.id)}
                        title="Elimină"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-base-100 border-t border-base-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6 text-lg font-bold text-base-content">
              <span>{t('cart.total')}:</span>
              <span className="text-xl text-primary">{getCartTotal().toFixed(2)} RON</span>
            </div>
            <button className="btn btn-primary w-full btn-lg shadow-md hover:-translate-y-1 transition-transform">
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
