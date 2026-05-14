import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminProducts = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    categoryId: '',
    inStock: true,
    isCustomizable: false,
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price,
        categoryId: product.categoryId,
        inStock: product.inStock,
        isCustomizable: product.isCustomizable,
        image: product.image || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: 0,
        categoryId: categories.length > 0 ? categories[0].id : '',
        inStock: true,
        isCustomizable: false,
        image: ''
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalData = { ...formData, price: Number(formData.price) };
      
      // Upload image if selected
      if (imageFile) {
        const uploadRes = await api.uploads.image(imageFile);
        finalData.image = uploadRes.url;
      }

      if (editingId) {
        await api.products.update(editingId, finalData);
      } else {
        await api.products.create(finalData);
      }
      
      await fetchData();
      closeModal();
    } catch (err) {
      alert(err.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.deleteConfirm'))) {
      try {
        await api.products.delete(id);
        await fetchData();
      } catch (err) {
        alert(err.message || t('common.error'));
      }
    }
  };

  if (loading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
        <div>
          <h1 className="text-2xl font-bold text-base-content">{t('admin.productsTitle')}</h1>
          <p className="text-base-content/60 text-sm mt-1">{t('engines.lamp.desc')}</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary shadow-lg hover:scale-105 transition-transform">
          <Plus size={20} />
          {t('admin.addProduct')}
        </button>
      </div>

      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200 text-base-content/70">
              <tr>
                <th>{t('admin.image')}</th>
                <th>{t('admin.productName')} & {t('admin.slug')}</th>
                <th>{t('admin.category')}</th>
                <th>{t('admin.price')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="hover:bg-base-200/50 transition-colors">
                  <td>
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-xl bg-base-300">
                        {p.image ? <img src={p.image.startsWith('http') ? p.image : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${p.image}`} alt={p.name} className="object-cover" /> : <ImageIcon className="w-6 h-6 m-3 opacity-30" />}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-xs opacity-50">{p.slug}</div>
                  </td>
                  <td>
                    <span className="badge badge-ghost badge-sm">{p.category?.name || p.categoryId}</span>
                  </td>
                  <td className="font-mono">{p.price}</td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className={`badge badge-sm ${p.inStock ? 'badge-success' : 'badge-error'}`}>
                        {p.inStock ? t('admin.statusInStock') : t('admin.statusOutOfStock')}
                      </span>
                      {p.isCustomizable && (
                        <span className="badge badge-sm badge-info">{t('admin.statusCustomizable')}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(p)} className="btn btn-sm btn-square btn-ghost text-primary hover:bg-primary/10">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-square btn-ghost text-error hover:bg-error/10">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-base-content/50">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-base-200">
              <h3 className="text-xl font-bold">{editingId ? t('admin.editProduct') : t('admin.addProduct')}</h3>
              <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">{t('admin.productName')}</span></label>
                  <input type="text" className="input input-bordered" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">{t('admin.slug')}</span></label>
                  <input type="text" className="input input-bordered" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">{t('admin.description')}</span></label>
                <textarea className="textarea textarea-bordered h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">{t('admin.price')}</span></label>
                  <input type="number" step="0.01" className="input input-bordered font-mono" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">{t('admin.category')}</span></label>
                  <select className="select select-bordered" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">{t('admin.image')}</span></label>
                <div className="flex gap-4 items-center">
                  {formData.image && !imageFile && (
                    <img src={formData.image.startsWith('http') ? formData.image : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${formData.image}`} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-base-200" />
                  )}
                  <input type="file" className="file-input file-input-bordered w-full" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                </div>
              </div>

              <div className="flex gap-6 mt-2 p-4 bg-base-200/50 rounded-xl border border-base-200">
                <label className="cursor-pointer label flex gap-3">
                  <input type="checkbox" className="toggle toggle-success" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} />
                  <span className="label-text font-semibold">{t('admin.statusInStock')}</span>
                </label>
                <label className="cursor-pointer label flex gap-3">
                  <input type="checkbox" className="toggle toggle-info" checked={formData.isCustomizable} onChange={e => setFormData({...formData, isCustomizable: e.target.checked})} />
                  <span className="label-text font-semibold">{t('admin.statusCustomizable')}</span>
                </label>
              </div>

              <div className="pt-4 border-t border-base-200 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="btn btn-ghost">{t('common.cancel')}</button>
                <button type="submit" className={`btn btn-primary ${saving ? 'loading' : ''}`} disabled={saving}>
                  <Save size={18} />
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
