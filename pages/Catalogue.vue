<template>
    <div class="card">
        <DataView v-if="Array.isArray(outils) && outils.length > 0" :value="outils" :layout="layout">
            <template #header>
                <div class="flex justify-content-between"> 
                    <div class="text-3xl">Catalogue</div>
                    <div class="flex justify-content-end">
                        <DataViewLayoutOptions v-model="layout" />
                    </div>
                </div>
                <div class="mb-2 lg:mb-0 mr-2">
                    Recherche: <span class="p-input-icon-right">
                        <InputText 
                            @keyup="getSearchData(searchKey)"
                            @keyup.delete="getSearchData(searchKey)" 
                            v-model="searchKey" 
                            type="text" 
                            placeholder="Cherchez un objet" 
                        />
                        <i class="pi pi-search" />
                    </span>
                </div>
            </template>

            <template #list="slotProps">
                <div v-if="slotProps.data" class="col-12">
                    <div class="flex flex-column xl:flex-row xl:align-items-start p-3 gap-4">
                        <NuxtLink :to="`/outil-${slotProps.data.id}`">
                            <img 
                                v-if="slotProps.data.photo" 
                                class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem object-contain shadow-2 block xl:block mx-auto border-round" 
                                :src="`${directusBase}/assets/${slotProps.data.photo}?fit=cover&width=300&height=300&quality=40`" 
                                :alt="slotProps.data.nom || 'Image'" 
                            />
                            <div v-else class="w-40 h-40 sm:w-16rem sm:h-16rem xl:w-10rem xl:h-10rem flex align-items-center justify-content-center bg-gray-200 border-round">
                                Pas d'image
                            </div>
                        </NuxtLink>
                        <div class="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                            <div class="flex flex-column align-items-center sm:align-items-start gap-3">
                                <NuxtLink :to="`/outil-${slotProps.data.id}`"> 
                                    <div class="text-2xl font-bold text-900">{{ slotProps.data?.nom || 'Sans nom' }}</div>
                                </NuxtLink>
                                <div class="flex flex-column align-items-start gap-3">
                                    <span class="flex align-items-center gap-2">
                                        <i class="pi pi-tag"></i>
                                        <span>Marque:</span>
                                        <span class="font-semibold">{{ slotProps.data.brand?.nom || 'N/A' }}</span>
                                    </span>
                                    <span class="flex align-items-center gap-2">
                                        <i class="pi pi-info-circle"></i>
                                        <span>Etat:</span> 
                                        <Tag :value="slotProps.data.etat || 'N/A'" :severity="getSeverity(slotProps.data)"></Tag>
                                    </span>
                                </div>
                            </div>
                            <div class="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                                <span class="text-l font-semibold">Prix indicatif: {{ slotProps.data?.prix_indicatif || 0 }} €</span>
                                <NuxtLink :to="`/outil-${slotProps.data.id}`">
                                    <Button icon="pi pi-plus" rounded :disabled="slotProps.data.etat === 'En panne'"></Button>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #grid="slotProps">
                <div v-if="slotProps.data" class="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
                    <div class="p-4 border-1 surface-border surface-card border-round">
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-tag"></i>
                                <span>Marque:</span>
                                <span class="font-semibold">{{ slotProps.data.brand?.nom || 'N/A' }}</span>
                            </div>
                            <Tag :value="slotProps.data.etat || 'N/A'" :severity="getSeverity(slotProps.data)"></Tag>
                        </div>
                        <div class="flex flex-column align-items-center gap-3 py-5">
                            <NuxtLink :to="`/outil-${slotProps.data.id}`">
                                <img 
                                    v-if="slotProps.data.photo" 
                                    class="w-80 h-60 object-contain border-round" 
                                    :src="`${directusBase}/assets/${slotProps.data.photo}?height=300&quality=40`" 
                                    :alt="slotProps.data.nom || 'Image'" 
                                />
                                <div v-else class="w-80 h-60 flex align-items-center justify-content-center bg-gray-200 border-round">
                                    Pas d'image
                                </div>
                            </NuxtLink>
                            <div class="text-2xl font-bold">{{ slotProps.data?.nom || 'Sans nom' }}</div>
                        </div>
                        <div class="flex align-items-center justify-content-between">
                            <span class="text-m font-semibold">Prix indicatif: {{ slotProps.data?.prix_indicatif || 0 }} €</span>
                            <NuxtLink :to="`/outil-${slotProps.data.id}`">
                                <Button icon="pi pi-plus" rounded :disabled="slotProps.data.etat === 'En panne'"></Button>
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </template>

            <template #empty>
                <div class="p-4 text-center text-500">
                    Aucun outil trouvé
                </div>
            </template>
        </DataView>

        <div v-else-if="outils === ''" class="p-4 text-center">
            <i class="pi pi-spin pi-spinner text-4xl"></i>
            <p class="mt-3">Chargement du catalogue...</p>
        </div>

        <div v-else class="p-4 text-center text-500">
            Aucun outil disponible
        </div>
    </div>

    <div class="flex gap-10 justify-content-between">

  <!-- 
<div class="hidden sm:block">
ou commencez à taper pour chercher : <AutoComplete 
placeholder="Cherchez un objet" 
id="dd" 
:dropdown="true" 
:multiple="false" 
v-model="selectedAutoValue" 
:suggestions="suggestions" 
@complete="searchOutil($event)" 
@item-select="getSearchData(selectedAutoValue.nom)"
@clear="getAllData()"
field="nom" />  
</div>-->
</div>

</template>

<script setup>
import ProductService from '@/service/ProductService';
import { useDirectusBase } from '@/composables/useDirectusBase';
const productService = new ProductService();
const directusBase = useDirectusBase();

onMounted(() => {
    productService.getTools().then((data) => {
        const toolsData = Array.isArray(data) ? data : [];
        outils.value = toolsData;
        fullList.value = toolsData;
    }).catch((error) => {
        console.error('Error loading tools:', error);
        outils.value = [];
        fullList.value = [];
    });
});



const layout = ref('grid');
const outils = ref([]);
const fullList = ref([]);
const searchKey = ref('');

const selectedAutoValue = ref(null);
const suggestions = ref([]);



const getSearchData = (a) => {
    if (a) {
        productService.getToolsFilter(a).then((data) => {
            outils.value = Array.isArray(data) ? data : [];
        }).catch((error) => {
            console.error('Error fetching filtered tools:', error);
            outils.value = [];
        });
    } else {
        productService.getTools().then((data) => {
            outils.value = Array.isArray(data) ? data : [];
        }).catch((error) => {
            console.error('Error fetching tools:', error);
            outils.value = [];
        });
    }
}

const getAllData = () => {
    productService.getTools().then((data) => {
        outils.value = Array.isArray(data) ? data : [];
    }).catch((error) => {
        console.error('Error fetching tools:', error);
        outils.value = [];
    });
    searchKey.value = '';
}

const searchOutil = (event) => {
    setTimeout(() => {
        if (!event.query.trim().length) {
            suggestions.value = Array.isArray(fullList.value) ? [...fullList.value] : [];
        } else {
            suggestions.value = Array.isArray(fullList.value) 
                ? fullList.value.filter((outil) => {
                    return outil?.nom?.toLowerCase().startsWith(event.query.toLowerCase());
                })
                : [];
        }
    }, 250);
};


const getSeverity = (outil) => {
    if (!outil || !outil.etat) return null;
    
    switch (outil.etat) {
        case 'Neuf':
        case 'Excellent':
        case 'Bon':
            return 'success';
        case 'Moyen':
            return 'warning';
        case 'Mauvais':
        case 'En panne':
            return 'danger';
        default:
            return null;
    }
}

</script>
