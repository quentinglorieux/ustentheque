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

          <DataTable v-if="resa.data" :value="resa.data" tableStyle="min-width: 20rem" sortField="debut" :sortOrder="-1"
            :filters="filter">
            <template #header>
              <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                <span class="text-xl text-900 font-bold">Mes prets</span>
              </div>
            </template>

            <Column field="objet.nom" header="Objet" sortable>
              <template #body="slotProps">
                <NuxtLink :to="`/edit/pret-${slotProps.data.id}`"
                  class="flex align-items-center gap-2 px-2 py-1 pr-3 font-semibold text-md">
                  {{ slotProps.data.objet.nom }}
                  <div class="text-sm text-600"> {{ slotProps.data.objet.brand.nom }}
                  </div>
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
                <div class="flex align-items-center gap-2">
                  <NuxtLink :to="`/edit/pret-${slotProps.data.id}`">
                    <Tag class="px-4 py-1.5 text-sm hover:bg-green-600 hover:text-white" :value="slotProps.data.statut"
                      :severity="getStatus(slotProps.data)" />
                  </NuxtLink>
                  <NuxtLink v-if="slotProps.data.statut === 'En attente'" :to="`/edit/pret-${slotProps.data.id}`">
                    <Button label="Répondre" size="small"
                      class="px-2 py-1.5 bg-indigo-500 text-white hover:bg-indigo-600" />
                  </NuxtLink>
                </div>
              </template>
            </Column>

            <Column field="user_created.last_name" header="A qui ?" sortable>
              <template #body="slotProps">
                <div class="flex flex-column gap-2">
                  <Chip class="mb-1 bg-slate-50  px-3" :label="slotProps.data.user_created.first_name +
                    ' ' +
                    slotProps.data.user_created.last_name
                    "
                    :image="`https://bibob.rubidiumweb.fr/assets/${slotProps.data.user_created.avatar}?fit=cover&width=50&height=50&quality=20`" />
                  <Button v-if="slotProps.data.statut === 'Validé'" icon="pi pi-eye" label="Infos Emprunteur"
                    size="small" class="px-2 py-1.5 bg-indigo-500 text-white hover:bg-indigo-600" severity="help"
                    outlined @click="showContact(slotProps.data.user_created)" />
                </div>
              </template>
            </Column>

            <Column header="Supprimer">
              <template #body="slotProps">
                <Button icon="pi pi-trash" class="p-button-lg p-button-rounded p-button-info"
                  @click="confirmDelete(slotProps.data.id)" />
              </template>
            </Column>

            <template #footer>
              Vous avez {{resa && resa.data ? resa.data.filter(r => r.statut === 'En attente').length : 0}} pret(s) en
              attente.
            </template>
          </DataTable>
        </div>
        <div v-else>
          <ProgressSpinner />
        </div>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="displayContact" modal header="Coordonnées de l'emprunteur" :style="{ width: '25rem' }">
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

async function mesPrets() {
  if (!isAuthenticated.value) {
    // If not authenticated, we can stop here. 
    // Ideally we might want to redirect or show a message, 
    // but the template handles the !resa.data case or we can set completed=true

    completed.value = true;
    return;
  }

  completed.value = false;

  try {
    const result = await directus.request(readItems("reservation", {
      fields: [
        "id", "debut", "fin", "statut", "user_created.last_name", "user_created.first_name", "user_created.avatar", "user_created.telephone", "user_created.location", "objet.id", "objet.nom", "objet.brand.nom", "objet.proprietaire"
      ],
      filter: {
        objet: {
          proprietaire: {
            _eq: "$CURRENT_USER",
          },
        },
      },
    }));
    resa.value = { data: result };

    // countValidatedItems logic was updating store.resa, we can remove it or keep it local if needed

  } catch (e) {
    console.error("Error fetching loans", e);
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
const confirm = useConfirm();

async function confirmDelete(id) {
  confirm.require({
    message: "Êtes-vous sûr de vouloir supprimer cette réservation ?",
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
    mesPrets();
  } catch (error) {
    console.error(`Error deleting reservation ${id}:`, error);
  }
}

onMounted(() => {
  mesPrets();
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
