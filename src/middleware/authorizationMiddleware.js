//middleware/authorizationMiddleware.js

export function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
        console.log('User in adminOnly middleware:', req.user);
        return res.status(403).send('Acceso denegado');
    }
    next();
}

export function userOnly(req, res, next) {
    if (req.user.role !== 'usuario') {
        console.log('User in adminOnly middleware:', req.user);
        return res.status(403).send('Acceso denegado');
    }
    next();
}