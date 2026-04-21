import React, { useState } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Settings2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { products } from '../../data/products';
import useStore from '../../store/useStore';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useStore();
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find(p => p.id === productId);

  if (!product) {
    return <Navigate to="/" replace />;
  }

  const handleAddToCart = () => {
    if (product.isCustomizable) {
      const engineMap = {
        'lampi-3d': 'lamp',
        'poze-litografice': 'lithophane'
      };
      const engineId = engineMap[product.categoryId] || 'lamp';
      navigate(`/customizer/${engineId}`);
      return;
    }

    addToCart(product, quantity);
    setAdded(true);
    openCart();
    
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-12">
      <Link to={`/category/${product.categoryId}`} className="inline-flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors mb-8 font-medium">
        <ArrowLeft size={20} />
        {t('product.backToCategory')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="sticky top-24">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-base-200 bg-base-200">
            <img src={product.image} alt={t(`data.${product.id}.name`)} className="w-full h-auto object-cover" />
            {product.isCustomizable && (
              <div className="absolute top-4 right-4 bg-primary text-primary-content font-bold px-3 py-1 rounded-full text-sm shadow-md">
                {t('product.diyAvailable')}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-base-content mb-2">{t(`data.${product.id}.name`)}</h1>
          <p className="text-2xl text-primary font-semibold mb-6">{product.price} RON</p>
          
          <div className="prose prose-base-content mb-8">
            <p className="text-lg text-base-content/80 leading-relaxed">{t(`data.${product.id}.desc`)}</p>
          </div>

          <div className="bg-base-200 p-6 rounded-xl border border-base-300 mb-8">
            <h3 className="text-lg font-bold mb-4 border-b border-base-300 pb-2">{t('product.specs')}</h3>
            <ul className="space-y-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span className="text-base-content/70 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium text-base-content">{value}</span>
                </li>
              ))}
            </ul>
          </div>

          {!product.isCustomizable && (
            <div className="mb-8">
              <label className="block text-sm font-bold text-base-content/70 mb-2">{t('product.quantity')}</label>
              <div className="flex items-center gap-4 bg-base-200 rounded-lg p-1 w-fit border border-base-300">
                <button className="btn btn-ghost btn-sm btn-square" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button className="btn btn-ghost btn-sm btn-square" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          )}

          <button 
            className={`btn btn-lg w-full sm:w-auto shadow-md ${product.isCustomizable ? 'btn-primary' : 'btn-accent'}`}
            onClick={handleAddToCart}
            disabled={added || !product.inStock}
          >
            {product.isCustomizable ? (
              <>
                {t('product.openConfigurator')}
                <Settings2 size={20} />
              </>
            ) : added ? (
              <>
                {t('product.added')}
                <Check size={20} />
              </>
            ) : (
              <>
                {t('product.addToCart')}
                <ShoppingCart size={20} />
              </>
            )}
          </button>
          
          {!product.inStock && (
             <p className="text-error mt-4 font-medium">{t('product.outOfStock')}</p>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
