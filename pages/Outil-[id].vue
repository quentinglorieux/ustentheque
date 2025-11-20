<template>
  <div class="tool-page">
    <Toast />

    <div v-if="isLoading" class="tool-loading">
      <USkeleton class="mb-4" height="180px" animated />
      <USkeleton height="320px" animated />
    </div>

    <UAlert
      v-else-if="loadError"
      color="red"
      variant="soft"
      icon="i-lucide-alert-triangle"
      :title="loadError"
      description="Reessayez dans un instant ou retournez au catalogue."
      class="mb-6"
    >
      <template #actions>
        <UButton label="Réessayer" color="red" variant="subtle" @click="retrieveOneObjet" />
        <UButton label="Catalogue" icon="i-lucide-arrow-left" to="/catalogue" />
      </template>
    </UAlert>

    <div v-else-if="objet" class="tool-content">
      <UCard class="hero-card">
        <div class="hero-content">
          <div class="hero-text">
            <p class="hero-eyebrow">Fiche outil</p>
            <h1>{{ objet.nom }}</h1>
            <p class="hero-description">
              Gérez vos demandes d'emprunt, consultez la disponibilité et contactez le propriétaire.
            </p>
            <div class="hero-tags">
              <UBadge :label="objet.etat ?? 'Etat inconnu'"   />
              <UBadge :label="availabilityBadge.label" />
            </div>
            <div class="hero-stats">
              <UStat label="Disponibilité" :value="availabilityBadge.label" variant="soft" />
              <UStat label="Demandes" :value="upcomingReservations.length" variant="soft" />
            </div>
          </div>

          <div class="hero-actions">
            <UButton icon="i-lucide-arrow-left" label="Catalogue" to="/catalogue" variant="ghost" />
            <UButton
              icon="i-lucide-pencil"
              label="Modifier"
              color="primary"
              :to="`/edit/outil-${objet.id}`"
            />
          </div>
        </div>
      </UCard>

      <div class="tool-grid">
        <UCard class="info-card">
          <div class="media-shell">
            <img
              v-if="heroImageUrl"
              :src="heroImageUrl"
              :alt="objet.nom"
              class="media-img"
            />
            <div v-else class="media-placeholder">Pas d'image</div>
          </div>

          <div class="detail-meta">
            <div v-for="chip in detailChips" :key="chip.label" class="meta-entry">
              <p class="meta-label">{{ chip.label }}</p>
              <p class="meta-value">{{ chip.value }}</p>
            </div>
          </div>

          <div class="owner-block">
            <div class="owner-info">
              <UAvatar :src="ownerAvatar" :alt="ownerName" :text="ownerInitials" size="lg" />
              <div>
                <p class="meta-label">Propriétaire</p>
                <p class="owner-name">{{ ownerName }}</p>
              </div>
            </div>
            <div class="rating-wrapper">
              <span class="meta-label">Etat général</span>
              <div class="rating-stars">
                <UIcon
                  v-for="star in 5"
                  :key="`rating-${star}`"
                  name="i-lucide-star"
                  :class="['rating-icon', { 'rating-icon--empty': star > ratingValue }]"
                />
              </div>
            </div>
          </div>
        </UCard>

        <div class="right-column">
          <UCard class="reservation-card">
            <template #header>
              <div class="card-header">
                <div>
                  <p class="card-eyebrow">Reservation</p>
                  <h2>Choisissez vos dates</h2>
                </div>
                <UBadge :label="selectedRangeLabel" variant="soft" color="neutral" />
              </div>
            </template>

            <div v-if="authenticated" class="reservation-body">
              <Calendar
                v-model="dates"
                inline
                showIcon
                selectOtherMonths
                :manualInput="false"
                selectionMode="range"
                :disabledDates="disabledDates"
                :minDate="minDate"
              >
                <template #date="slotProps">
                  <span
                    :class="['calendar-date', { 'calendar-date--disabled': isDateDisabled(slotProps) }]"
                  >
                    {{ slotProps.date.day }}
                  </span>
                </template>
              </Calendar>

              <p v-if="selectionError" class="form-error">{{ selectionError }}</p>

              <div class="reservation-actions">
                <UButton
                  label="Envoyer une demande"
                  color="primary"
                  icon="i-lucide-send"
                  class="flex-1"
                  :loading="isSubmitting"
                  :disabled="!dates || !Array.isArray(dates) || !dates[0]"
                  @click="createOneResa"
                />
              </div>
              <p class="helper-text">Les jours barrés sont déjà réservés (validés ou en attente).</p>
            </div>

            <div v-else class="login-prompt">
              <p>Connectez-vous pour réserver cet outil.</p>
              <UButton icon="i-lucide-log-in" label="Je me connecte" to="/auth/login" />
            </div>
          </UCard>

          <UCard class="message-card">
            <template #header>
              <div class="card-header">
                <div>
                  <p class="card-eyebrow">Message</p>
                  <h2>Note au propriétaire</h2>
                </div>
              </div>
            </template>

            <div v-if="authenticated" class="message-body">
              <UTextarea
                v-model="reservationMessage"
                :rows="6"
                placeholder="Expliquez votre besoin, vos disponibilités, etc."
              />
              <p class="helper-text">Cette note sera jointe à la demande.</p>
            </div>
            <div v-else class="login-prompt">
              <p>Ajoutez un message personnalisé après connexion.</p>
              <UButton icon="i-lucide-log-in" label="Connexion" to="/auth/login" variant="ghost" />
            </div>
          </UCard>

          <UCard class="reservations-overview-card">
            <template #header>
              <div class="card-header">
                <p class="card-eyebrow">Demandes récentes</p>
                <span>{{ upcomingReservations.length }}</span>
              </div>
            </template>

            <UTable :data="upcomingReservations" :columns="reservationTableColumns" dense>
              <template #borrower-cell="{ row }">
                <div class="detail-person">
                  <UIcon name="i-lucide-user" class="text-sm text-500" />
                  <span>{{ row.original.borrower }}</span>
                </div>
              </template>

              <template #dates-cell="{ row }">
                {{ row.original.start }} → {{ row.original.end }}
              </template>

              <template #status-cell="{ row }">
                <UBadge :label="row.original.status" :color="statusColor(row.original.status)" variant="soft" />
              </template>
            </UTable>
            <div v-if="!upcomingReservations.length" class="empty-state">Aucune demande pour le moment.</div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "@/composables/useAuthStore";
import { useDirectusBase } from "@/composables/useDirectusBase";
import { useDirectusClient } from "@/composables/useDirectusClient";
import { formatDate } from "@/utils/dateUtils";

const route = useRoute();
const toast = useToast();

const store = useAuthStore();
const authenticated = computed(() => store.authenticated);

const directusBase = useDirectusBase();
const directus = useDirectusClient();
const resaD = directus.items("reservation");

const objet = ref(null);
const proprio = ref(null);
const resaList = ref([]);
const filteredResaList = ref([]);
const disabledDates = ref([]);
const dates = ref(null);
const reservationMessage = ref("");
const selectionError = ref("");
const isSubmitting = ref(false);
const isLoading = ref(true);
const loadError = ref("");

const minDate = ref(new Date());

const heroImageUrl = computed(() => {
  if (!objet.value?.photo) {
    return null;
  }
  return `${directusBase}/assets/${objet.value.photo}?fit=contain&width=500&height=400&quality=60`;
});

const ownerName = computed(() => {
  if (!proprio.value) {
    return "Propriétaire";
  }
  const parts = [proprio.value.first_name, proprio.value.last_name].filter(Boolean);
  return parts.length ? parts.join(" ") : "Propriétaire";
});

const ownerInitials = computed(() => {
  if (!proprio.value) {
    return "?";
  }
  const initials = [proprio.value.first_name?.[0], proprio.value.last_name?.[0]]
    .filter(Boolean)
    .join("");
  return initials || "?";
});

const ownerAvatar = computed(() => {
  if (!proprio.value?.avatar) {
    return null;
  }
  return `${directusBase}/assets/${proprio.value.avatar}?fit=cover&width=90&height=90&quality=50`;
});

const availabilityBadge = computed(() => {
  const isBusy = filteredResaList.value.some((resa) => {
    if (!resa.debut || !resa.fin) {
      return false;
    }
    const today = new Date().toISOString().split("T")[0];
    return ["Validé", "En attente"].includes(resa.statut) && resa.debut <= today && today <= resa.fin;
  });

  return isBusy
    ? { label: "Réservé en ce moment", color: "amber" }
    : { label: "Disponible", color: "emerald" };
});

const ratingValue = computed(() => convertEtatToScore(objet.value?.etat));

const detailChips = computed(() => [
  { label: "Marque", value: objet.value?.marque ?? "Non renseigné" },
  { label: "Prix indicatif", value: formatCurrency(objet.value?.prix_indicatif) },
  { label: "Consommables", value: objet.value?.consommable ?? "—" },
  { label: "Conseils", value: objet.value?.conseils ?? "—" },
]);

const upcomingReservations = computed(() =>
  (resaList.value ?? [])
    .map((resa) => ({
      id: resa.id,
      borrower: formatBorrower(resa.user_created),
      start: formatReadableDate(resa.debut),
      end: formatReadableDate(resa.fin),
      status: resa.statut ?? "En attente",
      message: resa.message ?? "",
      startRaw: resa.debut ? new Date(resa.debut).getTime() : Number.MAX_SAFE_INTEGER,
    }))
    .sort((a, b) => a.startRaw - b.startRaw)
);

const reservationTableColumns = [
  { id: "borrower", header: "Demandeur" },
  { id: "dates", header: "Période" },
  { id: "status", header: "Statut" },
];

const selectedRangeLabel = computed(() => {
  if (!Array.isArray(dates.value) || !dates.value[0]) {
    return "Aucune date";
  }
  const start = formatReadableDate(dates.value[0]);
  const end = dates.value[1] ? formatReadableDate(dates.value[1]) : start;
  return `${start} → ${end}`;
});

const retrieveOneObjet = async () => {
  isLoading.value = true;
  loadError.value = "";
  try {
    const publicData = await directus.items("objet").readOne(route.params.id, {
      fields: [
        "id",
        "nom",
        "marque",
        "photo",
        "prix_indicatif",
        "conseils",
        "etat",
        "consommable",
        "proprietaire.first_name",
        "proprietaire.last_name",
        "proprietaire.avatar",
        "reservation.id",
        "reservation.debut",
        "reservation.fin",
        "reservation.statut",
        "reservation.message",
        "reservation.user_created.first_name",
        "reservation.user_created.last_name",
      ],
    });

    objet.value = publicData;
    proprio.value = publicData.proprietaire;
    resaList.value = publicData.reservation ?? [];
    filteredResaList.value = resaList.value.filter((resa) => ["Validé", "En attente"].includes(resa.statut));
    disabledDates.value = generateDisabledDateArray(filteredResaList.value);
  } catch (error) {
    console.error("Failed to load tool", error);
    loadError.value = "Impossible de charger cette fiche.";
  } finally {
    isLoading.value = false;
  }
};

const generateDisabledDateArray = (array = []) =>
  array.reduce((accumulator, resa) => {
    if (!resa.debut || !resa.fin) {
      return accumulator;
    }
    const start = new Date(resa.debut);
    const end = new Date(resa.fin);
    const current = new Date(start);
    const datesArray = [];

    while (current <= end) {
      datesArray.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return accumulator.concat(datesArray);
  }, []);

const isDateDisabled = (slotProps) => {
  const { year, month, day } = slotProps.date;
  const current = new Date(year, month, day);
  return disabledDates.value.some((date) => date.toDateString() === current.toDateString());
};

const verifyAvailability = (selectedRange = [], blocked = []) => {
  selectionError.value = "";
  if (!Array.isArray(selectedRange) || selectedRange.length < 2 || !selectedRange[1]) {
    return true;
  }

  const [startDate, endDate] = selectedRange;
  if (!startDate || !endDate) {
    return true;
  }

  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(0, 0, 0, 0);

  const overlaps = blocked.some((date) => {
    const point = new Date(date).setHours(0, 0, 0, 0);
    return point >= start && point <= end;
  });

  if (overlaps) {
    dates.value = null;
    selectionError.value = "Cette période inclut déjà une réservation.";
    toast.add({
      severity: "warn",
      summary: "Dates indisponibles",
      detail: "Choisissez une plage libre ou fractionnez la demande.",
      life: 4000,
    });
    return false;
  }

  return true;
};

const createOneResa = async () => {
  if (!Array.isArray(dates.value) || !dates.value[0]) {
    selectionError.value = "Sélectionnez une plage de dates.";
    return;
  }

  const [startDate, maybeEnd] = dates.value;
  const endDate = maybeEnd ?? startDate;

  if (!verifyAvailability([startDate, endDate], disabledDates.value)) {
    return;
  }

  isSubmitting.value = true;
  try {
    await resaD.createOne({
      debut: startDate,
      fin: endDate,
      statut: "En attente",
      objet: objet.value.id,
      message: reservationMessage.value?.trim() || null,
    });

    toast.add({
      severity: "success",
      summary: "Demande envoyée",
      detail: "Nous revenons vers vous rapidement.",
      life: 3000,
    });

    dates.value = null;
    reservationMessage.value = "";
    await retrieveOneObjet();
  } catch (error) {
    console.error("Failed to create reservation", error);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Impossible d'enregistrer la demande.",
      life: 4000,
    });
  } finally {
    isSubmitting.value = false;
  }
};

const formatBorrower = (user) => {
  if (!user) {
    return "Utilisateur inconnu";
  }
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length ? parts.join(" ") : "Utilisateur";
};

const formatReadableDate = (value) => {
  if (!value) {
    return "—";
  }
  return formatDate(value);
};

const formatCurrency = (val) => {
  if (typeof val !== "number") {
    return "—";
  }
  return val.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
};

const convertEtatToScore = (etat) => {
  switch (etat) {
    case "Neuf":
      return 5;
    case "Excellent":
      return 4;
    case "Bon":
      return 3;
    case "Moyen":
      return 2;
    case "Mauvais":
      return 1;
    default:
      return 0;
  }
};

const statusColor = (status) => {
  switch (status) {
    case "Validé":
      return "emerald";
    case "En attente":
      return "amber";
    case "Refusé":
      return "rose";
    case "Rendu":
      return "cyan";
    default:
      return "neutral";
  }
};

watch(dates, (range) => {
  if (!range || range.length < 2) {
    selectionError.value = "";
    return;
  }
  verifyAvailability(range, disabledDates.value);
}, { deep: true });

watch(
  () => route.params.id,
  () => {
    retrieveOneObjet();
  }
);

onMounted(async () => {
  if (!store.authenticated) {
    await store.restoreSession();
  }
  retrieveOneObjet();
});
</script>

<style scoped>
.tool-page {
  padding: 1.5rem clamp(1rem, 4vw, 2rem);
}

.tool-loading {
  max-width: 960px;
  margin: 0 auto;
}

.hero-card {
  margin-bottom: 1.5rem;
  border-radius: 1.25rem;
}

.hero-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
}

.hero-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: #818cf8;
  margin-bottom: 0.5rem;
}

.hero-description {
  margin: 0.25rem 0 0.75rem;
  color: #6b7280;
}

.hero-tags {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.hero-stats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
}

.tool-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 1200px) {
  .tool-grid {
    grid-template-columns: 1.2fr 1fr;
  }
}

.info-card,
.reservation-card,
.message-card,
.reservations-overview-card {
  border-radius: 1.25rem;
}

.media-shell {
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #174c81;
  margin-bottom: 1rem;
}

.media-img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.media-placeholder {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5f5;
  font-weight: 600;
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.meta-entry {
  padding: 0.75rem;
  border: 1px solid #eef2ff;
  border-radius: 0.85rem;
  background: #f8faff;
}

.meta-label {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
}

.meta-value {
  margin: 0.25rem 0 0;
  font-weight: 600;
}

.owner-block {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.owner-name {
  margin: 0.2rem 0 0;
  font-weight: 600;
}

.rating-wrapper {
  text-align: right;
}

.rating-stars {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

.rating-icon {
  color: #facc15;
  font-size: 1.1rem;
}

.rating-icon--empty {
  color: #e2e8f0;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.card-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.7rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.reservation-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calendar-date {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.calendar-date--disabled {
  text-decoration: line-through;
  color: #f87171;
}

.form-error {
  color: #dc2626;
  font-size: 0.9rem;
}

.reservation-actions {
  display: flex;
  gap: 0.75rem;
}

.helper-text {
  font-size: 0.85rem;
  color: #94a3b8;
}

.login-prompt {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem 0;
}

.message-body {
  margin-bottom: 1rem;
}

.reservations-overview-card {
  border-radius: 1.25rem;
}

.detail-person {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-state {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
  border: 1px dashed #cbd5f5;
  border-radius: 0.85rem;
}

.reservations-overview-card .empty-state {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .hero-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .owner-block {
    flex-direction: column;
    text-align: left;
  }

  .rating-wrapper {
    text-align: left;
  }

  .tool-grid {
    grid-template-columns: 1fr;
  }

  .right-column {
    order: 2;
  }
}
</style>
