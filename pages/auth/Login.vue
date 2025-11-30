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
      console.log("log in success");
      mesPrets();
    } catch (e) {
      console.log("Invalid credentials", e);
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
  <div v-if="!isAuthenticated" class="flex align-items-center justify-center overflow-hidden">
    <div class="flex flex-column align-items-center justify-content-center">
      <div style="
          border-radius: 26px;
          padding: 0.3rem;
          margin-top: 50px;
          background: linear-gradient(
            180deg,
            var(--primary-color) 10%,
            rgba(33, 150, 243, 0) 30%
          );
        ">
        <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
          <div class="text-center mb-5">
            <div class="text-900 text-3xl font-medium mb-3">
              Larchant Outilthèque
            </div>
          </div>

          <div>
            <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
            <InputText id="email1" type="text" placeholder="Email" class="w-full md:w-30rem mb-5" v-model="email" />

            <label for="password1" class="block text-900 font-medium text-xl mb-2">Mot de Passe</label>
            <Password id="password1" v-model="password" placeholder="Mot de Passe" :toggleMask="false"
              class="w-full mb-3" inputClass="w-full" :feedback="false"></Password>

            <div class="flex align-items-center justify-content-between mb-5 gap-5">
              <a @click="resetPasswordDirectus" class="font-medium no-underline ml-2 text-right cursor-pointer"
                style="color: var(--primary-color)">Mot de passe oublié?</a>
            </div>

            <Button @click="loginDirectus()" label="Connexion" class="w-full p-3 text-xl"></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isAuthenticated && user" class="p-4 sm:p-6">
    <div class="block text-center" v-if="user.first_name">
      <div class="text-900 text-2xl sm:text-3xl font-medium mb-4 pt-6 sm:pt-10">
        Bonjour {{ user.first_name }},
      </div>
      <div class="text-700 text-lg sm:text-xl font-medium mb-3" v-if="user.objet">
        Vous avez
        <span class="text-green-500 font-bold">{{ user.objet.length }}</span>
        objet{{ user.objet.length > 1 ? 's' : '' }} en prêt sur le site. Merci.
      </div>
      <div class="text-700 text-lg sm:text-xl font-medium mb-3">
        <NuxtLink to="/mesprets" class="text-orange-500 font-semibold underline">
          <!-- TODO: Handle 'resa' count if needed, or remove if not critical for this view -->
          Cliquez ici pour consulter vos demandes.
        </NuxtLink>
      </div>
      <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4">
        <NuxtLink to="/">
          <Button label="Voir mon Dashboard"
            class="w-full sm:w-auto p-3 text-lg sm:text-xl bg-blue-500 hover:bg-blue-700"></Button>
        </NuxtLink>
        <NuxtLink to="/edit/outil-add">
          <Button label="Ajouter un objet"
            class="w-full sm:w-auto p-3 text-lg sm:text-xl bg-green-500 hover:bg-green-700"></Button>
        </NuxtLink>
        <Button @click="logoutDirectus()" label="Se déconnecter"
          class="w-full sm:w-auto p-3 text-lg sm:text-xl bg-red-300 hover:bg-red-500"></Button>
      </div>
    </div>
  </div>

  <Toast />
</template>

<style scoped>
.pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}

button {
  border-radius: 8px;
}
</style>
