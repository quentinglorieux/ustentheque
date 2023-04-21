<template>
  <div v-if="objet" class="flex flex-column gap-1 ">
    <span class="text-2xl"> {{ objet.nom }}</span>
    <img
      class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain block xl:block  border-round"
      :src="`https://devdirectus.rubidiumweb.eu/assets/${objet.photo}`"
    />
   
  </div>
  <div class="flex items-center mb-4 gap-2"> Propriétaire: {{ proprio.first_name }} {{proprio.last_name }} - {{ proprio.telephone }}  -
    <Avatar :image="`https://devdirectus.rubidiumweb.eu/assets/${proprio.avatar}`" class="mr-2" size="large" shape="circle" />
  </div>
 

  <div class="mb-10">  
    <div class="mb-2"> <Calendar showIcon v-model="dates" selectionMode="range" :manualInput="false" /> </div>
     <Button v-if="!dates" disabled label="Envoyer une demande de reservation" severity="info" class="mr-2 mb-2 "></Button> 
     <Button v-if="dates"  label="Envoyer une demande de reservation" severity="info" class="mr-2 mb-2 "></Button> </div>
 

     <NuxtLink to="/catalogue"> <Button label="Catalogue" class="mr-2 mb-2 w-1"></Button></NuxtLink>

</template>

<script setup>
import { Directus } from "@directus/sdk";
const route = useRoute();

const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const objet = ref("");
const dates =ref('')
const proprio =ref('')

async function retrieveOneObjet() {
  const publicData = await directus.items("objet").readOne(route.params.id, 
  {fields: [
          "*,proprietaire.*"
        ]
  });
  objet.value = publicData;
  proprio.value = publicData.proprietaire;
}

onMounted(() => {
  retrieveOneObjet();
});

// watch(route, (newX) => {
//   retrieve1Objet();
// });
</script>
