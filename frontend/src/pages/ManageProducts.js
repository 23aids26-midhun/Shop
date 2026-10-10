import React, { useEffect, useState, useCallback } from 'react';
import api, { firstErrorMessage } from '../api/axios';
import { useToast } from '../context/ToastContext';

function slugify(text) {
  return (
    text.toString().toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36)
  );
}

export default function ManageProducts() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [productForm, setProductForm] = useState({
    name: '', category: '', price: '', mrp: '', stock: '', image_url: '', description: '',
  });
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  const loadCategories = useCallback(() => {
    api.get('/products/categories/').then(({ data }) => setCategories(data));
  }, []);

  const loadProducts = useCallback(() => {
    api.get('/products/products/', { params: { page_size: 100 } })
      .then(({ data }) => setProducts(data.results || data));
  }, []);

  useEffect(() => { loadCategories(); loadProducts(); }, [loadCategories, loadProducts]);

  const setP = (key) => (e) => setProductForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/products/', {
        name: productForm.name,
        slug: slugify(productForm.name),
        category: Number(productForm.category),
        price: productForm.price,
        mrp: productForm.mrp || null,
        stock: Number(productForm.stock),
        image_url: productForm.image_url,
        description: productForm.description,
      });
      toast('Product added.', 'success');
      setProductForm({ name: '', category: '', price: '', mrp: '', stock: '', image_url: '', description: '' });
      loadProducts();
    } catch (err) {
      toast(firstErrorMessage(err), 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/categories/', {
        name: categoryForm.name,
        slug: slugify(categoryForm.name),
      });
      toast('Category added.', 'success');
      setCategoryForm({ name: '' });
      loadCategories();
    } catch (err) {
      toast(firstErrorMessage(err), 'error');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/products/products/${product.slug}/`);
      toast('Product deleted.', 'success');
      loadProducts();
    } catch (err) {
      toast(firstErrorMessage(err), 'error');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <h1 className="page-heading"><i className="bi bi-box-seam"></i> Manage products</h1>
      <p className="dim mb-4">
        Only accounts with <code>is_staff</code> can create, edit or delete here — enforced by the API
        itself (<code>IsAdminUser</code>), not just hidden in the UI.
      </p>

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <section className="panel">
            <h2 className="panel__heading"><i className="bi bi-plus-circle"></i> New product</h2>
            <form onSubmit={handleAddProduct} className="field-stack" noValidate>
              <label className="field-label">Name</label>
              <input type="text" className="field-input" value={productForm.name} onChange={setP('name')} required />

              <label className="field-label">Category</label>
              <select className="field-input" value={productForm.category} onChange={setP('category')} required>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <label className="field-label">Price</label>
              <input type="number" step="0.01" className="field-input" value={productForm.price} onChange={setP('price')} required />

              <label className="field-label">MRP <span className="dim">(optional, shows a strikethrough discount)</span></label>
              <input type="number" step="0.01" className="field-input" value={productForm.mrp} onChange={setP('mrp')} />

              <label className="field-label">Stock</label>
              <input type="number" className="field-input" value={productForm.stock} onChange={setP('stock')} required />

              <label className="field-label">Image URL <span className="dim">(optional)</span></label>
              <input type="text" className="field-input" value={productForm.image_url} onChange={setP('image_url')} />

              <label className="field-label">Description</label>
              <textarea className="field-input" rows={3} value={productForm.description} onChange={setP('description')} />

              <button type="submit" className="btn btn--primary btn--full"><i className="bi bi-plus-lg"></i> Add product</button>
            </form>

            <hr />

            <h2 className="panel__heading"><i className="bi bi-tags"></i> New category</h2>
            <form onSubmit={handleAddCategory} className="field-stack" noValidate>
              <label className="field-label">Name</label>
              <input
                type="text"
                className="field-input"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                required
              />
              <button type="submit" className="btn btn--ghost btn--full"><i className="bi bi-plus-lg"></i> Add category</button>
            </form>
          </section>
        </div>

        <div className="col-12 col-lg-8">
          <section className="panel">
            <h2 className="panel__heading"><i className="bi bi-list-ul"></i> Catalog</h2>
            <div className="table-responsive">
              <table className="table ledger align-middle">
                <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.category_name}</td>
                      <td>₹{Number(p.price).toFixed(2)}{p.mrp ? <span className="dim"> (was ₹{Number(p.mrp).toFixed(0)})</span> : null}</td>
                      <td>{p.stock}</td>
                      <td className="text-end">
                        <button className="btn btn--danger btn--small" onClick={() => handleDelete(p)}>
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
