<template>
  <div class="mb-4">
    <NuxtLink to="/mesreservations">
      <Button label="Liste des réservations" class="px-4 py-3"> </Button
    ></NuxtLink>
  </div>
  <div class="grid">
    <div class="col-9">
      <!-- Main form -->
      <div class="card">
        <h4 v-if="addMode">Nouvelle réservation</h4>
        <h4 v-else>Accepter le Pret ?</h4>

        <div v-if="addMode" class="field col-6 md:col-4 md:col-offset-4">
          <Button
            @click="createOneResa()"
            label="Créer une réservation"
            class="w-full p-3 text-xl"
          ></Button>
        </div>
        <div v-if="!addMode" class="field col-8 md:col-6 md:col-offset-3">
          <div class="flex gap-2">
            <Button
              v-if="!addMode"
              @click="acceptOneResa()"
              label="Accepter"
              class="w-full p-3 text-xl"
            ></Button>
            <NuxtLink to="/catalogue">
              <Button
                v-if="!addMode"
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

// isAddMode (or editMode)
const isAddMode = () => {
  if (route.params.id == "add") {
    addMode.value = true;
  }
};

// L'objet
async function retrieveOneResa() {
  let publicData = await directus
    .items("reservation")
    .readOne(route.params.id, {
      fields: ["id,debut,fin,statut,objet.nom,objet.marque"],
    });
  resa.value = publicData;
  // console.log(Date.parse(resa.value.debut))
  // dates.value = [resa.value.debut + 'T22:00:00.000Z',resa.value.fin+ 'T22:00:00.000Z']
}

async function retrieveAllResa() {
  let publicData = await directus.items("reservation").readByQuery({
    fields: ["id,debut,fin,statut,objet.id,objet.nom,objet.marque"],
    filter: {
      user_created: {
        _eq: "$CURRENT_USER",
      },
    },
  });
  resaList.value = publicData.data;
}

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
      console.log("C");
      toast.add({
        severity: "success",
        summary: "Merci",
        detail: "Outil ajouté.",
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

// Mise a jour de l outil
async function updateOneResa() {
  await resaD
    .updateOne(route.params.id, {
      debut: dates.value[0],
      fin: dates.value[1],
    })
    .then(() => {
      console.log("U");
      retrieveOneResa();
      toast.add({
        severity: "success",
        summary: "Merci",
        detail: "Outil mis à jour.",
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

// Suppression de l outil
async function deleteOneResa() {
  await resaD
    .deleteOne(route.params.id)
    .then(() => {
      // succes.value = true;
      // objet.value = {};
      // proprio.value = "";
      console.log("del");
      toast.add({
        severity: "success",
        summary: "Merci",
        detail: "Supprimé.",
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
  isAddMode();
  retrieveAllResa();
  if (!addMode.value) {
    retrieveOneResa();
  }
});
</script>

<style scoped></style>
