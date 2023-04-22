<template>
    <div className="grid">
        <div className="col-12">
            <div className="card">
                <h5>Mes outils</h5>
                <!-- res----- {{ reservation }} -->
                
                <div>

<DataTable :value="me.objet" v-model:expandedRows="expandedRows" sortField="nom" :sortOrder="1"  tableStyle="min-width: 50rem">
    <template #header>
        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
            <span class="text-xl text-900 font-bold">Outils</span>
            <Button icon="pi pi-refresh" rounded raised />
        </div>
    </template>
    <Column expander style="width: 5rem" />
    <Column field="nom" header="Objet" sortable></Column>
    <!-- <Column header="Image">
        <template #body="slotProps">
            <img :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.image}`" :alt="slotProps.data.image" class="w-6rem shadow-2 border-round" />
        </template>
    </Column> -->
    <Column field="prix_indicatif" header="Prix" sortable>
        <template #body="slotProps">
           {{ formatCurrency(slotProps.data.prix_indicatif) }}
        </template>
    </Column>
    <Column field="marque" header="Marque" sortable> </Column>

    <Column field="etat" header="Etat" sortable>
        <template #body="slotProps">
         <Rating :modelValue="convertToGrade(slotProps.data.etat)" readonly :cancel="false" />
        </template>
    </Column>

    <Column field="dispo" header="Dispo" sortable>
        <template #body="slotProps">
            <Tag class="px-4 py-2" :value="slotProps.data.inventoryStatus" :severity="getSeverity(slotProps.data)" />
        </template>
    </Column>
    <!-- <Column expander header="Réservations"  style="width: 5rem">
         <template #body="slotProps">
            <Button icon="pi pi-calendar" class="p-button-rounded content-justify-center p-button-secondary mr-1 mb-1" />
        </template>
    </Column>  -->
    

    <template #expansion="slotProps">
                <div class="p-3 bg-slate-100">
                    <h6> Réservations </h6>
                    <DataTable :value="slotProps.data.reservation">
                        <!-- {{ slotProps.data.reservation }} -->
                        <Column field="user_created.first_name" header="Nom" > 
                            </Column>
                        <Column field="debut" header="Debut" >
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.debut) }}
                             </template>
                        </Column>
                        <Column field="fin" header="Fin" >
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.fin) }}
                             </template>
                        </Column>
                        <Column field="statut" header="Statut" >
                         <template #body="slotProps">
                        <Tag class="px-4 py-2 text-sm" :value="slotProps.data.statut" :severity="getSeverity(slotProps.data)" />
                        </template>
                        </Column>

                    </DataTable>
    
                </div>
            </template>



    <template #footer> Vous avez {{ me.objet ? me.objet.length : 0 }} outils à prêter. </template>
</DataTable>


                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Directus } from "@directus/sdk";
import moment from 'moment'
import 'moment/locale/fr';

const directus = new Directus("https://devdirectus.rubidiumweb.eu");
const me = ref('')
const reservation = ref('')
const expandedRows=ref([])

const formatDate = (val) => {
    var  mydate = new Date(val);
    var mom = moment(mydate);

    mom.locale('fr');
    const formattedDate = mom.fromNow();     

    return formattedDate
    // return mydate.toLocaleString('fr-FR', { style: 'date' });
}

const formatCurrency = (val) => {
    return val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
};

const onRowExpand = (event) => {
   
};

const convertToGrade = (etat) => {
    switch (etat) {
        case 'Neuf':
            return 5;
        case 'Excellent':
            return 4;
        case 'Bon':
            return 3;
        case 'Moyen':
            return 2;
        case 'En Panne':
            return 0;

        default:
            return null;
    }

}

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


async function mesObjets() {
    me.value = await directus.users.me.read(
        {
            fields: ['objet.*,objet.reservation.user_created.first_name,objet.reservation.user_created.last_name,objet.reservation.user_created.telephone,objet.reservation.*'],
        }
    );
    reservation.value = me.value.objet;
}



onMounted(() => {
    mesObjets();
});




</script>
