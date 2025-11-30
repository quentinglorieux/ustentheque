import { readItems } from "@directus/sdk";
import { ref } from "vue";

export const useStats = () => {
    const directus = useDirectus();

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
            const borrowedResponse = await directus.request(readItems("reservation", {
                filter: {
                    user_created: {
                        _eq: userId,
                    },
                },
            }));
            userBorrowed.value = borrowedResponse.length;

            // Fetch total lent items by the user
            const lentResponse = await directus.request(readItems("reservation", {
                filter: {
                    objet: {
                        proprietaire: {
                            _eq: userId,
                        },
                    },
                },
            }));
            userLent.value = lentResponse.length;

            // Fetch total items owned by the user
            const totalItemsResponse = await directus.request(readItems("objet", {
                filter: {
                    proprietaire: {
                        _eq: userId,
                    },
                },
            }));
            totalItems.value = totalItemsResponse.length;

            // Populate activityChartData with real data
            populateChartData(borrowedResponse, lentResponse);

            // Update the return percentage for the doughnut chart
            const returnedItems = lentResponse.filter(item => item.statut === "Rendu").length;
            returnChartData.value.datasets[0].data = [returnedItems, lentResponse.length - returnedItems];
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
