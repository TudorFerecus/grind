import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Settings2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categories } from '../../data/categories';
import { products } from '../../data/products';
import ProductCard from '../../components/ProductCard/ProductCard';

const Category = () => {
  const { categoryId } = useParams();
  const { t } = useTranslation();
  
  const category = categories.find(c => c.slug === categoryId);
  const categoryProducts = products.filter(p => p.categoryId === category?.id);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Category Header */}
      <div 
        className="relative pt-32 pb-20 px-4 flex items-center justify-center bg-cover bg-center min-h-[350px]"
        style={{ backgroundImage: `url(${category.image})` }}
      >
        <div className="absolute inset-0 bg-neutral/70 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center text-primary-content">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-content/80 hover:text-primary transition-colors mb-6 font-medium">
            <ArrowLeft size={20} />
            {t('category.back')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 drop-shadow-md">{category.name}</h1>
          <p className="text-lg md:text-xl text-primary-content/90 max-w-2xl mx-auto">{t(`data.${category.id}.desc`)}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl py-12 flex-1">
        
        {/* DIY Banner if category supports it */}
        {category.hasCustomizer && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start md:items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full text-primary shrink-0">
                <Settings2 size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-base-content mb-1">{t('category.createOwn')}</h3>
                <p className="text-base-content/70">{t('category.useCustomizer')}</p>
              </div>
            </div>
            <Link to={`/customizer/${category.id === 'poze-litografice' ? 'lithophane' : 'lamp'}`} className="btn btn-primary shadow-md hover:-translate-y-1 transition-transform shrink-0">
              {t('category.openCustomizer')}
            </Link>
          </div>
        )}

        <div className="flex justify-between items-center mb-8 pb-4 border-b border-base-200">
          <p className="text-base-content/60 font-medium">{categoryProducts.length} {t('category.productsTotal')}</p>
          {/* Aici ar veni eventuale filtre / sortare */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Category;
