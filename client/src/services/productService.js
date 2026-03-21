const API_BASE_URL = 'https://e-commerce-golang.onrender.com/api';
export const productService = {
  async getAllProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch product with id ${id}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  },

  async bulkCreate(products) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored here
        },
        body: JSON.stringify(products),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to bulk create products');
      }

      return await response.json();
    } catch (error) {
      console.error('Error bulk creating products:', error);
      throw error;
    }
  },
};
