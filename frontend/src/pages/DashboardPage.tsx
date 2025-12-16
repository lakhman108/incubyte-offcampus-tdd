import { useState, useEffect } from 'react';
import { sweetsAPI } from '../services/api';
import type { Sweet } from '../types';
import Layout from '../components/Layout';
import SweetCard from '../components/SweetCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search States
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // CRUD States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
  });

  // Purchase State
  const [purchaseQuantity, setPurchaseQuantity] = useState<{ [key: string]: number }>({});

  const { token } = useAuth();

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

  const handlePurchase = async (sweetId: string, quantity: number) => {
    if (!token) return;
    try {
      await sweetsAPI.purchase(token, sweetId, quantity);
      fetchSweets();
      setPurchaseQuantity(prev => ({ ...prev, [sweetId]: 1 }));
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
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingSweet(null);
    setFormData({ name: '', category: '', price: '', quantity: '' });
    setShowCreateForm(false);
  };

  const clearFilters = () => {
    setSearchName('');
    setSearchCategory('');
    setMinPrice('');
    setMaxPrice('');
    fetchSweets();
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">

        {/* Toggle Create Form Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingSweet(null);
              setFormData({ name: '', category: '', price: '', quantity: '' });
            }}
            className="shadow-lg shadow-primary/20 hover:scale-105 transition-all text-lg py-6"
          >
            {showCreateForm ? 'Cancel Operation' : '+ Add New Sweet'}
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingSweet) && (
          <div className="glass p-8 rounded-3xl border border-white/10 animate-in slide-in-from-top-4">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingSweet ? 'Edit Sweet Details' : 'Add New Sweet'}
            </h3>
            <form onSubmit={editingSweet ? handleUpdate : handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-black/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <Input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="bg-black/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="bg-black/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Initial Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="bg-black/20"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 font-bold">
                  {editingSweet ? 'Update Sweet' : 'Create Sweet'}
                </Button>
                {(editingSweet || showCreateForm) && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Hero / Filter Section */}
        <div className="glass p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <span className="text-9xl">🔍</span>
          </div>

          <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
            Find Your <span className="text-primary">Craving</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="bg-black/20 border-white/10"
            />
            <Input
              type="text"
              placeholder="Category..."
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-black/20 border-white/10"
            />
            <Input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-black/20 border-white/10"
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-black/20 border-white/10"
            />
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1 font-bold shadow-lg shadow-primary/20">
                Search
              </Button>
              <Button onClick={clearFilters} variant="secondary" className="px-4">
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl font-medium animate-in fade-in slide-in-from-top-4 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="hover:bg-destructive/10 rounded p-1 transition-colors">✕</button>
          </div>
        )}

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : sweets.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl border border-white/5">
            <div className="text-8xl mb-4 opacity-50">🧁</div>
            <h3 className="text-2xl font-bold text-white mb-2">No sweets found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
            <Button onClick={clearFilters} variant="link" className="mt-4 text-primary">
              View all sweets
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sweets.map((sweet) => (
              <SweetCard
                key={sweet._id}
                sweet={sweet}
                onPurchase={handlePurchase}
                onEdit={startEdit}
                purchaseQuantity={purchaseQuantity[sweet._id] || 1}
                setPurchaseQuantity={(q) => setPurchaseQuantity(prev => ({ ...prev, [sweet._id]: q }))}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
