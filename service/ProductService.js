import { Directus } from "@directus/sdk";

const contextPath = import.meta.env.BASE_URL;

const directus = new Directus("https://devdirectus.rubidiumweb.eu");


export default class ProductService {
  getProductsSmall() {
    return fetch(contextPath + "assets/demo/data/products-small.json")
      .then((res) => res.json())
      .then((d) => d.data);
  }

  getProducts() {
    return fetch(contextPath + "assets/demo/data/products.json")
      .then((res) => res.json())
      .then((d) => d.data);
  }

  getProductsWithOrdersSmall() {
    return fetch(contextPath + "assets/demo/data/products-orders-small.json")
      .then((res) => res.json())
      .then((d) => d.data);
  }

  getTools() {
    return directus
      .items("objet")
      .readByQuery({
        fields: [
          "*"
        ],
        sort: ['nom']
      })
    //   .then((res) => console.log(res))
      .then((res) => res.data);
  }

  getToolsFilter(searchTerm) {
    return directus
      .items("objet")
      .readByQuery({
        fields: [
          "*"
        ],
        filter: {
          nom: {
            _contains: searchTerm,
          },
        },
        sort: ['nom']
      
      })
      // .then((res) => console.log(res))
      .then((res) => res.data);
  }
}
