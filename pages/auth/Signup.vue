<script setup>
import { Directus } from "@directus/sdk";
import { useToast } from "primevue/usetoast";


const email = ref('');
const password = ref('');
const first_name = ref('');
const last_name = ref('');
const telephone = ref('');
const ville=ref('');
const succes=ref(false);
const charte=ref()


const directus = new Directus("https://devdirectus.rubidiumweb.eu");
const users = directus.items('directus_users');

const toast = useToast();

onMounted(() => {
});


async function registerDirectus() {
    if    (charte.value == "valide") {
    await users.createOne({
	first_name: first_name.value,
    last_name: last_name.value,
    email: email.value,
    password: password.value,
    telephone: telephone.value,
    location: ville.value,
    role: '62de0e16-3453-45fc-bc57-89ca548930f8'
    })
    .then(() => {
				console.log('Succes');
                succes.value = true
			}
        
    )
    .catch(() => {
				console.log('Erreur');
                toast.add({
                severity: "error",
                summary: "Erreur.",
                detail: "Merci de recommencer",
                life: 3000,
			});
        }
    );
    }
        else{
        toast.add({
        severity: "error",
        summary: "Erreur.",
        detail: "Veuillez accepter la charte",
        life: 3000,})


        }

} 
    



</script>
<template>
    <Toast />
    <div v-if="succes" class="text-center p-4">
      Vous êtes bien inscrit. Merci de vous connecter.
      <NuxtLink to="/auth/login">
        <Button
          label="Connexion"
          icon="pi pi-sign-in"
          severity="info"
          class="font-bold w-full sm:w-auto px-4 py-2"
        ></Button>
      </NuxtLink>
    </div>
    <div v-if="!succes" class="col-12 p-2 sm:p-4">
      <div class="card p-3 sm:p-4">
        <h5>S'inscrire</h5>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="prenom">Prénom</label>
            <InputText v-model="first_name" id="prenom" type="text" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="nom">Nom</label>
            <InputText v-model="last_name" id="nom" type="text" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="telephone">Téléphone</label>
            <InputText v-model="telephone" id="telephone" type="text" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="v1">Ville</label>
            <InputText disabled placeholder="Larchant" />
          </div>
          <div class="field col-12">
            <label for="ville">Adresse à Larchant (rue et numéro)</label>
            <InputText v-model="ville" id="ville" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="email">Email</label>
            <InputText v-model="email" id="email" type="email" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="password">Mot de Passe</label>
            <Password
              id="password"
              v-model="password"
              placeholder="Mot de Passe"
              :toggleMask="true"
              class="w-full"
              inputClass="w-full"
            ></Password>
          </div>
          <div class="field col-12 flex items-start">
            <Checkbox class="mt-1" v-model="charte" inputId="charte1" name="charte" value="valide" />
            <label for="charte1" class="ml-2 text-sm">Je m'engage à souscrire aux principes de la charte de la BibOb.</label>
          </div>
          <div class="field col-12 sm:col-6 sm:col-offset-3 mt-4">
            <Button @click="registerDirectus()" label="Inscription" class="w-full p-3 text-lg"></Button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .pi-eye,
  .pi-eye-slash {
    transform: scale(1.4);
    margin-right: 0.75rem;
  }
  </style>
  