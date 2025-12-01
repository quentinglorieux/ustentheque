<script setup>
import { readMe, readItems, passwordRequest } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useDirectusBase } from "@/composables/useDirectusBase";

const toast = useToast();
const { login, logout, user, isAuthenticated } = useUser();
const directus = useDirectus();

const email = ref("");
const password = ref("");

onMounted(() => {
  if (isAuthenticated.value) {
    mesPrets();
  }
});

const resa = ref("");

async function mesPrets() {
  try {
    const result = await directus.request(readItems("reservation", {
      fields: [
        "id", "debut", "fin", "statut", "objet.id", "objet.nom", "objet.marque", "objet.proprietaire",
      ],
      filter: {
        objet: {
          proprietaire: {
            _eq: "$CURRENT_USER",
          },
        },
      },
    }));

    resa.value = result;

    const countValidatedItems = Array.isArray(resa.value) ? resa.value.reduce((count, obj) => {
      if (obj.statut === "En attente") {
        return count + 1;
      }
      return count;
    }, 0) : 0;

    // We can store this in a local ref or another state if needed, 
    // but for now let's keep it local or use a simpler state if needed.
    // store.resa = countValidatedItems; 
  } catch (e) {
    console.error("Error fetching loans", e);
  }
}

async function logoutDirectus() {
  await logout();
};

async function loginDirectus() {
  if (!isAuthenticated.value) {
    try {
      await login(email.value, password.value);
      //console.log("log in success");
      mesPrets();
    } catch (e) {
      //console.log("Invalid credentials", e);
      toast.add({
        severity: "error",
        summary: "Erreur",
        detail: "Mot de passe ou identifiant incorrect.",
        life: 3000,
      });
      password.value = '';
    }
  }
}

async function resetPasswordDirectus() {
  if (!email.value || email.value.trim() === "") {
    toast.add({
      severity: "warn",
      summary: "Champ requis",
      detail: "Veuillez entrer votre adresse email.",
      life: 3000,
    });
    return;
  }

  try {
    const users = await directus.request(readItems("directus_users", {
      filter: {
        email: {
          _eq: email.value.trim(),
        },
      },
      limit: 1,
    }));

    if (users.length === 0) {
      toast.add({
        severity: "error",
        summary: "Erreur",
        detail: `Aucun utilisateur trouvé avec l'adresse email ${email.value}.`,
        life: 3000,
      });
      return;
    }

    await directus.request(passwordRequest(email.value));

    toast.add({
      severity: "success",
      summary: "Email envoyé",
      detail: `Un email a été envoyé à l'adresse ${email.value} pour réinitialiser votre mot de passe.`,
      life: 3000,
    });
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Impossible d'envoyer l'email de réinitialisation.",
      life: 3000,
    });
  }
}
</script>

<template>
  <div class="min-h-screen flex  justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Login Form -->
    <div v-if="!isAuthenticated" class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Larchant Outilthèque
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour gérer vos outils et réservations
        </p>
      </div>
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Adresse Email
            </label>
            <div class="mt-1">
              <InputText id="email" v-model="email" type="email" autocomplete="email" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div class="mt-1">
              <Password id="password" v-model="password" :feedback="false" :toggleMask="true"
                inputClass="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                class="w-full" />
            </div>
          </div>

          <div class="flex items-center justify-end">
            <div class="text-sm">
              <a @click="resetPasswordDirectus"
                class="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <div>
            <Button @click="loginDirectus()" label="Se connecter" icon="pi pi-sign-in"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- Authenticated View -->
    <div v-else class="max-w-4xl w-full space-y-8">
      <div class="bg-white shadow rounded-lg p-6 sm:p-10">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Bonjour {{ user?.first_name }} !
          </h2>
          <p class="mt-4 text-lg text-gray-500">
            Bienvenue sur votre espace personnel.
          </p>
        </div>

        <div class="mt-10">
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink to="/" class="w-full sm:w-auto">
              <Button label="Tableau de bord" icon="pi pi-home"
                class="w-full justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10" />
            </NuxtLink>
            <NuxtLink to="/edit/outil-add" class="w-full sm:w-auto">
              <Button label="Ajouter un outil" icon="pi pi-plus"
                class="w-full justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10" />
            </NuxtLink>
            <Button @click="logoutDirectus()" label="Déconnexion" icon="pi pi-sign-out" severity="danger" outlined
              class="w-full sm:w-auto justify-center py-3 px-6 border border-red-300 text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50 md:py-4 md:text-lg md:px-10" />
          </div>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-8">
          <div class="rounded-md bg-blue-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="pi pi-info-circle text-blue-400" aria-hidden="true"></i>
              </div>
              <div class="ml-3 flex-1 md:flex md:justify-between">
                <p class="text-sm text-blue-700">
                  Vous avez actuellement <span class="font-bold">{{ user?.objet?.length || 0 }}</span> outil(s)
                  partagé(s).
                </p>
                <p class="mt-3 text-sm md:mt-0 md:ml-6">
                  <NuxtLink to="/mesprets" class="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                    Voir mes demandes <span aria-hidden="true">&rarr;</span>
                  </NuxtLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Toast />
</template>

<style scoped>
/* Scoped styles can be removed as we are using Tailwind utility classes */
</style>
