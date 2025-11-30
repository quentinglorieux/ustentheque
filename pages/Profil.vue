<template>
  <div class="grid">
    <div class="col-12 md:col-9">
      <!-- Main form -->

      <div v-if="!me.first_name" class="card">
        <div>Vous n'etes pas connécté.</div>
        <NuxtLink to="/auth/login">
          <Button label="Connectez vous ici" icon="pi pi-sign-in" severity="info"
            class="font-bold mt-5 px-5 py-3 p-button-raised white-space-nowrap"></Button>
        </NuxtLink>
      </div>

      <div v-if="me.first_name" class="card">
        <h3>Mon Profil</h3>

        <Divider />
        <h4>Mes infos</h4>
        <div class="p-fluid formgrid grid">
          <div class="field col-12 md:col-6">
            <label for="nom">Prénom</label>
            <InputText v-model="me.first_name" id="first_name" type="text" />
          </div>

          <div class="field col-12 md:col-6">
            <label for="etat">Nom</label>
            <InputText v-model="me.last_name" id="last_name" type="text" />
          </div>
          <div class="field col-12 md:col-12">
            <label for="nom">Adresse</label>
            <InputText v-model="me.location" id="location" type="text" />
          </div>

          <div class="field col-12 md:col-6">
            <label for="etat">Telephone</label>
            <InputText v-model="me.telephone" id="telephone" type="telephone" />
          </div>

          <Divider />

          <h4>Mon compte</h4>

          <div class="flex field col-6 md:col-6 p-inputgroup pb-3">
            <span class="p-inputgroup-addon">
              <i class="pi pi-at"></i>
            </span>
            <InputText placeholder="Email" v-model="me.email" id="email" type="email" disabled />
          </div>

          <div class="flex field col-6 md:col-6 p-inputgroup pb-3">
            <span class="p-inputgroup-addon">
              <i class="pi pi-lock"></i>
            </span>
            <InputText placeholder="Password" v-model="me.password" id="password" type="password" />
          </div>

          <div class="field col-8 md:col-6 md:col-offset-3">
            <div class="flex gap-2">
              <Button label="Mettre à jour" class="w-full p-3 text-xl" @click="updateProfile()"></Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 sm:col-6 md:col-3">
      <div v-if="me.first_name" class="card flex flex-col content-center">
        <Toast />
        <h4 class="text-center">Ma photo</h4>
        <div v-if="me.avatar" class="flex justify-center">
          <img class="object-cover rounded-full mb-10"
            :src="`https://bibob.rubidiumweb.fr/assets/${image}?fit=cover&width=300&height=300&quality=50`" />
        </div>
        <div v-else class="flex justify-center">
          <img class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain block xl:block border-round"
            :src="`https://bibob.rubidiumweb.fr/assets/7ed6273f-9add-4257-b546-d99af9a3505a.png?fit=cover&width=300&height=300&quality=50`" />
        </div>



        <FileUpload class="flex justify-center mx-1" v-model="selectedFile" name="file"
          :url="`https://bibob.rubidiumweb.fr/files`" mode="basic" accept=".png,.jpg,.jpeg" maxFileSize="2000000"
          chooseLabel="Modifier" :withCredentials="true" @select="uploadFile" />
      </div>

      <div v-if="me.first_name" class="text-center"> <Button @click="logoutDirectus()" label="Se déconnecter"
          class=" p-3 text-xl "></Button></div>
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
