<template>
  <div>
    <div class="surface-section px-4 py-6 md:px-6 lg:px-8 mb-4 card" v-if="!isAuthenticated">
      <div class="text-700 text-center">
        <div class="text-blue-600 font-bold text-xl mb-3">La BibOB est soutenue par &nbsp; <i
            class="pi pi-megaphone"></i></div>
        <div>
          <div class="text-900 font-bold text-4xl mb-1">Bienvenue à la Bibliothèque des Objets de Larchant</div>
          <div class="text-700 text-2xl mb-1">Prêtez, empruntez, apprenez, réparez...</div>
        </div>
      </div>
    </div>


  </div>
  <div>
    <div v-if="isAuthenticated" class="grid justify-content-center mt-5">
      <div class="col-12 md:col-10 lg:col-8">
        <div class="card p-5 shadow-4 border-round-2xl bg-white">
          <div class="text-center mb-6">
            <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">
              Bonjour {{ user?.first_name }} !
            </h2>
            <p class="text-xl text-gray-500 mb-4">
              Bienvenue sur votre espace personnel.
            </p>
            <NuxtLink to="/edit/outil-add">
              <Button label="Ajouter un outil" icon="pi pi-plus" class="p-3 text-lg bg-indigo-500 text-white" raised />
            </NuxtLink>
          </div>

          <div class="grid">
            <!-- Catalogue -->
            <div class="col-12 md:col-6 p-2">
              <NuxtLink to="/catalogue" class="no-underline text-inherit h-full block">
                <div
                  class="surface-card p-4 shadow-2 border-round hover:shadow-4 transition-duration-200 cursor-pointer h-full flex flex-column align-items-center justify-content-center text-center border-left-3 border-blue-500 relative">
                  <i class="pi pi-list text-4xl text-blue-500 mb-3"></i>
                  <span class="text-xl font-bold text-900 mb-2">Catalogue</span>
                  <span class="text-600">Parcourir les objets</span>
                  <Badge :value="totalItems" class="absolute top-0 right-0 m-2 bg-blue-500"></Badge>
                </div>
              </NuxtLink>
            </div>

            <!-- Mes Outils -->
            <div class="col-12 md:col-6 p-2">
              <NuxtLink to="/mesoutils" class="no-underline text-inherit h-full block">
                <div
                  class="surface-card p-4 shadow-2 border-round hover:shadow-4 transition-duration-200 cursor-pointer h-full flex flex-column align-items-center justify-content-center text-center border-left-3 border-indigo-500 relative">
                  <i class="pi pi-briefcase text-4xl text-indigo-500 mb-3"></i>
                  <span class="text-xl font-bold text-900 mb-2">Mes Outils</span>
                  <span class="text-600">Gérer mes objets</span>
                  <Badge :value="userTools" class="absolute top-0 right-0 m-2 bg-indigo-500"></Badge>
                </div>
              </NuxtLink>
            </div>

            <!-- Mes Emprunts -->
            <div class="col-12 md:col-6 p-2">
              <NuxtLink to="/mesreservations" class="no-underline text-inherit h-full block">
                <div
                  class="surface-card p-4 shadow-2 border-round hover:shadow-4 transition-duration-200 cursor-pointer h-full flex flex-column align-items-center justify-content-center text-center border-left-3 border-orange-500 relative">
                  <i class="pi pi-download text-4xl text-orange-500 mb-3"></i>
                  <span class="text-xl font-bold text-900 mb-2">Mes Emprunts</span>
                  <span class="text-600">Suivre mes réservations</span>
                  <Badge :value="userBorrowed" class="absolute top-0 right-0 m-2 bg-orange-500"></Badge>
                </div>
              </NuxtLink>
            </div>

            <!-- Mes Prêts -->
            <div class="col-12 md:col-6 p-2">
              <NuxtLink to="/mesprets" class="no-underline text-inherit h-full block">
                <div
                  class="surface-card p-4 shadow-2 border-round hover:shadow-4 transition-duration-200 cursor-pointer h-full flex flex-column align-items-center justify-content-center text-center border-left-3 border-green-500 relative">
                  <i class="pi pi-upload text-4xl text-green-500 mb-3"></i>
                  <span class="text-xl font-bold text-900 mb-2">Mes Prêts</span>
                  <span class="text-600">Gérer les demandes</span>
                  <Badge :value="userLent" class="absolute top-0 right-0 m-2 bg-green-500"></Badge>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div class="flex flex-column sm:flex-row justify-center gap-3 mt-6">
            <NuxtLink to="/profil" class="w-full sm:w-auto">
              <Button label="Editer mon profil" icon="pi pi-user-edit" class="w-full p-3 text-lg bg-blue-500 text-white"
                raised />
            </NuxtLink>
            <Button @click="logoutDirectus()" label="Se déconnecter" icon="pi pi-sign-out"
              class="w-full sm:w-auto p-3 text-lg bg-red-500 text-white" raised />
          </div>

          <div class="mt-6 border-t border-gray-200 pt-4">
            <div class="rounded-md bg-blue-50 p-4">
              <div class="flex align-items-center">
                <div class="flex-shrink-0">
                  <i class="pi pi-info-circle text-blue-400" aria-hidden="true"></i>
                </div>
                <div class="ml-3 flex-1 md:flex md:justify-between">
                  <p class="text-sm text-blue-700 m-0">
                    Vous avez actuellement <span class="font-bold">{{ userTools }}</span> outil(s)
                    partagé(s).
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>


    <!-- Stats Section -->
    <!-- Non-authenticated View -->
    <div v-else class="grid justify-content-center mt-1">
      <div class="col-12 md:col-8 lg:col-6">
        <div class="card p-5 text-center shadow-4 border-round-2xl">
          <i class="pi pi-box text-6xl text-blue-500 mb-4"></i>
          <h2 class="text-3xl font-bold text-900 mb-2">Bienvenue sur la BibOB</h2>
          <p class="text-xl text-700 mb-6">La Bibliothèque des Objets à emprunter et à prêter de Larchant</p>

          <div class="flex flex-column gap-3">
            <NuxtLink to="/auth/login">
              <Button label="Se connecter" icon="pi pi-sign-in" class="w-full p-3 text-lg bg-indigo-500 text-white"
                raised />
            </NuxtLink>

            <NuxtLink to="/auth/signup">
              <Button label="Créer un compte" icon="pi pi-user-plus" class="w-full p-3 text-lg bg-blue-500 text-white"
                outlined />
            </NuxtLink>

            <div class="my-3 border-top-1 border-300 relative">
              <span class="absolute top-50 left-50 translate-x-50 translate-y-50 bg-white px-3 text-600"
                style="transform: translate(-50%, -50%);">ou</span>
            </div>

            <NuxtLink to="/catalogue">
              <Button label="Voir le catalogue" icon="pi pi-list" class="w-full p-3 text-lg border bg-zinc-200" text />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>


<script setup>
import { onMounted, ref } from "vue";
// Get the authenticated user
const { user, isAuthenticated, logout } = useUser();
const userId = computed(() => user.value?.id);
const router = useRouter();

async function logoutDirectus() {
  await logout();
  router.push('/auth/login');
};

// Use the stats composable
const {
  userBorrowed,
  userLent,
  totalItems,
  userTools,
  fetchUserStats
} = useStats();

onMounted(() => {
  if (userId.value) {
    fetchUserStats(userId.value);
  }
});

watch(userId, (newId) => {
  if (newId) {
    fetchUserStats(newId);
  }
});
</script>
