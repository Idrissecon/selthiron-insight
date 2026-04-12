const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const api = {
  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async uploadFiles(token: string, bankFile: File, providerFile: File): Promise<{ success: boolean; bankFileId: string; providerFileId: string }> {
    const formData = new FormData();
    formData.append('bankFile', bankFile);
    formData.append('providerFile', providerFile);

    const response = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  async saveReconciliation(token: string, report: any, bankFileId: string, providerFileId: string): Promise<{ success: boolean; reconciliationId: string }> {
    const response = await fetch(`${API_BASE}/files/save-reconciliation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ report, bankFileId, providerFileId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Save reconciliation failed');
    }

    return response.json();
  },

  async getReconciliationHistory(token: string): Promise<any[]> {
    const response = await fetch(`${API_BASE}/files/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Get history failed');
    }

    return response.json();
  },

  async getReconciliation(token: string, id: string): Promise<any> {
    const response = await fetch(`${API_BASE}/files/reconciliation/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Get reconciliation failed');
    }

    return response.json();
  },
};
