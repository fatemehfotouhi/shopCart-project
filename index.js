import { app } from "./axiosConfig.js"


// Selecting

const body = document.querySelector("body");
const headerCartBtn = document.querySelector(".header__cart-icon");
const backdrop = document.querySelector(".backdrop");
const cartCloseBtn = document.querySelector(".cart_close-btn");
const cart = document.querySelector(".cart");
const productsContainer = document.querySelector(".products-section");
const cartItemsQuantity = document.querySelector(".header__cart-items-quantity");
const cartItemsContainer = document.querySelector(".cart__items-container");
const totalPriceTag = document.querySelector(".total-price");
const cartClearBtn = document.querySelector(".cart__clear-btn");
const searchInput = document.querySelector(".header__search-input");
const searchResultContainer = document.querySelector(".header__search-result-container");
const categoryItems = [...document.querySelectorAll(".category-items>li")];
const filterItems = [...document.querySelectorAll(".filter-items>li")];
const selectCategory = document.querySelector(".select-category");
const selectFilter = document.querySelector(".select-filter");
const cartBtn = document.querySelector(".cart__btn");



// Classes


class Products {
    async getProducts() {
        const { data } = await app.get("products");
        return data;
    }

}
class Storage {
    static saveProducts(_products) {
        localStorage.setItem("products", JSON.stringify(_products));
    }
    static getProducts() {
        return JSON.parse(localStorage.getItem("products"));
    }
    static saveProduct(_product) {
        const products = this.getProducts();
        products.push(_product);
        localStorage.setItem("products", JSON.stringify(products));
    }
    static saveItemsToCart(_items) {
        localStorage.setItem("itemsInCart", JSON.stringify(_items));
    }
    static saveItemToCart(_item) {
        const items = this.getItemsInCart();
        items.push(_item);
        localStorage.setItem("itemsInCart", JSON.stringify(items));
    }
    static getItemsInCart() {
        return JSON.parse(localStorage.getItem("itemsInCart")) || [];
    }
    static getProduct(_id) {
        const products = this.getProducts();
        return products.find(p => p.id === Number(_id));
    }

}

let buttonsDOM = [];

class UI {
    displayProducts(_products) {
        let result = "";
        _products.forEach(_product => {
            result += `<div class="product">
            <div class="product__img-container">
                <img src=${_product.image} alt="">
            </div>
            <div class="product__desc">
                <span class="product__desc-title">${_product.title}</span>
                <span class="product__desc-price">${_product.price} $</span>
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
        });
        productsContainer.innerHTML = result;
    }

    getAddToCartBtns() {
        const addToCartBtns = [...document.querySelectorAll(".product__add-btn")];
        buttonsDOM = addToCartBtns;
        addToCartBtns.forEach(btn => {
            const id = btn.dataset.id;
            const itemsInCart = Storage.getItemsInCart();
            const isInCart = itemsInCart.find(p => p.id === Number(id));
            if (isInCart) {
                btn.textContent = "In Cart";
                btn.disabled = true;
            }
            btn.addEventListener("click", (e) => {
                e.target.textContent = "In Cart";
                e.target.disabled = true;
                const selectedProduct = { ...Storage.getProduct(id), quantity: 1 };
                Storage.saveItemToCart(selectedProduct);
                const cart = Storage.getItemsInCart();
                this.setCartValue(cart);
                this.addCartItem(selectedProduct);
            })

        })
    }

    setCartValue(_cart) {
        let totalItems = 0;
        const totalPrice = _cart.reduce((acc, curr) => {
            totalItems += Number(curr.quantity);
            return acc + Number(curr.quantity) * curr.price;
        }, 0)
        cartItemsQuantity.textContent = totalItems;
        totalPriceTag.textContent = `total price: ${totalPrice.toFixed(2)} $`;
    }

    addCartItem(cartItem) {
        const div = document.createElement("div");
        div.classList.add("cart__item");
        div.setAttribute("data-id", `${cartItem.id}`)
        div.innerHTML = `
        <div class="cart__item-img">
                <img src=${cartItem.image}
                    alt="">
            </div>
            <div class="cart__item-desc">
                <span class="cart__item-title">${cartItem.title}</span>
                <span class="cart__item-price">${cartItem.price} $</span>
                <div class="cart__item-quantity">
                    <span class="cart__item-quantity--decrement" data-id=${cartItem.id}>-</span>
                    <span>${cartItem.quantity}</span>
                    <span class="cart__item-quantity--increment" data-id=${cartItem.id}>+</span>
                </div> 
            </div>
                <i class="fa-solid fa-trash-can"  data-id=${cartItem.id}></i>
            `;
        cartItemsContainer.appendChild(div);
    }
    setupApp() {
        const itemsInCart = Storage.getItemsInCart();
        itemsInCart.forEach(item => this.addCartItem(item));
        this.setCartValue(itemsInCart);
    }
    cartLogic() {
        cartClearBtn.addEventListener("click", () => this.clearCart());
        cartItemsContainer.addEventListener("click", e => {

            if (e.target.classList.contains("cart__item-quantity--decrement")) {
                const id = e.target.dataset.id;
                const cart = Storage.getItemsInCart();
                const selectedItem = cart.find(item => item.id === Number(id));
                if (selectedItem.quantity === 1) {
                    this.removeItem(selectedItem.id);
                    cartItemsContainer.removeChild(e.target.parentElement.parentElement.parentElement);
                    return;
                }
                selectedItem.quantity--;
                this.setCartValue(cart);
                Storage.saveItemsToCart(cart)
                e.target.nextElementSibling.innerText = selectedItem.quantity;



            } else if (e.target.classList.contains("cart__item-quantity--increment")) {
                const id = e.target.dataset.id;
                const cart = Storage.getItemsInCart();
                const selectedItem = cart.find(item => item.id === Number(id));
                selectedItem.quantity++;
                this.setCartValue(cart);
                Storage.saveItemsToCart(cart);
                e.target.previousElementSibling.textContent = selectedItem.quantity;


            } else if (e.target.classList.contains("fa-trash-can")) {
                const cart = Storage.getItemsInCart();
                const id = e.target.dataset.id;
                const _removeItem = cart.find(item => Number(item.id) == Number(id));
                this.removeItem(_removeItem.id);
                cartItemsContainer.removeChild(e.target.parentElement);
            } else {

            }
        })
    }
    clearCart() {
        const items = Storage.getItemsInCart();
        items.forEach(item => this.removeItem(item.id))
        while (cartItemsContainer.children.length > 0) {
            cartItemsContainer.removeChild(cartItemsContainer.children[0])
        }
        closeModal()
    }

    removeItem(id) {
        let items = Storage.getItemsInCart();
        items = items.filter(item => item.id !== Number(id));
        Storage.saveItemsToCart(items);
        this.setCartValue(items);
        this.getSingleButton(id);
    }
    getSingleButton(id) {
        const btn = buttonsDOM.find(btn => Number(btn.dataset.id) === Number(id))
        btn.textContent = "Add to Cart";
        btn.disabled = false;
    }
    displayResultOfSearch(_searchResult) {
        let result = ""
        _searchResult.forEach(item => {
            result += `<li class="title">${item.title}</li>`
        })
        searchResultContainer.innerHTML = result;

    }
    displayWomenClothing() {
        const productsData = Storage.getProducts();
        const filteredWomansClothing = productsData.filter(data => data.category === "women's clothing");
        this.displayProducts(filteredWomansClothing);
        this.getAddToCartBtns();
    }
    displayElectronics() {
        const productsData = Storage.getProducts();
        const filteredElectronics = productsData.filter(data => data.category === "electronics");
        this.displayProducts(filteredElectronics)
        this.getAddToCartBtns();
    }
    displayJewelry() {
        const productsData = Storage.getProducts();
        const filteredJewelry = productsData.filter(data => data.category === "jewelery");
        this.displayProducts(filteredJewelry)
        this.getAddToCartBtns();
    }
    displayMenClothing() {
        const productsData = Storage.getProducts();
        const filteredMensClothing = productsData.filter(data => data.category === "men's clothing");
        this.displayProducts(filteredMensClothing);
        this.getAddToCartBtns();
    }
    sortBaseOnHighestPrice() {
        const productsData = Storage.getProducts();
        const expensiveItems = productsData.sort(((a, b) => b.price - a.price));
        this.displayProducts(expensiveItems);
        this.getAddToCartBtns();
    }
    sortBaseOnLowestPrice() {
        const productsData = Storage.getProducts();
        const cheapestItems = productsData.sort(((a, b) => a.price - b.price));
        this.displayProducts(cheapestItems);
        this.getAddToCartBtns();
    }
    sortBaseOnHighestScore() {
        const productsData = Storage.getProducts();
        const highestScore = productsData.sort(((a, b) => b.rating.rate - a.rating.rate));
        this.displayProducts(highestScore);
        this.getAddToCartBtns();
    }
    sortBaseOnLowestScore() {
        const productsData = Storage.getProducts();
        const lowestScore = productsData.sort(((a, b) => a.rating.rate - b.rating.rate));
        this.displayProducts(lowestScore);
        this.getAddToCartBtns();
    }
}



// Events

document.addEventListener("DOMContentLoaded", async () => {
    const products = new Products();
    const ui = new UI();
    const productsData = await products.getProducts();
    Storage.saveProducts(productsData);
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    ui.setupApp();
    ui.cartLogic();
})

categoryItems.forEach((item) => {
    item.addEventListener("click", (e) => {

        const classes = e.target.classList;
        const ui = new UI();
        if (classes.contains("filter__mens-clothing")) {
            ui.displayWomenClothing();
        } else if (classes.contains("filter__jewelry")) {
            ui.displayJewelry();
        } else if (classes.contains("filter__electronics")) {
            ui.displayElectronics();
        } else if (classes.contains("filter__womans-clothing")) {
            ui.displayWomenClothing();
        }
    })

})


filterItems.forEach(item => {
    item.addEventListener("click", (e) => {

        const ui = new UI();
        const classes = e.target.classList;
        if (classes.contains("expensive-item")) {
            ui.sortBaseOnHighestPrice();
        } else if (classes.contains("cheapest-item")) {
            ui.sortBaseOnLowestPrice();
        } else if (classes.contains("highest-score")) {
            ui.sortBaseOnHighestScore();
        } else if (classes.contains("lowest-score")) {
            ui.sortBaseOnLowestScore();
        }
    })
})


selectCategory.addEventListener("change", (e) => {
    const value = e.target.value;


    const ui = new UI();
    if (value === "mensClothing") {
        ui.displayWomenClothing();
    } else if (value === "jewelry") {
        ui.displayJewelry();
    } else if (value === "electronics") {
        ui.displayElectronics();
    } else if (value === "womenClothing") {
        ui.displayWomenClothing();
    }
})

selectFilter.addEventListener("change", (e) => {
    const value = e.target.value;
    const ui = new UI();
    if (value === "expensive") {
        ui.sortBaseOnHighestPrice();
    } else if (value === "cheapest") {
        ui.sortBaseOnLowestPrice();
    } else if (value === "highestScore") {
        ui.sortBaseOnHighestScore();
    } else if (value === "lowestScore") {
        ui.sortBaseOnLowestScore();
    }
})


searchInput.addEventListener("input", (e) => {

    const ui = new UI();
    const productsData = Storage.getProducts();
    let value = e.target.value.toLowerCase();

    const selectedTitle = productsData.filter(p => p.title.toLowerCase().includes(value));

    ui.displayResultOfSearch(selectedTitle);

    const li = [...document.querySelectorAll(".title")];
    li.forEach(l => {
        l.addEventListener("click", (e) => {
            const f = selectedTitle.filter(i => i.title === e.target.innerHTML)
            ui.displayProducts(f);
            ui.getAddToCartBtns();
            searchInput.value = e.target.innerHTML;
            searchResultContainer.innerHTML = ''
        })
    })
})

cartBtn.addEventListener("click", () => {
    cart.classList.remove("hidden");
    backdrop.classList.remove("hidden");
})

headerCartBtn.addEventListener("click", () => {
    cart.classList.remove("hidden");
    backdrop.classList.remove("hidden");
})

backdrop.addEventListener("click", closeModal);
cartCloseBtn.addEventListener("click", closeModal);

function closeModal() {
    cart.classList.add("hidden");
    backdrop.classList.add("hidden");
}

