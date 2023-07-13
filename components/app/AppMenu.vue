<script setup>
import AppMenuItem from "./AppMenuItem.vue";
import { useAuthStore } from "@/stores/auth";
const store = useAuthStore();
const resa = computed(() => store.resa);



const model = ref([
{
    label: "Home",
    items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" }],
  },
  {
    label: "Ustentheque",
    items: [
      {
        label: "Catalogue",
        icon: "pi pi-fw pi-list",
        to: "/catalogue",
      },
      {
        label: "Mes outils",
        icon: "pi pi-fw pi-wrench",
        to: "/mesoutils",
      },
      {
        label: "Mes emprunts",
        icon: "pi pi-fw pi-calendar",
        to: "/mesreservations",
      },
      {
        label: "Mes prets",
        icon: "pi pi-fw pi-external-link",
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
        label: "Login",
        icon: "pi pi-fw pi-sign-in",
        to: "/auth/login",
      },],
  },
  
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item
        v-if="!item.separator"
        :item="item"
        :index="i"
      ></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>


