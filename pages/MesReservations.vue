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
                <Chip v-if="slotProps.data.objet" class="mb-1 bg-slate-50  px-3" :label="slotProps.data.objet.proprietaire.first_name +
                  ' ' +
                  slotProps.data.objet.proprietaire.last_name
                  "
                  :image="`https://bibob.rubidiumweb.fr/assets/${slotProps.data.objet.proprietaire.avatar}?fit=cover&width=50&height=50&quality=20`" />
              </template>
            </Column>

            <!-- Delete Column -->
            <Column header="Supprimer">
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
        "id", "debut", "fin", "statut", "objet.id", "objet.nom", "objet.marque", "objet.proprietaire.first_name", "objet.proprietaire.last_name", "objet.proprietaire.avatar",
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
