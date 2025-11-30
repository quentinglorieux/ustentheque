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
                <!-- <NuxtLink :to="`/edit/resa-add`">
                  <Button icon="pi pi-plus" rounded raised />
                </NuxtLink> -->
              </div>
            </template>

            <Column field="objet.nom" header="Objet" sortable>
              <template #body="slotProps">
                <NuxtLink :to="`/edit/pret-${slotProps.data.id}`" class="flex align-items-center gap-2">
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
                <div class="flex align-items-center gap-2">
                  <Tag class="px-4 py-2 text-sm" :value="slotProps.data.statut" :severity="getStatus(slotProps.data)" />
                  <NuxtLink v-if="slotProps.data.statut === 'En attente'" :to="`/edit/pret-${slotProps.data.id}`">
                    <Button label="Répondre" size="small"
                      class="px-2 py-1.5 bg-indigo-500 text-white hover:bg-indigo-600" />
                  </NuxtLink>
                </div>
              </template>
            </Column>

            <Column field="user_created.last_name" header="A qui ?" sortable>
              <template #body="slotProps">
                <Chip class="mb-1 bg-slate-50  px-3" :label="slotProps.data.user_created.first_name +
                  ' ' +
                  slotProps.data.user_created.last_name
                  "
                  :image="`https://bibob.rubidiumweb.fr/assets/${slotProps.data.user_created.avatar}?fit=cover&width=50&height=50&quality=20`" />
              </template>
            </Column>

            <Column header="Refuser">
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
        "id", "debut", "fin", "statut", "user_created.last_name", "user_created.first_name", "user_created.avatar", "objet.id", "objet.nom", "objet.marque", "objet.proprietaire",
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
      console.log("Suppression annulée.");
    }
  });
}

// Function to delete a reservation
async function deleteResa(id) {
  try {
    await directus.request(deleteItem("reservation", id));
    console.log(`Reservation ${id} deleted successfully.`);

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
