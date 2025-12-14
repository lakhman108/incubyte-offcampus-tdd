import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sweetsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import type { Sweet } from '../types';

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
          <h1 className="text-2xl font-bold">🍬 Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email} ({user?.role})
            </span>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Customer View
            </Button>
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
            <h2 className="text-lg font-semibold mb-4">
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
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

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sweets.map((sweet) => (
                  <tr key={sweet._id}>
                    <td className="px-6 py-4">{sweet.name}</td>
                    <td className="px-6 py-4 capitalize">{sweet.category}</td>
                    <td className="px-6 py-4">${sweet.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {sweet.quantity}
                      {sweet.quantity === 0 && (
                        <span className="ml-2 text-red-600 text-xs">(Out)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={restockData[sweet._id] || ''}
                          onChange={(e) =>
                            setRestockData({
                              ...restockData,
                              [sweet._id]: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="Qty"
                          className="w-20 px-2 py-1 border rounded text-sm"
                        />
                        <Button
                          onClick={() => handleRestock(sweet._id)}
                          size="sm"
                          variant="outline"
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEdit(sweet)}
                          size="sm"
                          variant="outline"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(sweet._id)}
                          size="sm"
                          variant="destructive"
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
        )}

        {!loading && sweets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sweets available. Create your first sweet!
          </div>
        )}
      </div>
    </div>
  );
}
