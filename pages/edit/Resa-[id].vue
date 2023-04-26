<template>
  <!-- {{ resaList }}
  resa : {{ resa }} -->
  {{ dates }}
  
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
        <h4 v-else>Editer</h4>

        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="nom">Debut</label>
            <InputText v-model="resa.debut" id="nom" type="text" />
          </div>

          <div class="field col-12 md:col-6">
            <label for="etat">Fin</label>
            <InputText v-model="resa.fin" id="etat" type="text" />
          </div>

          <div class="field col-12 md:col-6">
            <Tag
              class="px-4 py-2 text-sm"
              :value="resa.statut"
              :severity="getStatus(resa.statut)"
            />
          </div>

          <div class="field col-12 md:col-12">
            <Calendar
              v-model="dates"
              selectionMode="range"
              :manualInput="false"
              inline
              :numberOfMonths="2"
              dateFormat="dd/mm/yy"
            />
          </div>

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
                @click="updateOneResa()"
                label="Mettre à jour"
                class="w-full p-3 text-xl"
              ></Button>
              <Button
                v-if="!addMode"
                @click="deleteOneResa()"
                label="Supprimer"
                class="w-full p-3 text-xl"
                severity="warning"
              ></Button>
            </div>
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
const id = computed(() => store.id);

const toast = useToast();
const directus = new Directus("https://devdirectus.rubidiumweb.eu");

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
  let publicData = await directus
    .items("reservation")
    .readOne(route.params.id, { fields: ["*"] });
  resa.value = publicData;
  console.log(Date.parse(resa.value.debut))
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
  await objetD
    .createOne({
      nom: nom.value,
      marque: selectedMarque.value,
      etat: etat.value,
      prix_indicatif: prix_indicatif.value,
      duree_max: duree.value,
      consommable: consommable.value,
      conseils: conseils.value,
      proprietaire: store.id,
      photo: image.value,
    })
    .then(() => {
      succes.value = true;
      addMode.value = false;
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
  await objetD
    .updateOne(route.params.id, {
      nom: nom.value,
      marque: selectedMarque.value,
      etat: etat.value,
      prix_indicatif: prix_indicatif.value,
      duree_max: duree.value,
      consommable: consommable.value,
      conseils: conseils.value,
      photo: image.value,
    })
    .then(() => {
      succes.value = true;
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
  await objetD
    .deleteOne(route.params.id)
    .then(() => {
      succes.value = true;
      objet.value = {};
      proprio.value = "";
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
