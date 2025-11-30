import { Directus } from "@directus/sdk";
import { useDirectusBase } from "@/composables/useDirectusBase";
import { ref } from "vue";

export const useStats = () => {
    const directusBase = useDirectusBase();
    const directus = new Directus(directusBase);

    const userBorrowed = ref(0);
    const userLent = ref(0);
    const totalItems = ref(0);
    const returnChartData = ref({
        labels: ["Retourné", "En cours"],
        datasets: [
            {
                data: [0, 0],
                backgroundColor: ["#42A5F5", "#FFCDD2"],
            },
        ],
    });
    const activityChartData = ref({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Emprunts",
                backgroundColor: "#42A5F5",
                data: Array(12).fill(0),
            },
            {
                label: "Prêts",
                backgroundColor: "#FFA726",
                data: Array(12).fill(0),
            },
        ],
    });

    const populateChartData = (borrowedData, lentData) => {
        const borrowedCountPerMonth = Array(12).fill(0);
        const lentCountPerMonth = Array(12).fill(0);

        borrowedData.forEach(item => {
            const month = new Date(item.debut).getMonth();
            borrowedCountPerMonth[month] += 1;
        });

        lentData.forEach(item => {
            const month = new Date(item.debut).getMonth();
            lentCountPerMonth[month] += 1;
        });

        activityChartData.value.datasets[0].data = borrowedCountPerMonth;
        activityChartData.value.datasets[1].data = lentCountPerMonth;
    };

    const fetchUserStats = async (userId) => {
        try {
            // Fetch total borrowed items for the user
            const borrowedResponse = await directus.items("reservation").readByQuery({
                filter: {
                    user_created: {
                        _eq: userId,
                    },
                },
            });
            userBorrowed.value = borrowedResponse.data.length;

            // Fetch total lent items by the user
            const lentResponse = await directus.items("reservation").readByQuery({
                filter: {
                    objet: {
                        proprietaire: {
                            _eq: userId,
                        },
                    },
                },
            });
            userLent.value = lentResponse.data.length;

            // Fetch total items owned by the user
            const totalItemsResponse = await directus.items("objet").readByQuery({
                filter: {
                    proprietaire: {
                        _eq: userId,
                    },
                },
            });
            totalItems.value = totalItemsResponse.data.length;

            // Populate activityChartData with real data
            populateChartData(borrowedResponse.data, lentResponse.data);

            // Update the return percentage for the doughnut chart
            const returnedItems = lentResponse.data.filter(item => item.statut === "Rendu").length;
            returnChartData.value.datasets[0].data = [returnedItems, lentResponse.data.length - returnedItems];
        } catch (error) {
            console.error("Error fetching user stats:", error);
        }
    };

    return {
        userBorrowed,
        userLent,
        totalItems,
        returnChartData,
        activityChartData,
        fetchUserStats
    };
};
