<script setup>
import { useToast } from "primevue/usetoast";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const email = ref(route.query.email || '');
const code = ref('');
const loading = ref(false);

// We need the hash that was returned by the send-verification endpoint.
// Since we are redirecting, we should pass it in the query params as well, 
// or re-trigger the send-verification if it's missing (but that generates a new code).
// BETTER APPROACH for this stateless flow: 
// The Signup page should pass the hash in the URL.
const hash = ref(route.query.hash || '');

async function verifyCode() {
    if (!code.value) return;

    loading.value = true;
    try {
        const { error } = await useFetch('/api/auth/verify-code', {
            method: 'POST',
            body: {
                email: email.value,
                code: code.value,
                hash: hash.value
            }
        });

        if (error.value) throw error.value;

        toast.add({ severity: "success", summary: "Succès", detail: "Email vérifié ! Vous pouvez vous connecter.", life: 3000 });

        // Redirect to login after a short delay
        setTimeout(() => {
            router.push('/auth/login');
        }, 1500);

    } catch (e) {
        toast.add({ severity: "error", summary: "Erreur", detail: "Code incorrect ou expiré.", life: 3000 });
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="flex justify-content-center align-items-center min-h-screen bg-gray-50">
        <div class="surface-card p-4 shadow-2 border-round w-full md:w-6 lg:w-4">
            <div class="text-center mb-5">
                <div class="text-900 text-3xl font-medium mb-3">Vérification Email</div>
                <span class="text-600 font-medium line-height-3">Un code a été envoyé à <strong>{{ email
                        }}</strong></span>
            </div>

            <div class="p-fluid">
                <div class="field mb-4">
                    <label for="code" class="block text-900 font-medium mb-2">Code de vérification</label>
                    <InputText id="code" v-model="code" type="text" class="w-full" placeholder="123456" />
                </div>

                <Button label="Valider" icon="pi pi-check" class="w-full" @click="verifyCode" :loading="loading" />

                <div class="mt-3 text-center">
                    <NuxtLink to="/auth/signup" class="text-blue-500 no-underline hover:underline cursor-pointer">Retour
                        à l'inscription</NuxtLink>
                </div>
            </div>
        </div>
        <Toast />
    </div>
</template>
