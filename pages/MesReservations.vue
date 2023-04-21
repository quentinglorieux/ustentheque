<template>
    <div className="grid">
        <div className="col-12">
            <div className="card">
         
    <DataTable :value="resa.data" tableStyle="min-width: 50rem">
    <template #header>
        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
            <span class="text-xl text-900 font-bold">Mes réservations</span>
            <Button icon="pi pi-refresh" rounded raised />
        </div>
    </template>

    <Column field="objet.nom" header="Objet" sortable> 
        <template #body="slotProps">
         {{ slotProps.data.objet.nom }}  {{ slotProps.data.objet.marque }}
        </template>
    </Column>

    <Column field="debut" header="Debut" sortable></Column>

    <Column field="fin" header="Fin" sortable>
    </Column>


    <Column field="statut" header="Statut" sortable>
        <template #body="slotProps">
            <Tag class="px-4 py-2 text-sm" :value="slotProps.data.statut" :severity="getSeverity(slotProps.data)" />
        </template>
    </Column>
    <Column  header="Edit" >
         <template #body="slotProps">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-secondary mr-1 mb-1" />
    </template>
</Column>
    <template #footer> Vous avez {{ resa ? resa.data.length : 0 }} réservation(s) sur votre compte. </template>
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


            </div>
        </div>
    </div>
</template>

<script setup>

import { Directus } from "@directus/sdk";
const directus = new Directus("https://devdirectus.rubidiumweb.eu");
const resa = ref('')


async function mesResa() {
    resa.value = await directus.items('reservation').readByQuery({
            fields: ["debut,fin,statut,objet.id,objet.nom,objet.marque"],
            filter: {
                "user_created": {
		        "_eq": "$CURRENT_USER"
	            }, 
            },         
    },
    );
}

onMounted(() => {
    mesResa();
});

const getSeverity = (resa) => {
    switch (resa.statut) {
        case 'En attente':
            return null;
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

