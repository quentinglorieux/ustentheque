import { proxyRefs, toRefs } from "vue";
import { useDirectusClient } from "@/composables/useDirectusClient";

const STORAGE_KEY = "ust-auth";

type SessionPayload = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | string | null;
};

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | string;
};

type AuthState = {
  authenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | string | null;
  id: string;
  first_name: string;
  last_name: string;
  avatar: string;
  resa: number | string;
  me: Record<string, any>;
};

const persistSession = (payload: SessionPayload | null) => {
  if (process.server) {
    return;
  }

  if (!payload?.accessToken) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const readPersistedSession = (): StoredSession | null => {
  if (process.server) {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const useAuthStore = () => {
  const state = useState<AuthState>("auth", () => ({
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
  }));

  const applySession = async (session?: any | null) => {
    const directus = useDirectusClient();

    state.value.accessToken = session?.access_token ?? session?.accessToken ?? null;
    state.value.refreshToken = session?.refresh_token ?? session?.refreshToken ?? null;
    state.value.expiresAt = session?.expires ?? session?.expiresAt ?? null;
    state.value.authenticated = Boolean(state.value.accessToken);

    try {
      if (state.value.accessToken) {
        await directus.auth.static(state.value.accessToken);
      } else {
        await directus.auth.static(undefined);
      }
    } catch (error) {
      console.warn("Failed to sync Directus auth state", error);
    }

    persistSession({
      accessToken: state.value.accessToken,
      refreshToken: state.value.refreshToken,
      expiresAt: state.value.expiresAt,
    });
  };

  const clearProfile = () => {
    state.value.id = "";
    state.value.first_name = "";
    state.value.last_name = "";
    state.value.avatar = "";
    state.value.resa = "";
    state.value.me = {};
  };

  const fetchProfile = async () => {
    if (!state.value.accessToken) {
      return;
    }

    const directus = useDirectusClient();
    const profile = await directus.users.me.read({ fields: ["*"] });

    state.value.me = profile;
    state.value.first_name = profile.first_name ?? "";
    state.value.last_name = profile.last_name ?? "";
    state.value.id = profile.id ?? "";
    state.value.avatar = profile.avatar ?? "";
  };

  const fetchPendingReservations = async () => {
    if (!state.value.accessToken) {
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
    const countValidatedItems = reservations.reduce((count: number, obj: any) => {
      if (obj.statut === "En attente") {
        return count + 1;
      }
      return count;
    }, 0);

    state.value.resa = countValidatedItems;
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    const session = await $fetch("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    await applySession(session.data ?? session);
    await Promise.all([fetchProfile(), fetchPendingReservations()]);
  };

  const refresh = async () => {
    if (!state.value.refreshToken) {
      return null;
    }

    const session = await $fetch("/api/auth/refresh", {
      method: "POST",
      body: {
        refreshToken: state.value.refreshToken,
      },
    });

    await applySession(session.data ?? session);
    return session;
  };

  const logout = async () => {
    await applySession(null);
    persistSession(null);
    clearProfile();
    state.value.authenticated = false;
  };

  const restoreSession = async () => {
    const session = readPersistedSession();

    if (!session?.accessToken) {
      return;
    }

    return applySession(session);
  };

  return proxyRefs({
    ...toRefs(state.value),
    applySession,
    clearProfile,
    fetchProfile,
    fetchPendingReservations,
    login,
    refresh,
    logout,
    restoreSession,
  });
};
