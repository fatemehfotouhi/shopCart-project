
const app = axios.create({
    baseURL: 'https://fakestoreapi.com/',
});

const productsContainer = document.querySelector(".products");



document.addEventListener("DOMContentLoaded", async () => {
    const storage = new Storage();
    await storage.saveAllProducts();
    const products = storage.getAllProducts();
    const ui = new Ui()
    ui.displayProducts(products)
})



async function getProductsFromServer() {
    try {
        const { data } = await app.get("products");
        return data;
    } catch (err) {
        console.log(err)
    }
}

class Storage {
    async saveAllProducts() {
        const products = await getProductsFromServer();
        return localStorage.setItem("products", JSON.stringify(products))
    }
    getAllProducts() {
        return JSON.parse(localStorage.getItem("products"));

    }
}

class Ui {
    displayProducts(_products) {
        let result = "";
        _products.forEach(_product => {
            result += `<div class="product">
            <div class="product__img-container">
                <img src=${_product.image} alt="">
            </div>
            <div class="product__desc">
                <span class="product__desc-title">${_product.title}</span>
                <span class="Product__desc-price">${_product.price} $</span>
            </div>
            <div class="product__rate">
                <spam class="product__rate-icon">
                    <i class="fa-solid fa-star"></i>
                </spam>
                <spam class="product__rate-number">${_product.rating.rate}</spam>
            </div>
            <div>
                <button class="product__add-btn" data-id=${_product.id}>Add to Cart</button>
            </div>
        </div>`
        })
        productsContainer.innerHTML = result;
    }

}
