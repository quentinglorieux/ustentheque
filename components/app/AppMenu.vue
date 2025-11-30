<script setup>
import AppMenuItem from "./AppMenuItem.vue";

const resa = computed(() => 0); // Placeholder, as resa count was removed from store



const model = ref([
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
      },
      {
        label: "Mes outils",
        icon: "pi pi-fw pi-wrench",
        to: "/mesoutils",
      },
      {
        label: "J'emprunte",
        icon: "pi pi-fw pi-download",
        to: "/mesreservations",
      },
      {
        label: "Je prête",
        icon: "pi pi-fw pi-upload",
        to: "/mesprets",
        val: resa,
      },
      {
        label: "Profil",
        icon: "pi pi-fw pi-user",
        to: "/profil",
      },

    ],
  },
  {
    label: "Admin",
    items: [{
      label: "Connexion",
      icon: "pi pi-fw pi-sign-in",
      to: "/auth/login",
    },],
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
