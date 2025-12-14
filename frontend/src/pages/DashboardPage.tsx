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
          <h1 className="text-2xl font-bold">🍬 Sweet Shop</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email} ({user?.role})
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
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Search Sweets</h2>
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
                <h3 className="text-xl font-semibold mb-2">{sweet.name}</h3>
                <p className="text-gray-600 capitalize mb-2">
                  Category: {sweet.category}
                </p>
                <p className="text-lg font-bold text-green-600 mb-2">
                  ${sweet.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Stock: {sweet.quantity} {sweet.quantity === 0 && '(Out of Stock)'}
                </p>
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
