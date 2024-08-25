//views.controller.js
import ProductsService from "../service/products.service.js";
import CartsController from "../controllers/carts.controller.js";
import CartsRepository from "../repositories/carts.repository.js";
import ProductsModel from "../models/products.model.js";
import UserDTO from "../dto/user.dto.js";
import nodemailer from "nodemailer";
import CartsService from "../service/carts.service.js";
import MockingService from '../service/mocking.service.js';
import { addLogger, logger } from "../utils/logger.js";
const ps = new ProductsService();
const cc = new CartsController();
const cr = new CartsRepository();
const pm = new ProductsModel();
const cs = new CartsService();

class ViewsController {
    async renderProducts(req, res) {
        try {
            const { page = 1, limit = 2, sort, query } = req.query;


            const productList = await ps.getProducts({ page: parseInt(page), limit: parseInt(limit), sort, query });

            if (!productList || !productList.docs) {
                throw new Error("Lista de productos es indefinida o vacía");
            }


            const requiredProperties = ['hasPrevPage', 'hasNextPage', 'prevPage', 'nextPage', 'page', 'totalPages'];

            requiredProperties.forEach(prop => {
                if (productList[prop] === undefined) {
                    throw new Error(`La propiedad '${prop}' es indefinida en productList`);
                }
            });
            const cartId = req.session.user.cart;
            res.render("products", {
                user: req.session.user,
                products: productList.docs,
                hasPrevPage: productList.hasPrevPage,
                hasNextPage: productList.hasNextPage,
                prevPage: productList.prevPage,
                nextPage: productList.nextPage,
                currentPage: productList.page,
                totalPages: productList.totalPages,
                cartId,
            });
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }
    async renderProfile(req, res, next) {
        try {
            // Pasar el objeto completo de la sesión al constructor de UserDTO
            const userDto = new UserDTO(req.session.user);
            const isAdmin = req.session.user.role === 'admin';
            const isPremium = req.session.user.role === 'premium';
            const isUsuario = req.session.user.role === 'usuario';
            // Renderizar la vista pasando el userDto y el flag de admin
            res.render("profile", { user: userDto, isAdmin, isPremium, isUsuario });
        } catch (error) {
            next(error);
        }
    }
    async renderCart(req, res) {
        const cartId = req.session.user.cart;

        try {
            const carrito = await cr.getCartById(cartId);
    
            if (!carrito) {
                req.logger.info("No existe ese carrito con el id");
                return res.status(404).json({ error: "Carrito no encontrado" });
            }
    
            let totalCompra = 0;
    
            const productosEnCarrito = carrito.products.map(item => {
                const product = item.product.toObject();
                const quantity = item.quantity;
                const totalPrice = product.price * quantity;
    
                totalCompra += totalPrice;
    
                return {
                    product: { ...product, totalPrice, thumbnail: product.thumbnail },
                    quantity,
                    cartId
                };
            });
    
            res.render("carts", { productos: productosEnCarrito, totalCompra, cartId });
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }

    async renderLogin(req, res) {
        res.render("login");
    }

    async renderRegister(req, res) {
        res.render("register");
    }

    async renderRealTimeProducts(req, res) {
        try {
            res.render("realtimeproducts");
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }

    async renderChat(req, res) {
        const userDto = new UserDTO(req.session.user);
    res.render("chat", { user: userDto });
    }

    async renderHome(req, res) {
        res.render("home");
    }
    async deleteProductFromCart(req, res) {
        try {
            const { cid, pid } = req.params;
            const respuesta = await cs.deleteProductCart(cid, pid);
            if (respuesta.status) {
                res.json({ status: 'success' });
            } else {
                res.json({ status: 'failure' });
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }

    async compraExitosa(req, res) {
        const userEmail = req.user.email; // Obtener el correo del usuario autenticado
        const userDto = new UserDTO(req.session.user);
        const transport = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: "ayelen.anca@gmail.com",
                pass: "bsqc hogc sjpa ydxg"
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        try {
            await transport.sendMail({
                from: "Compra exitosa <ayelen.anca@gmail.com>",
                to: userEmail, // Usar el correo del usuario autenticado
                subject: "Compra exitosa",
                html: `<h1>Arrabal MusicStore: </h1> <p>Su compra fue exitosa!</p>
                <img src="cid:tsuki" />`,
                // Para enviar una imagen como adjunto:
                attachments: [{
                    filename: "conejito_mate.jpeg",
                    path: "./src/public/img/conejito_mate.jpeg",
                    cid: "tsuki"
                }]
            });
            res.render("ticket", { user: userDto });
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }
    async renderMockingProducts(req, res) {
        const products = MockingService.generateMockProducts();
        res.json(products);
    }
    //Tercer integradora: 
    
    async renderResetPassword(req, res){
        res.render("passwordreset"); 
    }

    async renderCambioPassword(req, res){
        res.render("passwordcambio"); 
    }

    async renderConfirmacion(req, res){
        res.render("confirmacion-envio"); 
    }
    async failedlogin(req,res){
        res.render("faillogin");
    }
    async ticket(req,res){
        const userDto = new UserDTO(req.session.user);
        res.render("ticket", { user: userDto });
    }
    async panelPremium(req,res){
        res.render("panel-premium");
    };
    async cargarDocumentos(req,res){
        const userDto = new UserDTO(req.session.user);
        res.render("cargardocumentos", { user: userDto });
    }
    async adminUsers(req,res){
        res.render("adminUsers");
    }
}

export default ViewsController;