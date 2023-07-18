<!-- Reservation sur un objet -->
<template>
  <div v-if="objet" class="xl:flex  items-stretch">
    <div class="col-12 sm:col-12 lg:col-12 xl:col-3 p-2  items-stretch">
      <div class="p-4 border-1 surface-border surface-card border-round">
        <div class="text-2xl font-bold text-center pb-4">{{ objet.nom }}</div>
        <div
          class="flex flex-wrap align-items-center justify-content-between gap-2"
        >
          <div class="flex align-items-center gap-2">
            <i class="pi pi-tag"></i>
            <span> Marque:</span
            ><span class="font-semibold">{{ objet.marque }}</span>
          </div>
          <Tag :value="objet.etat"></Tag>
        </div>
        <div class="flex flex-column align-items-center gap-3 py-5">
          <NuxtLink :to="`/outil-${objet.id}`">
            <img
              class="w-80 h-60 object-contain border-round"
              :src="`https://devdirectus.rubidiumweb.eu/assets/${objet.photo}?    height=300&quality=40`"
            />
          </NuxtLink>
        </div>
        <div class="flex align-items-center justify-content-between">
          <span class="text-m font-semibold"
            >Prix indicatif: {{ objet.prix_indicatif }} €</span
          >
        </div>

        <div class="flex content-center gap-2">
          <div class="mt-1 text-m font-semibold">Propiétaire:</div>
          <Chip
          v-if="authenticated"
            class="mb-1 bg-slate-50"
            :label="proprio.first_name + ' ' + proprio.last_name"
            :image="`https://devdirectus.rubidiumweb.eu/assets/${proprio.avatar}?fit=cover&width=50&height=50&quality=20`"
          />
        </div>
        <div class="flex align-items-center justify-content-between">
          <span class="text-m font-semibold">Conseils: </span>
          <span>{{ objet.conseils }} </span>
        </div>
        <div class="flex align-items-center justify-content-between">
          <span class="text-m font-semibold">Consommables: </span>
          <span> {{ objet.consommable }} </span>
        </div>
      </div>
           <!-- Retour -->
           <div class=" hidden xl:flex justify-center p-4 mt-3 border-1 surface-border surface-card border-round">
        <NuxtLink to="/catalogue" class="flex justify-center">
          <Button label="Retour au Catalogue" class="mr-2 mb-2"></Button
        ></NuxtLink>
      </div>
    </div>




    <!-- Reservation form -->
    <div v-if="authenticated" class="col-12 sm:col-12 lg:col-12 xl:col-6 p-2">
      <div class="p-4 border-1 surface-border surface-card border-round">
        <div class="text-2xl font-bold text-center pb-4">Reservation</div>
        <div class="mb-2">
          <div class="mb-2 flex justify-center">
            <Calendar
              showIcon
              v-model="dates"
              selectOtherMonths="true"
              view="date"
              selectionMode="range"
              :manualInput="false"
              inline
              :disabledDates="disabledDates"
              :minDate="minDate"
              @date-select=verifyAvailability(dates,disabledDates)
            >
              <template #date="slotProps">
                <strong
                  v-if="isDateInArray(slotProps)"
                  style="text-decoration: line-through red"
                  class="bg-red-100 p-10"
                  >{{ slotProps.date.day }}
                </strong>
                <template v-else> {{ slotProps.date.day }}</template>
              </template>
            </Calendar>
          </div>
          <div class="flex justify-center pt-3"> 
          <Button 
            v-if="!dates"
            disabled
            label="Envoyer une demande d'emprunt"
            severity="info"
            class="mr-2 mb-2 "
          ></Button>
          <Button
            v-if="dates"
            @click="createOneResa()"
            label="Envoyer une demande d'emprunt"
            severity="info"
            class="mr-2 mb-2"
          ></Button>
        </div>
        </div>
      </div>
    </div>
    

 
    <div class="col-12 sm:col-12 lg:col-12 xl:col-3 p-2">
      

       
      <div class="p-4 border-1 surface-border surface-card border-round">
        <div class="text-2xl font-bold text-center pb-4">
          Ajouter un message de demande
        </div>
        <span class="p-float-label">
    <Textarea v-model="value" rows="20" autoResize />
    <label>Votre demande ici</label>
</span>
      </div>
    </div>

  </div>

  <Toast />
</template>

<script setup>
import { Directus } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const toast = useToast();

const store = useAuthStore();
const authenticated = computed(() => store.authenticated);

const directus = new Directus("https://devdirectus.rubidiumweb.eu");
const resaD = directus.items("reservation");

const objet = ref("");
const dates = ref("");
const proprio = ref("");
const resaList = ref();
const filteredResaList = ref();
const disabledDates = ref([]);

// Look for disabled Dates in the slot
const isDateInArray = computed(() => {
  return (slotProps) => {
    const searchDate = slotProps.date;
    const searchDateFormatted = new Date(
      searchDate.year,
      searchDate.month,
      searchDate.day
    );
    const dateArray = disabledDates;

    return dateArray.value.some((date) => {
      const formattedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      return formattedDate.getTime() === searchDateFormatted.getTime();
    });
  };
});

// Start today
const minDate = ref(new Date());


//retrieveOneObjet()
async function retrieveOneObjet() {
  const publicData = await directus.items("objet").readOne(route.params.id, {
    fields: [
      "id,nom,marque,photo,prix_indicatif,conseils,etat,consommable,proprietaire.first_name,proprietaire.last_name,proprietaire.avatar, reservation.debut,reservation.fin,reservation.statut",
    ],
  });
  objet.value = publicData;
  proprio.value = publicData.proprietaire;
  resaList.value = publicData.reservation;
  filteredResaList.value = resaList.value.filter(
    (obj) => obj.statut === "Validé" || obj.statut === "En attente"
  );
  disabledDates.value = generateDisabledDateArray(filteredResaList.value);
}

// Function to generate Disabled dates
// Create an array of dates from debut/fin (reservations - filteredResaList)
const generateDisabledDateArray = (array) => {
  const dateArray = array.reduce((accumulator, obj) => {
    const debutDate = new Date(obj.debut);
    const finDate = new Date(obj.fin);

    const currentArray = [];
    const currentDate = new Date(debutDate);

    while (currentDate <= finDate) {
      currentArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return accumulator.concat(currentArray);
  }, []);
  return dateArray;
};


// Function to check if the selected range overlaps with disabled dates
const verifyAvailability = (selectedDates, disabledDates) => {
  if (!selectedDates[1]) {return;}
  const [startDate, endDate] = selectedDates;

  for (const disabledDate of disabledDates) {
    const disabledDateTime = new Date(disabledDate).setHours(0, 0, 0, 0);

    if (
      startDate.getTime() <= disabledDateTime &&
      endDate.getTime() >= disabledDateTime
    ) {
      dates.value ='';
      toast.add({
        severity: "error",
        summary: "Objet non disponible.",
        detail: "Veuillez faire plusieurs réservations.",
        life: 3000,
      });
      return false; // Selected range overlaps with a disabled date
    }
  }
  return true; // No overlapping dates found
};

// Création de l outil
async function createOneResa() {
  dates.value[1] = dates.value[1] ? dates.value[1] : dates.value[0];
  await resaD
    .createOne({
      debut: dates.value[0],
      fin: dates.value[1],
      statut: "En attente",
      objet: objet.value.id,
    })
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Merci",
        detail: "Demande envoyée.",
        life: 3000,
      });
    })
    .catch(() => {
      console.log("Erreur");
      toast.add({
        severity: "error",
        summary: "Erreur",
        detail: "Demande non envoyée.",
        life: 3000,
      });
    });
  retrieveOneObjet();
}

onMounted(() => {
  retrieveOneObjet();
});
</script>
