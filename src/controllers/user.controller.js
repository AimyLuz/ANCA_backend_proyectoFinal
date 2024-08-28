//user.controller.js
import CartsModel from "../models/carts.model.js";
import { createHash, isValidPassword } from "../utils/hashbcryp.js";
import UserDTO from "../dto/user.dto.js";
import UsersModel from "../models/users.model.js";
import ensureCart from "../middleware/ensureCart.js";
import { addLogger, logger } from "../utils/logger.js";
import generarResetToken from "../utils/tokenreset.js";
import jwt from 'jsonwebtoken';
import EmailManager from "../service/email.js";
const emailManager = new EmailManager();
import UserRepository from "../repositories/user.repository.js";
const ur = new UserRepository();
class UserController {
    async register(req, res) {
        const { first_name, last_name, email, password, age } = req.body;
        try {
            //console.log("Password recibido:", password); // Log para verificar la contraseña
    
            const existeUsuario = await UsersModel.findOne({ email });
            if (existeUsuario) {
                return res.status(400).send("El usuario ya existe");
            }
    
            const nuevoCarrito = new CartsModel();
            await nuevoCarrito.save();
            
            const hashedPassword = createHash(password);
            //console.log("Hashed Password:", hashedPassword); // Log para verificar el hash
    
            const nuevoUsuario = new UsersModel({
                first_name,
                last_name,
                email,
                cart: nuevoCarrito._id,
                password: hashedPassword, // Asegúrate de usar el hash aquí
                age
            });
    
            await nuevoUsuario.save();
    
            res.redirect("/login");
        } catch (error) {
            req.logger.error("Error interno del servidor: " + error.message);
            res.status(500).send("Error interno del servidor");
        }
    }
    async login(req, res) {
        try {
            if (!req.user) {
                return res.status(400).send("Credenciales inválidas");
            }
            //console.log("Usuario autenticado en login:", req.user);
    
            // Actualizar la última conexión del usuario
            req.user.last_connection = new Date();
            await req.user.save();
    
            // Crear un token JWT
            const token = jwt.sign({ user: req.user }, "coderhouse", {
                expiresIn: "1h" // El token expira en 1 hora
            });
    
            // Asegurar que el usuario tenga un carrito
            await ensureCart(req, res, async () => {
                // Crear una instancia de UserDTO para encapsular los datos del usuario
                const userDTO = new UserDTO(req.user);
               // console.log("UserDTO creado:", userDTO);
    
                // Asignar los datos del usuario a la sesión, asegurando que todos los campos están presentes
                req.session.user = {
                    _id: userDTO._id,
                    first_name: userDTO.first_name,
                    last_name: userDTO.last_name,
                    age: userDTO.age,
                    email: userDTO.email,
                    role: userDTO.role,  // Incluir el rol en la sesión
                    cart: userDTO.cart,
                    resetToken: userDTO.resetToken,
                    documents: userDTO.documents,
                    last_connection: userDTO.last_connection
                };
                req.session.login = true;
    
               // console.log("Sesión del usuario asignada:", req.session.user);
    
                // Guardar la sesión
                req.session.save((err) => {
                    if (err) {
                        logger.error("Error al guardar la sesión: " + err.message);
                        return res.status(500).send("Error al guardar la sesión");
                    }
                    // Establecer cookie y redirigir
                    res.cookie("coderCookieToken", token, {
                        maxAge: 3600000,
                        httpOnly: true
                    });
                    res.redirect("/profile");
                });
            });
        } catch (error) {
            logger.error("Error interno del servidor: " + error.message);
            res.status(500).send("Error interno del servidor");
        }
    }
    

    async createUser(req, res) {
        try {
            if (req.body.password) {
                req.body.password = createHash(req.body.password);
            }
    
            const user = await UsersModel.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            //next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
            req.logger.error("Error interno del servidor: " + error.message);
        }
        //console.log("Sesión del usuario después de login:", req.session.user);
    }

    async profile(req, res) {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.status(401).send("No autorizado");
        }
    }

    async logout(req, res) {
            try {
                req.user.last_connection = new Date();
                await req.user.save();
                req.session.destroy((err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Logout failed' });
                    }
                    res.clearCookie('connect.sid'); // Clear the session cookie
                    return res.redirect('/login'); // Redirigir después de borrar la cookie y destruir la sesión
                });
            } catch (error) {
                next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message }));
                req.logger.error("Error interno del servidor" + error.mensaje)
            }
        }

    async admin(req, res) {
        if (req.session.user.role !== "admin") {
            return res.status(403).send("Acceso denegado");

        }
        res.render("admin");
    }

//Tercer Integradora: 

async requestPasswordReset(req, res) {
    const { email } = req.body;
    try {
        //Buscar al usuario por email
        const user = await UsersModel.findOne({ email });

        if (!user) {
            //Si no hay usuario tiro error y el metodo termina aca. 
            return res.status(404).send("Usuario no encontrado");
        }

        //Peeero, si hay usuario, le genero un token: 

        const token = generarResetToken();
        //Recuerden que esto esta en la carpetita utils. 

        //Una vez que tenemos el token se lo podemos agregar al usuario: 

        user.resetToken = {
            token: token,
            expire: new Date(Date.now() + 3600000) // 1 Hora de duración. 
        }

        await user.save();

        //Despues que guardamos los cambios, mandamos el mail: 
        await emailManager.enviarCorreoRestablecimiento(email, user.first_name, token);

        res.redirect("/confirmacion-envio");
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
}

async resetPassword(req, res) {
    const { email, password, token } = req.body;

    try {
        //Busco el usuario: 
        const user = await UsersModel.findOne({ email });
        if (!user) {
            return res.render("passwordcambio", { error: "Usuario no encontrado" });
        }

        //Saco token y lo verificamos: 
        const resetToken = user.resetToken;
        if (!resetToken || resetToken.token !== token) {
            return res.render("passwordreset", { error: "El token es invalido" });
        }

        //Verificamos si el token expiro: 
        const ahora = new Date();
        if (ahora > resetToken.expire) {
            return res.render("passwordreset", { error: "El token es invalido" });
        }

        //Verificamos que la contraseña nueva no sea igual a la anterior: 
        if (isValidPassword(password, user)) {
            return res.render("passwordcambio", { error: "La nueva contraseña no puede ser igual a la anterior" });
        }

        //Actualizo la contraseña: 
        user.password = createHash(password);

        //Marcamos como usado el token: 
        user.resetToken = undefined;
        await user.save();

        return res.redirect("/login");

    } catch (error) {
        res.status(500).render("passwordreset", { error: "Error interno del servidor" });
    }
}

//Cambiar el rol del usuario: 

async cambiarRolPremium(req, res) {
    const {uid} = req.params; 
    try {
        //Busco el usuario: 
        const user = await UsersModel.findById(uid); 

        if(!user) {
            return res.status(404).send("Usuario no encontrado"); 
        }
          // Verificamos si el usuario tiene la documentacion requerida: 
          const documentacionRequerida = ["Identificacion", "Comprobante de domicilio", "Comprobante de estado de cuenta"];

          const userDocuments = user.documents.map(doc => doc.name);

          const tieneDocumentacion = documentacionRequerida.every(doc => userDocuments.includes(doc));

          if (!tieneDocumentacion) {
              return res.status(400).send("El usuario tiene que completar toda la documentacion requerida o no tendra feriados la proxima semana");
          }

        //Peeeeero si lo encuentro, le cambio el rol: 

        const nuevoRol = user.role === "usuario" ? "premium" : "usuario"; 

        const actualizado = await UsersModel.findByIdAndUpdate(uid, {role: nuevoRol});
        res.json(actualizado); 
    } catch (error) {
        res.status(500).send("Error en el servidor"); 
    }
}


}
export default UserController;