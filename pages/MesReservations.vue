<template>

    
    <div className="grid">
        <div className="col-12">
            <div className="card">
    <div v-if="completed">
    <div v-if="!resa.data">
        <div> Vous n'etes pas connécté.</div> 
        <NuxtLink to="/auth/login"> 
            <Button label="Connectez vous ici" icon="pi pi-sign-in"  severity="info" class="font-bold mt-5 px-5 py-3 p-button-raised  white-space-nowrap"></Button>
        </NuxtLink>
    </div>
         
    <DataTable v-if="resa.data" :value="resa.data" tableStyle="min-width: 50rem">
    <template #header>
        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
            <span class="text-xl text-900 font-bold">Mes emprunts</span>
            <NuxtLink :to="`/edit/resa-add`">
                    <Button icon="pi pi-plus" rounded raised /> 
                </NuxtLink>
        </div>
    </template>

    <Column field="objet.nom" header="Objet" sortable> 
        <template #body="slotProps">
            <NuxtLink :to="`/edit/resa-${slotProps.data.id}`" class="flex align-items-center gap-2"> 
                {{ slotProps.data.objet.nom }}  {{ slotProps.data.objet.marque }}
                <Button icon="pi pi-pencil" class="py-0" text rounded  />
                </NuxtLink>
               
        </template>
    </Column>

    <Column field="debut" header="Debut" sortable></Column>

    <Column field="fin" header="Fin" sortable>
    </Column>


    <Column field="statut" header="Statut" sortable>
        <template #body="slotProps">
            <Tag class="px-4 py-2 text-sm" :value="slotProps.data.statut" :severity="getStatus(slotProps.data)" />
        </template>
    </Column>
    <Column  header="Edit" >
         <template #body="slotProps">
            
            <NuxtLink :to="`/edit/resa-${slotProps.data.id}`" > 
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-secondary mr-1 mb-1" />
            </NuxtLink>
    </template>
</Column>
    <template #footer> Vous avez {{ resa ? resa.data.length : 0 }} demande(s) d'emprunt sur votre compte. </template>
    <!-- <Column field="marque" header="Marque" sortable> </Column>

    <Column field="etat" header="Etat" sortable>
        <template #body="slotProps">
         <Rating :modelValue="convertToGrade(slotProps.data.etat)" readonly :cancel="false" />
        </template>
    </Column>

 
    <Column expander style="width: 5rem">
         <template #body="slotProps">
           <Button @click="onRowExpand"> Réservations</Button>
        </template>
    </Column> 
    <template #footer> Vous avez {{ me.objet ? me.objet.length : 0 }} outils à prêter. </template> -->
</DataTable>


            </div >
            <div v-else> <ProgressSpinner /></div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { Directus } from "@directus/sdk";
const directus = new Directus("https://devdirectus.rubidiumweb.eu");
const resa = ref('')
const completed=ref(false)


async function mesResa() {
    completed.value = false;

    resa.value = await directus.items('reservation').readByQuery({
            fields: ["id,debut,fin,statut,objet.id,objet.nom,objet.marque"],
            filter: {
                "user_created": {
		        "_eq": "$CURRENT_USER"
	            }, 
            },         
    },
    );
    completed.value = true;
}

onMounted(() => {
    mesResa();
});

const getStatus = (resa) => {
    switch (resa.statut) {
        case 'En attente':
            return "info";
        case 'Validé':
            return 'success';

        case 'Rendu':
            return 'warning';

        case 'Refusé':
            return 'danger';

        default:
            return null;
    }
};

</script>

