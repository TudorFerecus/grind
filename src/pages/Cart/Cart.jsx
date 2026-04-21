import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useStore();
  const { t } = useTranslation();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 max-w-5xl py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-6 text-base-content/30">
           <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-base-content mb-3">{t('cart.empty')}</h1>
        <p className="text-base-content/70 text-lg mb-8 max-w-md">{t('cart.emptySub')}</p>
        <Link to="/" className="btn btn-primary btn-lg shadow-md hover:-translate-y-1 transition-transform">
          {t('cart.backShop')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-5xl py-12 min-h-[60vh]">
      <div className="flex justify-between items-center mb-8 border-b border-base-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-base-content">{t('cart.title')}</h1>
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-focus font-medium">
          <ArrowLeft size={16} />
          {t('cart.startShopping')}
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row bg-base-100 p-4 rounded-2xl shadow-sm border border-base-200 gap-4 relative items-start sm:items-center">
              <img src={item.product.image} alt={item.product.name} className="w-full sm:w-24 h-24 object-cover rounded-xl bg-base-200" />
              
              <div className="flex-1">
                <Link to={`/product/${item.product.id}`} className="text-lg font-bold hover:text-primary transition-colors text-base-content block mb-1">
                  {t(`data.${item.product.id}.name`)}
                </Link>
                <span className="text-primary font-semibold block mb-2">{item.product.price} RON</span>
                
                {item.customConfig && (
                   <div className="mt-2 p-3 bg-base-200 rounded-lg text-sm border border-base-300">
                      <span className="badge badge-primary badge-sm mb-2">{t('cart.customConfig')}</span>
                      <ul className="text-base-content/70 space-y-1 grid grid-cols-2 gap-x-4">
                        <li>Formă: {item.customConfig.shape || 'Standard'}</li>
                        <li>Dimensiune: {item.customConfig.scale || '1'}</li>
                        {item.customConfig.thickness && <li>Grosime perete: {item.customConfig.thickness}</li>}
                        {item.customConfig.opacity && <li>Opacitate: {item.customConfig.opacity}</li>}
                      </ul>
                   </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-4 sm:gap-2 mt-4 sm:mt-0">
                <div className="flex items-center gap-3 bg-base-200 rounded-lg p-1 border border-base-300">
                  <button 
                    className="btn btn-ghost btn-xs sm:btn-sm btn-square"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-medium w-4 text-center">{item.quantity}</span>
                  <button className="btn btn-ghost btn-xs sm:btn-sm btn-square" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                
                <div className="font-bold text-base-content whitespace-nowrap">
                  {(item.product.price * item.quantity).toFixed(2)} RON
                </div>

                <button 
                  className="btn btn-ghost btn-sm text-error hover:bg-error/10 sm:self-end mt-1"
                  onClick={() => removeFromCart(item.id)}
                  title="Elimină"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-1/3 bg-base-200 p-6 rounded-2xl border border-base-300 sticky top-24">
          <h3 className="text-xl font-bold mb-6 text-base-content">{t('cart.summary')}</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-base-content/80">
              <span>{t('cart.subtotal')}</span>
              <span className="font-medium">{getCartTotal().toFixed(2)} RON</span>
            </div>
            <div className="flex justify-between text-base-content/80">
              <span>{t('cart.delivery')}</span>
              <span className="font-medium">20.00 RON</span>
            </div>
          </div>
          
          <div className="divider my-4"></div>
          
          <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-bold text-base-content">{t('cart.totalEst')}</span>
            <span className="text-2xl font-bold text-primary">{(getCartTotal() + 20).toFixed(2)} RON</span>
          </div>

          <button className="btn btn-primary w-full btn-lg shadow-md hover:-translate-y-1 transition-transform mb-4">
            {t('cart.proceedCheckout')}
          </button>

          <p className="text-center text-xs text-base-content/60 px-4">
            {t('cart.secureCheckout')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
