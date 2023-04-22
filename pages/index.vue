<template>
  <div >

    <div class="surface-section px-4 py-8 md:px-6 lg:px-8 mb-4  card">
      <div class="text-700 text-center">
          <div class="text-blue-600 font-bold mb-3">SOUTENUE PAR&nbsp; <i class="pi pi-megaphone"></i></div>
          <div class="text-900 font-bold text-5xl mb-3">Bienvenue sur l'outilthèque de Larchant</div>
          <div class="text-700 text-2xl mb-5">Prêtez, empruntez, apprenez, réparez...</div>
          <div class="flex justify-center gap-10"> 
            <NuxtLink to="/auth/signup"> 
          <Button label="Devenez membre" icon="pi pi-plus-circle" severity="info" class="font-bold px-5 py-3 p-button-raised  white-space-nowrap"></Button>
          </NuxtLink>
          <NuxtLink to="/auth/login"> 
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
              <div class="text-900 font-medium text-xl">152</div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-blue-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-wrench text-blue-500 text-xl"></i>
            </div>
          </div>
          <span class="text-500">Voir le catalogue</span>
        </div>
      </div>
      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Membres</span>
              <div class="text-900 font-medium text-xl">10</div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-orange-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-users text-orange-500 text-xl"></i>
            </div>
          </div>
         
          <span class="text-500">Se connecter</span>
        </div>
      </div>
      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Réservations et prêts</span>
              <div class="text-900 font-medium text-xl">28441</div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-cyan-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-calendar text-cyan-500 text-xl"></i>
            </div>
          </div>
          <span class="text-green-500 font-medium">520 </span>
          <span class="text-500">depuis 2023</span>
        </div>
      </div>
      <div class="col-12 lg:col-6 xl:col-3">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-600 font-medium mb-3">Formations</span>
              <div class="text-900 font-medium text-xl">152</div>
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
