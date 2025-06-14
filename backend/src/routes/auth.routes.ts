import { Router } from "express";
import { login, createUser } from "../controllers/auth.controller"

const router = Router();

router.post('/login', login);
router.post('/users', createUser);


export default router;