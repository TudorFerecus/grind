import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../api/client';
import { ShoppingBag, Calendar, Truck, CheckCircle2, ChevronRight, Package, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Orders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await api.orders.getAll();
        // Sort orders by date descending
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      } catch (err) {
        console.error(err);
        setError(t('auth.ordersError'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning font-medium p-3 rounded-xl gap-1">{t('auth.statusPENDING')}</span>;
      case 'CONFIRMED':
        return <span className="badge badge-info font-medium p-3 rounded-xl gap-1">{t('auth.statusCONFIRMED')}</span>;
      case 'IN_PRODUCTION':
        return <span className="badge badge-secondary font-medium p-3 rounded-xl gap-1">{t('auth.statusPRODUCTION')}</span>;
      case 'SHIPPED':
        return <span className="badge badge-primary font-medium p-3 rounded-xl gap-1">{t('auth.statusSHIPPED')}</span>;
      case 'DELIVERED':
        return <span className="badge badge-success font-medium p-3 rounded-xl gap-1"><CheckCircle2 size={14} /> {t('auth.statusDELIVERED')}</span>;
      case 'CANCELLED':
        return <span className="badge badge-error font-medium p-3 rounded-xl gap-1">{t('auth.statusCANCELLED')}</span>;
      default:
        return <span className="badge badge-ghost font-medium p-3 rounded-xl">{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/60 font-medium">{t('auth.ordersLoading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[80vh]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-base-content">{t('auth.orders')}</h1>
          <p className="text-sm text-base-content/60 mt-0.5">{t('auth.ordersSubtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error bg-error/10 border-error/20 text-error flex items-start gap-2 p-4 rounded-2xl mb-6">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card bg-base-100 border border-base-200/50 shadow-xl rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="p-4 bg-base-200 text-base-content/40 rounded-full mb-4">
            <Package size={48} />
          </div>
          <h3 className="text-xl font-bold text-base-content">{t('auth.ordersEmpty')}</h3>
          <p className="text-base-content/60 max-w-sm mt-2 mb-6">
            {t('auth.ordersEmptySub')}
          </p>
          <Link to="/" className="btn btn-primary font-bold px-8 rounded-xl shadow-lg shadow-primary/20">
            {t('auth.ordersGoShop')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="card bg-base-100 border border-base-200/50 hover:border-primary/25 shadow-lg rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              {/* Card Header */}
              <div className="bg-base-200/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-base-200/50 gap-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-base-content/70">
                  <div>
                    <span className="text-base-content/45 block text-xs font-semibold uppercase tracking-wider">{t('auth.orderDate')}</span>
                    <span className="font-semibold flex items-center gap-1.5 mt-0.5">
                      <Calendar size={14} className="text-base-content/40" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/45 block text-xs font-semibold uppercase tracking-wider">{t('auth.orderCode')}</span>
                    <span className="font-mono text-xs font-bold mt-1 block select-all bg-base-200 px-2 py-0.5 rounded-lg border border-base-300">
                      #{order.id.substring(0, 8)}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/45 block text-xs font-semibold uppercase tracking-wider">{t('auth.orderTotal')}</span>
                    <span className="font-bold text-primary text-base mt-0.5 block">
                      {(Number(order.totalAmount) + Number(order.deliveryFee)).toFixed(2)} RON
                    </span>
                  </div>
                </div>
                <div className="self-start sm:self-center shrink-0">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="divide-y divide-base-200">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl.startsWith('http') ? item.product.imageUrl : `http://localhost:3001${item.product.imageUrl}`}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-2xl border border-base-200 bg-base-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Package size={24} />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-base-content leading-snug">{item.product?.name || 'Produs Custom'}</h4>
                          <p className="text-xs text-base-content/50 mt-1 flex items-center gap-2">
                            <span>{t('auth.orderQty')}: <strong className="text-base-content">{item.quantity}</strong></span>
                            <span>•</span>
                            <span>{t('auth.orderUnitPrice')}: <strong className="text-base-content">{Number(item.unitPrice).toFixed(2)} RON</strong></span>
                          </p>
                          {item.customDesignId && (
                            <span className="badge badge-xs badge-outline badge-primary font-semibold py-2 px-3 mt-2 rounded-lg text-[10px]">
                              {t('auth.orderDiyBadge')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-base-content">
                          {(Number(item.unitPrice) * item.quantity).toFixed(2)} RON
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
