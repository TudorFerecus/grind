import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';

const ProductCard = ({ product }) => {
  const addToCart = useStore((state) => state.addToCart);
  const openCart = useStore((state) => state.openCart);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleAction = (e) => {
    e.preventDefault();
    if (product.isCustomizable) {
      const engineMap = {
        'lampi-3d': 'lamp',
        'poze-litografice': 'lithophane'
      };
      const engineId = engineMap[product.categoryId] || 'lamp';
      navigate(`/customizer/${engineId}`);
    } else {
      addToCart(product);
      openCart();
    }
  };

  return (
    <div className={`card w-full shadow-md hover:shadow-xl transition-all duration-300 border border-base-200 group ${product.isCustomizable ? 'bg-base-100' : 'bg-base-100'}`}>
      <Link to={`/product/${product.id}`} className="relative overflow-hidden cursor-pointer rounded-t-2xl block aspect-square bg-base-200">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
        {product.isCustomizable && (
          <div className="absolute top-3 right-3 badge badge-primary gap-1 shadow-md border-none font-bold py-3 px-3">
            <Settings2 size={14} />
            {t('product.diyAvailable')}
          </div>
        )}
      </Link>
      
      <div className="card-body p-5">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link to={`/product/${product.id}`} className="card-title text-lg font-bold text-base-content hover:text-primary transition-colors leading-tight line-clamp-2">
             {t(`data.${product.id}.name`)}
          </Link>
        </div>
        <p className="text-primary font-bold text-xl mb-3">{product.price} RON</p>
        
        <p className="text-base-content/70 text-sm line-clamp-2 mb-4 leading-relaxed">
          {t(`data.${product.id}.desc`)}
        </p>
        
        <div className="card-actions justify-end mt-auto pt-2">
          <button  
            className={`btn w-full shadow-sm hover:-translate-y-1 transition-transform ${product.isCustomizable ? 'btn-primary' : 'btn-outline border-base-300 hover:bg-base-200 hover:text-base-content hover:border-base-300'}`}
            onClick={handleAction}
          >
            {product.isCustomizable ? (
              <>
                {t('product.openConfigurator')}
                <Settings2 size={18} />
              </>
            ) : (
              <>
                {t('product.addToCart')}
                <ShoppingCart size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
