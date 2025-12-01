<template>
  <div className="grid">
    <div className="col-12">
      <div className="card">
        <div v-if="completed">
          <div v-if="!resa.data">
            <div>Vous n'etes pas connécté.</div>
            <NuxtLink to="/auth/login">
              <Button label="Connectez vous ici" icon="pi pi-sign-in" severity="info"
                class="font-bold mt-5 px-5 py-3 p-button-raised white-space-nowrap"></Button>
            </NuxtLink>
          </div>

          <DataTable v-if="resa.data" :value="resa.data" tableStyle="min-width: 20rem" sortField="debut"
            :sortOrder="-1">
            <template #header>
              <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                <span class="text-xl text-900 font-bold">Mes emprunts</span>
                <NuxtLink :to="`/edit/resa-add`">
                </NuxtLink>
              </div>
            </template>

            <Column field="objet.nom" header="Objet" sortable>
              <template #body="slotProps">
                <NuxtLink v-if="slotProps.data.objet" :to="`/edit/resa-${slotProps.data.id}`"
                  class="flex align-items-center gap-2">
                  {{ slotProps.data.objet.nom }}
                  {{ slotProps.data.objet.marque }}
                  <Button icon="pi pi-pencil" class="py-0" text rounded />
                </NuxtLink>
              </template>
            </Column>

            <Column field="debut" header="Debut" sortable>
              <template #body="slotProps">
                {{ formatDate(slotProps.data.debut) }}
              </template>
            </Column>

            <Column field="fin" header="Fin" sortable>
              <template #body="slotProps">
                {{ formatDate(slotProps.data.fin) }}
              </template>
            </Column>

            <Column field="statut" header="Statut" sortable>
              <template #body="slotProps">
                <Tag v-if="slotProps.data" class="px-4 py-2 text-sm" :value="slotProps.data.statut"
                  :severity="getStatus(slotProps.data)" />
              </template>
            </Column>

            <Column field="objet.proprietaire.last_name" header="Propriétaire" sortable>
              <template #body="slotProps">
                <div class="flex flex-column gap-2">
                  <Chip v-if="slotProps.data.objet" class="mb-1 bg-slate-50  px-3" :label="slotProps.data.objet.proprietaire.first_name +
                    ' ' +
                    slotProps.data.objet.proprietaire.last_name
                    "
                    :image="`https://bibob.rubidiumweb.fr/assets/${slotProps.data.objet.proprietaire.avatar}?fit=cover&width=50&height=50&quality=20`" />
                  <Button v-if="slotProps.data.statut === 'Validé'" icon="pi pi-eye" label="Voir Contact" size="small"
                    severity="help" outlined @click="showContact(slotProps.data.objet.proprietaire)" />
                </div>
              </template>
            </Column>

            <!-- Delete Column -->
            <Column header="Supprimer" class="hidden md:block">
              <template #body="slotProps">
                <Button icon="pi pi-trash" class="p-button-sm p-button-rounded p-button-info"
                  @click="confirmDelete(slotProps.data.id)" />
              </template>
            </Column>

            <template #footer>
              Vous avez {{ resa ? resa.data.length : 0 }} demande(s) d'emprunt
              sur votre compte.
            </template>
          </DataTable>
        </div>
        <div v-else>
          <ProgressSpinner />
        </div>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="displayContact" modal header="Coordonnées du propriétaire" :style="{ width: '25rem' }">
    <div class="flex align-items-center gap-3 mb-3" v-if="selectedContact">
      <Avatar :image="`https://bibob.rubidiumweb.fr/assets/${selectedContact.avatar}`" shape="circle" size="large" />
      <span class="font-bold">{{ selectedContact.first_name }} {{ selectedContact.last_name }}</span>
    </div>
    <div class="mb-3">
      <i class="pi pi-phone mr-2 text-primary"></i>
      <span class="font-semibold">Téléphone:</span>
      <span class="ml-2">{{ selectedContact.telephone || 'Non renseigné' }}</span>
    </div>
    <div class="mb-3">
      <i class="pi pi-map-marker mr-2 text-primary"></i>
      <span class="font-semibold">Adresse:</span>
      <span class="ml-2">{{ selectedContact.location || 'Non renseigné' }}</span>
    </div>
  </Dialog>
  <ConfirmDialog />
</template>

<script setup>
import { readItems, deleteItem } from "@directus/sdk";
import { formatDate } from "@/utils/dateUtils";
import { useConfirm } from "primevue/useconfirm";
import { useDirectusBase } from "@/composables/useDirectusBase";

const { isAuthenticated } = useUser();
const directusBase = useDirectusBase();
const directus = useDirectus();
const resa = ref("");
const completed = ref(false);
const confirm = useConfirm();

async function mesResa() {
  if (!isAuthenticated.value) {
    completed.value = true;
    resa.value = '';
    return;
  }
  completed.value = false;

  try {
    const result = await directus.request(readItems("reservation", {
      fields: [
        "id", "debut", "fin", "statut", "objet.id", "objet.nom", "objet.marque", "objet.proprietaire.first_name", "objet.proprietaire.last_name", "objet.proprietaire.avatar", "objet.proprietaire.telephone", "objet.proprietaire.location",
      ],
      filter: {
        user_created: {
          _eq: "$CURRENT_USER",
        },
      },
    }));
    resa.value = { data: result }; // Maintain structure for template compatibility
  } catch (e) {
    console.error("Error fetching reservations", e);
  }
  completed.value = true;
}

const displayContact = ref(false);
const selectedContact = ref({});

const showContact = (user) => {
  selectedContact.value = user;
  displayContact.value = true;
};

// Function to confirm and delete a reservation
async function confirmDelete(id) {
  confirm.require({
    message: "Êtes-vous sûr de vouloir supprimer cette demande d'emprunt ?",
    header: "Confirmer la suppression",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      deleteResa(id);
    },
    reject: () => {
      //console.log("Suppression annulée.");
    }
  });
}

// Function to delete a reservation
async function deleteResa(id) {
  try {
    await directus.request(deleteItem("reservation", id));
    //console.log(`Reservation ${id} deleted successfully.`);

    // Refresh the data after deleting
    mesResa();
  } catch (error) {
    console.error(`Error deleting reservation ${id}:`, error);
  }
}

onMounted(() => {
  mesResa();
});

const getStatus = (resa) => {
  switch (resa.statut) {
    case "En attente":
      return "info";
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
</script>
