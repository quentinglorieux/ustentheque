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
  actions: {
    setAuthenticated(status) {
      this.authenticated = status;
    },
    setUser(user) {
      this.me = user;
      this.id = user.id;
      this.first_name = user.first_name;
      this.avatar = user.avatar;
    },
    logout() {
      this.authenticated = false;
      this.me = {};
      this.id = '';
      this.first_name = '';
      this.avatar = '';
    }
  }
})
