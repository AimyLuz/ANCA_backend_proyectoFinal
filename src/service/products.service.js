//products.service.js

import ProductRepository from "../repositories/products.repository.js";

const pr = new ProductRepository();

class ProductsService {
    async addProduct({title, description, price, thumbnail = [], code, stock, status, category}) {
        try {
            if (!title || !description || !price || !code || !stock || !status || !category) {
                return { status: false, msg: "Error al agregar el producto, por favor completar los campos faltantes " };
            }
            const existeProducto = await pr.findOne({ code: code });
            if (existeProducto) {
                return { status: false, msg: `Error al agregar el producto, ${code} repetido: ` };
            };

            const nuevoProducto = await pr.addProduct({
                title, 
                description, 
                price,
                code,
                stock, 
                category, 
                status: true, 
                thumbnail: thumbnail || []
            });
           
            return { status: true, product: nuevoProducto, msg: "Producto agregado exitosamente" };
        } catch (error) {
            return { status: false, msg: "Error al agregar el producto: " + error.message };
        }
    }
    
    async getProducts({ limit = 10, page = 1, sort, query } = {}) {
        try {
            const options = {
                page,
                limit,
                lean: true,
            };
    
            if (sort) {
                options.sort = { price: sort === 'asc' ? 1 : -1 };
            }
    
            const filter = query ? { category: query } : {};
    
            const productList = await pr.getProducts(filter, options);
    
    
            if (!productList || !productList.docs || !productList.totalDocs || !productList.totalPages) {
                throw new Error("La lista de productos devuelta no es válida");
            }
    
            return productList;
        } catch (error) {
            console.error("Error al obtener productos:", error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const producto = await pr.getProductById(id);
            if (!producto) {
                return { status: false, msg: `Producto con ID ${id} no encontrado` };
            } else {
                return { status: true, product: producto, msg: `Producto ID: ${id} encontrado exitosamente` };
            }
        } catch (error) {
            return { status: false, msg: `Producto con ID ${id} no encontrado` + error.message };
        }
    };

    async deleteProduct(id) {
        try {
            const deleteProduct = await pr.deleteProduct(id);
            if (!deleteProduct) {
                return { status: false, msg: `Producto con ID  ${id} no encontrado` };
            }
            return { status: true, delete: deleteProduct, msg: `Producto con ID ${id} eliminado correctamente` };
        } catch (error) {
            return { status: false, msg: "Error al intentar borrar el producto: " + error.message };
        }
    }
    
    async updateProduct(id, productoActualizado) {
        try {
            const updateProduct = await pr.updateProduct(id, productoActualizado); 
            if (!updateProduct) {
                return { status: false, msg: `Producto con ID ${id} no encontrado` };
            }
            return { status: true, product: updateProduct, msg: `Producto con ID ${id} actualizado correctamente` };
        } catch (error) {
            return { status: false, msg: "Error al intentar modificar el producto: " + error.message };
        }
    }
}

export default ProductsService;