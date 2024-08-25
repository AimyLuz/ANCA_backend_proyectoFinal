//middleware/ensureCart.js
import CartsModel from "../models/carts.model.js";
import UsersModel from "../models/users.model.js";
const ensureCart = async (req, res, next) => {
    if (!req.user) {
        return next(); // Si req.user no está definido, simplemente pasa al siguiente middleware
    }

    if (!req.user.cart) {
        try {
            const newCart = new CartsModel();
            await newCart.save();

            req.user.cart = newCart._id;
            await UsersModel.findByIdAndUpdate(req.user._id, { cart: newCart._id });

            req.session.user.cart = newCart._id; // Actualizar la sesión con el carrito del usuario
            //req.session.user.cart = 'default-cart-id';
            console.log("Asegurando carrito para el usuario:", req.user);
        } catch (error) {
            console.error("Error al asegurar carrito para el usuario:", error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    next();
};

export default ensureCart;