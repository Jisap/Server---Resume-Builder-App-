import jwt from "jsonwebtoken"

const protect = async (req, res, next) => {
  const token = req.headers.authorization;                        // token desde el request
  if (!token) {                                                   // si no hay token, no hay permiso 
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)     // verificar token
    req.userId = decoded.id;                                      // se iguala el userId al token.id (El token ya trae el id del usuario dentro (porque lo metimos al crearlo))
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" })      // si el token no es valido
  }
}

export default protect;