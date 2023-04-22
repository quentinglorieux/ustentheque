// stores/auth.js

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    first_name: '',
    avatar: ''
  }),
})
