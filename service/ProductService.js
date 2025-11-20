import { Directus } from "@directus/sdk";
import { DIRECTUS_BASE } from "@/utils/directusConfig";

const contextPath = import.meta.env.BASE_URL;

const directus = new Directus(DIRECTUS_BASE);


export default class ProductService {
  async getProductsSmall() {
    const res = await fetch(contextPath + "assets/demo/data/products-small.json");
    const d = await res.json();
    return d.data;
  }

  async getProducts() {
    const res = await fetch(contextPath + "assets/demo/data/products.json");
    const d = await res.json();
    return d.data;
  }

  async getProductsWithOrdersSmall() {
    const res = await fetch(contextPath + "assets/demo/data/products-orders-small.json");
    const d = await res.json();
    return d.data;
  }

  async getTools() {
    const res = await directus
      .items("objet")
      .readByQuery({
        fields: [
          "*,brand.nom",
        ],
        sort: ['nom']
      });
    return res.data;
  }

  async getToolsFilter(searchTerm) {
    const res = await directus
      .items("objet")
      .readByQuery({
        fields: [
          "*",
        ],
        filter: {
          nom: {
            _contains: searchTerm,
          },
        },
        sort: ['nom']
      });
    return res.data;
  }
}
