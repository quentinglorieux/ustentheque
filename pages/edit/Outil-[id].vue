<template>
  <div class="grid">
    <div class="col-12">
      <div v-if="!isAuthenticated" class="flex flex-column align-items-center justify-content-center h-screen">
        <div class="text-2xl font-bold mb-4">Vous n'êtes pas connecté.</div>
        <NuxtLink to="/auth/login">
          <Button label="Connectez-vous ici" icon="pi pi-sign-in" severity="primary" size="large" raised
            rounded></Button>
        </NuxtLink>

      </div>

      <div v-else class="grid nested-grid">
        <!-- Header -->
        <div class="col-12">
          <div class="flex align-items-center justify-content-between mb-4">
            <h1 class="text-3xl font-bold text-900 m-0">
              {{ addMode ? "Ajouter un nouvel outil" : `Éditer : ${objet.nom}` }}
            </h1>
            <NuxtLink to="/mesoutils">
              <Button label="Retour" icon="pi pi-arrow-left" text severity="secondary" />
            </NuxtLink>
          </div>
        </div>

        <!-- Main Content (Left Column) -->
        <div class="col-12 md:col-8 order-2 md:order-1">
          <div class="card p-fluid border-round-xl shadow-2 p-5 border-top-3 border-blue-500">
            <h5 class="text-xl font-semibold mb-4 text-blue-600">Informations Générales</h5>

            <div class="field grid">
              <label for="nom" class="col-12 mb-2 md:col-2 md:mb-0 font-medium">Nom</label>
              <div class="col-12 md:col-10">
                <InputText v-model="objet.nom" id="nom" type="text" placeholder="Ex: Perceuse à percussion"
                  class="w-full bg-blue-50 p-2" />
              </div>
            </div>

            <div class="field grid">
              <label for="brand" class="col-12 mb-2 md:col-2 md:mb-0 font-medium">Marque</label>
              <div class="col-12 md:col-10">
                <Dropdown v-model="selectedMarque" :editable="true" :options="fieldsMarque" optionLabel="nom"
                  placeholder="Sélectionnez ou ajoutez une marque" class="w-full p-2 bg-blue-50"
                  @keyup.enter="handleBrandInput">
                  <template #option="slotProps">
                    <div class="flex align-items-center">
                      <div>{{ slotProps.option.nom }}</div>
                    </div>
                  </template>
                </Dropdown>
                <small class="text-gray-500 block mt-1">Appuyez sur "Entrée" pour ajouter une nouvelle
                  marque.</small>
              </div>
            </div>

            <div class="formgrid grid">
              <div class="field col-12 md:col-6">
                <label for="etat" class="font-medium">État</label>
                <Dropdown v-model="selectedEtat" :options="fieldsEtat" optionLabel="etat" placeholder="État de l'objet"
                  class="w-full p-2 bg-blue-50" />
              </div>
              <div class="field col-12 md:col-6">
                <label for="prix_indicatif" class="font-medium">Prix d'achat (€)</label>
                <InputNumber v-model="objet.prix_indicatif" inputId="prix_indicatif" mode="currency" currency="EUR"
                  locale="fr-FR" placeholder="0,00 €" class="w-full p-2 bg-blue-50" />
              </div>
              <div class="field col-12 md:col-6">
                <label for="duree" class="font-medium p-2">Durée max. (jours)</label>
                <InputNumber v-model="objet.duree_max" inputId="duree" suffix=" jours" placeholder="Ex: 7"
                  class="w-full p-2 bg-blue-50" />
              </div>
            </div>

            <Divider />

            <h5 class="text-xl font-semibold mb-4 text-blue-600">Détails & Description</h5>

            <div class="field">
              <label for="conseils" class="font-medium">Conseils d'utilisation</label>
              <Textarea v-model="objet.conseils" id="conseils" rows="4"
                placeholder="Partagez vos astuces ou précautions..." class="w-full p-2 bg-blue-50" />
            </div>

            <div class="field">
              <label for="consommable" class="font-medium">Consommables nécessaires</label>
              <Textarea v-model="objet.consommable" id="consommable" rows="3"
                placeholder="Ex: Papier de verre, mèches..." class="w-full p-2 bg-blue-50" />
            </div>
          </div>
        </div>

        <!-- Sidebar (Right Column) -->
        <div class="col-12 md:col-4 order-1 md:order-2">
          <!-- Image Upload Card -->
          <div
            class="card border-round-xl shadow-2 p-4 mb-4 flex flex-column align-items-center border-top-3 border-blue-500">
            <h5 class="text-xl font-semibold mb-3 text-blue-600 align-self-start">Photo de l'objet</h5>

            <div
              class="relative w-full h-15rem border-2 border-dashed border-blue-200 border-round bg-blue-50 flex align-items-center justify-content-center overflow-hidden mb-3">
              <img v-if="image"
                :src="`https://bibob.rubidiumweb.fr/assets/${image}?fit=cover&width=400&height=300&quality=80`"
                class="w-full h-full object-cover" alt="Aperçu" />
              <div v-else class="text-center text-500">
                <i class="pi pi-image text-4xl mb-2"></i>
                <p>Aucune image</p>
              </div>
            </div>

            <FileUpload mode="basic" name="file" :url="`https://bibob.rubidiumweb.fr/files`" accept="image/*"
              :maxFileSize="5000000" :auto="true" chooseLabel="Ajouter une photo" class="p-button w-full"
              :withCredentials="true" @select="uploadFile" />
          </div>

          <!-- Actions Card (Desktop Only) -->
          <div class="card border-round-xl shadow-2 p-4 border-top-3 border-blue-500 hidden md:block">
            <h5 class="text-xl font-semibold mb-3 text-blue-600">Actions</h5>
            <div class="flex flex-column gap-3">
              <Button v-if="addMode" @click="createOneObjet" class="bg-indigo-500 text-white px-6 py-2"
                label="Créer l'objet" icon="pi pi-check" size="x-large" variant="success" raised />

              <template v-else>
                <Button @click="updateOneObjet" label="Enregistrer" icon="pi pi-save"
                  class="w-full bg-indigo-500 text-white px-6 py-2" size="large" raised />
                <Button @click="confirmDelete" label="Supprimer" icon="pi pi-trash" severity="danger"
                  class="w-full bg-red-500 text-white px-6 py-2" outlined />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Sticky Action Bar -->
  <div class="block md:hidden fixed bottom-0 left-0 w-full z-5 surface-0 border-top-1 border-gray-200 p-3 shadow-4">
    <div class="flex gap-2">
      <Button v-if="addMode" @click="createOneObjet" label="Créer l'objet" icon="pi pi-check" severity="success"
        size="large" raised class="w-full font-bold bg-indigo-500 text-white px-6 py-2 mb-2" />
      <template v-else>
        <Button @click="updateOneObjet" label="Enregistrer" icon="pi pi-save" severity="primary" size="large" raised
          class="flex-1 font-bold bg-indigo-500 text-white px-6 py-2" />
        <Button @click="confirmDelete" icon="pi pi-trash" severity="danger" outlined class="w-4rem" />
      </template>
    </div>
  </div>

  <!-- Confirm Dialogs -->
  <ConfirmDialog />
  <Toast />
</template>

<script setup>
import { readItem, createItem, updateItem, deleteItem, readItems, uploadFiles } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { ref, onMounted } from "vue";
import { useDirectusBase } from "@/composables/useDirectusBase";

// Directus and other dependencies
const directusBase = useDirectusBase();
const directus = useDirectus();
const toast = useToast();
const confirm = useConfirm();
const { user, isAuthenticated } = useUser();
const route = useRoute();

// Form-related data
const objet = ref({});
const selectedMarque = ref("");
const selectedEtat = ref("");
const addMode = ref(false);
const fieldsMarque = ref([]);
const image = ref("");

// Function to determine if in add mode
const isAddMode = () => {
  addMode.value = route.params.id === "add";
};

// Retrieve object details for editing, including related `Marque`
async function retrieveOneObjet() {
  try {
    const publicData = await directus.request(readItem("objet", route.params.id, {
      fields: ["*", "brand.*"],
    }));
    objet.value = publicData;
    image.value = publicData.photo;
    selectedMarque.value = publicData.brand || {};
    selectedEtat.value = { etat: publicData.etat }; // Assuming fieldsEtat structure
  } catch (e) {
    console.error("Error fetching object", e);
  }
}

// Create new object
async function createOneObjet() {
  if (!objet.value.nom || !image.value) {
    toast.add({ severity: "error", summary: "Erreur", detail: "Le nom et la photo sont obligatoires.", life: 3000 });
    return;
  }
  try {
    await directus.request(createItem("objet", {
      nom: objet.value.nom,
      brand: selectedMarque.value?.id,
      etat: selectedEtat.value.etat,
      prix_indicatif: objet.value.prix_indicatif,
      duree_max: objet.value.duree_max,
      consommable: objet.value.consommable,
      conseils: objet.value.conseils,
      proprietaire: user.value.id,
      photo: image.value,
    }));
    toast.add({ severity: "success", summary: "Objet ajouté", life: 3000 });
    addMode.value = false;
  } catch (e) {
    console.error("Error creating object", e);
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  }
}

// Update existing object
async function updateOneObjet() {
  if (!objet.value.nom || !image.value) {
    toast.add({ severity: "error", summary: "Erreur", detail: "Le nom et la photo sont obligatoires.", life: 3000 });
    return;
  }
  try {
    await directus.request(updateItem("objet", route.params.id, {
      nom: objet.value.nom,
      brand: selectedMarque.value?.id,
      etat: selectedEtat.value.etat,
      prix_indicatif: objet.value.prix_indicatif,
      duree_max: objet.value.duree_max,
      consommable: objet.value.consommable,
      conseils: objet.value.conseils,
      photo: image.value,
    }));
    toast.add({
      severity: "success",
      summary: "Objet mis à jour",
      life: 3000,
    });
  } catch (e) {
    console.error("Error updating object", e);
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  }
}

// Add a new marque to Directus after confirmation
const handleBrandInput = async () => {
  const typedMarque = selectedMarque.value;
  //console.log(typedMarque);
  if (
    typedMarque &&
    !fieldsMarque.value.some((item) => item.nom === typedMarque)
  ) {
    confirm.require({
      message: `La marque "${typedMarque}" n'existe pas. Voulez-vous l'ajouter ?`,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          // Add the new marque to the `Marque` collection
          const newMarque = await directus.request(createItem("marque", {
            nom: typedMarque,
          }));

          // After creating, refresh the marques and select the new one
          await retrieveMarque();
          selectedMarque.value = newMarque;

          // Show a success message
          toast.add({
            severity: "success",
            summary: "Nouvelle marque ajoutée",
            detail: typedMarque,
            life: 3000,
          });
        } catch (error) {
          // Handle error if the marque could not be created
          toast.add({
            severity: "error",
            summary: "Erreur",
            detail: "Impossible d'ajouter la nouvelle marque",
            life: 3000,
          });
        }
      },
      reject: () => {
        // Handle case where the user declines adding the new marque
        selectedMarque.value = {};
      },
    });
  }
};

// Retrieve list of marques from the new `Marque` collection
async function retrieveMarque() {
  try {
    const publicData = await directus.request(readItems("marque", { limit: -1 }));
    fieldsMarque.value = publicData;
  } catch (e) {
    console.error("Error fetching marques", e);
  }
}

//retrieveEtat
const fieldsEtat = [
  { etat: "Neuf" },
  { etat: "Excellent" },
  { etat: "Bon" },
  { etat: "Moyen" },
  { etat: "Mauvais" },
  { etat: "En panne" },
  { etat: "Hors Service" },
];

const uploadFile = async (event) => {
  let form = new FormData();
  form.append("file", event.files[0]);

  try {
    const im = await directus.request(uploadFiles(form));
    image.value = im.id;
    //console.log(image.value);
  } catch (e) {
    onFailed();
  }
};

const onFailed = () => {
  toast.add({ severity: "error", summary: "Erreur", detail: "Upload failed", life: 3000 });
}

// Confirm deletion wrapper
const confirmDelete = () => {
  confirm.require({
    message: 'Êtes-vous sûr de vouloir supprimer cet objet ?',
    header: 'Confirmation de suppression',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteOneObjet();
    },
    reject: () => {
      // User rejected
    }
  });
};

async function deleteOneObjet() {
  try {
    await directus.request(deleteItem("objet", route.params.id));
    toast.add({ severity: "success", summary: "Objet supprimé", life: 3000 });
    // Redirect to list after deletion
    navigateTo('/mesoutils');
  } catch (e) {
    console.error("Error deleting object", e);
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  }
}

// On component mount, retrieve data
onMounted(() => {
  isAddMode();
  retrieveMarque();
  if (!addMode.value) {
    retrieveOneObjet();
  }
});
</script>

<style scoped></style>
