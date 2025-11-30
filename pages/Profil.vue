<template>
  <div class="grid">
    <div class="col-12">
      <div v-if="!me.first_name" class="flex flex-column align-items-center justify-content-center h-screen">
        <div class="text-2xl font-bold mb-4">Vous n'êtes pas connecté.</div>
        <NuxtLink to="/auth/login">
          <Button label="Connectez-vous ici" icon="pi pi-sign-in" severity="primary" size="large" raised
            rounded></Button>
        </NuxtLink>
      </div>

      <div v-else class="grid nested-grid">
        <!-- Header -->
        <div class="col-12">
          <div class="flex align-items-center justify-content-between mb-4">
            <h1 class="text-3xl font-bold text-900 m-0">Mon Profil</h1>
            <Button @click="logoutDirectus()" label="Se déconnecter" icon="pi pi-sign-out" severity="danger" outlined />
          </div>
        </div>

        <!-- Main Info (Left Column) -->
        <div class="col-12 md:col-8 order-2 md:order-1">
          <div class="card p-fluid border-round-xl shadow-2 p-5 border-top-3 border-blue-500">
            <h5 class="text-xl font-semibold mb-4 text-blue-600">Mes Informations</h5>

            <div class="formgrid grid">
              <div class="field col-12 md:col-6">
                <label for="first_name" class="font-medium">Prénom</label>
                <InputText v-model="me.first_name" id="first_name" type="text" />
              </div>
              <div class="field col-12 md:col-6">
                <label for="last_name" class="font-medium">Nom</label>
                <InputText v-model="me.last_name" id="last_name" type="text" />
              </div>
              <div class="field col-12">
                <label for="location" class="font-medium">Adresse</label>
                <InputText v-model="me.location" id="location" type="text" placeholder="Votre adresse complète" />
              </div>
              <div class="field col-12 md:col-6">
                <label for="telephone" class="font-medium">Téléphone</label>
                <InputText v-model="me.telephone" id="telephone" type="tel" />
              </div>
            </div>

            <Divider />

            <h5 class="text-xl font-semibold mb-4 text-blue-600">Mon Compte</h5>

            <div class="formgrid grid">
              <div class="field col-12 md:col-6">
                <label for="email" class="font-medium">Email</label>
                <div class="p-inputgroup">
                  <span class="p-inputgroup-addon"><i class="pi pi-at"></i></span>
                  <InputText v-model="me.email" id="email" type="email" disabled class="bg-gray-100" />
                </div>
              </div>
              <div class="field col-12 md:col-6">
                <label for="password" class="font-medium">Mot de passe</label>
                <div class="p-inputgroup">
                  <span class="p-inputgroup-addon"><i class="pi pi-lock"></i></span>
                  <InputText v-model="me.password" id="password" type="password" placeholder="Nouveau mot de passe" />
                </div>
              </div>
            </div>

            <div class="flex justify-content-end mt-4">
              <Button label="Enregistrer les modifications" icon="pi pi-save" @click="updateProfile()"
                severity="primary" size="large" class="bg-indigo-500 text-white px-6 py-2" raised />
            </div>
          </div>
        </div>

        <!-- Sidebar (Right Column) -->
        <div class="col-12 md:col-4 order-1 md:order-2">
          <!-- Avatar Card -->
          <div
            class="card border-round-xl shadow-2 p-4 mb-4 flex flex-column align-items-center border-top-3 border-blue-500">
            <h5 class="text-xl font-semibold mb-3 text-blue-600 align-self-start">Ma Photo</h5>

            <div
              class="relative w-10rem h-10rem border-2 border-dashed border-blue-200 border-circle bg-blue-50 flex align-items-center justify-content-center overflow-hidden mb-4">
              <img v-if="image"
                :src="`https://bibob.rubidiumweb.fr/assets/${image}?fit=cover&width=300&height=300&quality=80`"
                class="w-full h-full object-cover" alt="Avatar" />
              <div v-else class="text-center text-500">
                <i class="pi pi-user text-4xl mb-2"></i>
              </div>
            </div>

            <FileUpload mode="basic" name="file" :url="`https://bibob.rubidiumweb.fr/files`" accept="image/*"
              :maxFileSize="2000000" :auto="true" chooseLabel="Modifier ma photo" class="p-button-outlined w-full"
              :withCredentials="true" @select="uploadFile" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { updateMe, uploadFiles } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useDirectusBase } from "@/composables/useDirectusBase";

const { user, logout } = useUser();
const toast = useToast();

const me = computed(() => user.value || {});
const directusBase = useDirectusBase();
const directus = useDirectus();

// uploadFile
const image = ref("");
watchEffect(() => {
  if (user.value?.avatar) {
    image.value = user.value.avatar;
  }
});

const uploadFile = async (event) => {
  let form = new FormData();
  form.append("file", event.files[0]);

  try {
    const im = await directus.request(uploadFiles(form));
    image.value = im.id;
    // Update the user avatar in the backend immediately or wait for profile update?
    // Usually profile update handles it, but here we just set image.value.
    // If we want to save avatar immediately:
    await directus.request(updateMe({ avatar: im.id }));
    // Refresh user state
    // fetchUser(); // We might need to expose fetchUser or just update local state
    if (user.value) user.value.avatar = im.id;

    console.log(image.value);
  } catch (e) {
    onFailed();
  }
};
const onFailed = () => {
  toast.add({
    severity: "error",
    summary: "Erreur",
    detail: "Le chargement a échoué",
    life: 3000,
  });
};

// Mise a jour de l outil
async function updateProfile() {
  try {
    await directus.request(updateMe({
      first_name: me.value.first_name,
      last_name: me.value.last_name,
      telephone: me.value.telephone,
      location: me.value.location,
      // photo: image.value, // If photo is separate from avatar
    }));
    toast.add({
      severity: "success",
      summary: "Merci",
      detail: "Profil mis à jour.",
      life: 3000,
    });
  } catch (e) {
    console.error("Error updating profile", e);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Mise à jour échouée",
      life: 3000,
    });
  }
}

async function logoutDirectus() {
  await logout();
  // Redirect to home or login page is handled by logout usually or we can do it here
  navigateTo('/');
};

</script>
