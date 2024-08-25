//carts-manager-db.js
import express from "express";
const router = express.Router();
import CartsController from "../controllers/carts.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { userOnly } from "../middleware/authorizationMiddleware.js";
import CartsService from "../service/carts.service.js";

const cartsController = new CartsController();
const cs = new CartsService();

router.use(authMiddleware);

router.post('/', userOnly, cartsController.addCart);
router.delete('/:cid', userOnly, cartsController.deleteCart);
router.post('/:cid/product/:pid', userOnly, cartsController.addProductToCart);
router.get('/', userOnly, cartsController.getCarts);
router.get('/:cid', userOnly, cartsController.getCartById);
router.delete('/:cid/product/:pid', userOnly, async (req, res) => {
    const { cid: cartId, pid: productId } = req.params;
    try {
        const result = await cs.deleteProductCart(cartId, productId);
        if (result.status) {
            res.status(200).json({ status: 'success', msg: result.msg });
        } else {
            res.status(400).json({ status: 'error', msg: result.msg });
        }
    } catch (error) {
        console.error("Error interno del servidor:", error);
        res.status(500).json({ status: 'error', msg: "Error interno del servidor" });
    }
});
router.put('/:cid', userOnly, cartsController.updateCart);
router.put('/:cid/product/:pid', userOnly, cartsController.updateProductsQuantityCart);
router.delete('/:cid', userOnly, cartsController.emptyCart);

export default router