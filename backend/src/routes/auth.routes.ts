import { Router } from "express";
import { 
  login, 
  createUser, 
  refreshToken, 
  logout,
    getAllUsers
} from "../controllers/auth.controller";
import { verifyToken, isAdmin, isSelfOrAdmin } from "../middlewares/auth"; // Nuevo middleware

import { updateUser, disableUser, enableUser, changePassword } from "../controllers/user.controller";
import { createCard, deleteCard, disableCard, enableCard, getAllCards } from "../controllers/tarjet.controller";

const router = Router();

// rutas públicas
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/users', createUser); // registro de nuevos usuarios

// rutas protegidas (requieren token válido)
router.post('/logout', verifyToken, logout); // cerrar sesión
router.get('/all-users', verifyToken, getAllUsers);


router.put('/:id/update', updateUser); // Editar usuario (sin contraseña)
router.patch('/:id/disable', disableUser); // Deshabilitar usuario
router.patch('/:id/enable', isAdmin, enableUser);  // Habilitar usuario (opcional)
router.post('/:id/change-password', isSelfOrAdmin, changePassword);   // Cambio de contraseña


//tarjetas 

router.post('/addCard', createCard); //crear tarjeta
router.get('/cards', verifyToken, getAllCards); // Obtener todas las tarjetas
router.put('/cards/:id/disable', disableCard); // Deshabilitar tarjeta
router.put('/cards/:id/enable', enableCard); // Habilitar tarjeta
router.delete('/cards/:id/delete', deleteCard); // Eliminar tarjeta


export default router;