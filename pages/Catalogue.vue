<template>
    <div class="card">
        <DataView :value="outils" :layout="layout">
            <template #header>
                <div class="flex flex-column md:flex-row justify-content-between gap-2">
                    <div class="relative w-full md:w-25rem">
                        <i class="pi pi-search absolute left-3 text-500 z-1"
                            style="top: 50%; transform: translateY(-50%)"></i>
                        <InputText v-model="searchKey" @keyup="getSearchData(searchKey)"
                            placeholder="Rechercher un outil..."
                            class="w-full pl-7 pr-7 py-2 border-round-3xl shadow-1 focus:shadow-2 transition-all transition-duration-200" />
                        <i v-if="searchKey"
                            class="pi pi-times absolute right-3 text-500 hover:text-700 cursor-pointer z-1"
                            style="top: 50%; transform: translateY(-50%)" @click="clearSearch"></i>
                    </div>
                    <div class="flex justify-end">
                        <SelectButton v-model="layout" :options="options" :allowEmpty="false">
                            <template #option="{ option }">
                                <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
                            </template>
                        </SelectButton>
                    </div>
                </div>
            </template>

            <template #list="slotProps">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div v-for="(item, index) in slotProps.items" :key="index" class="h-full">
                        <div
                            class="flex flex-row items-start p-3 gap-4 border border-surface-200 dark:border-surface-700 rounded h-full bg-surface-0 dark:bg-surface-900 hover:bg-zinc-100 hover:cursor-pointer hover:border-zinc-300">
                            <div class="w-32 shrink-0 relative">
                                <NuxtLink :to="`/outil-${item.id}`">
                                    <img v-if="item.photo" class="block rounded w-full object-cover aspect-square"
                                        :src="`${directusBase}/assets/${item.photo?.id || item.photo}?fit=cover&width=200&height=200&quality=40`"
                                        :alt="item.nom" />
                                    <div v-else
                                        class="block rounded w-full aspect-square bg-gray-200 flex align-items-center justify-content-center text-xs">
                                        Pas d'image</div>

                                    <div class="absolute bg-black/70 rounded-border" style="left: 4px; top: 4px">
                                        <Tag :value="item.etat" :severity="getSeverity(item)" class="text-xs p-1"></Tag>
                                    </div>
                                </NuxtLink>
                            </div>
                            <div class="flex flex-col justify-between flex-1 h-full gap-2">
                                <NuxtLink :to="`/outil-${item.id}`">
                                    <div>
                                        <span class="font-bold text-surface-500 dark:text-surface-400 text-sm">{{
                                            item.brand?.nom || 'Sans marque' }}</span>
                                        <div class="text-base font-medium mt-1 line-clamp-2 w-24">{{ item.nom }}</div>
                                    </div>
                                    <div class="flex flex-col gap-2 mt-auto">
                                        <div class="flex justify-content-between items-center">
                                            <span class="text-lg font-semibold">{{ item.prix_indicatif }} €</span>
                                            <div class="flex gap-2">
                                                <Button icon="pi pi-eye" label="Voir" size="small"
                                                    class="p-button-rounded p-button-text"></Button>
                                                <Button v-if="isAuthenticated" icon="pi pi-calendar-plus"
                                                    label="Réserver" size="small"
                                                    class="p-button-rounded p-button-text text-teal-500"></Button>
                                            </div>
                                        </div>
                                    </div>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #grid="slotProps">
                <div class="grid grid-cols-12 gap-2">
                    <div v-for="(item, index) in slotProps.items" :key="index"
                        class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2 p-1 mx-auto">
                        <div
                            class="p-2 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col">
                            <div class="bg-surface-50 flex justify-center rounded p-2 mx-auto">
                                <div class="relative mx-auto">
                                    <NuxtLink :to="`/outil-${item.id}`">
                                        <img v-if="item.photo" class="rounded w-full"
                                            :src="`${directusBase}/assets/${item.photo?.id || item.photo}?fit=cover&width=300&height=300&quality=40`"
                                            :alt="item.nom" style="max-width: 200px" />
                                        <div v-else
                                            class="rounded w-full h-8rem bg-gray-200 flex align-items-center justify-content-center text-xs"
                                            style="max-width: 300px">Pas d'image</div>
                                    </NuxtLink>
                                    <div class="absolute bg-black/70 rounded-border" style="left: 4px; top: 4px">
                                        <Tag :value="item.etat" :severity="getSeverity(item)" class="text-xs p-1"></Tag>
                                    </div>
                                </div>
                            </div>
                            <div class="pt-2">
                                <div class="flex flex-row justify-between items-start gap-1">
                                    <div>
                                        <span class="font-bold text-surface-500 dark:text-surface-400 text-sm">{{
                                            item.brand?.nom || 'Sans marque' }}</span>
                                        <div class="text-base font-medium mt-1">{{ item.nom }}</div>
                                    </div>
                                </div>
                                <div class="flex justify-content-between gap-2 mt-2">
                                    <span class="text-lg font-semibold">{{ item.prix_indicatif }} €</span>
                                    <div class="flex gap-2 ">
                                        <NuxtLink :to="`/outil-${item.id}`" class="flex-auto">
                                            <Button icon="pi pi-eye" label="Voir" size="medium"
                                                :disabled="item.etat === 'En panne'"
                                                class=" px-2 py-1 whitespace-nowrap bg-indigo-500 text-white"></Button>
                                        </NuxtLink>
                                        <NuxtLink v-if="isAuthenticated" :to="`/outil-${item.id}`" class="flex-auto">
                                            <Button icon="pi pi-calendar-plus" label="Réserver" size="medium"
                                                :disabled="item.etat === 'En panne'"
                                                class=" px-2 py-1 whitespace-nowrap bg-teal-500 text-white"></Button>
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
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
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { readItems } from '@directus/sdk';
import { useDirectusBase } from '@/composables/useDirectusBase';

const directusBase = useDirectusBase();
const directus = useDirectus();
const { isAuthenticated } = useUser();

const layout = ref(typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'grid');
const options = ref(['list', 'grid']);
const outils = ref([]);
const fullList = ref([]);
const searchKey = ref('');

const fetchTools = async (filter = {}) => {
    try {
        const items = await directus.request(readItems('objet', {
            filter: filter,
            limit: -1,
            fields: ['*.*']
        }));

        outils.value = Array.isArray(items) ? items : [];

        if (Object.keys(filter).length === 0) {
            fullList.value = outils.value;
        }
    } catch (error) {
        console.error('Error loading tools:', error);
    }
};

onMounted(() => {
    fetchTools();
});

const getSearchData = (query) => {
    if (query) {
        fetchTools({
            nom: {
                _contains: query
            }
        });
    } else {
        fetchTools();
    }
}

const clearSearch = () => {
    searchKey.value = '';
    fetchTools();
}

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
