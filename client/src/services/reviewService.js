const API_BASE_URL = 'http://localhost:8080/api';

export const reviewService = {
  async getProductReviews(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }
      
      return data.reviews || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  async createReview(reviewData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to leave a review');

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
};
