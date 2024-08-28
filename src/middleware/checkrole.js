//middleware/checkrole.js

const checkUserRole = (allowedRoles) => (req, res, next) => {
    // Si estamos en modo de prueba, omite la comprobación de roles
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
      }


    const userRole = req.session.user.role;
    if (allowedRoles.includes(userRole)) {
        next();
    } else {
        res.status(403).send('Acceso denegado. No tienes permiso para acceder a esta página.');
    }
};

export default checkUserRole;