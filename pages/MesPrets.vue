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
            tableStyle="min-width: 50rem"
          >
            <template #header>
              <div
                class="flex flex-wrap align-items-center justify-content-between gap-2"
              >
                <span class="text-xl text-900 font-bold">Mes prets</span>
                <!-- <NuxtLink :to="`/edit/resa-add`">
                  <Button icon="pi pi-plus" rounded raised />
                </NuxtLink> -->
              </div>
            </template>

            <Column field="objet.nom" header="Objet" sortable>
              <template #body="slotProps">
                <NuxtLink
                  :to="`/edit/pret-${slotProps.data.id}`"
                  class="flex align-items-center gap-2"
                >
                  {{ slotProps.data.objet.nom }}
                  {{ slotProps.data.objet.marque }}
                  <Button icon="pi pi-pencil" class="py-0" text rounded />
                </NuxtLink>
              </template>
            </Column>

            <Column field="debut" header="Debut" sortable></Column>

            <Column field="fin" header="Fin" sortable> </Column>

            <Column field="statut" header="Statut" sortable>
              <template #body="slotProps">
                <Tag
                  class="px-4 py-2 text-sm"
                  :value="slotProps.data.statut"
                  :severity="getStatus(slotProps.data)"
                />
              </template>
            </Column>
            <!-- <Column header="Edit">
              <template #body="slotProps">
                <NuxtLink :to="`/edit/pret-${slotProps.data.id}`">
                  <Button
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-secondary mr-1 mb-1"
                  />
                </NuxtLink>
              </template>
            </Column> -->
            <Column field="user_created.last_name" header="A qui ?" sortable>
              <template #body="slotProps">
                <Chip
                  class="mb-1 bg-slate-50"
                  :label="slotProps.data.user_created.first_name + ' ' + slotProps.data.user_created.last_name"
                  :image="`https://devdirectus.rubidiumweb.eu/assets/${slotProps.data.user_created.avatar}?fit=cover&width=50&height=50&quality=20`"
                />
              </template>
            </Column>

            <template #footer>
              Vous avez {{ resa ? store.resa : 0 }} pret(s) en attente.
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
const store = useAuthStore();
// const resa = computed(() => store.resa);

const directus = new Directus("https://devdirectus.rubidiumweb.eu");
const resa = ref("");
const completed = ref(false);

async function mesPrets() {
  if (!store.authenticated) {
    completed.value = true;
    return;
  }
  
  completed.value = false;

  resa.value = await directus.items("reservation").readByQuery({
    fields: [
      "id,debut,fin,statut,user_created.last_name,user_created.first_name,user_created.avatar,objet.id,objet.nom,objet.marque,objet.proprietaire",
    ],
    filter: {
      objet: {
        proprietaire: {
          _eq: "$CURRENT_USER",
        },
      },
    },
  });
  completed.value = true;

  const countValidatedItems = resa.value.data.reduce((count, obj) => {
    if (obj.statut === "En attente") {
      return count + 1;
    }
    return count;
  }, 0);

  store.resa = countValidatedItems;
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
