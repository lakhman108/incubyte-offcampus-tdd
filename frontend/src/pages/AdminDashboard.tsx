import { useState, useEffect } from 'react';
import { sweetsAPI } from '../services/api';
import type { Sweet } from '../types';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
  });
  const [restockData, setRestockData] = useState<{ [key: string]: number }>({});
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

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this sweet?')) return;
    try {
      await sweetsAPI.delete(token, id);
      fetchSweets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sweet');
    }
  };

  const handleRestock = async (id: string) => {
    if (!token) return;
    const quantity = restockData[id] || 0;
    if (quantity <= 0) {
      setError('Restock quantity must be greater than 0');
      return;
    }
    try {
      await sweetsAPI.restock(token, id, quantity);
      setRestockData({ ...restockData, [id]: 0 });
      fetchSweets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restock sweet');
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

  useEffect(() => {
    fetchSweets();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Inventory Management</h2>
            <p className="text-muted-foreground mt-2">Manage your sweet collection and stock levels</p>
          </div>
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

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl flex justify-between items-center">
            {error}
            <button onClick={() => setError('')} className="font-bold hover:bg-destructive/20 p-1 rounded">×</button>
          </div>
        )}

        {/* Form Section */}
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
                {editingSweet && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Data Table */}
        <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Restock</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sweets.map((sweet) => (
                  <tr key={sweet._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                          🍬
                        </div>
                        <span className="font-bold text-white">{sweet.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                        {sweet.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-primary">
                      ${sweet.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${sweet.quantity > 10 ? 'bg-emerald-500' : sweet.quantity > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-gray-300">
                          {sweet.quantity} units
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={restockData[sweet._id] || ''}
                          onChange={(e) =>
                            setRestockData({
                              ...restockData,
                              [sweet._id]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="h-8 w-20 bg-black/40 border-white/10 text-xs"
                        />
                        <Button
                          onClick={() => handleRestock(sweet._id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0Hover:bg-primary/20 text-primary"
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => startEdit(sweet)}
                          size="sm"
                          variant="ghost"
                          className="hover:text-primary hover:bg-primary/10"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(sweet._id)}
                          size="sm"
                          variant="ghost"
                          className="hover:text-destructive hover:bg-destructive/10 text-muted-foreground"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && sweets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sweets found in inventory.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
