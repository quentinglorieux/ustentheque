<template>
    <div class="flex gap-10 justify-content-between">
    <div class="flex">
    <div class=" mb-2 lg:mb-0 mr-2">
                       Filtrer les objets par nom:  <span class="p-input-icon-right">
                            <InputText 
                                @keyup="getSearchData(searchKey)"
                                @keyup.delete="getSearchData(searchKey)" 
                                v-model="searchKey" 
                                type="text" 
                                placeholder="Search" 
                            />
                            <i class="pi pi-search" />
                        </span>
                    </div>
                    <Button @click="getSearchData(searchKey)" label="Filtre" class="mr-2 mb-2"></Button>
                    <Button @click="getAllData()" label="Reset Filtre" class="mr-2 mb-2"></Button>
                </div>

                <div>
                ou commencez à taper pour chercher : <AutoComplete 
                placeholder="Search" 
                id="dd" 
                :dropdown="true" 
                :multiple="false" 
                v-model="selectedAutoValue" 
                :suggestions="suggestions" 
                @complete="searchOutil($event)" 
                @item-select="getSearchData(selectedAutoValue.nom)"
                @clear="getAllData()"
                field="nom" />
            </div>
        </div>
                    
     <div class="card">
        
        <DataView :value="outils" :layout="layout">
            <template #header>
                <div class="flex justify-content-between"> 
                <div class="text-3xl"> Catalogue </div>
                <div class="flex justify-content-end">
                    <DataViewLayoutOptions v-model="layout" />
                </div>
            </div>
            </template>

            <template #list="slotProps">
                <div class="col-12">
                    <div class="flex flex-column xl:flex-row xl:align-items-start p-3 gap-4">
                        <NuxtLink :to="`/outil-${slotProps.data.id}`">
                       <img class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem  object-contain shadow-2 block xl:block mx-auto border-round" :src="`https://devdirectus.rubidiumweb.eu/assets/${slotProps.data.photo}?fit=cover&width=300&height=300&quality=40`" :alt="slotProps.data.name" />
                        </NuxtLink>
                    <div class="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                            <div class="flex flex-column align-items-center sm:align-items-start gap-3">
                                <NuxtLink :to="`/outil-${slotProps.data.id}`"> 
                                    <div class="text-2xl font-bold text-900">{{ slotProps.data.nom }}</div>
                                </NuxtLink>
                            

                                <div class="flex flex-column align-items-start gap-3">
                                    <span class="flex align-items-center gap-2">
                                        <i class="pi pi-tag"></i>
                                        <span> Marque:</span><span class="font-semibold">{{ slotProps.data.marque }}</span>
                                    </span>
                                    <span class="flex align-items-center gap-2">
                                        <i class="pi pi-info-circle"></i>
                                        <span> Etat:</span> 
                                    <Tag :value="slotProps.data.etat" :severity="getSeverity(slotProps.data)"></Tag>
                                </span>
                                </div>
                            </div>
                            <div class="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                                <span class="text-l font-semibold">Prix indicatif: {{ slotProps.data.prix_indicatif }} €</span>
                                <NuxtLink :to="`/outil-${slotProps.data.id}`"><Button icon="pi pi-plus" rounded :disabled="slotProps.data.etat === 'En panne'"></Button></NuxtLink>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #grid="slotProps">
                <div class="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
                    <div class="p-4 border-1 surface-border surface-card border-round">
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-tag"></i>
                                <span> Marque:</span><span class="font-semibold">{{ slotProps.data.marque }}</span>
                            </div>
                            <Tag :value="slotProps.data.etat" :severity="getSeverity(slotProps.data)"></Tag>
                        </div>
                        <div class="flex flex-column align-items-center gap-3 py-5">
                            <NuxtLink :to="`/outil-${slotProps.data.id}`">
                            <img class="w-80 h-60 object-contain border-round" :src="`https://devdirectus.rubidiumweb.eu/assets/${slotProps.data.photo}?    height=300&quality=40`" :alt="slotProps.data.name" />
                            </NuxtLink>
                            <div class="text-2xl font-bold">{{ slotProps.data.nom }}</div>
                            <!-- <Rating value="{product.rating}" readonly :cancel="false"></Rating> -->
                        </div>
                        <div class="flex align-items-center justify-content-between">
                            <span class="text-m font-semibold">Prix indicatif: {{ slotProps.data.prix_indicatif }} €</span>
                            <NuxtLink :to="`/outil-${slotProps.data.id}`"><Button icon="pi pi-plus" rounded :disabled="slotProps.data.etat === 'En panne'"></Button></NuxtLink>

                        </div>
                    </div>
                </div>
            </template>
        </DataView>
    </div>

</template>

<script setup>
import ProductService from '@/service/ProductService';

const productService = new ProductService();

onMounted(() => {
    // productService.getProducts().then((data) => (products.value = data.slice(0, 12)));
    productService.getTools().then((data) => { 
        outils.value = data;
        fullList.value = data;
     } );
});



const layout = ref('grid');
const outils = ref('');
const fullList = ref('');
const searchKey = ref('');

const selectedAutoValue = ref(null);
const suggestions = ref([]);



const getSearchData = (a) => {
 if  (a) {   productService.getToolsFilter(a).then((data) => (outils.value = data)); };
 if  (!a) {   productService.getTools().then((data) => (outils.value = data));};
 console.log(a)
}

const getAllData = () => {
 productService.getTools().then((data) => (outils.value = data));
 searchKey.value=''
}

const searchOutil = (event) => {
    setTimeout(() => {
        if (!event.query.trim().length) {
            suggestions.value = [...fullList.value];
        } else {
            suggestions.value = fullList.value.filter((outil) => {
                return outil.nom.toLowerCase().startsWith(event.query.toLowerCase());
            });
        }
    }, 250);
};


const getSeverity = (outil) => {
    switch (outil.etat) {
        case 'Neuf':
            return 'success';
        case 'Excellent':
            return 'success';
        case 'Bon':
            return 'success';
        case 'Moyen':
            return 'warning';

        case 'Mauvais':
            return 'danger';
        case 'En Panne':
            return 'danger';

        default:
            return null;
    }
}

</script>
