<template>
  <div class="grid">
    <div class="col-9">
      <!-- Main form -->
      <div class="card">
        <h4 v-if="addMode">Nouvel objet</h4>
        <h4 v-else>Editer : {{ objet.nom }} {{ objet.marque }}</h4>
        <div v-if="proprio" class="flex content-center gap-2">
          <div class="mt-1">Propiétaire:</div>
          <Chip
            v-if="proprio"
            class="mb-1 bg-slate-50 flex px-3"
            :label="proprio.first_name + ' ' + proprio.last_name"
            :image="`https://devdirectus.rubidiumweb.eu/assets/${proprio.avatar}?fit=cover&width=50&height=50&quality=20`"
          />
        </div>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="nom">Nom</label>
            <InputText v-model="objet.nom" id="nom" type="text" />
          </div>

          <div class="field col-12 md:col-6">
            <label for="marque">Marque : </label>
            <Dropdown
              v-model="selectedMarque"
              editable
              :options="fieldsMarque"
              optionLabel="marque"
              placeholder="Choisissez une marque existante ou créez une nouvelle"
              class="w-full"
            />
          </div>
          
          <div class="field col-12 md:col-4">
            <label for="etat">Etat</label>
            <Dropdown
              v-model="selectedEtat"
              editable
              :options="fieldsEtat"
              optionLabel="etat"
              placeholder="Dans quel état ?"
              class="w-full"
            />
          </div>
          <div class="field col-12 md:col-4">
            <label for="prix_indicatif">Prix</label>
            <InputText
              v-model="objet.prix_indicatif"
              id="prix_indicatif"
              type="text"
            />
          </div>
          <div class="field col-12 md:col-4">
            <label for="duree">Durée</label>
            <InputText v-model="objet.duree_max" id="duree" type="email" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="conseils" class="">Conseils</label>
            <Textarea
              v-model="objet.conseils"
              id="conseils"
              rows="5"
              cols="30"
            />
          </div>
          <div class="field col-12 md:col-6">
            <label for="consommable" class="">Consommables</label>
            <Textarea
              v-model="objet.consommable"
              id="consommable"
              rows="5"
              cols="30"
            />
          </div>
          <div v-if="addMode" class="field col-6 md:col-4 md:col-offset-4">
            <Button
              @click="createOneObjet()"
              label="Créer un objet"
              class="w-full p-3 text-xl"
            ></Button>
          </div>
          <div v-if="!addMode" class="field col-8 md:col-6 md:col-offset-3">
            <div class="flex gap-2">
              <Button
                v-if="!addMode"
                @click="updateOneObjet()"
                label="Mettre à jour"
                class="w-full p-3 text-xl"
              ></Button>
              <Button
                v-if="!addMode"
                @click="deleteOneObjet()"
                label="Supprimer"
                class="w-full p-3 text-xl"
                severity="warning"
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-3">
      <!-- Image -->

      <div class="card flex flex-col content-center">
        <Toast />
        <h4 class="text-center">Editer l'image</h4>
        <div v-if="image" class="flex justify-center">
          <img
            class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain block xl:block border-round"
            :src="`https://devdirectus.rubidiumweb.eu/assets/${image}?fit=cover&width=200&height=200&quality=70`"
          />
        </div>
        <div v-else class="flex justify-center">
          <img
            class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain block xl:block border-round"
            src="https://devdirectus.rubidiumweb.eu/assets/7ed6273f-9add-4257-b546-d99af9a3505a.png?fit=cover&width=200&height=200&quality=70"
          />
        </div>

        <FileUpload
          class="flex justify-center mx-1"
          v-model="selectedFile"
          name="file"
          url="https://devdirectus.rubidiumweb.eu/files"
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
</template>

<script setup>
import { Directus } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/auth";

const store = useAuthStore();

const toast = useToast();
const directus = new Directus("https://devdirectus.rubidiumweb.eu");
const objetD = directus.items("objet");

const succes = ref(false);
const addMode = ref(false);

const route = useRoute();
const objet = ref({});
const proprio = ref("");
const selectedMarque = ref("");
const selectedEtat = ref("");

// isAddMode (or editMode)
const isAddMode = () => {
  if (route.params.id == "add") {
    addMode.value = true;
  }
};

// L'objet
async function retrieveOneObjet() {
  const publicData = await directus
    .items("objet")
    .readOne(route.params.id, { fields: ["*,proprietaire.*"] });
  objet.value = publicData;
  image.value = publicData.photo;
  proprio.value = publicData.proprietaire;
  selectedMarque.value = publicData.marque;
  selectedEtat.value = publicData.etat;
}

// Création de l outil
async function createOneObjet() {
  await objetD
    .createOne({
      nom: nom.value,
      marque: selectedMarque.value.marque,
      etat: selectedEtat.value.etat,
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
        detail: "Photo manquante ou hors connexion.",
        life: 3000,
      });
    });
}

// Mise a jour de l outil
async function updateOneObjet() {
  await objetD
    .updateOne(route.params.id, {
      nom: nom.value,
      marque: selectedMarque.value.marque,
      etat: selectedEtat.value.etat,
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
async function deleteOneObjet() {
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

// uploadFile
const image = ref("");
const uploadFile = async (event) => {
  let form = new FormData();
  form.append("file", event.files[0]);

  await directus.files
    .createOne(form)
    .then((im) => {
      image.value = im.id;
    })
    .catch(() => onFailed());
};
const onFailed = () => {
  toast.add({
    severity: "error",
    summary: "Failed",
    detail: "Upload failed",
    life: 3000,
  });
};

//retrieveMarque
const fieldsMarque = ref([]);
async function retrieveMarque() {
  const publicdata = await directus.items("objet").readByQuery({ limit: -1 });
  const temp = publicdata.data;
  fieldsMarque.value = Array.from(new Set(temp.map((obj) => obj.marque))).map(
    (marque) => ({ marque })
  );
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

onMounted(() => {
  isAddMode();
  retrieveMarque();
  if (!addMode.value) {
    retrieveOneObjet();
  }
});
</script>

<style scoped></style>
