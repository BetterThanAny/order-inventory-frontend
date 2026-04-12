import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const email = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function initFromStorage() {
    token.value = localStorage.getItem('token')
    email.value = localStorage.getItem('email')
  }

  async function login(emailVal: string, password: string) {
    const res = await apiLogin({ email: emailVal, password })
    token.value = res.access_token
    email.value = emailVal
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('email', emailVal)
  }

  async function register(emailVal: string, password: string) {
    const res = await apiRegister({ email: emailVal, password })
    token.value = res.access_token
    email.value = emailVal
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('email', emailVal)
  }

  function logout() {
    token.value = null
    email.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    router.push('/login')
  }

  return { token, email, isLoggedIn, initFromStorage, login, register, logout }
})
