<script setup>
import AppMenuItem from "./AppMenuItem.vue";

const resa = computed(() => 0);

const { isAuthenticated, logout } = useUser();
const router = useRouter();

const model = computed(() => [
  {
    label: "Home",
    items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" }],
  },
  {
    label: "BibOB",
    items: [
      {
        label: "Catalogue",
        icon: "pi pi-fw pi-list",
        to: "/catalogue",
      },
      {
        label: "Ajouter un outil",
        icon: "pi pi-fw pi-plus",
        to: "/edit/outil-add",
        visible: isAuthenticated.value
      },
      {
        label: "Mes outils",
        icon: "pi pi-fw pi-wrench",
        to: "/mesoutils",
        visible: isAuthenticated.value
      },
      {
        label: "J'emprunte",
        icon: "pi pi-fw pi-download",
        to: "/mesreservations",
        visible: isAuthenticated.value
      },
      {
        label: "Je prête",
        icon: "pi pi-fw pi-upload",
        to: "/mesprets",
        val: resa,
        visible: isAuthenticated.value
      },
      {
        label: "Profil",
        icon: "pi pi-fw pi-user",
        to: "/profil",
        visible: isAuthenticated.value
      },

    ],
  },
  {
    label: "Admin",
    items: isAuthenticated.value ? [{
      label: "Se déconnecter",
      icon: "pi pi-fw pi-sign-out",
      command: () => {
        logout();
        router.push('/auth/login');
      }
    }] : [{
      label: "Connexion",
      icon: "pi pi-fw pi-sign-in",
      to: "/auth/login",
    }],
  },

]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
