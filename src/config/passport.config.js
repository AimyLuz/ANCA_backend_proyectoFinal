//passport.config.js
import passport from "passport";
import local from "passport-local";
import UsersModel from "../models/users.model.js";
import { createHash, isValidPassword } from "../utils/hashbcryp.js";
import GitHubStrategy from "passport-github2";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
            let usuario = await UsersModel.findOne({ email });
            if (usuario) {
                return done(null, false);
            }

            let nuevoUsuario = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password)
            }

            let resultado = await UsersModel.create(nuevoUsuario);
            return done(null, resultado);
        } catch (error) {
            return done(error);
        }
    }));

    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            let usuario = await UsersModel.findOne({ email });

            if (!usuario) {
                return done(null, false);
            }

            if (!isValidPassword(password, usuario)) {
                return done(null, false);
            }

            return done(null, usuario);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await UsersModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    passport.use("github", new GitHubStrategy({
        clientID: "Iv23liVkzNCXPxb64kEh",
        clientSecret: "11defeda49832ac1c043b0b27320612a694f751f",
        callbackURL: "http://localhost:8080/api/users/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await UsersModel.findOne({ githubId: profile.id });
    
            if (!user) {
                user = await UsersModel.create({
                    first_name: profile.displayName || "Nombre por defecto",
                    email: profile.emails[0].value,
                    githubId: profile.id
                });
            }
    
            return done(null, user);
        } catch (error) {
            console.error("Error en GitHub Strategy:", error);
            return done(error);
        }
    }));
  
};

export default initializePassport;