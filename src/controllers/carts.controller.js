import CartsService from "../service/carts.service.js";
import mongoose from "mongoose";
import TicketService from "../service/ticket.service.js";
import { createError, ERROR_TYPES } from '../utils/errorDirectory.js';
import { addLogger, logger } from "../utils/logger.js";
const cs = new CartsService();
const ts = new TicketService();
class CartsController {
    // 1. Comenzar carrito nuevo 
    async addCart(req, res) {
        try {
            const respuesta = await cs.addCart(req.body);
            if (respuesta.status) {
                res.status(200).send(respuesta);
            } else {
                res.status(400).send(respuesta);
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));   
            req.logger.error("Error interno del servidor" + error.mensaje)
             }
    }

    // 2. Borrar carrito
    async deleteCart(req, res) {
        try {
            const respuesta = await cs.deleteCart(req.params.cid);
            if (respuesta.status) {
                res.status(200).send(respuesta);
            } else {
                res.status(400).send(respuesta);
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message })); 
            req.logger.error("Error interno del servidor" + error.mensaje)
               }
    }

    // 3. Agregar productos al carrito
    async addProductToCart(req, res, next) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;
        try {
            const product = await cs.getProductById(productId); // Obtener detalles del producto
        
            // Verificar si el usuario es premium y si el producto le pertenece
            if (req.user.role === 'premium' && product.owner.toString() === req.user._id.toString()) {
                return next(createError(ERROR_TYPES.PRODUCT_OUT_OF_STOCK, "No podes agregar productos propios al carrito"));
            }
    
            const respuesta = await cs.addProductToCart(cartId, productId, quantity);
            if (respuesta.status) {
                const carritoID = (req.user.cart).toString();
                res.redirect(`/carts/${carritoID}`);
            } else {
                next(createError(ERROR_TYPES.PRODUCT_OUT_OF_STOCK, "Producto fuera de stock"));

            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
            console.log("Error en addproducttocart: ", error);
        }
    }

    // 4. Mostrar carritos
    async getCarts(req, res) {
        try {
            const respuesta = await cs.getCarts();
            if (respuesta.status) {
                res.status(200).send(respuesta);
            } else {
                res.status(400).send(respuesta);
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }
    }

    // 5. Mostrar carrito según ID
    async getCartById(req, res, next) {
        const cartId = req.params.cid;

        try {
          const resultado = await  cs.getCartById(cartId); // Verifica que se devuelve un resultado
          const carrito = resultado && resultado.cart; // Asegúrate de obtener `cart`
      
      
          if (!carrito || !Array.isArray(carrito.products) || carrito.products.length === 0) { // Verificar si tiene productos
            next(createError(ERROR_TYPES.CART_EMPTY, "Carrito no encontrado o sin productos"));
        }
          const productosEnCarrito = carrito.products.map(item => ({
            product: item.product.toObject(), // Verificar que `product` es un documento completo
            quantity: item.quantity
          }));
           res.render("carts", { productos: productosEnCarrito });
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
        }

    }

    // 6. Borrar un producto del carrito
    async deleteProductFromCart(req, res) {
        try {
            const respuesta = await cs.deleteProductCart(req.params.cid, req.params.pid);
            if (respuesta.status) {
                res.status(200).send(respuesta);
            } else {
                next(createError(ERROR_TYPES.PRODUCT_NOT_FOUND, "Producto no encontrado en el carrito"));

            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message })); 
            req.logger.error("Error interno del servidor" + error.mensaje)
               }
    }

    // 7. Actualizar productos del carrito
    async updateCart(req, res) {
        try {
            const respuesta = await cs.updateCart(req.params.cid, req.body);
            if (respuesta.status) {
                res.status(200).send(respuesta);
            } else {
                res.status(400).send(respuesta);
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor" + error.mensaje)
                }
    }

    // 8. Actualizar la cantidad de productos de un carrito
    async updateProductsQuantityCart(req, res) {
        try {
            const respuesta = await cs.updateProductsQuantityCart(req.params.cid, req.params.pid, req.body.newQuantity);
            if (respuesta.status) {
                res.status(200).send(respuesta);
            } else {
                res.status(400).send(respuesta);
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));  
            req.logger.error("Error interno del servidor" + error.mensaje)
              }
    }

    // 9. Vaciar carrito
    async emptyCart(req, res) {
        try {
            const respuesta = await cs.emptyCart(req.params.cid);
            if (respuesta.status) {
                res.redirect(`/carts/${req.params.cid}`);
            } else {
                res.status(400).send(respuesta);
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message })); 
            req.logger.error("Error interno del servidor" + error.mensaje)
               }
    }
    //10.terminar compra
    async purchase(req, res, next) {
        const cartId = req.params.cid;
        try {
            const cart = await cs.getCartById(cartId);
            if (!cart) {
                return next(createError(ERROR_TYPES.CART_NOT_FOUND, "Carrito no encontrado"));
            }
    
            let amount = 0;
            const unavailableProducts = [];
    
            cart.products.forEach(item => {
                if (item.product.stock >= item.quantity) {
                    amount += item.product.price * item.quantity;
                } else {
                    unavailableProducts.push(item.product._id);
                }
            });
    
            if (unavailableProducts.length === 0) {
                const ticketData = {
                    amount,
                    purchaser: req.user.email
                };
    
                // Crear el ticket
                await ts.createTicket(ticketData);
                
                // Vaciar el carrito
                await cs.emptyCart(cartId);
    
                // Renderizar la vista del ticket
                res.render('ticket', { title: 'Your Order' });
            } else {
                res.status(400).json({
                    error: 'Algunos productos no están disponibles',
                    unavailableProducts
                });
            }
        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor: " + error.message);
        }
    }
    async finalizarCompra  (req, res) {
        const { cartId } = req.params;
        try {
            const resultado = await procesarCompra(cartId);

        } catch (error) {
            next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));   
            req.logger.error("Error interno del servidor" + error.mensaje)
             }
    };
}

export default CartsController;