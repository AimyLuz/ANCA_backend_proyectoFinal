import CartsModel from "../models/carts.model.js";

class CartsRepository {
    // 1. Crear carrito
    async addCart() {
        const newCart = new CartsModel({ products: [] });
        return await newCart.save();
    }

    // 2. Borrar carrito
    async deleteCart(cartId) {
        return await CartsModel.findByIdAndDelete(cartId);
    }

    // 3. Agregar productos al carrito
    async addProductToCart(cartId, productId, quantity = 1) {
        const cart = await CartsModel.findById(cartId);
        if (!cart) {
            throw new Error(`Cart with ID ${cartId} not found`);
        }
        const existingProduct = cart.products.find(item => item.product.toString() === productId);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }
        cart.markModified("products");
        return await cart.save();
    }

    // 4. Mostrar carritos
    async getCarts() {
        return await CartsModel.find();
    }

    // 5. Mostrar el carrito según el ID
    async getCartById(cartId) {
        return await CartsModel.findById(cartId).populate('products.product');
    }

    // 6. Borrar un producto del carrito
    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await CartsModel.findById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
    
            // Encuentra el producto en el carrito y elimínalo
            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
            if (productIndex === -1) {
                throw new Error("Producto no encontrado en el carrito");
            }
    
            cart.products.splice(productIndex, 1);
            await cart.save();
    
            return true; // Asegúrate de devolver un valor que indique éxito
        } catch (error) {
            console.error("Error al borrar producto del carrito:", error);
            return false;
        }
    }

    // 7. Actualizar productos del carrito
    async updateCart(cartId, cartData) {
        return await CartsModel.findByIdAndUpdate(cartId, cartData, { new: true });
    }

    // 8. Actualizar la cantidad de productos de un carrito
    async updateProductQuantity(cartId, productId, newQuantity) {
        const cart = await CartsModel.findById(cartId);
        if (!cart) {
            throw new Error(`Cart with ID ${cartId} not found`);
        }
        const productIndex = cart.products.findIndex(item => item.product.toString() === productId);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity = newQuantity;
            cart.markModified('products');
            return await cart.save();
        } else {
            throw new Error(`Product with ID ${productId} not found in cart`);
        }
    }

    // 9. Vaciar carrito
    async emptyCart(cartId) {
        const cart = await CartsModel.findByIdAndUpdate(cartId, { products: [] }, { new: true });
        if (!cart) {
            throw new Error(`Cart with ID ${cartId} not found`);
        }
        return cart;
    }
}

export default CartsRepository;