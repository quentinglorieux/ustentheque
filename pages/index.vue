<template>
  <div>
    <div class="surface-section px-4 py-6 md:px-6 lg:px-8 mb-4 card">
      <div class="text-700 text-center">
        <div class="text-blue-600 font-bold text-xl mb-3">La BibOB est soutenue par &nbsp; <i class="pi pi-megaphone"></i></div>
        <div  v-if="store.authenticated"> 
        <div class="text-900 font-bold text-4xl mb-1">Bienvenue {{ store.me.first_name }}</div>
        <div  class="text-700 text-2xl mb-1">à la Bibliothèque des Objets de Larchant </div>
        <div  class="text-700 text-xl mb-1">Prêtez, empruntez, apprenez, réparez...</div>
        </div>
        <div  v-else> 
        <div class="text-900 font-bold text-4xl mb-3">Bienvenue à la Bibliothèque des Objets de Larchant</div>
        <div  class="text-700 text-2xl mb-5"> </div>
        <div  class="text-700 text-xl mb-5">Prêtez, empruntez, apprenez, réparez...</div>
        </div>

        
        <!-- Show buttons only if user is not authenticated -->
        <div v-if="!store.authenticated" class="md:flex justify-center gap-10">
          <NuxtLink to="/auth/signup">
            <Button label="Devenez membre de la BibOB" icon="pi pi-plus-circle" severity="info" class="font-bold mb-3 px-5 py-3 p-button-raised m-10 white-space-nowrap"></Button>
          </NuxtLink>
          <NuxtLink class="" to="/auth/login">
            <Button label="Connexion" icon="pi pi-sign-in" severity="info" class="font-bold px-5 py-3 p-button-raised white-space-nowrap"></Button>
          </NuxtLink>
        </div>
      </div>
    </div>

    
  </div>
  <div>
    <div  v-if="store.authenticated"> 
<h1> Mes infos</h1>
     <!-- Dashboard Section -->
     <div class="grid">
      <!-- Stats Cards -->
      <div class="col-12 lg:col-6 xl:col-3">
      <div >
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Emprunts</span>
              <div class="text-900 font-medium text-xl">{{ userBorrowed }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-download text-blue-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Prêts</span>
              <div class="text-900 font-medium text-xl">{{ userLent }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-upload text-orange-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Objets dans la BibOB</span>
              <div class="text-900 font-medium text-xl">{{ totalItems }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-box text-cyan-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Circular Progress 
      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="text-center">
            <h4 class="text-600 mb-3">Retours effectués</h4>
            <Chart type="doughnut" :data="returnChartData" />
          </div>
        </div>
      </div>
      -->


      <!-- Calendar Column -->
      <!--<div class="col-12 lg:col-6 xl:col-6 flex">
        <div class="card flex-grow-1">
          <h4 class="text-center text-600 mb-3">Calendrier de vos emprunts</h4>
          <Calendar v-model="selectedDate" :inline="true" :events="reservationEvents" />
        </div>
      </div> -->

      <!-- Chart Column -->
      <div class="col-12 lg:col-12 xl:col-12 flex">
        <div class="card flex-grow-1 flex flex-col">
          <h4 class="text-600 mb-3 text-center">Activité des emprunts et prêts</h4>
          <div class="chart-container flex-grow-1">
            <Chart type="bar" :data="activityChartData" :options="activityChartOptions" />
          </div>
        </div>
      </div>

      </div>
  </div>
  

  <!-- Stats Section -->
  <div v-else class="grid">
      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Outils & objets</span>
              <div class="text-900 font-medium text-xl">{{ outils }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-wrench text-blue-500 text-xl"></i>
            </div>
          </div>
          <RouterLink to="catalogue"><span class="text-500">Voir le catalogue</span></RouterLink>
        </div>
      </div>

      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Membres</span>
              <div class="text-900 font-medium text-xl">{{ members }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-users text-orange-500 text-xl"></i>
            </div>
          </div>
          <RouterLink to="auth/login"><span class="text-500">Se connecter</span></RouterLink>
        </div>
      </div>

      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Réservations et prêts</span>
              <div class="text-900 font-medium text-xl">{{ resa }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-calendar text-cyan-500 text-xl"></i>
            </div>
          </div>
          <span class="text-green-500 font-medium">{{ resa }}  </span>
          <span class="text-500"> depuis 2023</span>
        </div>
      </div>

      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Formations</span>
              <div class="text-900 font-medium text-xl">2</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-sliders-v text-purple-500 text-xl"></i>
            </div>
          </div>
          <span class="text-500">aux outils en prêt</span>
        </div>
      </div>
    </div>
  </div>

</template>


<script setup>
import { Directus } from "@directus/sdk";
import { useAuthStore } from "@/stores/auth";
import { ref, onMounted } from "vue";
import Chart from "primevue/chart";

// Directus setup
const directus = new Directus("https://devdirectus.rubidiumweb.eu");

// Get the authenticated user
const store = useAuthStore();
const userId = store.me.id;

// Data for stats and graphs
const userBorrowed = ref(0);
const userLent = ref(0);
const totalItems = ref(0);
const returnPercentage = ref(0);
const reservationEvents = ref([]);

// Chart data
const returnChartData = ref({
  labels: ["Retourné", "En cours"],
  datasets: [
    {
      data: [0, 0],
      backgroundColor: ["#42A5F5", "#FFCDD2"],
    },
  ],
});

const activityChartData = ref({
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "Emprunts",
      backgroundColor: "#42A5F5",
      data: Array(12).fill(0), // Initialize with zeros
    },
    {
      label: "Prêts",
      backgroundColor: "#FFA726",
      data: Array(12).fill(0), // Initialize with zeros
    },
  ],
});

const activityChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false, // Make the chart responsive to the container size
});

async function fetchUserStats() {
  // Fetch total borrowed items for the user
  const borrowedResponse = await directus.items("reservation").readByQuery({
    filter: {
      user_created: {
        _eq: userId,
      },
    },
  });
  userBorrowed.value = borrowedResponse.data.length;

  // Fetch total lent items by the user
  const lentResponse = await directus.items("reservation").readByQuery({
    filter: {
      objet: {
        proprietaire: {
          _eq: userId,
        },
      },
    },
  });
  userLent.value = lentResponse.data.length;

  // Fetch total items owned by the user
  const totalItemsResponse = await directus.items("objet").readByQuery({
    filter: {
      proprietaire: {
        _eq: userId,
      },
    },
  });
  totalItems.value = totalItemsResponse.data.length;

  // Populate activityChartData with real data
  populateChartData(borrowedResponse.data, lentResponse.data);

  // Update the return percentage for the doughnut chart
  const returnedItems = lentResponse.data.filter(item => item.statut === "Rendu").length;
  returnChartData.value.datasets[0].data = [returnedItems, lentResponse.data.length - returnedItems];
}

function populateChartData(borrowedData, lentData) {
  const borrowedCountPerMonth = Array(12).fill(0); // Array for counting borrows per month
  const lentCountPerMonth = Array(12).fill(0); // Array for counting lends per month

  borrowedData.forEach(item => {
    const month = new Date(item.debut).getMonth(); // Get the month from the start date
    borrowedCountPerMonth[month] += 1; // Increment the count for that month
  });

  lentData.forEach(item => {
    const month = new Date(item.debut).getMonth(); // Get the month from the start date
    lentCountPerMonth[month] += 1; // Increment the count for that month
  });

  // Update the activityChartData dataset
  activityChartData.value.datasets[0].data = borrowedCountPerMonth;
  activityChartData.value.datasets[1].data = lentCountPerMonth;
}

onMounted(() => {
  fetchUserStats();
});
</script>


