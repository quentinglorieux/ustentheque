const contextPath = import.meta.env.BASE_URL;

export default class ProductService {
    getProductsSmall() {
        return fetch(contextPath + 'assets/demo/data/products-small.json')
            .then((res) => res.json())
            .then((d) => d.data);
    }

    getProducts() {
        return fetch(contextPath + 'assets/demo/data/products.json')
            .then((res) => res.json())
            .then((d) => d.data);
    }

    getProductsWithOrdersSmall() {
        return fetch(contextPath + 'assets/demo/data/products-orders-small.json')
            .then((res) => res.json())
            .then((d) => d.data);
    }
}
