<template>
  <div class="layout-topbar">
    <router-link to="/" class="layout-topbar-logo">
      <img :src="logoUrl" alt="" />
      <span>BibOB {{ version }}</span>
    </router-link>

    <button
      class="p-link layout-menu-button layout-topbar-button"
      @click="onMenuToggle()"
    >
      <i class="pi pi-bars"></i>
    </button>

    <button
      class="p-link layout-topbar-menu-button layout-topbar-button"
      @click="onTopBarMenuButton()"
    >
      <i class="pi pi-ellipsis-v"></i>
    </button>

    <div class="layout-topbar-menu" :class="topbarMenuClasses">
        <router-link to="/mesreservations">  <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
        <i class="pi pi-calendar"></i>
      </button>
      </router-link>



      <router-link to="/profil"> <div class="pt-3 pl-3"> {{ first_name }}</div></router-link>

      <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
        <i v-if="!avatar" class="pi pi-user"></i>
        <router-link to="/profil"> <Avatar
          v-if="avatar"
          :image="`https://devdirectus.rubidiumweb.eu/assets/${avatar}`"
          class="hover:border-2"
          size="large"
          shape="circle"
        />
    </router-link>
      </button>

      <!-- <button @click="onSettingsClick()" class="p-link layout-topbar-button">
                <i  class="pi pi-cog"></i>
                <span>Settings</span>
            </button> -->
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script setup>
import { Directus } from "@directus/sdk";
import { useAuthStore } from "@/stores/auth";

const { layoutConfig, onMenuToggle, contextPath } = useLayout();

const store = useAuthStore();
const first_name = computed(() => store.first_name);
const avatar = computed(() => store.avatar);

const version = "1.0.1";

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();

const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const me = ref("");

async function myProfile() {
  if (store.authenticated) {
    me.value = await directus.users.me.read();
  }
}

onMounted(() => {
  bindOutsideClickListener();
  myProfile();
});

onBeforeUnmount(() => {
  unbindOutsideClickListener();
});

const logoUrl = computed(() => {
  return `${contextPath}layout/images/${
    layoutConfig.darkTheme.value ? "logo-white" : "logo-dark"
  }.svg`;
});

const onTopBarMenuButton = () => {
  topbarMenuActive.value = !topbarMenuActive.value;
};
const onSettingsClick = () => {
  topbarMenuActive.value = false;
  router.push("/documentation");
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
