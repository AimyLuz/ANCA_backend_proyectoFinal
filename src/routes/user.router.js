//user.router.js
import express from "express";
import passport from "passport";
import UserController from "../controllers/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const uc = new UserController();
import checkUserRole from "../middleware/checkrole.js";
import UserRepository from "../repositories/user.repository.js";
import UsersModel from "../models/users.model.js";
const ur = new UserRepository();
const router = express.Router();
import upload from "../middleware/multer.js";
import EmailManager from "../service/email.js";
// Nueva ruta para obtener todos los usuarios
router.get("/", async (req, res) => {
    try {
        const users = await ur.getAll();
        res.status(200).json(users);
    } catch (error) {
        req.logger.error('Error al obtener los usuarios: ' + error.message);
        res.status(500).send('Error al obtener los usuarios');
    }
});
//eliminar usuarios inactivos
router.delete("/", async (req, res) => {
    try {
        const threshold = moment().subtract(2, 'days'); // Cambia a 'minutes' para pruebas rápidas
        const usersToDelete = await UsersModel.find({
            last_connection: { $lt: threshold.toDate() }
        });

        for (const user of usersToDelete) {
            await EmailManager.sendEmail(user.email, 'Cuenta eliminada por inactividad', 'Tu cuenta ha sido eliminada debido a inactividad.');
            await UsersModel.findByIdAndDelete(user._id);
        }

        res.status(200).send('Usuarios inactivos eliminados y notificados');
    } catch (error) {
        req.logger.error('Error al eliminar usuarios inactivos: ' + error.message);
        res.status(500).send('Error al eliminar usuarios inactivos');
    }
});
//ELIMINAR USUARIOS desde el admin
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

router.get("/:uid", async (req, res) => {
    try {
        const userId = req.params.uid;
        const user = await ur.getById(userId); // Suponiendo que tienes un método getById en tu UserRepository
        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        req.logger.error('Error al obtener el usuario: ' + error.message);
        res.status(500).send('Error al obtener el usuario');
    }
});
router.post("/", async (req, res) => {
    try {
        const newUser = req.body;
        const createdUser = await ur.create(newUser); // Suponiendo que tienes un método create en tu UserRepository
        res.status(201).json(createdUser);
    } catch (error) {
        req.logger.error('Error al crear el usuario: ' + error.message);
        res.status(500).send('Error al crear el usuario');
    }
});
// Rutas para registrar y loguear usuarios
router.post("/register", passport.authenticate("register", { failureRedirect: "/failedregister" }), uc.register);
router.post("/login", passport.authenticate("login", { failureRedirect: "/faillogin" }), uc.login);

// Rutas protegidas que requieren autenticación
router.get("/profile", authMiddleware, uc.profile);
//router.post("/logout", authMiddleware, uc.logout);
router.post("/logout", authMiddleware, uc.logout); // Usamos POST para logout

router.get("/admin", authMiddleware, checkUserRole(['admin']), uc.admin);

router.post("/users", uc.createUser);

router.get("/failedregister", (req, res) => res.send("Registro Fallido!"));
router.get("/faillogin", (req, res) => res.send("Fallo todo, vamos a morir"));

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), (req, res) => {});
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), (req, res) => {
    req.session.user = req.user;
    req.session.login = true;
    res.redirect("/profile");
});

router.get('/current', authMiddleware, async (req, res) => {
    try {
        const userDTO = await ur.getById(req.user._id);
        res.json(userDTO);
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});
//Tercer integradora: 

//Nueva ruta!
router.post("/requestPasswordReset", uc.requestPasswordReset);
router.post("/reset-password", uc.resetPassword);
//Modificamos el usuario para que sea premium: 
router.put("/premium/:uid", uc.cambiarRolPremium);
// Mover la ruta de premium aquí
//router.post('/premium/:uid', uc.updateUserToPremium);
//Cuarta integradora: 

//Vamos a crear un middleware para Multer y lo vamos a importar: 
router.post("/:uid/documents", upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "product", maxCount: 1 },
    { name: "document", maxCount: 3 }
]), async (req, res) => {
    const { uid } = req.params;
    const uploadedDocuments = req.files;

    try {
        // Aquí obtenemos el documento de Mongoose en lugar de un DTO
        const user = await UsersModel.findById(uid);

        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }

        // Ahora podemos agregar los documentos al usuario
        if (uploadedDocuments) {
            if (uploadedDocuments.document) {
                user.documents = user.documents.concat(uploadedDocuments.document.map(doc => ({
                    name: doc.originalname,
                    reference: doc.path
                })));
            }

            if (uploadedDocuments.products) {
                user.documents = user.documents.concat(uploadedDocuments.products.map(doc => ({
                    name: doc.originalname,
                    reference: doc.path
                })));
            }

            if (uploadedDocuments.profile) {
                user.documents = user.documents.concat(uploadedDocuments.profile.map(doc => ({
                    name: doc.originalname,
                    reference: doc.path
                })));
            }
        }

        // Guardamos los cambios en la base de datos usando el documento Mongoose
        await user.save();

        res.status(200).send("Documentos cargados exitosamente");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error interno del servidor, los mosquitos seran cada vez mas grandes");
    }
});



export default router;