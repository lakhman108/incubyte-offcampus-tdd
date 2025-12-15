import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sweetsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import type { Sweet } from '../types';

export default function DashboardPage() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [purchaseQuantity, setPurchaseQuantity] = useState<{ [key: string]: number }>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
  });
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const fetchSweets = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await sweetsAPI.getAll(token);
      setSweets(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchName) params.append('name', searchName);
      if (searchCategory) params.append('category', searchCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      
      const data = await sweetsAPI.search(token, params.toString());
      setSweets(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (sweetId: string) => {
    if (!token) return;
    const quantity = purchaseQuantity[sweetId] || 1;
    try {
      await sweetsAPI.purchase(token, sweetId, quantity);
      fetchSweets();
      setPurchaseQuantity({ ...purchaseQuantity, [sweetId]: 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await sweetsAPI.create(token, {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
      });
      setFormData({ name: '', category: '', price: '', quantity: '' });
      setShowCreateForm(false);
      setError('');
      fetchSweets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sweet');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingSweet) return;
    try {
      await sweetsAPI.update(token, editingSweet._id, {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
      });
      setFormData({ name: '', category: '', price: '', quantity: '' });
      setEditingSweet(null);
      setError('');
      fetchSweets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sweet');
    }
  };

  const startEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString(),
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingSweet(null);
    setFormData({ name: '', category: '', price: '', quantity: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-5xl font-black tracking-tight">🍬 Sweet Shop</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-light tracking-wide uppercase">
              {user?.username || user?.email} ({user?.role})
            </span>
            {user?.role === 'admin' && (
              <Button onClick={() => navigate('/admin')} variant="outline">
                Admin Panel
              </Button>
            )}
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
            <button onClick={() => setError('')} className="ml-2 font-bold">×</button>
          </div>
        )}

        <div className="mb-6">
          <Button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingSweet(null);
              setFormData({ name: '', category: '', price: '', quantity: '' });
            }}
          >
            {showCreateForm ? 'Cancel' : '+ Add New Sweet'}
          </Button>
        </div>

        {(showCreateForm || editingSweet) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-3xl font-black mb-4">
              {editingSweet ? 'Edit Sweet' : 'Create New Sweet'}
            </h2>
            <form onSubmit={editingSweet ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  minLength={2}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  minLength={2}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingSweet ? 'Update' : 'Create'}
                </Button>
                {editingSweet && (
                  <Button type="button" onClick={cancelEdit} variant="outline">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-3xl font-black mb-4">Search Sweets</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Category"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch}>Search</Button>
            <Button
              onClick={() => {
                setSearchName('');
                setSearchCategory('');
                setMinPrice('');
                setMaxPrice('');
                fetchSweets();
              }}
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sweets.map((sweet) => (
              <div key={sweet._id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-4xl font-black mb-3 tracking-tight">{sweet.name}</h3>
                <p className="text-xs font-light uppercase tracking-widest mb-2">
                  {sweet.category}
                </p>
                <p className="text-5xl font-black text-green-600 mb-2 mono">
                  ${sweet.price.toFixed(2)}
                </p>
                <p className="text-sm font-light mb-4 mono">
                  Stock: {sweet.quantity} {sweet.quantity === 0 && '(Out of Stock)'}
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max={sweet.quantity}
                      value={purchaseQuantity[sweet._id] || 1}
                      onChange={(e) =>
                        setPurchaseQuantity({
                          ...purchaseQuantity,
                          [sweet._id]: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-20 px-2 py-1 border rounded"
                      disabled={sweet.quantity === 0}
                    />
                    <Button
                      onClick={() => handlePurchase(sweet._id)}
                      disabled={sweet.quantity === 0}
                      className="flex-1"
                    >
                      Purchase
                    </Button>
                  </div>
                  <Button
                    onClick={() => startEdit(sweet)}
                    variant="outline"
                    className="w-full"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sweets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sweets found
          </div>
        )}
      </div>
    </div>
  );
}
