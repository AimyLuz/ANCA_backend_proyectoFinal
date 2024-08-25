//views.router.js
import express from 'express';
import ProductsController from '../controllers/products.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';
import checkUserRole from '../middleware/checkrole.js';
import CartsController from '../controllers/carts.controller.js';
import ProductsService from '../service/products.service.js';
import passport from 'passport';
import ViewsController from '../controllers/views.controller.js';
import ensureCart from '../middleware/ensureCart.js';
import UserRepository from '../repositories/user.repository.js';
const router = express.Router();
const pc = new ProductsController();
const cc = new CartsController();
const ps = new ProductsService();
const vc = new ViewsController();
const ur = new UserRepository();
router.get("/", vc.renderHome);
router.get("/products", authMiddleware, ensureCart, vc.renderProducts);

router.get("/carts", authMiddleware, ensureCart, (req, res) => {
    const cartId = req.session.user.cart;
    res.redirect(`/carts/${cartId}`);
});
router.get("/carts/:cid", authMiddleware, ensureCart, vc.renderCart);
router.get("/login", vc.renderLogin);
router.get("/register", vc.renderRegister);
router.get("/realtimeproducts", authMiddleware, checkUserRole(['admin', 'premium']), vc.renderRealTimeProducts);

router.get("/chat", authMiddleware, vc.renderChat);
router.get("/profile", authMiddleware,ensureCart, vc.renderProfile);
router.get('/empty/:cid', cc.emptyCart);
router.get("/api/carts/:cid/purchase", authMiddleware, ensureCart, vc.compraExitosa);
router.get("/mockingproducts", vc.renderMockingProducts);


router.get("/panel-premium", vc.panelPremium);
router.get("/documents", vc.cargarDocumentos);
//Tercer integradora: 
router.get("/reset-password", vc.renderResetPassword);
router.get("/password", vc.renderCambioPassword);
router.get("/confirmacion-envio", vc.renderConfirmacion);
router.get("/faillogin",vc.failedlogin);
router.get("/api/carts/:cid/purchase",vc.ticket);

router.get("/admin/users", authMiddleware, checkUserRole(['admin']), async (req, res) => {
    try {
        const users = await ur.getAll();
        res.render('adminUsers', { users });
    } catch (error) {
        req.logger.error('Error al cargar vista de administración de usuarios: ' + error.message);
        res.status(500).send('Error al cargar vista de administración de usuarios');
    }
});
router.post('/admin/users/delete/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // Lógica para eliminar al usuario
        await ur.delete(userId);
        res.redirect('/admin/users'); // Redirige después de eliminar
    } catch (error) {
        res.status(500).send('Error al eliminar el usuario.');
    }
});
export default router;