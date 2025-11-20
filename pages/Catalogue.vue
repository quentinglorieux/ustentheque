<template>
    <div class="catalogue-shell">
        <UCard class="catalogue-card">
            <template #header>
                <div class="catalogue-head">
                    <div>
                        <p class="catalogue-kicker">Inventaire vivant</p>
                        <h1 class="catalogue-title">Mes outils</h1>
                        <p class="catalogue-subtitle">Gardez un coup d'avance sur vos prets et reservations.</p>
                    </div>
                    <UButton
                        :to="createToolHref"
                        icon="i-lucide-plus"
                        label="Nouvel outil"
                        color="primary"
                        size="sm"
                    />
                </div>
            </template>

            <div class="catalogue-toolbar">
                <div class="toolbar-field">
                    <label for="catalogue-search" class="toolbar-label">Recherche</label>
                    <UInput
                        id="catalogue-search"
                        v-model="searchKey"
                        icon="i-lucide-search"
                        placeholder="Cherchez un objet"
                        :disabled="isFetching"
                    />
                </div>
                <UButton
                    icon="i-lucide-rotate-ccw"
                    label="Reinitialiser"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    :disabled="isFetching || !searchKey"
                    @click="resetSearch"
                />
            </div>
            <p v-if="filterError" class="text-warning">{{ filterError }}</p>

            <div class="stats-grid">
                <div v-for="stat in statsBlocks" :key="stat.label" class="stat-chip">
                    <p class="stat-label">{{ stat.label }}</p>
                    <p class="stat-value">{{ stat.value }}</p>
                    <p class="stat-helper">{{ stat.helper }}</p>
                </div>
            </div>

            <div class="table-shell">
                <div class="table-head">
                    <span class="col col-toggle" />
                    <span class="col col-object">Objet</span>
                    <span class="col col-brand">Marque</span>
                    <span class="col col-price">Prix</span>
                    <span class="col col-rating">Etat</span>
                    <span class="col col-availability">Dispo</span>
                    <span class="col col-actions">Edit</span>
                </div>

                <div v-if="isFetching" class="table-placeholder">
                    <div v-for="index in 3" :key="`loader-${index}`" class="placeholder-row" />
                </div>

                <template v-else>
                    <div v-if="decoratedTools.length" class="table-body">
                        <div v-for="outil in decoratedTools" :key="outil.id" class="row-wrapper">
                            <div class="table-row">
                                <button
                                    class="row-toggle"
                                    type="button"
                                    aria-label="Afficher les reservations"
                                    @click="toggleRow(outil.id)"
                                >
                                    <UIcon
                                        :name="isRowExpanded(outil.id) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                                        class="text-base"
                                    />
                                </button>

                                <div class="col col-object">
                                    <NuxtLink :to="detailHref(outil.id)" class="object-link">
                                        <div class="object-photo">
                                            <img
                                                v-if="outil.photo"
                                                :src="`${directusBase}/assets/${outil.photo}?fit=cover&width=160&height=160&quality=60`"
                                                :alt="outil.nom"
                                            />
                                            <div v-else class="object-photo--placeholder">IMG</div>
                                        </div>
                                        <div class="object-meta">
                                            <span class="object-name">{{ outil.nom }}</span>
                                        </div>
                                    </NuxtLink>
                                </div>

                                <div class="col col-brand">{{ outil.brandLabel }}</div>
                                <div class="col col-price">{{ formatCurrency(outil.prix_indicatif) }}</div>

                                <div class="col col-rating">
                                    <div class="rating-stars">
                                        <UIcon
                                            v-for="index in 5"
                                            :key="`star-${outil.id}-${index}`"
                                            name="i-lucide-star"
                                            :class="['rating-icon', { 'rating-icon--empty': index > outil.ratingValue }]"
                                        />
                                    </div>
                                </div>

                                <div class="col col-availability">
                                    <UBadge :label="outil.availability.label" :color="outil.availability.color" variant="subtle" />
                                </div>

                                <div class="col col-actions">
                                    <div class="action-buttons">
                                        <UButton
                                            icon="i-lucide-pencil"
                                            variant="ghost"
                                            color="neutral"
                                            size="xs"
                                            :to="editToolHref(outil.id)"
                                        />
                                        <UButton
                                            icon="i-lucide-external-link"
                                            variant="ghost"
                                            color="primary"
                                            size="xs"
                                            :to="detailHref(outil.id)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Transition name="catalogue-expand">
                                <div v-if="isRowExpanded(outil.id)" class="row-detail">
                                    <div class="detail-head">
                                        <p class="detail-title">Reservations et prets</p>
                                        <span class="detail-count">{{ outil.reservations.length }} enregistres</span>
                                    </div>

                                    <div v-if="outil.reservations.length" class="detail-table">
                                        <UTable :data="reservationsFor(outil)" :columns="reservationColumns" dense>
                                            <template #borrower-cell="{ row }">
                                                <div class="detail-person">
                                                    <UIcon name="i-lucide-user" class="text-sm text-500" />
                                                    <span>{{ row.original.borrower }}</span>
                                                </div>
                                            </template>

                                            <template #start-cell="{ row }">
                                                {{ row.original.start }}
                                            </template>

                                            <template #end-cell="{ row }">
                                                {{ row.original.end }}
                                            </template>

                                            <template #status-cell="{ row }">
                                                <UBadge :label="row.original.status" :color="statusColor(row.original.rawStatus)" variant="soft" />
                                            </template>

                                            <template #actions-cell="{ row }">
                                                <UButton
                                                    icon="i-lucide-pencil"
                                                    size="xs"
                                                    variant="ghost"
                                                    color="neutral"
                                                    :to="editReservationHref(row.original.id)"
                                                />
                                            </template>

                                            <template #empty>
                                                <div class="detail-empty">Aucune reservation en cours.</div>
                                            </template>
                                        </UTable>
                                    </div>

                                    <div v-else class="detail-empty">
                                        Aucune reservation pour cet outil.
                                    </div>
                                </div>
                            </Transition>
                        </div>
                    </div>

                    <div v-else class="table-empty">
                        <span v-if="hasActiveSearch">Aucun outil ne correspond a votre recherche.</span>
                        <span v-else>Le catalogue est vide pour le moment.</span>
                    </div>
                </template>
            </div>

            <div v-if="loadError" class="catalogue-error">
                <span>{{ loadError }}</span>
                <UButton
                    label="Reessayer"
                    icon="i-lucide-rotate-ccw"
                    size="sm"
                    color="error"
                    variant="outline"
                    @click="refreshList"
                    :disabled="isFetching"
                />
            </div>
        </UCard>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ProductService from '@/service/ProductService';
import { useDirectusBase } from '@/composables/useDirectusBase';
import { useDirectusClient } from '@/composables/useDirectusClient';
import { formatDate } from '@/utils/dateUtils';

const directusBase = useDirectusBase();
const directusClient = useDirectusClient();
const productService = new ProductService(directusClient);

const createToolHref = '/edit/outil-add';
const detailHref = (id) => `/outil-${id}`;
const editToolHref = (id) => `/edit/outil-${id}`;
const editReservationHref = (id) => `/edit/pret-${id}`;

const outils = ref([]);
const fullList = ref([]);
const searchKey = ref('');
const isLoadingList = ref(false);
const isSearching = ref(false);
const loadError = ref('');
const filterError = ref('');
const expandedRows = ref(new Set());

const reservationColumns = [
    { id: 'borrower', header: 'Nom' },
    { id: 'start', header: 'Debut' },
    { id: 'end', header: 'Fin' },
    { id: 'status', header: 'Statut' },
    { id: 'actions', header: '' },
];

const isFetching = computed(() => isLoadingList.value || isSearching.value);

const decoratedTools = computed(() =>
    outils.value.map((outil) => {
        const reservations = Array.isArray(outil.reservation) ? outil.reservation : [];
        return {
            ...outil,
            reservations,
            brandLabel: outil.brand?.nom ?? 'Non renseigne',
            availability: resolveAvailability(reservations),
            ratingValue: convertEtatToScore(outil.etat),
        };
    }),
);

const statsBlocks = computed(() => {
    const total = fullList.value.length;
    const available = fullList.value.filter((outil) => resolveAvailability(outil.reservation ?? []).status === 'available').length;
    const pending = fullList.value.reduce((count, outil) => count + ((outil.reservation ?? []).length || 0), 0);

    return [
        { label: 'Outils', value: total, helper: 'En base' },
        { label: 'Disponibles', value: available, helper: 'Pret immediat' },
        { label: 'Reservations', value: pending, helper: 'Demandes en cours' },
    ];
});

const refreshList = async () => {
    isLoadingList.value = true;
    loadError.value = '';
    filterError.value = '';

    try {
        const data = await productService.getTools();
        outils.value = data;
        fullList.value = data;
    } catch (error) {
        console.error('Failed to load catalogue', error);
        loadError.value = 'Impossible de charger le catalogue pour le moment.';
    } finally {
        isLoadingList.value = false;
    }
};

let searchToken = 0;

const runSearch = async (term) => {
    const normalized = term?.trim() ?? '';
    filterError.value = '';

    if (!normalized) {
        outils.value = [...fullList.value];
        isSearching.value = false;
        return;
    }

    isSearching.value = true;
    const currentToken = ++searchToken;

    try {
        const data = await productService.getToolsFilter(normalized);
        if (currentToken === searchToken) {
            outils.value = data;
        }
    } catch (error) {
        console.error('Failed to filter catalogue', error);
        filterError.value = 'La recherche a echoue. Reessayez dans un instant.';
    } finally {
        if (currentToken === searchToken) {
            isSearching.value = false;
        }
    }
};

const resetSearch = () => {
    searchKey.value = '';
    filterError.value = '';
    outils.value = [...fullList.value];
    isSearching.value = false;
};

const hasActiveSearch = computed(() => Boolean(searchKey.value?.trim().length));

let searchTimer;

watch(searchKey, (term) => {
    if (searchTimer) {
        clearTimeout(searchTimer);
    }

    searchTimer = setTimeout(() => {
        runSearch(term);
    }, 300);
});

const toggleRow = (id) => {
    const next = new Set(expandedRows.value);
    if (next.has(id)) {
        next.delete(id);
    } else {
        next.add(id);
    }
    expandedRows.value = next;
};

const isRowExpanded = (id) => expandedRows.value.has(id);

const reservationsFor = (outil) =>
    outil.reservations.map((reservation) => ({
        id: reservation.id,
        borrower: formatBorrower(reservation.user_created),
        start: formatReadableDate(reservation.debut),
        end: formatReadableDate(reservation.fin),
        status: reservation.statut ?? 'En attente',
        rawStatus: reservation.statut ?? 'En attente',
    }));

const formatBorrower = (user) => {
    if (!user) {
        return 'Utilisateur inconnu';
    }
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : 'Utilisateur inconnu';
};

const formatReadableDate = (value) => {
    if (!value) {
        return '—';
    }
    return formatDate(value);
};

const statusColor = (status) => {
    switch (status) {
        case 'Validé':
            return 'emerald';
        case 'En attente':
            return 'amber';
        case 'Refusé':
            return 'rose';
        case 'Rendu':
            return 'cyan';
        default:
            return 'neutral';
    }
};

const convertEtatToScore = (etat) => {
    switch (etat) {
        case 'Neuf':
            return 5;
        case 'Excellent':
            return 4;
        case 'Bon':
            return 3;
        case 'Moyen':
            return 2;
        case 'Mauvais':
            return 1;
        default:
            return 0;
    }
};

const resolveAvailability = (reservations = []) => {
    if (!reservations.length) {
        return { label: 'Disponible', color: 'emerald', status: 'available' };
    }

    const today = new Date().toISOString().split('T')[0];
    const busy = reservations.some((reservation) => {
        if (!reservation.debut || !reservation.fin) {
            return false;
        }
        const isPending = ['Validé', 'En attente'].includes(reservation.statut);
        return isPending && reservation.debut <= today && today <= reservation.fin;
    });

    if (busy) {
        return { label: 'Reserve', color: 'amber', status: 'reserved' };
    }

    return { label: 'Disponible', color: 'emerald', status: 'available' };
};

const formatCurrency = (value) => {
    if (typeof value !== 'number') {
        return '—';
    }
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
};

onMounted(() => {
    refreshList();
});

onBeforeUnmount(() => {
    if (searchTimer) {
        clearTimeout(searchTimer);
    }
});

</script>

<style scoped>
.catalogue-shell {
    padding: 1rem;
}

.catalogue-card {
    border-radius: 1.25rem;
    box-shadow: 0 25px 60px rgba(15, 23, 42, 0.1);
}

.catalogue-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.catalogue-kicker {
    margin: 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #6366f1;
}

.catalogue-title {
    margin: 0.2rem 0 0;
    font-size: 2rem;
    font-weight: 700;
}

.catalogue-subtitle {
    margin: 0.25rem 0 0;
    color: #6b7280;
}

.catalogue-toolbar {
    margin-top: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
}

.toolbar-field {
    flex: 1 1 260px;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.toolbar-label {
    font-size: 0.8rem;
    color: #6b7280;
}

.stats-grid {
    margin-top: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
}

.stat-chip {
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(99, 102, 241, 0.2);
    background: linear-gradient(145deg, rgba(99, 102, 241, 0.08), transparent);
}

.stat-label {
    margin: 0;
    font-size: 0.85rem;
    color: #6b7280;
}

.stat-value {
    margin: 0.2rem 0;
    font-size: 1.75rem;
    font-weight: 700;
}

.stat-helper {
    margin: 0;
    font-size: 0.8rem;
    color: #9ca3af;
}

.table-shell {
    margin-top: 2rem;
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    overflow: hidden;
}

.table-head,
.table-row {
    display: grid;
    grid-template-columns: 50px 2fr 1.1fr 0.8fr 1fr 1fr 120px;
    gap: 0.5rem;
    align-items: center;
}

.table-head {
    padding: 0.85rem 1.25rem;
    background: #f9fafb;
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
}

.table-body {
    display: flex;
    flex-direction: column;
}

.row-wrapper:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
}

.table-row {
    padding: 1rem 1.25rem;
    background: #fff;
}

.row-toggle {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    color: #6366f1;
}

.object-link {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    text-decoration: none;
    color: inherit;
}

.object-photo {
    width: 56px;
    height: 56px;
    border-radius: 0.9rem;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #cbd5f5;
}

.object-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.object-meta {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.object-name {
    font-weight: 600;
}

.object-id {
    font-size: 0.75rem;
    color: #9ca3af;
}

.col-brand,
.col-price,
.col-rating,
.col-availability,
.col-actions {
    font-size: 0.9rem;
}

.rating-stars {
    display: inline-flex;
    gap: 0.15rem;
}

.rating-icon {
    color: #facc15;
    font-size: 1rem;
}

.rating-icon--empty {
    color: #e2e8f0;
}

.action-buttons {
    display: flex;
    gap: 0.4rem;
    justify-content: flex-end;
}

.row-detail {
    padding: 1rem 1.25rem 1.5rem 3.4rem;
    background: #fafafa;
}

.detail-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
}

.detail-title {
    margin: 0;
    font-weight: 600;
}

.detail-count {
    font-size: 0.85rem;
    color: #9ca3af;
}

.detail-table {
    margin-top: 0.75rem;
}

.detail-person {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.detail-empty {
    margin-top: 0.75rem;
    padding: 0.9rem 1rem;
    border-radius: 0.75rem;
    background: #fff;
    border: 1px dashed #cbd5f5;
    color: #94a3b8;
    font-size: 0.9rem;
}

.table-placeholder {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.placeholder-row {
    height: 50px;
    border-radius: 0.75rem;
    background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
}

.table-empty {
    padding: 2rem;
    text-align: center;
    color: #94a3b8;
}

.catalogue-error {
    margin-top: 1.5rem;
    padding: 1rem 1.25rem;
    border: 1px solid rgba(248, 113, 113, 0.4);
    border-radius: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #b91c1c;
    background: #fef2f2;
    gap: 1rem;
}

.text-warning {
    margin-top: 0.5rem;
    color: #ea580c;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

@media (max-width: 1024px) {
    .table-head,
    .table-row {
        grid-template-columns: 40px 2.5fr 1fr 0.9fr 0.9fr 1fr 90px;
    }
}

@media (max-width: 768px) {
    .table-head {
        display: none;
    }

    .table-row {
        grid-template-columns: 40px 1fr;
        grid-auto-rows: auto;
        gap: 0.75rem;
    }

    .col-brand,
    .col-price,
    .col-rating,
    .col-availability,
    .col-actions {
        display: flex;
        justify-content: space-between;
        padding-left: 2.5rem;
        font-size: 0.85rem;
    }

    .col-brand::before {
        content: 'Marque';
        color: #94a3b8;
    }

    .col-price::before {
        content: 'Prix';
        color: #94a3b8;
    }

    .col-rating::before {
        content: 'Etat';
        color: #94a3b8;
    }

    .col-availability::before {
        content: 'Dispo';
        color: #94a3b8;
    }

    .col-actions::before {
        content: 'Actions';
        color: #94a3b8;
    }

    .row-detail {
        padding-left: 2.5rem;
    }
}
</style>
