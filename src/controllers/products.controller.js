import ProductsService from "../service/products.service.js";
import { createError, ERROR_TYPES } from '../utils/errorDirectory.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/authorizationMiddleware.js';
import { addLogger, logger } from "../utils/logger.js";
import UserDTO from "../dto/user.dto.js";
const ps = new ProductsService();
import EmailManager from "../service/email.js";
const emailManager = new EmailManager();
class ProductsController {
    async getProductsApi(req, res, next) {
        try {
            const { page = 1, limit = 10, sort, query } = req.query;
            const productList = await ps.getProducts({ page: parseInt(page), limit: parseInt(limit), sort, query });
            res.json({
                status: "success",
                products: productList.docs,
                hasPrevPage: productList.hasPrevPage,
                hasNextPage: productList.hasNextPage,
                prevPage: productList.prevPage,
                nextPage: productList.nextPage,
                currentPage: productList.page,
                totalPages: productList.totalPages,
            });
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }

    async getProductsView(req, res, next) {
        try {
            const { page = 1, limit = 2, sort, query } = req.query;
            const productList = await ps.getProducts({ page: parseInt(page), limit: parseInt(limit), sort, query });
            res.render("home", {
                user: req.session.user,
                products: productList.docs,
                hasPrevPage: productList.hasPrevPage,
                hasNextPage: productList.hasNextPage,
                prevPage: productList.prevPage,
                nextPage: productList.nextPage,
                currentPage: productList.page,
                totalPages: productList.totalPages,
            });
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }
    async getProductById(req, res, next) {
        try {
            const productId = req.params.pid;
            const product = await ps.getProductById(productId);
            if (product.status) {
                return res.status(200).json({
                    status: true,
                    product: product.product,
                    msg: "Producto encontrado exitosamente"
                });
            } else {
                return res.status(404).json({
                    status: false,
                    msg: "Producto no encontrado"
                });
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }

    async addProduct(req, res, next) {
        try {
            const { title, description, price, thumbnail, code, stock, status, category } = req.body;
            const respuesta = await ps.addProduct({ title, description, price, thumbnail, code, stock, status, category });

            if (respuesta.status) {
                return res.status(200).json(respuesta);
            } else {
                return res.status(400).json(respuesta);
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }

    async updateProduct(req, res, next) {
        try {
            const productId = req.params.pid;
            const productData = req.body;
            const respuesta = await ps.updateProduct(productId, productData);

            if (respuesta.status) {
                return res.status(200).json(respuesta);
            } else {
                return res.status(400).json(respuesta);
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const productId = req.params.pid;
            const product = await ps.getProductById(productId);

            if (!product) {
                return res.status(404).json({
                    status: false,
                    msg: `Producto con ID ${productId} no encontrado.`
                });
            }

            const respuesta = await ps.deleteProduct(productId);

            if (respuesta.status) {
                const user = new UserDTO(req.session.user);
                if (user && user.role === 'premium') {
                    await emailManager.sendEmail(user.email, 'Producto eliminado', `Tu producto "${product.title}" ha sido eliminado.`);
                }
                return res.status(200).json(respuesta);
            } else {
                return res.status(500).json({
                    status: false,
                    msg: `No se pudo eliminar el producto con ID ${productId}.`
                });
            }

        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            logger.error("Error interno del servidor: " + error.message);
        }
    }
}


export default ProductsController;