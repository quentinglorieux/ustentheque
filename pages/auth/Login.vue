<script setup>
import { Directus } from "@directus/sdk";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "primevue/usetoast";

const store = useAuthStore();
const toast = useToast();

const authenticated = computed(() => store.authenticated);

const email = ref("");
const password = ref("");
const checked = ref(false);
const token = ref();
const me = ref();

const directus = new Directus("https://devdirectus.rubidiumweb.eu", {
  auth: {
    mode: "cookie", // 'json' in Node.js
    autoRefresh: true,
    msRefreshBeforeExpires: 60000,
    staticToken: "",
  },
});

onMounted(() => {
  checkLogin();
  if (store.authenticated) {
    myProfile();
    mesPrets();
  }
});

async function myProfile() {
  const profileData = await directus.users.me.read({ fields: ["*"] });
  me.value = profileData;
  store.me = profileData;
  store.first_name = profileData.first_name;
  store.last_name = profileData.last_name;
  store.id = profileData.id;
  store.avatar = profileData.avatar;
}

const resa = ref("");

async function mesPrets() {
  
  resa.value = await directus.items("reservation").readByQuery({
    fields: [
      "id,debut,fin,statut,objet.id,objet.nom,objet.marque,objet.proprietaire",
    ],
    filter: {
      objet: {
        proprietaire: {
          _eq: "$CURRENT_USER",
        },
      },
    },
  });
  const countValidatedItems = resa.value.data.reduce((count, obj) => {
    if (obj.statut === "En attente") {
      return count + 1;
    }
    return count;
  }, 0);

  store.resa = countValidatedItems;
}

async function checkLogin() {
  store.authenticated = false;
  // AUTHENTICATION
  await directus.auth.token
    .then((a) => {
      if (a) {
        store.authenticated = true;
        myProfile();
        mesPrets();
      }
      //
      token.value = a;
    })
    .catch(() => {
      console.log("error");
    });
}

async function logoutDirectus() {
  // AUTHENTICATION
  // await directus.auth.logout({ refresh_token: token }).then("logged out");
  store.authenticated = false;
  store.id = "";
  store.first_name = "";
  store.avatar = "";
  store.resa = "";
  store.me = {};
  localStorage.clear();
  localStorage.setItem("bgcolor", "red");
};


async function loginDirectus() {
  if (!authenticated.value) {
    await directus.auth
      .login({
        email: email.value,
        password: password.value,
        mode: "cookie",
      })
      .then(() => {
        store.authenticated = true;
        console.log("log in");
        myProfile();
        mesPrets();
      })
      .catch(() => {
        console.log("Invalid credentials");
        toast.add({
        severity: "error",
        summary: "Erreur",
        detail: "Mot de passe ou identifiant incorrect.",
        life: 3000,
      });
      password.value ='';

      });
  }
}
</script>

<template>
  <div
    v-if="!store.authenticated"
    class="flex align-items-center justify-center overflow-hidden"
  >
    <div class="flex flex-column align-items-center justify-content-center">
      <div
        style="
          border-radius: 56px;
          padding: 0.3rem;
          background: linear-gradient(
            180deg,
            var(--primary-color) 10%,
            rgba(33, 150, 243, 0) 30%
          );
        "
      >
        <div
          class="w-full surface-card py-8 px-5 sm:px-8"
          style="border-radius: 53px"
        >
          <div class="text-center mb-5">
            <div class="text-900 text-3xl font-medium mb-3">
              Larchant Outilthèque
            </div>
          </div>

          <div>
            <label for="email1" class="block text-900 text-xl font-medium mb-2"
              >Email</label
            >
            <InputText
              id="email1"
              type="text"
              placeholder="Email"
              class="w-full md:w-30rem mb-5"
              v-model="email"
            />

            <label
              for="password1"
              class="block text-900 font-medium text-xl mb-2"
              >Mot de Passe</label
            >
            <Password
              id="password1"
              v-model="password"
              placeholder="Mot de Passe"
              :toggleMask="false"
              class="w-full mb-3"
              inputClass="w-full"
              :feedback="false"
            ></Password>

            <div
              class="flex align-items-center justify-content-between mb-5 gap-5"
            >
              <!-- <div class="flex align-items-center">
                <Checkbox
                  v-model="checked"
                  id="rememberme1"
                  binary
                  class="mr-2"
                ></Checkbox>
                <label for="rememberme1">Se souvenir de moi</label>
              </div> -->
              <a
                class="font-medium no-underline ml-2 text-right cursor-pointer"
                style="color: var(--primary-color)"
                >Mot de passe oublié? (en maintenance)</a
              >
            </div>
            <Button
              @click="loginDirectus()"
              label="Connexion"
              class="w-full p-3 text-xl"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="store.authenticated">
    <div class="block" v-if="store.me.first_name">
      <div class="text-900 text-3xl font-medium mb-3 ">
        Bonjour {{ store.me.first_name }},
      </div>
      <div class="text-700 text-xl font-medium mb-3">
        Vous avez
        <span class="text-green-500">{{ store.me.objet.length }} </span> objet{{store.me.objet.length > 1 ? 's': ''}} en prêt sur le site. Merci.
      </div>
      <div class="text-700 text-xl font-medium mb-3">
        

        <NuxtLink to="/mesprets">
        Vous avez 
        <span class="text-orange-500">
          {{ store.resa > 0 ? store.resa : 0 }}
        </span> 
        demande{{ store.resa > 1 ? 's' : '' }} en attente. Cliquer ici pour les consulter.
      </NuxtLink>

      </div>
      <div class="flex space-x-4">
        <NuxtLink to="/"> 
          <Button
        label="Voir mon Dashboard"
        class=" p-3 text-xl bg-blue-500 hover:bg-blue-700"
      ></Button>
      </NuxtLink>
      
      <Button
        @click="logoutDirectus()"
        label="Se déconnecter"
        class=" p-3 text-xl"
      ></Button>

    
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
</style>
