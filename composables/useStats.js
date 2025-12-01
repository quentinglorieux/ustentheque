import { readItems } from "@directus/sdk";
import { ref } from "vue";

export const useStats = () => {
    const directus = useDirectus();
    const publicDirectus = usePublicDirectus();

    const userBorrowed = ref(0);
    const userLent = ref(0);
    const totalItems = ref(0);
    const userTools = ref(0);
    const pendingRequests = ref(0);

    const fetchUserStats = async (userId) => {
        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Mes Emprunts (Demandes): Active requests made by the user
            // Status is 'En attente' OR ('Validé' AND not finished)
            const borrowedResponse = await directus.request(readItems("reservation", {
                filter: {
                    user_created: {
                        _eq: userId,
                    },
                    _or: [
                        { statut: { _eq: "En attente" } },
                        {
                            _and: [
                                { statut: { _eq: "Validé" } },
                                { fin: { _gte: today } }
                            ]
                        }
                    ]
                },
                aggregate: { count: "*" }
            }));
            userBorrowed.value = borrowedResponse[0]?.count || 0;

            // 2. Mes Prêts (Prêts en cours): Active requests received by the user (as owner)
            // Status is 'En attente' OR ('Validé' AND not finished)
            const lentResponse = await directus.request(readItems("reservation", {
                filter: {
                    objet: {
                        proprietaire: {
                            _eq: userId,
                        },
                    },
                    _or: [
                        { statut: { _eq: "En attente" } },
                        {
                            _and: [
                                { statut: { _eq: "Validé" } },
                                { fin: { _gte: today } }
                            ]
                        }
                    ]
                },
                aggregate: { count: "*" }
            }));
            userLent.value = lentResponse[0]?.count || 0;

            // 3. Catalogue Elements: Total items in the catalogue (Public)
            const totalItemsResponse = await publicDirectus.request(readItems("objet", {
                aggregate: { count: "*" }
            }));
            totalItems.value = totalItemsResponse[0]?.count || 0;

            // 4. User Tools: Total items owned by the user
            const userToolsResponse = await directus.request(readItems("objet", {
                filter: {
                    proprietaire: {
                        _eq: userId,
                    },
                },
                aggregate: { count: "*" }
            }));
            userTools.value = userToolsResponse[0]?.count || 0;

            // 5. Pending Requests: Requests received by the user (as owner) that are 'En attente'
            const pendingResponse = await directus.request(readItems('reservation', {
                filter: {
                    statut: { _eq: 'En attente' },
                    objet: {
                        proprietaire: {
                            _eq: userId
                        }
                    }
                },
                aggregate: { count: '*' }
            }));
            pendingRequests.value = pendingResponse[0]?.count || 0;

        } catch (error) {
            console.error("Error fetching user stats:", error);
        }
    };

    return {
        userBorrowed,
        userLent,
        totalItems,
        userTools,
        pendingRequests,
        fetchUserStats
    };
};
