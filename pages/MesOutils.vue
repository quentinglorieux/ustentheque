<template>
    <div className="grid">
        <div className="col-12">
            <div className="card">
                <h5>Mes outils</h5>
                {{ me }}
                <p>Use this page to start from scratch and place your custom content.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Directus } from "@directus/sdk";

const directus = new Directus("https://devdirectus.rubidiumweb.eu");

const me = ref('')

async function myProfile() {
    me.value = await directus.users.me.read();
}

onMounted(() => {
    myProfile();
});




</script>
