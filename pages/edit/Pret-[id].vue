<template>
  <div class="grid">
    <div class="col-12 md:col-4">
      <div class="card mt-2">
        <h4 v-if="resa">Demande {{ resa.objet.nom }}</h4>

        <!-- Rappel de l'objet -->
        <div v-if="resa" class="flex items-stretch ">
          <div class="p-2 flex items-stretch w-full">
            <div class="w-full">
              <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-tag"></i>
                  <span> Marque:</span><span class="font-semibold">{{ resa.objet.brand.nom }}</span>
                </div>
                <Tag :value="resa.objet.etat"></Tag>
              </div>
              <div class="flex align-items-center justify-content-between mt-2">
                <span class="text-m font-semibold">Prix indicatif: {{ resa.objet.prix_indicatif }} €</span>
              </div>
              <div class="flex flex-column align-items-center gap-3 py-1 mt-2">
                <img class="w-full h-auto object-contain border-round" style="max-height: 300px;"
                  :src="`https://bibob.rubidiumweb.fr/assets/${resa.objet.photo}?height=300&quality=40`" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 md:col-5">
      <!-- Valider la Reservation  -->
      <div v-if="resa" class="card">
        <h3 v-if="resa.statut !== 'Validé'">Accepter le Pret ?</h3>
        <h3 v-else>Pret validé</h3>
        <div class="text-m font-bold">
          Date:
          <span class="text-m font-semibold">
            {{ formatDate(resa.debut) }} au {{ formatDate(resa.fin) }}
          </span>
        </div>
        <div class="flex content-center gap-2 mt-3">
          <div class="mt-2 text-m font-bold">Demandeur:</div>
          <Chip class="mb-1 bg-slate-50 flex px-3" :label="resa.user_created.first_name + ' ' + resa.user_created.last_name
            "
            :image="`https://bibob.rubidiumweb.fr/assets/${resa.user_created.avatar}?fit=cover&width=50&height=50&quality=20`" />
        </div>
        <div class="mt-2 text-m font-bold mb-4" v-if="resa.statut === 'Validé'">
          Infos Contact:
          <div class="card bg-blue-50 border-blue-200 border-1 p-3 mt-2">
            <div class="mb-3 flex align-items-center gap-2">
              <i class="pi pi-user text-primary text-xl"></i>
              <span class="font-bold text-lg">{{ resa.user_created.first_name }} {{ resa.user_created.last_name
              }}</span>
            </div>
            <div class="mb-2">
              <i class="pi pi-phone mr-2 text-primary"></i>
              <span class="font-semibold">Téléphone:</span>

              <span class="ml-2">{{ resa.user_created.telephone || 'Non renseigné' }}</span>
            </div>
            <div>
              <i class="pi pi-map-marker mr-2 text-primary"></i>
              <span class="font-semibold">Adresse:</span>
              <span class="ml-2">{{ resa.user_created.location || 'Non renseigné' }}</span>
            </div>
          </div>
        </div>
        <div class="mt-2 text-m font-bold mb-4" v-else>
          Infos Contact:
          <div class="text-gray-500 italic mt-2">
            <i class="pi pi-lock mr-2"></i>
            Coordonnées disponibles après validation
          </div>
        </div>
        <div v-if="resa.message" class="mt-2 text-m font-bold mb-4">
          Demande:
          <div>
            <span class="mt-2 text-m font-normal"> {{ resa.message }} </span>

          </div>
        </div>


        <div class="field col-12 md:col-12 p-0 mt-4">
          <div class="flex flex-column md:flex-row gap-2" v-if="resa.statut !== 'Validé'">
            <Button @click="acceptOneResa()" label="Accepter" class="w-full p-2 text-xl bg-green-500 text-white"
              :disabled=isDateInPast(resa.fin)></Button>
            <Button @click="refuseOneResa()" label="Refuser" class="w-full p-2 text-xl bg-orange-500 text-white"
              :disabled=isDateInPast(resa.fin)></Button>
          </div>
          <div v-else>
            <Button @click="resetResaStatus()" label="Modifier la réservation"
              class="w-full p-2 text-xl bg-blue-500 text-white"></Button>
          </div>

          <Toast />
          <div v-if="isDateInPast(resa.fin)" class="text-red-500 pt-2"> Délais depassé. Modification non autorisée.
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 md:col-3">

      <div class="card">
        <div class="mb-4 mt-2 font-bold">
          <h4> Statut actuel: </h4>
          <Tag v-if="resa" class="px-4 ml-2 py-2 text-lg font-semi-bold" :value="resa.statut"
            :severity="getStatus(resa.statut)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { readItem, updateItem } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { formatDate, isDateInPast } from '@/utils/dateUtils';
// import { useDirectusBase } from "@/composables/useDirectusBase";

const { user } = useUser();
const { fetchUserStats } = useStats();
const toast = useToast();
const directus = useDirectus();
const route = useRoute();
const resa = ref("");

// La resa
async function retrieveOneResa() {
  try {
    const publicData = await directus.request(readItem("reservation", route.params.id, {
      fields: [
        "id", "debut", "fin", "statut", "message", "user_created.first_name", "user_created.last_name", "user_created.avatar", "user_created.location", "user_created.telephone", "user_created.email", "objet.nom", "objet.brand.nom", "objet.prix_indicatif", "objet.photo", "objet.etat",
      ],
    }));
    resa.value = publicData;
  } catch (e) {
    console.error("Error fetching reservation", e);
  }
}

// Accepte une reservation
async function acceptOneResa() {
  try {
    await directus.request(updateItem("reservation", route.params.id, {
      statut: "Validé",
    }));

    // Send notification to borrower
    if (resa.value?.user_created?.email) {
      try {
        await $fetch('/api/loans/notify-validation', {
          method: 'POST',
          body: {
            borrowerEmail: resa.value.user_created.email,
            itemName: resa.value.objet.nom,
            ownerName: (user.value?.first_name || '') + ' ' + (user.value?.last_name || ''),
            ownerPhone: user.value?.telephone || 'Non renseigné',
            ownerLocation: user.value?.location || 'Non renseigné'
          }
        });
      } catch (emailError) {
        console.error("Failed to send notification email", emailError);
      }
    }

    retrieveOneResa();
    // Refresh stats to update the badge
    if (user.value?.id) {
      fetchUserStats(user.value.id);
    }

    toast.add({
      severity: "success",
      summary: "Merci",
      detail: "Reservation acceptée !",
      life: 3000,
    });
  } catch (e) {
    //console.log("Erreur", e);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Veuillez vous reconnecter.",
      life: 3000,
    });
  }
}

// Refuse une reservation
async function refuseOneResa() {
  try {
    await directus.request(updateItem("reservation", route.params.id, {
      statut: "Refusé",
    }));
    retrieveOneResa();

    // Refresh stats to update the badge
    if (user.value?.id) {
      fetchUserStats(user.value.id);
    }

    toast.add({
      severity: 'warn',
      summary: "Mis à jour",
      detail: "Reservation refusée !",
      life: 3000,
    });
  } catch (e) {
    //console.log("Erreur", e);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Veuillez vous reconnecter.",
      life: 3000,
    });
  }
}

// Reset status to "En attente"
async function resetResaStatus() {
  try {
    await directus.request(updateItem("reservation", route.params.id, {
      statut: "En attente",
    }));
    retrieveOneResa();
    toast.add({
      severity: "info",
      summary: "Statut mis à jour",
      detail: "La réservation est de nouveau en attente.",
      life: 3000,
    });
  } catch (e) {
    //console.log("Erreur", e);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Une erreur est survenue.",
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
  retrieveOneResa();
});
</script>

<style scoped></style>
