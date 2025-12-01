<template>
  <div class="layout-topbar">
    <router-link to="/" class="layout-topbar-logo">
      <span>BibOB {{ version }}</span>
    </router-link>

    <button class="p-link layout-menu-button layout-topbar-button hidden md:block" @click="onMenuToggle()">
      <i class="pi pi-bars"></i>
    </button>

    <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
      <i class="pi pi-ellipsis-v"></i>
    </button>

    <div class="layout-topbar-menu" :class="topbarMenuClasses">
      <!-- Menu pour utilisateurs connectés -->
      <div v-if="avatar" class="flex flex-column md:flex-row gap-2">
        <router-link to="/catalogue">
          <button @click="onTopBarMenuButton()"
            class="p-link layout-topbar-button flex align-items-center gap-2 block md:hidden">
            <i class="pi pi-list"></i>
            <span class="font-bold">Catalogue</span>
          </button>
        </router-link>
        <router-link to="/edit/outil-add">
          <button @click="onTopBarMenuButton()"
            class="p-link layout-topbar-button flex align-items-center gap-2 block md:hidden">
            <i class="pi pi-plus-circle"></i>
            <span class="font-bold">Ajouter un outil</span>
          </button>
        </router-link>

        <router-link to="/mesreservations">
          <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button flex align-items-center gap-2">
            <i class="pi pi-download"></i>
            <span class="block md:hidden font-bold">Mes Emprunts</span>
          </button>
        </router-link>

        <router-link to="/mesprets">
          <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button flex align-items-center gap-2">
            <i class="pi pi-upload"></i>
            <span class="block md:hidden font-bold">Mes Prêts</span>
          </button>
        </router-link>

        <router-link to="/mesoutils">
          <button @click="onTopBarMenuButton()"
            class="p-link layout-topbar-button flex align-items-center gap-2 block md:hidden">
            <i class="pi pi-briefcase"></i>
            <span class="font-bold">Mes Outils</span>
          </button>
        </router-link>

        <button @click="logoutDirectus()"
          class="p-link layout-topbar-button flex align-items-center gap-2 block md:hidden">
          <i class="pi pi-sign-out text-red-500"></i>
          <span class="font-bold text-red-500">Se déconnecter</span>
        </button>
      </div>

      <!-- Menu pour utilisateurs non connectés -->
      <div v-else class="flex flex-column md:flex-row gap-2">
        <router-link to="/catalogue">
          <button @click="onTopBarMenuButton()"
            class="p-link layout-topbar-button flex align-items-center gap-2 block md:hidden">
            <i class="pi pi-list"></i>
            <span class="font-bold">Catalogue</span>
          </button>
        </router-link>
      </div>


      <div class="flex flex-row md:flex-row align-items-center gap-2">
        <router-link v-if="first_name" to="/profil" class="block md:hidden">
          <div class="font-bold"> {{ first_name }}</div>
        </router-link>

        <router-link v-if="first_name" to="/profil" class="hidden md:block">
          <div class="pt-3 pl-3"> {{ first_name }}</div>
        </router-link>

        <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
          <router-link to="/auth/login">
            <div v-if="!avatar" class="flex align-items-center gap-2">
              <i class="pi pi-user"></i>
              <span class="block md:hidden font-bold">Se connecter</span>
            </div>
          </router-link>
          <router-link to="/profil">

            <div class="relative inline-block">
              <Avatar v-if="avatar" :image="`https://bibob.rubidiumweb.fr/assets/${avatar}`" class="hover:border-2"
                size="large" shape="circle" />

            </div>

          </router-link>

        </button>
      </div>


      <router-link v-if="pendingRequests > 0" to="/mesprets" class="ml-3">
        <button class="p-link layout-topbar-button relative">
          <i class="pi pi-envelope text-2xl p-overlay-badge" v-badge.danger="pendingRequests"></i>

        </button>
        <Badge v-if="pendingRequests > 0" :value="pendingRequests" class="absolute top-4 right-8"></Badge>

      </router-link>

    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script setup>
const directus = useDirectus();
const { layoutConfig, onMenuToggle, contextPath } = useLayout();
const { user, logout } = useUser();
import { readItems } from "@directus/sdk";
const router = useRouter();

async function logoutDirectus() {
  await logout();
  router.push('/auth/login');
  onTopBarMenuButton(); // Close menu
};

const first_name = computed(() => user.value?.first_name);
const avatar = computed(() => user.value?.avatar);
const { pendingRequests, fetchUserStats } = useStats();

watch(() => user.value, () => {
  if (user.value?.id) {
    fetchUserStats(user.value.id);
  }
}, { immediate: true });

const version = "2.0";

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);


// No need for local myProfile fetch if app.vue does it, 
// but we can keep it if we want to refresh on mount or just rely on 'user' state.
// Since 'user' state is reactive and populated by app.vue, we can just use it.


onMounted(() => {
  bindOutsideClickListener();
});

onBeforeUnmount(() => {
  unbindOutsideClickListener();
});

// const logoUrl = computed(() => {
//   return `${contextPath}layout/images/${layoutConfig.darkTheme.value`
//     }.svg`;
// });

const onTopBarMenuButton = () => {
  topbarMenuActive.value = !topbarMenuActive.value;
};

const topbarMenuClasses = computed(() => {
  return {
    "layout-topbar-menu-mobile-active": topbarMenuActive.value,
  };
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        topbarMenuActive.value = false;
      }
    };
    document.addEventListener("click", outsideClickListener.value);
  }
};
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener("click", outsideClickListener);
    outsideClickListener.value = null;
  }
};
const isOutsideClicked = (event) => {
  if (!topbarMenuActive.value) return;

  const sidebarEl = document.querySelector(".layout-topbar-menu");
  const topbarEl = document.querySelector(".layout-topbar-menu-button");

  return !(
    sidebarEl.isSameNode(event.target) ||
    sidebarEl.contains(event.target) ||
    topbarEl.isSameNode(event.target) ||
    topbarEl.contains(event.target)
  );
};
</script>
