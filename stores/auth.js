// stores/auth.js

import { defineStore } from "pinia";
import { useDirectusClient } from "@/composables/useDirectusClient";

const STORAGE_KEY = "ust-auth";

const persistSession = (payload) => {
  if (process.server) {
    return;
  }

  if (!payload?.accessToken) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      expiresAt: payload.expiresAt,
    })
  );
};

const readPersistedSession = () => {
  if (process.server) {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    authenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    id: "",
    first_name: "",
    last_name: "",
    avatar: "",
    resa: "",
    me: {},
  }),

  actions: {
    async applySession(session) {
      const directus = useDirectusClient();
      this.accessToken = session?.access_token ?? session?.accessToken ?? null;
      this.refreshToken = session?.refresh_token ?? session?.refreshToken ?? null;
      this.expiresAt = session?.expires ?? session?.expiresAt ?? null;
      this.authenticated = Boolean(this.accessToken);

      try {
        if (this.accessToken) {
          await directus.auth.static(this.accessToken);
        } else {
          await directus.auth.static(undefined);
        }
      } catch (error) {
        console.warn("Failed to sync Directus auth state", error);
      }

      persistSession({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresAt: this.expiresAt,
      });
    },

    clearProfile() {
      this.id = "";
      this.first_name = "";
      this.last_name = "";
      this.avatar = "";
      this.resa = "";
      this.me = {};
    },

    async fetchProfile() {
      if (!this.accessToken) {
        return;
      }
      const directus = useDirectusClient();
      const profile = await directus.users.me.read({ fields: ["*"] });
      this.me = profile;
      this.first_name = profile.first_name ?? "";
      this.last_name = profile.last_name ?? "";
      this.id = profile.id ?? "";
      this.avatar = profile.avatar ?? "";
    },

    async fetchPendingReservations() {
      if (!this.accessToken) {
        return;
      }
      const directus = useDirectusClient();
      const response = await directus.items("reservation").readByQuery({
        fields: [
          "id,statut,objet.id,objet.nom,objet.marque,objet.proprietaire",
        ],
        filter: {
          objet: {
            proprietaire: {
              _eq: "$CURRENT_USER",
            },
          },
        },
      });

      const reservations = response?.data ?? [];
      const countValidatedItems = reservations.reduce((count, obj) => {
        if (obj.statut === "En attente") {
          return count + 1;
        }
        return count;
      }, 0);

      this.resa = countValidatedItems;
    },

    async login({ email, password }) {
      const session = await $fetch("/api/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      await this.applySession(session.data ?? session);
      await Promise.all([this.fetchProfile(), this.fetchPendingReservations()]);
    },

    async refresh() {
      if (!this.refreshToken) {
        return null;
      }

      const session = await $fetch("/api/auth/refresh", {
        method: "POST",
        body: {
          refreshToken: this.refreshToken,
        },
      });

      await this.applySession(session.data ?? session);
      return session;
    },

    async logout() {
      await this.applySession(null);
      persistSession(null);
      this.clearProfile();
      this.authenticated = false;
    },

    restoreSession() {
      const session = readPersistedSession();
      if (!session?.accessToken) {
        return;
      }
      return this.applySession(session);
    },
  },
});
