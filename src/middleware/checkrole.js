//middleware/checkrole.js


const checkUserRole = (allowedRoles) => (req, res, next) => {
    // Si estamos en modo de prueba, omite la comprobación de roles
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    if (!req.session.login) {
        return res.status(401).redirect("/login");
    }

    const userRole = req.session.user.role;
    if (allowedRoles.includes(userRole)) {
        next();
    } else {
        res.status(403).send('Acceso denegado. No tienes permiso para acceder a esta página.');
    }
};

export default checkUserRole;