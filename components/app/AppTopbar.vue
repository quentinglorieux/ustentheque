<template>
  <div class="layout-topbar">
    <router-link to="/" class="layout-topbar-logo">
      <img :src="logoUrl" alt="" />
      <span>BibOB {{ version }}</span>
    </router-link>

    <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
      <i class="pi pi-bars"></i>
    </button>

    <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
      <i class="pi pi-ellipsis-v"></i>
    </button>

    <div class="layout-topbar-menu" :class="topbarMenuClasses">
      <div v-if="avatar">
        <router-link to="/mesreservations"> <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
            <i class="pi pi-download"></i>
          </button>
        </router-link>

        <router-link to="/mesprets"> <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
            <i class="pi pi-upload"></i>
          </button>
        </router-link>
      </div>


      <router-link to="/profil">
        <div class="pt-3 pl-3"> {{ first_name }}</div>
      </router-link>

      <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
        <router-link to="/auth/login"> <i v-if="!avatar" class="pi pi-user"></i></router-link>
        <router-link to="/profil">
          <Avatar v-if="avatar" :image="`https://bibob.rubidiumweb.fr/assets/${avatar}`" class="hover:border-2"
            size="large" shape="circle" />
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
import { readMe } from "@directus/sdk";
import { useDirectusBase } from "@/composables/useDirectusBase";

const { layoutConfig, onMenuToggle, contextPath } = useLayout();
const { user, isAuthenticated } = useUser();

const first_name = computed(() => user.value?.first_name);
const avatar = computed(() => user.value?.avatar);

const version = "2.0.beta.0";

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();

const directusBase = useDirectusBase();
const directus = useDirectus();

// No need for local myProfile fetch if app.vue does it, 
// but we can keep it if we want to refresh on mount or just rely on 'user' state.
// Since 'user' state is reactive and populated by app.vue, we can just use it.


onMounted(() => {
  bindOutsideClickListener();
});

onBeforeUnmount(() => {
  unbindOutsideClickListener();
});

const logoUrl = computed(() => {
  return `${contextPath}layout/images/${layoutConfig.darkTheme.value ? "logo-white" : "logo-dark"
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
