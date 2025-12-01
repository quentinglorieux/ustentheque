<script setup>
import { createUser } from "@directus/sdk";
import { useToast } from "primevue/usetoast";
import { useDirectusBase } from "@/composables/useDirectusBase";


const email = ref('');
const password = ref('');
const first_name = ref('');
const last_name = ref('');
const telephone = ref('');
const ville = ref('');
const succes = ref(false);
const charte = ref()


const directusBase = useDirectusBase();
const directus = useDirectus();

const toast = useToast();
const router = useRouter();

onMounted(() => {
});


async function registerDirectus() {
  // Basic validation for empty fields
  if (!telephone.value || !ville.value) {
    toast.add({
      severity: "error",
      summary: "Erreur.",
      detail: "Veuillez renseigner votre téléphone et votre adresse.",
      life: 3000,
    });
    return;
  }

  // Phone format validation (French format: 10 digits starting with 0)
  const phoneRegex = /^0[1-9]([-. ]?[0-9]{2}){4}$/;
  if (!phoneRegex.test(telephone.value)) {
    toast.add({
      severity: "error",
      summary: "Format invalide",
      detail: "Veuillez entrer un numéro de téléphone valide (ex: 06 12 34 56 78).",
      life: 3000,
    });
    return;
  }

  if (charte.value == "valide") {
    try {
      // 1. Create User
      // 1. Create User via Server Endpoint
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          first_name: first_name.value,
          last_name: last_name.value,
          email: email.value,
          password: password.value,
          telephone: telephone.value,
          location: ville.value,
        }
      });

      // 2. Send Verification Email
      const { data, error } = await useFetch('/api/auth/send-verification', {
        method: 'POST',
        body: { email: email.value }
      });

      if (error.value) throw error.value;

      // 3. Redirect to Verify Page with hash
      router.push({
        path: '/auth/verify-email',
        query: {
          email: email.value,
          hash: data.value.hash
        }
      });

    } catch (e) {
      //console.log('Erreur', e);
      toast.add({
        severity: "error",
        summary: "Erreur.",
        detail: "Erreur lors de l'inscription. Vérifiez que l'email n'est pas déjà utilisé.",
        life: 3000,
      });
    }
  }
  else {
    toast.add({
      severity: "error",
      summary: "Erreur.",
      detail: "Veuillez accepter la charte",
      life: 3000,
    })
  }
}
</script>
<template>
  <Toast />
  <div v-if="succes" class="text-center p-4">
    Vous êtes bien inscrit. Merci de vous connecter.
    <NuxtLink to="/auth/login">
      <Button label="Connexion" icon="pi pi-sign-in"
        class="font-bold w-full sm:w-auto px-4 py-2 bg-indigo-500 text-white"></Button>
    </NuxtLink>
  </div>
  <div v-if="!succes" class="col-12 p-2 sm:p-4">
    <div class="card p-3 sm:p-4">
      <h5>S'inscrire</h5>
      <div class="p-fluid formgrid grid">
        <div class="field col-12 md:col-6">
          <label for="prenom">Prénom</label>
          <InputText v-model="first_name" id="prenom" type="text" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="nom">Nom</label>
          <InputText v-model="last_name" id="nom" type="text" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="telephone">Téléphone</label>
          <InputText v-model="telephone" id="telephone" type="text" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="v1">Ville</label>
          <InputText disabled placeholder="Larchant" />
        </div>
        <div class="field col-12">
          <label for="ville">Adresse à Larchant (rue et numéro)</label>
          <InputText v-model="ville" id="ville" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="email">Email</label>
          <InputText v-model="email" id="email" type="email" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="password">Mot de Passe</label>
          <Password id="password" v-model="password" placeholder="Mot de Passe" :toggleMask="true" class="w-full"
            inputClass="w-full"></Password>
        </div>

        <div class="field col-12">
          <Accordion>
            <AccordionTab header="Charte du Préteur et de l'Emprunteur">
              <div class="text-sm leading-relaxed">
                <p class="mb-3"><strong>0.0-</strong> Le service de prêt a été réalisé par les responsables du service
                  de prêt au travers de la charte du préteur et de l'emprunteur. Toute personne utilisatrice de ce
                  service devra être domiciliée à LARCHANT.</p>

                <p class="mb-3"><strong>0.1-</strong> Les administrateurs ne seront pas tenu responsables en cas de
                  litiges, fraudes et tous autres malversations…</p>

                <p class="mb-3"><strong>0.2-</strong> En cas de conflit les administrateurs du service se réservent le
                  droit de supprimer le(s) article(s) ou le(s) signataire(s) de la charte.</p>

                <h4 class="font-bold mt-4 mb-2">1.0- LE PRÉTEUR</h4>

                <p class="mb-3"><strong>1.1-</strong> Pour devenir préteur il faut inscrire un article dans le catalogue
                  de prêt qui sera validé par un responsable du service de prêt.</p>

                <p class="mb-3"><strong>1.2-</strong> Tous les articles (neufs ou d'occasions) doivent être en bon état
                  d'utilisation.</p>

                <p class="mb-3"><strong>1.3-</strong> Les responsables du service sont en droit de retirer les articles
                  ne respectant pas l'alinéa 1.2</p>

                <p class="mb-3"><strong>1.4-</strong> Le préteur s'engage à tester le matériel avec l'emprunteur et
                  s'assurer que l'emprunteur est apte à utiliser le matériel (les accessoires de sécurité restent à la
                  charge de l'emprunteur). (Les responsables du service de prêt et le préteur sont en aucun cas
                  responsable d'un accident dû à une mauvaise utilisation d'un matériel de prêt).</p>

                <h4 class="font-bold mt-4 mb-2">2.0- L'EMPRUNTEUR</h4>

                <p class="mb-3"><strong>2.1-</strong> Pour devenir emprunteur la personne doit être enregistrée dans le
                  fichier préteur.</p>

                <p class="mb-3"><strong>2.2-</strong> L'emprunteur s'engage à prendre soin des articles mis à sa
                  disposition dans le catalogue en respectant les dates de restitutions. (Pour certains matériels les
                  accessoires de sécurité restent à la charge de l'emprunteur, par exemple : casque, lunettes de
                  protections, protections auditives, gants etc.). (Les responsables du service de prêt et le préteur ne
                  sont en aucun cas responsable d'un accident dû à une mauvaise utilisation d'un matériel de prêt).</p>

                <p class="mb-3"><strong>2.3-</strong> L'emprunteur s'engage à signaler, sans attendre, tous
                  dysfonctionnements d'un matériel aux responsables du service de prêt.</p>

                <p class="mb-3"><strong>2.4-</strong> L'emprunt des articles ne doit pas dépasser 1 semaine(un
                  arrangement peut être accordé avec le préteur et s'il n'y a pas de réservation sur l'article).</p>

                <p class="mb-3"><strong>2.5-</strong> Pour certains articles le consommable est à la charge de
                  l'emprunteur (ou discrétion du préteur)</p>

                <p class="mb-3"><strong>2.6-</strong> La réservation des articles est possible, sous réserve de la bonne
                  restitution de l'article (date de restitution, en réparation ou entretien …).</p>

                <p class="mb-3"><strong>2.7-</strong> L'article prêté devra être restitué dans le même état qu'au moment
                  de l'emprunt.</p>

                <p class="mb-3"><strong>2.8-</strong> La restitution et le contrôle de l'article ce fait directement au
                  préteur (le préteur s'engage à prévenir un responsable du service de prêt d'un retard de date de
                  restitutions ou sur un litige.</p>

                <h4 class="font-bold mt-4 mb-2">3.0- UTILISATION DES ARTICLES EMPRUNTÉS</h4>

                <p class="mb-3"><strong>3.1-</strong> Tous les articles sont exclusivement destinés à un usage
                  personnel, non commercial et non professionnelle. Tous les articles devront être utilisés pour l'usage
                  pour lesquels ils ont été conçu notamment en respectant les consignes de sécurité dictées par le
                  fabricant.</p>

                <p class="mb-3"><strong>3.2-</strong> Le prêt ou la location à toute autre personne est formellement
                  interdit.</p>

                <p class="mb-3"><strong>3.3-</strong> En cas de détérioration de l'article emprunté, ne résultant pas de
                  l'usure normale ou en cas de perte ou de vol, l'emprunteur est entièrement responsable et le
                  remplacement de celui-ci reste à sa charge.</p>
              </div>
            </AccordionTab>
          </Accordion>
        </div>

        <div class="field col-12 flex items-start">
          <Checkbox class="mt-2 bg-indigo-500 text-white" v-model="charte" inputId="charte1" name="charte"
            value="valide" />
          <label for="charte1" class="ml-2 text-sm">Je m'engage à souscrire aux principes de la charte de la
            BibOb.</label>
        </div>
        <div class="field col-12 sm:col-6 sm:col-offset-3 mt-4">
          <Button @click="registerDirectus()" label="Inscription"
            class="w-full p-3 text-lg bg-indigo-500 text-white"></Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi-eye,
.pi-eye-slash {
  transform: scale(1.4);
  margin-right: 0.75rem;
}
</style>