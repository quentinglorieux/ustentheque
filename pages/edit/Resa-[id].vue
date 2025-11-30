<template>
  <div class="grid">
    <div class="col-9">
      <!-- Main form -->
      <div class="card">
        <h4 v-if="addMode">Nouvelle réservation</h4>
        <h4 v-else>Editer la réservation</h4>

        <div class="p-fluid formgrid grid">
          <div v-if="resa" class="field col-12 md:col-12">
            Objet : {{ resa.objet.nom }} - {{ resa.objet.marque }}
          </div>
          <div class="field col-12 md:col-6">
            <label for="nom">Debut</label>
            <InputText v-model="resa.debut" id="nom" type="text" disabled />
          </div>

          <div class="field col-12 md:col-6">
            <label for="etat">Fin</label>
            <InputText v-model="resa.fin" id="etat" type="text" disabled />
          </div>

          <div class="field col-12 md:col-6">
            <Tag class="px-4 py-2 text-sm" :value="resa.statut" :severity="getStatus(resa.statut)" />
          </div>

          <div class="field col-12 md:col-12">
            <Calendar v-model="dates" selectionMode="range" :manualInput="false" inline :numberOfMonths="2"
              dateFormat="dd/mm/yy" />
          </div>

          <div v-if="addMode" class="field col-6 md:col-4 md:col-offset-4">
            <Button @click="createOneResa()" label="Créer une réservation" class="w-full p-3 text-xl"></Button>
          </div>
          <div v-if="!addMode" class="field col-8 md:col-6 md:col-offset-3">
            <div class="flex gap-2">
              <Button v-if="!addMode" @click="updateOneResa()" label="Mettre à jour"
                class="w-full p-3 text-xl"></Button>
              <NuxtLink to="/">
                <Button v-if="!addMode" @click="deleteOneResa()" label="Supprimer" class="w-full p-3 text-xl"
                  severity="warning"></Button>
              </NuxtLink>
              <Toast></Toast>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-3">
      <!-- Main form -->
      <div class="card ">
        <div class="mb-4 ">
          <NuxtLink class=" flex justify-items-center " to="/mesreservations">
            <Button label="Liste des réservations" class="px-4 py-3"> </Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
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
      fields: ["id,debut,fin,statut,objet.nom,objet.marque"],
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
