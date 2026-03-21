const API_BASE_URL = 'https://e-commerce-golang.onrender.com/api';
export const wishlistService = {
  async getWishlist() {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch wishlist');

    return data.wishlist || [];
  },

  async addToWishlist(productId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId }) // ⚠️ backend expects this
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add to wishlist');

    return data;
  },

  async removeFromWishlist(productId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to remove from wishlist');
    }
  },

  async clearWishlist() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // optional feature (only if backend supports it)
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to clear wishlist');
    }
  }
};