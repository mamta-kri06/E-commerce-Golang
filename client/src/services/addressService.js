const API_BASE_URL = 'https://e-commerce-golang.onrender.com/api';

export const addressService = {
  async getAddresses() {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const res = await fetch(`${API_BASE_URL}/address`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch addresses");

    return data.addresses || [];
  },

  async addAddress(address) {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE_URL}/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(address),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add address");

    return data;
  },

  async updateAddress(id, updatedAddress) {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE_URL}/address/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedAddress),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update address");

    return data;
  },

  async deleteAddress(id) {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE_URL}/address/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete address");
    }
  },
};
