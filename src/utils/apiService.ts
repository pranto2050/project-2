const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Products API
  async getProducts() {
    return this.request('/products');
  }

  async addProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getCategories() {
    return this.request('/categories');
  }

  async addCategory(category: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Brands API
  async getBrands() {
    return this.request('/brands');
  }

  async addBrand(brand: any) {
    return this.request('/brands', {
      method: 'POST',
      body: JSON.stringify(brand),
    });
  }

  async updateBrand(id: string, brand: any) {
    return this.request(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brand),
    });
  }

  async deleteBrand(id: string) {
    return this.request(`/brands/${id}`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getUsers() {
    return this.request('/users');
  }

  async addUser(user: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Administrators API
  async getAdministrators() {
    return this.request('/administrators');
  }

  async addAdministrator(admin: any) {
    return this.request('/administrators', {
      method: 'POST',
      body: JSON.stringify(admin),
    });
  }

  async deleteAdministrator(id: string) {
    return this.request(`/administrators/${id}`, {
      method: 'DELETE',
    });
  }

  // Sales API
  async getSales() {
    return this.request('/sales');
  }

  async addSale(sale: any) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  // Purchases API
  async getPurchases() {
    return this.request('/purchases');
  }

  async addPurchase(purchase: any) {
    return this.request('/purchases', {
      method: 'POST',
      body: JSON.stringify(purchase),
    });
  }

  // Returns API
  async getReturns() {
    return this.request('/returns');
  }

  async addReturn(returnRecord: any) {
    return this.request('/returns', {
      method: 'POST',
      body: JSON.stringify(returnRecord),
    });
  }

  // Authentication API
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Administrator password verification for data clear
  async verifyAdminPassword(email: string, password: string) {
    return this.request('/auth/verify-admin-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Update administrator password
  async updateAdminPassword(adminId: string, newPassword: string) {
    return this.request(`/administrators/${adminId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  }

  // Update administrator profile
  async updateAdministrator(adminId: string, updateData: any) {
    return this.request(`/administrators/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Clear all data (admin only)
  async clearAllData() {
    return this.request('/data-clear', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
