<!-- Reservation sur un objet -->
<template>
  <div v-if="objet" class="flex items-stretch">
    <div class="col-12 sm:col-6 lg:col-4 xl:col-3 p-2 flex items-stretch">
      <div class="p-4 border-1 surface-border surface-card border-round">
        <div class="text-2xl font-bold text-center pb-4">{{ objet.nom }}</div>
        <div
          class="flex flex-wrap align-items-center justify-content-between gap-2"
        >
          <div class="flex align-items-center gap-2">
            <i class="pi pi-tag"></i>
            <span> Marque:</span
            ><span class="font-semibold">{{ objet.marque }}</span>
          </div>
          <Tag :value="objet.etat"></Tag>
        </div>
        <div class="flex flex-column align-items-center gap-3 py-5">
          <NuxtLink :to="`/outil-${objet.id}`">
            <img
              class="w-80 h-60 object-contain border-round"
              :src="`https://devdirectus.rubidiumweb.eu/assets/${objet.photo}?    height=300&quality=40`"
            />
          </NuxtLink>
        </div>
        <div class="flex align-items-center justify-content-between">
          <span class="text-m font-semibold"
            >Prix indicatif: {{ objet.prix_indicatif }} €</span
          >
        </div>

        <div class="flex content-center gap-2">
          <div class="mt-1 text-m font-semibold">Propiétaire:</div>
          <Chip
            class="mb-1 bg-slate-50"
            :label="proprio.first_name + ' ' + proprio.last_name"
            :image="`https://devdirectus.rubidiumweb.eu/assets/${proprio.avatar}?fit=cover&width=50&height=50&quality=20`"
          />
        </div>
        <div class="flex align-items-center justify-content-between">
          <span class="text-m font-semibold"
            >Conseils: </span> <span>{{ objet.conseils }}
          </span>
        </div>
        <div class="flex align-items-center justify-content-between">
          <span class="text-m font-semibold"
            >Consommables: </span> <span> {{ objet.consommable }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="authenticated" class="col-12 sm:col-6 lg:col-6 xl:col-6 p-2">
      <div class="p-4 border-1 surface-border surface-card border-round">
        <div class="text-2xl font-bold text-center pb-4">Reservation</div>
        <div class="mb-2">
          <div class="mb-2">
            <Calendar
              showIcon
              v-model="dates"
              selectOtherMonths = true
              view="date"
              selectionMode="range"
              :manualInput="false"
              inline
            />
          </div>
          <Button
            v-if="!dates"
            disabled
            label="Envoyer une demande d'emprunt"
            severity="info"
            class="mr-2 mb-2"
          ></Button>
          <Button
            v-if="dates"
            @click="createOneResa()"
            label="Envoyer une demande d'emprunt"
            severity="info"
            class="mr-2 mb-2"
          ></Button>
        </div>
      </div>
    </div>
    <div class="col-12 sm:col-6 lg:col-2 xl:col-3 p-2">
      <div class="p-4 border-1 surface-border surface-card border-round">
        <div class="text-2xl font-bold text-center pb-4">
          Retour au catalogue
        </div>
        <NuxtLink to="/catalogue">
          <Button label="Catalogue" class="mr-2 mb-2"></Button
        ></NuxtLink>
      </div>
    </div>
  </div>

  <Toast />
</template>

<script setup>
import { Directus } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/auth";




const route = useRoute();
const toast = useToast();

const store = useAuthStore();
const authenticated = computed(() => store.authenticated);

const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const objet = ref("");
const dates = ref("");
const proprio = ref("");

const resaD = directus.items("reservation");

async function retrieveOneObjet() {
  const publicData = await directus
    .items("objet")
    .readOne(route.params.id, { fields: ["*,proprietaire.*"] });
  objet.value = publicData;
  proprio.value = publicData.proprietaire;
}

// async function requestResa() {
//   const resa = await directus.items("reservation").createOne({
//     objet: route.params.id,
//     debut: dates.value[0],
//     fin: dates.value[1],
//     statut: "En attente",
//   });
//   if (resa.id) {
//     toast("Votre demande de réservation a bien été envoyée");
//   } else {
//     toast("Votre demande de réservation n'a pas pu être envoyée");
//   }
// }

// Création de l outil
async function createOneResa() {
  await resaD
    .createOne({
      debut: dates.value[0],
      fin: dates.value[1],
      statut: "a",
      objet: objet.value.id,
    })
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Merci",
        detail: "Demande envoyée.",
        life: 3000,
      });
    })
    .catch(() => {
      console.log("Erreur");
      toast.add({
        severity: "error",
        summary: "Erreur",
        detail: "Demande non envoyée.",
        life: 3000,
      });
    });
}

onMounted(() => {
  retrieveOneObjet();
});

// watch(route, (newX) => {
//   retrieve1Objet();
// });
</script>
