<template>
  <div class="grid">
    <div class="col-9">
      <div class="card">
        <h4>Editer : {{ objet.nom }} {{ objet.marque }}</h4>
        <div class="flex content-center gap-2">
          <div class="mt-1">Propiétaire:</div>
          <Chip
            class="mb-1 bg-slate-50"
            :label="proprio.first_name + ' ' + proprio.last_name"
            :image="`https://devdirectus.rubidiumweb.eu/assets/${proprio.avatar}`"
          />
        </div>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="nom">Nom</label>
            <InputText v-model="objet.nom" id="nom" type="text" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="marque">Marque</label>
            <InputText v-model="objet.marque" id="marque" type="text" />
          </div>

          <div class="field col-12 md:col-4">
            <label for="etat">Etat</label>
            <InputText v-model="objet.etat" id="etat" type="text" />
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
          <div class="field col-6 md:col-4 md:col-offset-4">
            <Button
              @click="updateOneObjet()"
              label="Update"
              class="w-full p-3 text-xl"
            ></Button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-3">
      <div class="card flex flex-col justify-content-center">
        <Toast />
        <div><h4>Editer l'image</h4></div>
        <div v-if="objet" class="flex flex-column gap-1">
          <img
            class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain block xl:block border-round"
            :src="`https://devdirectus.rubidiumweb.eu/assets/${objet.photo}`"
          />
        </div>

        <FileUpload
          mode="basic"
          name="demo[]"
          url="./upload.php"
          accept="image/*"
          :maxFileSize="1000000"
          @upload="uploadAvatar"
        />
        a finir
      </div>
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { Directus } from "@directus/sdk";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const users = directus.items("directus_users");
const objetD = directus.items("objet");

const succes = ref(false);

const route = useRoute();
const objet = ref("");
const proprio = ref("");

// L'objet
async function retrieveOneObjet() {
  const publicData = await directus
    .items("objet")
    .readOne(route.params.id, { fields: ["*,proprietaire.*"] });
  objet.value = publicData;
  proprio.value = publicData.proprietaire;
}

// Mise a jour de l outil
async function updateOneObjet() {
  await objetD
    .updateOne(route.params.id, {
      nom: nom.value,
      marque: marque.value,
      etat: etat.value,
      prix_indicatif: prix_indicatif.value,
      duree_max: duree.value,
      consommable: consommable.value,
      conseils: conseils.value,
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

async function uploadAvatar() {
  await directus.files.createOne(
    form,
    {},
    {
      requestOptions: {
        headers: {
          ...form.getHeaders(),
        },
      }
        .then(() => {
          console.log("Success");
          succes.value = true;
        })
        .catch(() => {
          console.log("Erreur");
        }),
    }
  );
}

onMounted(() => {
  retrieveOneObjet();
});
</script>
