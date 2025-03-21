//  ์NOTE: Add
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authSecretKey = 'access_token';
  public isAuthenticated = false;

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  async login(email: string, password: string): Promise<string | null> {
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return errorData.message || 'Login failed';
      }

      const result = await response.json();

      if (result.status === 'success' && result.data?.access_token) {
        localStorage.setItem(this.authSecretKey, result.data.access_token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        this.isAuthenticated = true;
        return result.status;
      }
      return 'Invalid credentials';
    } catch (error) {
      console.error('Login failed:', error);
      return 'Network error';
    }
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<string> {
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return errorData.message || 'Register failed';
      }

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        return result.status;
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      return error.message || 'Network error';
    }
  }

  logout(): void {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem(this.authSecretKey);
      localStorage.removeItem('user');
      this.isAuthenticated = false;

      this.router.navigate(['/login']);
    }
  }

  clearAuthData(): void {
    localStorage.removeItem(this.authSecretKey);
    localStorage.removeItem('user');
    this.isAuthenticated = false;
  }

  async checkAuthStatus(): Promise<void> {
    const token = localStorage.getItem(this.authSecretKey);
    this.isAuthenticated = !!token;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        if (expiry < now) {
          this.clearAuthData();
          this.router.navigate(['/login']);
        }
      } catch (e) {
        this.clearAuthData();
        this.router.navigate(['/login']);
      }
    }
  }

  async getToken(): Promise<string | null> {
    await this.checkAuthStatus();
    return localStorage.getItem(this.authSecretKey);
  }

  getUser(): object | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
