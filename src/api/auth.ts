import api from './index'
import type { LoginRequest, RegisterRequest, TokenResponse } from '@/types/auth'

export function register(data: RegisterRequest): Promise<TokenResponse> {
  return api.post('/api/v1/auth/register', data).then((res) => res.data)
}

export function login(data: LoginRequest): Promise<TokenResponse> {
  return api.post('/api/v1/auth/login', data).then((res) => res.data)
}
