class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    // No need for base URL since it's same origin
    const url = `/api${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async register(name: string, email: string, password: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  // Match methods
  async createMatch(matchData: any) {
    return this.request('/matches', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  async getMatch(id: string) {
    return this.request(`/matches/${id}`);
  }

  async updateScore(matchId: string, scoreData: any) {
    return this.request(`/matches/${matchId}/score`, {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
  }
}

export default new ApiClient();