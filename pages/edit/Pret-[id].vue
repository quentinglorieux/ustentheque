<template>
  <div class="grid ">
    <div class="col-4">
      <div class="card">
        <h4 v-if="resa">Demande {{ resa.objet.nom }}</h4>

        <!-- Rappel de l'objet -->
        <div v-if="resa" class="flex items-stretch">
          <div class="p-2 flex items-stretch">
            <div class="">
              <div
                class="flex flex-wrap align-items-center justify-content-between gap-2"
              >
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-tag"></i>
                  <span> Marque:</span
                  ><span class="font-semibold">{{ resa.objet.marque }}</span>
                </div>
                <Tag :value="resa.objet.etat"></Tag>
              </div>
              <div class="flex align-items-center justify-content-between">
                <span class="text-m font-semibold"
                  >Prix indicatif: {{ resa.objet.prix_indicatif }} €</span
                >
              </div>
              <div class="flex flex-column align-items-center gap-3 py-1">
                <img
                  class="w-80 h-60 object-contain border-round"
                  :src="`${directusBase}/assets/${resa.objet.photo}?    height=300&quality=40`"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-5">
      <!-- Valider la Reservation  -->
      <div v-if="resa" class="card">
        <h3>Accepter le Pret ?</h3>
        <div class="text-m font-bold">
          Date:
          <span class="text-m font-semibold">
            {{ formatDate(resa.debut) }} au {{ formatDate(resa.fin) }}
          </span>
        </div>
        <div class="flex content-center gap-2 mt-3">
          <div class="mt-2 text-m font-bold">Demandeur:</div>
          <Chip
            class="mb-1 bg-slate-50 flex px-3"
            :label="
              resa.user_created.first_name + ' ' + resa.user_created.last_name
            "
            :image="`${directusBase}/assets/${resa.user_created.avatar}?fit=cover&width=50&height=50&quality=20`"
          />
        </div>
        <div class="mt-2 text-m font-bold mb-4">
          Infos:
          <div class="pl-6"> 
          <li >Adresse: <span class="mt-2 text-m font-normal"> {{ resa.user_created.location }} </span></li>
          <li>Telephone: <span class="mt-2 text-m font-normal"> {{ resa.user_created.telephone }} </span></li>
        </div>
        </div>
        <div v-if="resa.message" class="mt-2 text-m font-bold mb-4">
          Demande:
          <div > 
          <span class="mt-2 text-m font-normal"> {{ resa.message }} </span>
          
        </div>
        </div>


        <div class="field col-12 md:col-12">
          <div class="flex gap-2">
            <Button
              @click="acceptOneResa()"
              label="Accepter"
              class="w-full p-3 text-xl"
              severity="success"
              :disabled=isDateInPast(resa.fin)
            ></Button>
            <Button
              @click="refuseOneResa()"
              label="Refuser"
              class="w-full p-3 text-xl"
              severity="warning"
              :disabled=isDateInPast(resa.fin)
            ></Button>
            
            <Toast />
          </div>
          <div v-if="isDateInPast(resa.fin)" class="text-red-500 pt-2"> Délais depassé. Modification non autorisée. </div>
        </div>
      </div>
    </div>
    <div class="col-3">
     
      <div class="card">
        <div class="mb-4 mt-2 font-bold">
  <h4> Statut actuel: </h4>
  <Tag
  v-if="resa"
                  class="px-4 ml-2 py-2 text-lg font-semi-bold"
                  :value="resa.statut"
                  :severity="getStatus(resa.statut)"
                />
        </div>
      </div>


      <div class="card">
        <div class="mb-4">
          Retour à :
          <NuxtLink class="flex justify-items-center" to="/mesprets">
            <Button label="Liste des prets" class="px-4 py-3 mt-1"> </Button
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
import { formatDate,isDateInPast } from '@/utils/dateUtils';
import { useDirectusBase } from "@/composables/useDirectusBase";


const store = useAuthStore();

const toast = useToast();
const directusBase = useDirectusBase();
const directus = new Directus(directusBase);

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
      fields: [
        "id,debut,fin,statut,message,user_created.first_name,user_created.last_name,user_created.avatar,user_created.avatar,user_created.location,user_created.telephone,objet.nom,objet.marque,objet.prix_indicatif,objet.photo,objet.etat",
      ],
    });
  resa.value = publicData;
}

// Accepte une reservation
async function acceptOneResa() {
  await resaD
    .updateOne(route.params.id, {
      statut: "Validé",
    })
    .then(() => {
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

// Refuse une reservation
async function refuseOneResa() {
  await resaD
    .updateOne(route.params.id, {
      statut: "Refusé",
    })
    .then(() => {
      retrieveOneResa();
      toast.add({
        severity: 'warn',
        summary: "Mis à jour",
        detail: "Reservation refusée !",
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
  retrieveOneResa();
});
</script>

<style scoped></style>
