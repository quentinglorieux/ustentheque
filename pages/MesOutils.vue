<template>
  <div className="grid">
    <div className="col-12">
      <div className="card">
        <!-- res----- {{ reservation }} -->

        <div v-if="completed">
          <div v-if="!me.objet">
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
            v-if="me.objet"
            :value="me.objet"
            v-model:expandedRows="expandedRows"
            sortField="nom"
            :sortOrder="1"
            tableStyle="min-width: 50rem"
          >
            <template #header>
              <div
                class="flex flex-wrap align-items-center justify-content-between gap-2"
              >
                <span class="text-xl text-900 font-bold">Mes outils</span>
                <div class="flex items-center gap-2">
                  Nouvel outil
                  <NuxtLink :to="`/edit/outil-add`">
                    <Button icon="pi pi-plus" rounded raised />
                  </NuxtLink>
                </div>
              </div>
            </template>
            <Column expander style="width: 5rem" />
            <Column field="nom" header="Objet" sortable>
              <template #body="slotProps">
                <div>
                  <NuxtLink
                    :to="`/edit/outil-${slotProps.data.id}`"
                    class="flex align-items-center gap-2"
                  >
                    {{ slotProps.data.nom }}
                    <Button icon="pi pi-pencil" class="py-0" text rounded />
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

            <Column field="etat" header="Etat" sortable>
              <template #body="slotProps">
                <Rating
                  :modelValue="convertToGrade(slotProps.data.etat)"
                  readonly
                  :cancel="false"
                />
              </template>
            </Column>

            <Column field="dispo" header="Dispo" sortable>
              <template #body="slotProps">
                <Tag
                  v-if="!checkAvailabilityForToday(slotProps.data.reservation)"
                  class="px-4 py-2"
                  value="Reservé"
                  severity="danger"
                />
                <Tag
                  v-if="checkAvailabilityForToday(slotProps.data.reservation)"
                  class="px-4 py-2"
                  value="Disponible"
                  severity="success"
                />
              </template>
            </Column>

            <!-- <Column expander header="Réservations"  style="width: 5rem">
         <template #body="slotProps">
            <Button icon="pi pi-calendar" class="p-button-rounded content-justify-center p-button-secondary mr-1 mb-1" />
        </template>
    </Column>  -->

            <template #expansion="slotProps">
              <div class="p-3 bg-slate-100">
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
                      <Tag
                        class="px-4 py-2 text-sm"
                        :value="slotProps.data.statut"
                        :severity="getSeverity(slotProps.data)"
                      />
                    </template>
                  </Column>

                  <Column header="Edit">
                    <template #body="slotProps">
                      <NuxtLink :to="`/edit/pret-${slotProps.data.id}`">
                        <Button
                          icon="pi pi-pencil"
                          class="p-button-rounded p-button-secondary mr-1 mb-1"
                        />
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
        <div v-if="!completed"><ProgressSpinner /></div>
        <div v-if="!meStore">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { Directus } from "@directus/sdk";
import { useAuthStore } from "@/stores/auth";
import { formatDate } from "@/utils/dateUtils";

const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const me = ref("");
const reservation = ref("");
const expandedRows = ref([]);
const completed = ref();

const store = useAuthStore();
const meStore = computed(() => store.me);

const formatCurrency = (val) => {
  return val.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
};

// const onRowExpand = (event) => {};

const convertToGrade = (etat) => {
  switch (etat) {
    case "Neuf":
      return 5;
    case "Excellent":
      return 4;
    case "Bon":
      return 3;
    case "Moyen":
      return 2;
    case "Mauvais":
      return 1;
    case "En Panne":
      return 0;

    default:
      return null;
  }
};

const getSeverity = (resa) => {
  switch (resa.statut) {
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

async function mesObjets() {
  if (!store.authenticated) {
    completed.value = true;
    return;
  }
  completed.value = false;
  me.value = await directus.users.me.read({
    fields: [
      "objet.*,objet.brand.nom,objet.reservation.user_created.first_name,objet.reservation.user_created.last_name,objet.reservation.user_created.telephone,objet.reservation.*",
    ],
  });
  completed.value = true;
  reservation.value = me.value.objet;
}

const checkAvailabilityForToday = (reservations) => {
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  for (const reservation of reservations) {
    const { debut, fin } = reservation;
    if (debut <= currentDate && currentDate <= fin) {
      if (
        reservation.statut == "Validé" ||
        reservation.statut == "En attente"
      ) {
        return false;
      } // Overlapping reservation found}
      return true; // Overlapping reservation found but not validated
    }
  }
  return true; // No overlapping reservation for today found
};

onMounted(() => {
  mesObjets();
});
</script>
