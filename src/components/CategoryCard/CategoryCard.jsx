import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CategoryCard = ({ category }) => {
  const Icon = category.icon;
  const { t } = useTranslation();

  return (
    <Link to={`/category/${category.slug}`} className="relative group overflow-hidden rounded-2xl shadow-md border border-base-200 aspect-[4/3] block bg-base-300">
      <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral/90 via-neutral/50 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>
      
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="w-12 h-12 bg-primary/20 backdrop-blur-md text-primary rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:-translate-y-2">
          {Icon && <Icon size={24} />}
        </div>
        <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
          <h3 className="text-2xl font-serif font-bold text-primary mb-2">{category.name}</h3>
          <p className="text-primary/80 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto transition-all duration-300">{category.description}</p>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
            <span>{t('category.openCustomizer')}</span>
            <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
