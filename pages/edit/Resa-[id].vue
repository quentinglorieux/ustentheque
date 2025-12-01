<template>
  <div class="grid">
    <div class="col-12 md:col-9">
      <!-- Main form -->
      <div class="card">
        <div class="flex flex-column md:flex-row justify-content-between align-items-center mb-4">
          <h4 v-if="addMode" class="m-0">Nouvelle réservation</h4>
          <h4 v-else class="m-0">Editer la réservation</h4>
          <NuxtLink to="/mesreservations" class="mt-2 md:mt-0">
            <Button label="Retour" icon="pi pi-arrow-left" text severity="secondary" />
          </NuxtLink>
        </div>

        <div class="p-fluid formgrid grid">
          <div v-if="resa" class="field col-12">
            <div class="text-xl font-bold mb-2">{{ resa.objet.nom }}</div>
            <div class="text-500">{{ resa.objet.marque }}</div>
          </div>

          <div class="field col-12 md:col-6">
            <label for="debut" class="font-bold">Debut</label>
            <InputText v-model="resa.debut" id="debut" type="text" disabled class="bg-gray-100" />
          </div>

          <div class="field col-12 md:col-6">
            <label for="fin" class="font-bold">Fin</label>
            <InputText v-model="resa.fin" id="fin" type="text" disabled class="bg-gray-100" />
          </div>

          <div class="field col-12">
            <label class="font-bold mb-2 block">Statut</label>
            <Tag class="px-4 py-2 text-base" :value="resa.statut" :severity="getStatus(resa.statut)" />
          </div>

          <div v-if="resa.statut === 'Validé' && resa.objet.proprietaire" class="field col-12">
            <div class="card bg-blue-50 border-blue-200 border-1 p-3 mt-3">
              <h5 class="text-blue-600 mb-3">Contact Propriétaire</h5>
              <div class="flex flex-column md:flex-row align-items-start md:align-items-center gap-3 mb-3">
                <Avatar :image="`https://bibob.rubidiumweb.fr/assets/${resa.objet.proprietaire.avatar}`" shape="circle"
                  size="large" />
                <span class="font-bold text-lg">{{ resa.objet.proprietaire.first_name }} {{
                  resa.objet.proprietaire.last_name }}</span>
              </div>
              <div class="flex flex-column gap-2">
                <div class="flex align-items-center">
                  <i class="pi pi-phone mr-2 text-primary"></i>
                  <span class="font-semibold mr-2">Téléphone:</span>
                  <span>{{ resa.objet.proprietaire.telephone || 'Non renseigné' }}</span>
                </div>
                <div class="flex align-items-center">
                  <i class="pi pi-map-marker mr-2 text-primary"></i>
                  <span class="font-semibold mr-2">Adresse:</span>
                  <span>{{ resa.objet.proprietaire.location || 'Non renseigné' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="field col-12 mt-4">
            <label class="font-bold mb-2 block">Modifier les dates</label>
            <Calendar v-model="dates" selectionMode="range" :manualInput="false" inline :numberOfMonths="1"
              class="w-full" dateFormat="dd/mm/yy" />
          </div>

          <div class="col-12 mt-4">
            <div v-if="addMode">
              <Button @click="createOneResa()" label="Créer une réservation"
                class="w-full p-3 text-lg bg-indigo-500 text-white" raised></Button>
            </div>
            <div v-else class="flex flex-column md:flex-row gap-3 justify-content-center">
              <Button @click="updateOneResa()" label="Mettre à jour"
                class="w-full md:w-auto px-6 py-3 text-lg bg-indigo-500 text-white" raised icon="pi pi-save"></Button>
              <Button @click="deleteOneResa()" label="Annuler la réservation"
                class="w-full md:w-auto px-6 py-3 text-lg bg-red-500 text-white" raised icon="pi pi-trash"
                severity="danger"></Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar / Info Column (Hidden on mobile if empty or less relevant, or stacked) -->
    <div class="col-12 md:col-3">
      <!-- You can put additional info or navigation here if needed, 
            currently the 'Liste des réservations' button is redundant with the 'Retour' button added above -->
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { readItem, readItems, createItem, updateItem, deleteItem } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useDirectusBase } from "@/composables/useDirectusBase";

const { user } = useUser();
const id = computed(() => user.value?.id);

const toast = useToast();
const directusBase = useDirectusBase();
const directus = useDirectus();

const succes = ref(false);
const addMode = ref(false);

const route = useRoute();
const resa = ref("");
const resaList = ref("");
const dates = ref("");


// isAddMode (or editMode)
const isAddMode = () => {
  if (route.params.id == "add") {
    addMode.value = true;
  }
};

// L'objet
async function retrieveOneResa() {
  try {
    let publicData = await directus.request(readItem("reservation", route.params.id, {
      fields: ["id,debut,fin,statut,objet.nom,objet.marque,objet.proprietaire.first_name,objet.proprietaire.last_name,objet.proprietaire.avatar,objet.proprietaire.telephone,objet.proprietaire.location"],
    }));
    resa.value = publicData;
  } catch (e) {
    console.error("Error fetching reservation", e);
  }
}

async function retrieveAllResa() {
  try {
    let publicData = await directus.request(readItems("reservation", {
      fields: ["id,debut,fin,statut,objet.id,objet.nom,objet.marque"],
      filter: {
        user_created: {
          _eq: "$CURRENT_USER",
        },
      },
    }));
    resaList.value = publicData;
  } catch (e) {
    console.error("Error fetching reservations", e);
  }
}

// Création de l outil
async function createOneResa() {
  try {
    await directus.request(createItem("reservation", {
      debut: dates.value[0],
      fin: dates.value[1],
      statut: "En attente",
      objet: objet.value.id,
    }));
    toast.add({
      severity: "success",
      summary: "Merci",
      detail: "Outil ajouté.",
      life: 3000,
    });
  } catch (e) {
    console.log("Erreur", e);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Veuillez vous reconnecter.",
      life: 3000,
    });
  }
}

// Mise a jour de l outil
async function updateOneResa() {
  try {
    await directus.request(updateItem("reservation", route.params.id, {
      debut: dates.value[0],
      fin: dates.value[1],
    }));
    console.log("U");
    retrieveOneResa();
    toast.add({
      severity: "success",
      summary: "Merci",
      detail: "Outil mis à jour.",
      life: 3000,
    });
  } catch (e) {
    console.log("Erreur", e);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Veuillez vous reconnecter.",
      life: 3000,
    });
  }
}

// Suppression de l outil
async function deleteOneResa() {
  try {
    await directus.request(deleteItem("reservation", route.params.id));
    console.log("del");
    toast.add({
      severity: "success",
      summary: "Merci",
      detail: "Supprimé.",
      life: 3000,
    });
  } catch (e) {
    console.log("Erreur", e);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Veuillez vous reconnecter.",
      life: 3000,
    });
  }
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
