<template>
  <div class="grid">
    <div class="col-12">
      <div class="card px-0 md:px-3">
        <!-- res----- {{ reservation }} -->

        <div v-if="error" class="p-4 mb-4 text-white bg-red-500 rounded">
          Error: {{ error }}
        </div>

        <div v-if="completed">
          <div v-if="!me.objet">
            <div>Vous n'etes pas connécté.</div>
            <NuxtLink to="/auth/login">
              <Button label="Connectez vous icix" icon="pi pi-sign-in" severity="info"
                class="font-bold mt-5 px-5 py-3 p-button-raised white-space-nowrap"></Button>
            </NuxtLink>
          </div>

          <DataTable v-if="me.objet" :value="me.objet" v-model:expandedRows="expandedRows" resizableColumns
            sortField="nom" :sortOrder="1" tableStyle="min-width: 100%">
            <template #header>
              <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                <span class="text-xl text-900 font-bold">Mes outils</span>
                <NuxtLink :to="`/edit/outil-add`">
                  <div
                    class="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-700 transition-colors text-white rounded-xl px-2 py-0">
                    Nouvel outil
                    <Button icon="pi pi-plus" rounded />

                  </div>
                </NuxtLink>
              </div>
            </template>
            <Column expander class="w-2rem md:w-5rem p-0 md:p-3" />
            <Column field="nom" header="Objet" sortable class="p-1 md:p-3">
              <template #body="slotProps">
                <div class="">
                  <NuxtLink :to="`/edit/outil-${slotProps.data.id}`"
                    class="flex gap-2 justify-between text-md md:text-base">
                    {{ slotProps.data.nom }}
                    <Button icon="pi pi-pencil" class="p-2 max-w-8 max-h-8 md:w-8  md:h-8 bg-indigo-500 text-white "
                      rounded />
                  </NuxtLink>
                </div>
              </template>
            </Column>
            <Column field="brand" header="Marque" sortable>
              <template #body="slotProps">
                <div v-if="slotProps.data.brand && slotProps.data.brand.nom">
                  {{ slotProps.data.brand.nom }}
                </div>
                <div v-else> </div>
              </template>
            </Column>
            <Column field="prix_indicatif" header="Prix" sortable>
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.prix_indicatif) }}
              </template>
            </Column>

            <Column field="etat" header="Etat" class="hidden md:block">
              <template #body="slotProps">
                <Rating :modelValue="convertToGrade(slotProps.data.etat)" readonly :cancel="false" />
              </template>
            </Column>

            <Column field="dispo" header="Dispo" sortable class="p-1 md:p-3">
              <template #body="slotProps">
                <Tag v-if="!checkAvailabilityForToday(slotProps.data.reservation)"
                  class="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base" value="Reservé" severity="danger" />
                <Tag v-if="checkAvailabilityForToday(slotProps.data.reservation)"
                  class="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base" value="Disponible" severity="success" />
              </template>
            </Column>


            <template #expansion="slotProps">
              <div class="md:p-3 p-1 bg-slate-100">
                <h6>Réservations et prets</h6>
                <DataTable :value="slotProps.data.reservation">
                  <!-- {{ slotProps.data.reservation }} -->

                  <Column field="user_created" header="Nom">
                    <template #body="slotProps">
                      {{ slotProps.data.user_created.first_name }}
                      {{ slotProps.data.user_created.last_name }}
                    </template>
                  </Column>

                  <Column field="debut" header="Debut">
                    <template #body="slotProps">
                      {{ formatDate(slotProps.data.debut) }}
                    </template>
                  </Column>

                  <Column field="fin" header="Fin">
                    <template #body="slotProps">
                      {{ formatDate(slotProps.data.fin) }}
                    </template>
                  </Column>
                  <Column field="statut" header="Statut">
                    <template #body="slotProps">
                      <Tag class="px-4 py-2 text-sm" :value="slotProps.data.statut"
                        :severity="getSeverity(slotProps.data)" />
                    </template>
                  </Column>

                  <Column header="Edit">
                    <template #body="slotProps">
                      <NuxtLink :to="`/edit/pret-${slotProps.data.id}`">
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-secondary mr-1 mb-1" />
                      </NuxtLink>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </template>

            <template #footer>
              Vous avez {{ me.objet ? me.objet.length : 0 }} outils à prêter.
            </template>
          </DataTable>
        </div>
        <div v-if="!completed">
          <ProgressSpinner />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { readMe } from "@directus/sdk";
import { formatDate } from "@/utils/dateUtils";

const directus = useDirectus();
const { isAuthenticated, loading } = useUser();

const me = ref("");
const reservation = ref("");
const expandedRows = ref([]);
const completed = ref(false);
const error = ref(null);

const formatCurrency = (val) => {
  return val.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
};

const convertToGrade = (etat) => {
  switch (etat) {
    case "Neuf": return 5;
    case "Excellent": return 4;
    case "Bon": return 3;
    case "Moyen": return 2;
    case "Mauvais": return 1;
    case "En Panne": return 0;
    default: return null;
  }
};

const getSeverity = (resa) => {
  switch (resa.statut) {
    case "En attente": return null;
    case "Validé": return "success";
    case "Rendu": return "warning";
    case "Refusé": return "danger";
    default: return null;
  }
};

const checkAvailabilityForToday = (reservations) => {
  const currentDate = new Date().toISOString().split("T")[0];

  for (const reservation of reservations) {
    const { debut, fin } = reservation;
    if (debut <= currentDate && currentDate <= fin) {
      if (
        reservation.statut == "Validé" ||
        reservation.statut == "En attente"
      ) {
        return false;
      }
      return true;
    }
  }
  return true;
};

async function mesObjets() {
  // Don't fetch if still loading auth
  if (loading.value) return;

  if (!isAuthenticated.value) {
    completed.value = true;
    return;
  }

  completed.value = false;
  error.value = null;

  try {
    const userData = await directus.request(readMe({
      fields: [
        "objet.*",
        "objet.brand.nom",
        "objet.reservation.user_created.first_name",
        "objet.reservation.user_created.last_name",
        "objet.reservation.user_created.telephone",
        "objet.reservation.*",
      ],
    }));

    me.value = userData;
    reservation.value = me.value.objet;

  } catch (e) {
    console.error("Error fetching user objects:", e);
    error.value = e.message || JSON.stringify(e);
  }
  completed.value = true;
}

// Watch for auth changes
watch([isAuthenticated, loading], () => {
  if (!loading.value) {
    mesObjets();
  }
}, { immediate: true });

</script>
