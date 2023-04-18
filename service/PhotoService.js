const contextPath = import.meta.env.BASE_URL;
export default class PhotoService {
    getImages() {
        console.log(contextPath)
        return fetch(contextPath + 'assets/demo/data/photos.json')
            .then((res) => res.json())
            .then((d) => d.data);
    }
}
