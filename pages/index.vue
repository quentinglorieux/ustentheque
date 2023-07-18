<template>
  <div >

    <div class="surface-section px-4 py-8 md:px-6 lg:px-8 mb-4  card">
      <div class="text-700 text-center">
          <div class="text-blue-600 font-bold text-xl mb-3">La BibOB est soutenue par &nbsp; <i class="pi pi-megaphone"></i></div>
          <div class="text-900 font-bold text-4xl mb-3">Bienvenue sur la Biblothèque des Objets de Larchant</div>
          <div class="text-700 text-2xl mb-5">Prêtez, empruntez, apprenez, réparez...</div>
          <div class="md:flex justify-center gap-10"> 
            <NuxtLink to="/auth/signup"> 
          <Button label="Devenez membre de la BibOB" icon="pi pi-plus-circle" severity="info" class=" font-bold mb-3 px-5 py-3 p-button-raised m-10 white-space-nowrap"></Button>
          </NuxtLink>
          <NuxtLink class="" to="/auth/login"> 
            <Button label="Connexion" icon="pi pi-sign-in"  severity="info" class="font-bold px-5 py-3 p-button-raised  white-space-nowrap"></Button>
          </NuxtLink>
          </div>
      </div>
    </div>

    <div class="grid">
      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Outils & objets</span>
              <div class="text-900 font-medium text-xl">{{ outils }}</div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-blue-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-wrench text-blue-500 text-xl"></i>
            </div>
          </div>
          <RouterLink to="catalogue"> <span class="text-500">Voir le catalogue</span> </RouterLink>
        </div>
      </div>
      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Membres</span>
              <div class="text-900 font-medium text-xl">{{ members }}</div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-orange-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-users text-orange-500 text-xl"></i>
            </div>
          </div>
         
          <RouterLink to="auth/login"> <span class="text-500">Se connecter</span> </RouterLink>
        </div>
      </div>
      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Réservations et prêts</span>
              <div class="text-900 font-medium text-xl">{{resa}}</div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-cyan-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-calendar text-cyan-500 text-xl"></i>
            </div>
          </div>
          <span class="text-green-500 font-medium">{{resa}}  </span>
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
            <div
              class="flex align-items-center justify-content-center bg-purple-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-sliders-v text-purple-500 text-xl"></i>
            </div>
          </div>
          
          <span class="text-500">aux outils en prêt</span>
        </div>
      </div>
    </div>




    <div class="flex">
      <!-- <MyPrime />
      <MyCounter /> -->
    </div>
  </div>
</template>

<script setup>
import { Directus } from "@directus/sdk";
const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const resa=ref();
async function countResa() {
    let count = await directus.items('objet').readByQuery({
            meta: 'total_count'  
    },
    );
    resa.value = count.meta.total_count;
    
}

const members=ref();
async function countMembers() {
    let count = await directus.items('directus_users').readByQuery({
            meta: 'total_count'  
    },
    );
    members.value = count.meta.total_count;   
}

const outils=ref();
async function countOutils() {
    let count = await directus.items('objet').readByQuery({
            meta: 'total_count'  
    },
    );
    outils.value = count.meta.total_count;   
}



onMounted(() => {
  countResa();
  countMembers();
  countOutils();
});

</script>
