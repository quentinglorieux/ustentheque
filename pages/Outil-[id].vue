<!-- Reservation sur un objet -->
<template>
  <div v-if="objet" class="flex flex-column gap-1">
    <span class="text-2xl"> {{ objet.nom }}</span>
    <img
      class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain block xl:block border-round"
      :src="`https://devdirectus.rubidiumweb.eu/assets/${objet.photo}?quality=50`"
    />
  </div>
  <div  class="flex content-center gap-2"> 
        <div class="mt-1" > Propiétaire: </div>
      <Chip class="mb-1 bg-slate-50" :label="proprio.first_name + ' ' + proprio.last_name" :image="`https://devdirectus.rubidiumweb.eu/assets/${proprio.avatar}?fit=cover&width=50&height=50&quality=20`" />
      </div>
 

  <div class="mb-10">  
    <div class="mb-2"> <Calendar showIcon v-model="dates" selectionMode="range" :manualInput="false" /> </div>
     <Button v-if="!dates" disabled label="Envoyer une demande d'emprunt" severity="info" class="mr-2 mb-2 "></Button> 
     <Button v-if="dates" @click="createOneResa()" label="Envoyer une demande d'emprunt" severity="info" class="mr-2 mb-2 "></Button> </div>
     <Toast />


     <NuxtLink to="/catalogue"> <Button label="Catalogue" class="mr-2 mb-2 w-1"></Button></NuxtLink>

</template>

<script setup>
import { Directus } from "@directus/sdk";
import { useToast } from "primevue/usetoast";

const route = useRoute();
const toast = useToast();


const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const objet = ref("");
const dates =ref('')
const proprio =ref('')

const resaD = directus.items("reservation");


async function retrieveOneObjet() {
  const publicData = await directus
    .items("objet")
    .readOne(route.params.id, { fields: ["*,proprietaire.*"] });
  objet.value = publicData;
  proprio.value = publicData.proprietaire;
}

async function requestResa() {
  const resa = await directus.items("reservation").createOne({
    objet: route.params.id,
    debut: dates.value[0],
    fin: dates.value[1],
    statut: "En attente",
  });
  if (resa.id) {
    toast("Votre demande de réservation a bien été envoyée");
  }else {
    toast("Votre demande de réservation n'a pas pu être envoyée");
  }
}

// Création de l outil
async function createOneResa() {
  await resaD
    .createOne({
      debut: dates.value[0],
      fin:  dates.value[1],
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
