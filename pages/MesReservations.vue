<template>
  <div className="grid">
    <div className="col-12">
      <div className="card">
        <div v-if="completed">
          <div v-if="!resa.data">
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

          <DataTable
            v-if="resa.data"
            :value="resa.data"
            tableStyle="min-width: 20rem"
            sortField="statut"
            :sortOrder="1"
          >
            <template #header>
              <div
                class="flex flex-wrap align-items-center justify-content-between gap-2"
              >
                <span class="text-xl text-900 font-bold">Mes emprunts</span>
                <NuxtLink :to="`/edit/resa-add`">
                  <Button icon="pi pi-plus" rounded raised />
                </NuxtLink>
              </div>
            </template>

            <Column field="objet.nom" header="Objet" sortable>
              <template #body="slotProps">
                <NuxtLink
                  v-if="slotProps.data.objet"
                  :to="`/edit/resa-${slotProps.data.id}`"
                  class="flex align-items-center gap-2"
                >
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
                    </template></Column>

            <Column field="statut" header="Statut" sortable>
              <template #body="slotProps">
                <Tag
                  v-if="slotProps.data"
                  class="px-4 py-2 text-sm"
                  :value="slotProps.data.statut"
                  :severity="getStatus(slotProps.data)"
                />
              </template>
            </Column>
            
            <Column
              field="objet.proprietaire.last_name"
              header="Propriétaire"
              sortable
            >
              <template #body="slotProps">
                <Chip
                  v-if="slotProps.data.objet"
                  class="mb-1 bg-slate-50  px-3"
                  :label="
                    slotProps.data.objet.proprietaire.first_name +
                    ' ' +
                    slotProps.data.objet.proprietaire.last_name
                  "
                  :image="`https://devdirectus.rubidiumweb.eu/assets/${slotProps.data.objet.proprietaire.avatar}?fit=cover&width=50&height=50&quality=20`"
                />
              </template>
            </Column>

            <template #footer>
              Vous avez {{ resa ? resa.data.length : 0 }} demande(s) d'emprunt
              sur votre compte.
            </template>
          </DataTable>
        </div>
        <div v-else><ProgressSpinner /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Directus } from "@directus/sdk";
import { useAuthStore } from "@/stores/auth";
import { formatDate } from '@/utils/dateUtils';


const store = useAuthStore();
const directus = new Directus("https://devdirectus.rubidiumweb.eu");
const resa = ref("");
const completed = ref(false);

async function mesResa() {
  if (!store.authenticated) {
    completed.value = true;
    resa.store =''
    return;
  }
  completed.value = false;

  resa.value = await directus.items("reservation").readByQuery({
    fields: [
      "id,debut,fin,statut,objet.id,objet.nom,objet.marque,objet.proprietaire.first_name,objet.proprietaire.last_name,objet.proprietaire.avatar",
    ],
    filter: {
      user_created: {
        _eq: "$CURRENT_USER",
      },
    },
  });
  completed.value = true;
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
