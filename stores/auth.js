// stores/auth.js

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    id: '',
    first_name: '',
    avatar: '',
    resa: '',
    me: {}
  }),
})
