const contextPath = import.meta.env.BASE_URL;


export default class ProductService {
  constructor(directus = null) {
    this.directus = directus;
  }

  withDirectus() {
    if (!this.directus) {
      throw new Error("Directus client was not provided to ProductService.");
    }
    return this.directus;
  }

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
    const directus = this.withDirectus();
    const res = await directus
      .items("objet")
      .readByQuery({
        fields: [
          "*,brand.nom,reservation.*,reservation.user_created.first_name,reservation.user_created.last_name",
        ],
        sort: ['nom']
      });
    return res.data ?? [];
  }

  async getToolsFilter(searchTerm) {
    const directus = this.withDirectus();
    const res = await directus
      .items("objet")
      .readByQuery({
        fields: [
          "*,brand.nom,reservation.*,reservation.user_created.first_name,reservation.user_created.last_name",
        ],
        filter: {
          nom: {
            _contains: searchTerm,
          },
        },
        sort: ['nom']
      });
    return res.data ?? [];
  }
}
