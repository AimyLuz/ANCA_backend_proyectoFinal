import nodemailer from "nodemailer";
import { createError, ERROR_TYPES } from '../utils/errorDirectory.js';
import { addLogger, logger } from "../utils/logger.js";
class EmailManager{
    constructor(){
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: "ayelen.anca@gmail.com",
                pass: "pthe kwhd mjxu gsmz"

            }
        })
        

    }
    async enviarCorreoCompra(email, first_name, ticket){
        try{
            const mailOptions ={
                from: "Coder test <Ayelen.anca@gmail.com>",
                to: email,
                subject: "Confirmacion de compra",
                html: `
                    <h1> Confirmación de compra </h1>
                    <p> Gracias por tu compra ${first_name} </p>
                    <p> El número de tu orden es: ${ticket} </p>

                `
            }
            await this.transporter.sendMail(mailOptions)
        }catch(error){
            console.log("Error al enviar el mail");
            //next(createError(ERROR_TYPES.SERVER_ERROR, "Error interno del servidor", { originalError: error.message })); 
           // req.logger.error("Error interno del servidor" + error.mensaje)
            
        }
    }

async enviarCorreoRestablecimiento(email, first_name, token){
    try {
        const mailOptions = {
            from: "Coder Test <ayelen.anca@gmail.com>",
            to: email,
            subject: "Restablecimiento de contraseña",
            html: `
                    <h1> Restablecimiento de contraseña </h1>
                    <p>Hola ${first_name} ! ke ase? </p>
                    <p>Pediste restablecer la contraseña porque siempre te olvidas de todo. Te enviamos el codigo de confirmacion: </p>
                    <strong> ${token} </strong>
                    <p> Este codigo expira en una hora </p>
                    <a href="http://localhost:8080/password"> Restablecer contraseña </a>

            `
        }
        
        await this.transporter.sendMail(mailOptions);

    } catch (error) {
        console.error("Error al enviar el correo de restablecimiento: ", error.message);
    }
}

}

export default EmailManager;