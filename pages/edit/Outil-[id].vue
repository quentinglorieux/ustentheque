<template>
  <div class="grid">
    <div class="mt-2 col-12 md:col-9">
      <div v-if="!store.authenticated">
        <div>Vous n'etes pas connécté.</div>
        <NuxtLink to="/auth/login">
          <Button
            label="Connectez vous ici"
            icon="pi pi-sign-in"
            severity="info"
            class="font-bold mt-5 px-5 py-3 p-button-raised white-space-nowrap"
          ></Button>
        </NuxtLink>
      </div>

      <div v-if="store.authenticated" class="card p-4 sm:p-6">
        <h4 class="text-xl sm:text-2xl font-semibold mb-4">
          {{
            addMode
              ? "Nouvel objet"
              : `Éditer : ${objet.nom} ${selectedMarque.nom}`
          }}
        </h4>
        <div class="p-fluid formgrid grid gap-4">
          <div class="field col-12 md:col-6">
            <label for="nom">Nom</label>
            <InputText
              v-model="objet.nom"
              id="nom"
              type="text"
              class="w-full"
            />
          </div>

          <!-- Brand Dropdown with Editable Functionality -->
          <div class="field col-12 md:col-6">
            <label for="brand">Marque :</label>
            <Dropdown
              v-model="selectedMarque"
              :editable="true"
              :options="fieldsMarque"
              optionLabel="nom"
              placeholder="Choisissez ou ajoutez une marque"
              class="w-full"
              @keyup.enter="handleBrandInput"
            />
            <small class="text-sm text-gray-500 italic">
              Tapez "Enter" après avoir saisi la nouvelle marque pour l'ajouter
              si elle n'existe pas déjà.
            </small>
          </div>

          <div class="field col-12 md:col-4">
            <label for="etat">État</label>
            <Dropdown
              v-model="selectedEtat"
              :editable="true"
              :options="fieldsEtat"
              optionLabel="etat"
              placeholder="Dans quel état ?"
              class="w-full"
            />
          </div>

          <div class="field col-12 md:col-4">
            <label for="prix_indicatif">Prix (€)</label>
            <InputText
              v-model="objet.prix_indicatif"
              id="prix_indicatif"
              type="text"
              class="w-full"
            />
            <small class="text-sm text-gray-500 italic">
              Prix indicatif lors de l'achat.
              <span class="text-gray-900"
                >Les prêts sont toujours gratuits.</span
              >
            </small>
          </div>

          <div class="field col-12 md:col-4">
            <label for="duree">Durée (jours)</label>
            <InputText
              v-model="objet.duree_max"
              id="duree"
              type="text"
              class="w-full"
            />
            <small class="text-sm text-gray-500 italic">
              Durée maximale de prêt.
            </small>
          </div>

          <div class="field col-12 md:col-6">
            <label for="conseils">Conseils</label>
            <Textarea
              v-model="objet.conseils"
              id="conseils"
              rows="4"
              class="w-full"
            />
          </div>

          <div class="field col-12 md:col-6">
            <label for="consommable">Consommables</label>
            <Textarea
              v-model="objet.consommable"
              id="consommable"
              rows="4"
              class="w-full"
            />
          </div>

          <!-- Create / Update Buttons -->
          <div
            v-if="addMode"
            class="field col-12 sm:col-6 sm:col-offset-3 flex justify-center"
          >
            <Button
              @click="createOneObjet"
              label="Créer un objet"
              class="w-full sm:w-auto p-3 text-lg sm:text-xl bg-green-500 hover:bg-green-700"
            />
          </div>
          <div
            v-else
            class="field col-12 flex flex-col sm:flex-row gap-3 sm:justify-center"
          >
            <Button
              @click="updateOneObjet"
              label="Mettre à jour"
              class="w-full sm:w-auto p-3 text-lg sm:text-xl bg-blue-500 hover:bg-blue-700"
            />
            <Button
              @click="deleteOneObjet"
              label="Supprimer"
              class="w-full sm:w-auto p-3 text-lg sm:text-xl bg-red-500 hover:bg-red-700"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.authenticated" class="col-12 md:col-3">
      <!-- Image -->

      <div class="card flex flex-col content-center">
        <Toast />
        <h4 class="text-center">Editer l'image</h4>
        <div v-if="image" class="flex justify-center">
          <img
            class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain block xl:block border-round"
            :src="`${directusBase}/assets/${image}?fit=cover&width=200&height=200&quality=70`"
          />
        </div>
        <div v-else class="flex justify-center">
          <img
            class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain block xl:block border-round"
            :src="`${directusBase}/assets/7ed6273f-9add-4257-b546-d99af9a3505a.png?fit=cover&width=200&height=200&quality=70`"
          />
        </div>

        <FileUpload
          class="flex justify-center mx-1"
          v-model="selectedFile"
          name="file"
          :url="`${directusBase}/files`"
          mode="basic"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          maxFileSize="5000000"
          chooseLabel="Parcourir"
          :withCredentials="true"
          @select="uploadFile"
        />
      </div>
    </div>
  </div>

  <!-- Confirm Dialog for new marque -->
  <ConfirmDialog />
  <Toast />
</template>

<script setup>
import { Directus } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm"; // Import Confirm service for confirmation dialogs
import { useAuthStore } from "@/stores/auth";
import { ref, onMounted } from "vue";
import { useDirectusBase } from "@/composables/useDirectusBase";

// Directus and other dependencies
const directusBase = useDirectusBase();
const directus = new Directus(directusBase);
const toast = useToast();
const confirm = useConfirm(); // Create an instance of useConfirm
const store = useAuthStore();
const route = useRoute();

// Form-related data
const objet = ref({});
const selectedMarque = ref(""); // Initialize as an empty object
const selectedEtat = ref("");
const addMode = ref(false);
const fieldsMarque = ref([]); // This will now store data from the Marque collection
const image = ref("");

// Function to determine if in add mode
const isAddMode = () => {
  addMode.value = route.params.id === "add";
};

// Retrieve object details for editing, including related `Marque`
async function retrieveOneObjet() {
  const publicData = await directus.items("objet").readOne(route.params.id, {
    fields: ["*,brand.*"], // Ensure we retrieve the related brand
  });
  objet.value = publicData;
  image.value = publicData.photo;
  selectedMarque.value = publicData.brand || {}; // Default to empty object if no brand is available
  selectedEtat.value = publicData.etat;
}

// Create new object
async function createOneObjet() {
  await directus
    .items("objet")
    .createOne({
      nom: objet.value.nom,
      brand: selectedMarque.value?.id, // Use optional chaining to avoid errors if brand is not selected
      etat: selectedEtat.value.etat,
      prix_indicatif: objet.value.prix_indicatif,
      duree_max: objet.value.duree_max,
      consommable: objet.value.consommable,
      conseils: objet.value.conseils,
      proprietaire: store.me.id,
      photo: image.value,
    })
    .then(() => {
      toast.add({ severity: "success", summary: "Objet ajouté", life: 3000 });
      addMode.value = false;
    })
    .catch(() => {
      toast.add({ severity: "error", summary: "Erreur", life: 3000 });
    });
}

// Update existing object
async function updateOneObjet() {
  await directus
    .items("objet")
    .updateOne(route.params.id, {
      nom: objet.value.nom,
      brand: selectedMarque.value?.id, // Use optional chaining to avoid errors if brand is not selected
      etat: selectedEtat.value.etat,
      prix_indicatif: objet.value.prix_indicatif,
      duree_max: objet.value.duree_max,
      consommable: objet.value.consommable,
      conseils: objet.value.conseils,
      photo: image.value,
    })
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Objet mis à jour",
        life: 3000,
      });
    })
    .catch(() => {
      toast.add({ severity: "error", summary: "Erreur", life: 3000 });
    });
}

// Add a new marque to Directus after confirmation
const handleBrandInput = async () => {
  const typedMarque = selectedMarque.value;
  console.log(typedMarque);
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
          const newMarque = await directus.items("marque").createOne({
            nom: typedMarque,
          });

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
  const publicData = await directus.items("marque").readByQuery({ limit: -1 });
  fieldsMarque.value = publicData.data;
}

//retrieveEtat
const fieldsEtat = [
  { etat: "Neuf" },
  { etat: "Excellent" },
  { etat: "Bon" },
  { etat: "Moyen" },
  { etat: "Mauvais" },
  { etat: "En panne" },
];

const uploadFile = async (event) => {
  let form = new FormData();
  form.append("file", event.files[0]);

  await directus.files
    .createOne(form)
    .then((im) => {
      image.value = im.id;
      console.log(image.value);
    })
    .catch(() => onFailed());
};

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
