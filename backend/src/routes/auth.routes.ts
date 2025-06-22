import { Router } from "express";
import { 
  login, 
  createUser, 
  refreshToken, 
  logout,
    getAllUsers
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth"; // Nuevo middleware

const router = Router();

// rutas públicas
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/users', createUser); // registro de nuevos usuarios

// rutas protegidas (requieren token válido)
router.post('/logout', verifyToken, logout); // cerrar sesión
router.get('/all-users', verifyToken, getAllUsers);

export default router;