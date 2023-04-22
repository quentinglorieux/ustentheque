<script setup>
import { Directus } from "@directus/sdk";
import { useAuthStore } from "@/stores/auth";
const store = useAuthStore();
const authenticated = computed(() => store.authenticated);


// import Checkbox from 'primevue/checkbox';
// import Password from 'primevue/password';


// const { layoutConfig, contextPath } = useLayout();
const email = ref('');
const password = ref('');
const checked = ref(false);
// const authenticated = ref(false);
const token = ref();
const me = ref();

const directus = new Directus("https://devdirectus.rubidiumweb.eu");

onMounted(() => {
    checkLogin();
    myProfile();
});

async function myProfile() {
    const profileData = await directus.users.me.read(
        { fields: ['*'],}
    );
    console.log(profileData)
	me.value =  profileData;
    store.first_name = profileData.first_name
    store.last_name = profileData.last_name
    store.avatar = profileData.avatar
		
}


async function checkLogin() {
	// AUTHENTICATION
	await directus.auth.token
		.then((a) => {
			//authenticated.value = true;
            token.value=a;
		})
		.catch(() => {});
    }

    async function logoutDirectus() {
	// AUTHENTICATION
	directus.auth.logout()} 
    

async function loginDirectus() {
	if (!authenticated.value) {
        await directus.auth.login({ 
                email: email.value,
                password : password.value,
             })
			.then(() => {
				store.authenticated = true;
                console.log("log in");
                myProfile();
			})
			.catch(() => {
				console.log('Invalid credentials');
			});
	}
}

</script>

<template>




    <div v-if="!store.authenticated" class="flex align-items-center justify-center overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Larchant Outilthèque</div>
                    </div>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email" class="w-full md:w-30rem mb-5" v-model="email" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Mot de Passe</label>
                        <Password id="password1" v-model="password" placeholder="Mot de Passe" :toggleMask="false" class="w-full mb-3" inputClass="w-full"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Se souvenir de moi</label>
                            </div>
                            <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Mot de passe oublié?</a>
                        </div>
                        <Button @click="loginDirectus()" label="Connexion" class="w-full p-3 text-xl"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div  v-if="me" > 
    <div class="text-900 text-3xl font-medium mb-3"> Bonjour {{ me.first_name }}, </div>
    <div class="text-700 text-xl font-medium mb-3"> Merci de preter <span  class="text-orange-500">{{ me.objet.length }} </span> objets</div>
    <Button @click="logoutDirectus()" label="Se déconnecter" class="w-3 p-3 text-xl"></Button> (ne fait rien pour l instant)
 </div>

 
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
