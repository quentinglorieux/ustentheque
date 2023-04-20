<template>
  <div v-if="objet" class="flex flex-column gap-1">
    <span class="text-2xl"> {{ objet.nom }}</span>
    <img
      class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain block xl:block  border-round"
      :src="`https://devdirectus.rubidiumweb.eu/assets/${objet.photo}`"
    />
    <NuxtLink to="/catalogue"> <Button label="Catalogue" class="mr-2 mb-2 w-1"></Button></NuxtLink>

   
  </div>
</template>

<script setup>
import { Directus } from "@directus/sdk";
const route = useRoute();

const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const objet = ref("");
//   async function retrieve1Objet() {
//     const publicData = await directus.items("objet").readByQuery({
//       fields: ["*"],
//       filter: {
//           "id": {
//               "_eq": route.params.id
//           }
//   }
//   });
//   objet.value = publicData.data[0];
// }

async function retrieve1Objet() {
  const publicData = await directus.items("objet").readOne(route.params.id);
  objet.value = publicData;
}

onMounted(() => {
  retrieve1Objet();
});

// watch(route, (newX) => {
//   retrieve1Objet();
// });
</script>
