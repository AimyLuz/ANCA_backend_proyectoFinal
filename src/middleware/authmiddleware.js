//middleware/authmiddleware.js


const authMiddleware = (req, res, next) => {
  // Si estamos en modo de prueba, omite la autenticación
  if (process.env.NODE_ENV === 'test') {
    return next();
}

if (req.isAuthenticated()) {
    // Si el usuario está autenticado, continúa con la siguiente función de middleware
    return next();
}

// Si el usuario no está autenticado, redirige a la página de login o responde con un error
res.redirect('/login');
console.log("Autenticación de usuario:", req.isAuthenticated());
};
export default authMiddleware;