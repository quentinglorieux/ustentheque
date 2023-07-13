<template>
  <div class="grid">
    <div class="col-9">
      <!-- Main form -->
      <div class="card">
        <h4>Accepter le Pret ?</h4>

        <div class="field col-8 md:col-6 md:col-offset-3">
          <div class="flex gap-2">
            <Button
              @click="acceptOneResa()"
              label="Accepter"
              class="w-full p-3 text-xl"
            ></Button>
            <NuxtLink to="/catalogue">
              <Button

                @click="refuseOneResa()"
                label="Refuser"
                class="w-full p-3 text-xl"
                severity="warning"
              ></Button>
            </NuxtLink>
            <Toast></Toast>
          </div>
        </div>
      </div>
    </div>
    <div class="col-3">
      <!-- Main form -->
      <div class="card ">
        <div class="mb-4 ">
          <NuxtLink  class=" flex justify-items-center " to="/mesprets">
            <Button label="Liste des prets" class="px-4 py-3"> </Button
          ></NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Directus } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/auth";

const store = useAuthStore();

const toast = useToast();
const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const addMode = ref(false);

const route = useRoute();
const resa = ref("");
const resaList = ref("");
const dates = ref("");

const resaD = directus.items("reservation");



// La resa
async function retrieveOneResa() {
  let publicData = await directus
    .items("reservation")
    .readOne(route.params.id, {
      fields: ["id,debut,fin,statut,objet.nom,objet.marque"],
    });
  resa.value = publicData;
}

// async function retrieveAllResa() {
//   let publicData = await directus.items("reservation").readByQuery({
//     fields: ["id,debut,fin,statut,objet.id,objet.nom,objet.marque"],
//     filter: {
//       user_created: {
//         _eq: "$CURRENT_USER",
//       },
//     },
//   });
//   resaList.value = publicData.data;
// }



// Mise a jour de l outil
async function acceptOneResa() {
  await resaD
    .updateOne(route.params.id, {
      statut: "Validé"
    })
    .then(() => {
      console.log("U");
      retrieveOneResa();
      toast.add({
        severity: "success",
        summary: "Merci",
        detail: "Reservation acceptée !",
        life: 3000,
      });
    })
    .catch(() => {
      console.log("Erreur");
      toast.add({
        severity: "error",
        summary: "Erreur",
        detail: "Veuillez vous reconnecter.",
        life: 3000,
      });
    });
}


const getStatus = (st) => {
  switch (st) {
    case "En attente":
      return null;
    case "Validé":
      return "success";

    case "Rendu":
      return "warning";

    case "Refusé":
      return "danger";

    default:
      return null;
  }
};

onMounted(() => {
  // retrieveAllResa();
    retrieveOneResa();
});
</script>

<style scoped></style>
