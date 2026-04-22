import React from 'react';
import Hero from '../../components/Hero/Hero';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import { categories } from '../../data/categories';
import { products } from '../../data/products';
import { Printer, Lightbulb, Palette, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  // Get one featured product from each category to display on home page
  const featuredProducts = categories.map(cat => 
    products.find(p => p.categoryId === cat.id && !p.isCustomizable)
  ).filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-base-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-base-content">
              {t('home.catTitle1')} <span className="text-primary">{t('home.catTitle2')}</span>
            </h2>
            <p className="text-base-content/70 text-lg">{t('home.catDesc')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {/* <section className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-base-content">
              {t('home.prodTitle1')} <span className="text-accent">{t('home.prodTitle2')}</span>
            </h2>
            <p className="text-base-content/70 text-lg">{t('home.prodDesc')}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section> */}

      {/* USPs / De ce noi */}
      <section className="py-16 md:py-24 bg-base-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-base-content">
              {t('home.whyTitle1')} <span className="text-primary">{t('home.whyTitle2')}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-box border border-base-300 hover:-translate-y-2 transition-transform shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Printer size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-base-content">{t('home.usp1')}</h3>
              <p className="text-base-content/70">{t('home.usp1_desc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-box border border-base-300 hover:-translate-y-2 transition-transform shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
                <Palette size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-base-content">{t('home.usp2')}</h3>
              <p className="text-base-content/70">{t('home.usp2_desc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-box border border-base-300 hover:-translate-y-2 transition-transform shadow-sm">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-base-content">{t('home.usp3')}</h3>
              <p className="text-base-content/70">{t('home.usp3_desc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-box border border-base-300 hover:-translate-y-2 transition-transform shadow-sm">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-4">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-base-content">{t('home.usp4')}</h3>
              <p className="text-base-content/70">{t('home.usp4_desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
