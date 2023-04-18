const contextPath = import.meta.env.BASE_URL;
export default class NodeService {
    getTreeTableNodes() {
        return fetch(contextPath + 'assets/demo/data/treetablenodes.json')
            .then((res) => res.json())
            .then((d) => d.root);
    }

    getTreeNodes() {
        return fetch(contextPath + 'assets/demo/data/treenodes.json')
            .then((res) => res.json())
            .then((d) => d.root);
    }
}
