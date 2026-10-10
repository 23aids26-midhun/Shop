import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Carousel from '../components/Carousel';
import CategoryStrip from '../components/CategoryStrip';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Must match StandardPagination.page_size on the backend (10 per page).
const PAGE_SIZE = 10;

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlQuery = new URLSearchParams(location.search).get('q') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(urlQuery);
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [category, setCategory] = useState('');
  const [ordering, setOrdering] = useState('');
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  useEffect(() => {
    api.get('/products/categories/').then(({ data }) => setCategories(data));
  }, []);

  // Pick up ?q= again whenever the navbar search fires (even while already on Home)
  useEffect(() => {
    setSearch(urlQuery);
    setSearchInput(urlQuery);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (category) params.category = category;
      if (ordering) params.ordering = ordering;
      const { data } = await api.get('/products/products/', { params });
      setProducts(data.results);
      setCount(data.count);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, ordering]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const pickCategory = (id) => {
    setCategory(id);
    setPage(1);
    document.getElementById('product-grid-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast('Please sign in to add items to your cart.', 'warning');
      navigate('/signin', { state: { from: '/' } });
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast(`${product.name} added to cart.`, 'success');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not add to cart.', 'error');
    }
  };

  const handleBuyNow = async (product) => {
    if (!isAuthenticated) {
      toast('Please sign in to continue.', 'warning');
      navigate('/signin', { state: { from: '/' } });
      return;
    }
    try {
      await addToCart(product.id, 1);
      navigate('/checkout');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not start checkout.', 'error');
    }
  };

  const start = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, count);

  return (
    <>
      <Carousel onShopCategory={() => pickCategory('')} />
      <CategoryStrip categories={categories} active={category} onPick={pickCategory} />

      <div className="container-fluid px-3 px-lg-4 py-4" id="product-grid-top">
        <div className="shop-toolbar mb-3">
          <h2 className="shop-toolbar__heading">
            {search ? `Results for "${search}"` : category ? (categories.find((c) => String(c.id) === String(category))?.name || 'Products') : 'Recommended for you'}
          </h2>

          <div className="shop-toolbar__controls">
            <form onSubmit={handleSearch} className="search-bar__group d-none d-lg-flex">
              <i className="bi bi-search search-bar__icon"></i>
              <input
                type="text"
                className="field-input search-bar__input"
                placeholder="Refine search…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
            <select
              className="field-input search-bar__select"
              value={ordering}
              onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
            >
              <option value="">Sort: Relevance</option>
              <option value="price">Price: low → high</option>
              <option value="-price">Price: high → low</option>
              <option value="-rating">Avg. customer rating</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        <div className="results-line">
          <span>
            {count > 0 ? <>Showing <strong>{start}–{end}</strong> of <strong>{count}</strong> results</> : 'No products'}
          </span>
          {count > 0 && <span className="dim">Page {page} of {Math.max(1, Math.ceil(count / PAGE_SIZE))}</span>}
        </div>

        {loading ? (
          <p className="dim">Loading products…</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>No products match that search.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
            ))}
          </div>
        )}

        <div className="mt-4">
          <Pagination count={count} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />
        </div>

        <div className="trust-strip">
          <span><i className="bi bi-truck"></i> Free delivery over ₹499</span>
          <span><i className="bi bi-arrow-repeat"></i> 7-day replacement</span>
          <span><i className="bi bi-shield-check"></i> Secure payments</span>
          <span><i className="bi bi-headset"></i> 24/7 support</span>
        </div>
      </div>
    </>
  );
}
