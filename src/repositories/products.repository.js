//products.repository.js

import ProductsModel from "../models/products.model.js";

class ProductRepository {
    
    async addProduct(productData) {
        const newProduct = new ProductsModel(productData);
        return await newProduct.save();
    }

    async getProducts(filter, options) {
        return ProductsModel.paginate(filter, options);
    }


    async getProductById(id) {
        return await ProductsModel.findById(id);
    }

    async deleteProduct(id) {
        return await ProductsModel.findByIdAndDelete(id);
    }
    async updateProduct(id, productoActualizado) {
        return await ProductsModel.findByIdAndUpdate(id, productoActualizado, { new: true });
    }



}


export default ProductRepository;