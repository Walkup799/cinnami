import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { User } from "../models/User";
import { RefreshToken } from "../utils/RefreshToken"; // Nuevo modelo para refresh tokens
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dayjs from "dayjs";

// LOGIN - Versión mejorada
export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    try {
        // 1. Buscar usuario
        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        }).select('+password'); // Asegurar que incluya el campo password

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // 2. Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" }); // Mismo mensaje por seguridad
        }

        // 3. Generar tokens
        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        // 4. Guardar refresh token en DB (nuevo)
        await RefreshToken.create({
            token: refreshToken,
            userId: user._id,
            expiresAt: dayjs().add(7, 'days').toDate()
        });

        // 5. Actualizar último login
        user.lastLogin = new Date();
        await user.save();

        return res.json({
            message: 'Login exitoso',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error interno en el servidor" });
    }
};

// REFRESH TOKEN - Versión mejorada
export const refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Token de actualización requerido' });
    }

    try {
        // 1. Verificar token en DB
        const storedToken = await RefreshToken.findOne({ token });
        if (!storedToken || dayjs(storedToken.expiresAt).isBefore(dayjs())) {
            return res.status(403).json({ message: 'Refresh token inválido o expirado' });
        }

        // 2. Verificar firma JWT
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET || 'refresh_secret') as { userId: string };

        // 3. Generar nuevos tokens
        const newAccessToken = generateAccessToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);

        // 4. Actualizar refresh token en DB
        await RefreshToken.findByIdAndUpdate(storedToken._id, {
            token: newRefreshToken,
            expiresAt: dayjs().add(7, 'days').toDate()
        });

        return res.json({ 
            accessToken: newAccessToken, 
            refreshToken: newRefreshToken 
        });

    } catch (err) {
        return res.status(403).json({ message: 'Refresh token inválido' });
    }
};

// LOGOUT - Nuevo endpoint
export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
        // Eliminar refresh token de la DB
        await RefreshToken.deleteOne({ token: refreshToken });
        res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};
 

// CREAR UN NUEVO USUARIO
export const createUser = async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
            email,
            role,
            firstName,
            lastName,
            cardId,
        } = req.body;

        // Verificar si ya existe el usuario
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "El nombre de usuario ya existe" });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            role,
            firstName,
            lastName,
            cardId, // tarjeta
            doorOpenReminderMinutes: false, // valor por defecto
            createdAt: new Date(),      // asignar la fecha actual
            lastLogin: null,         // aún no ha iniciado sesión
            status: true
        });

        const savedUser = await newUser.save();

        return res.status(201).json({ user: savedUser });

    } catch (error) {
        console.error("Error ocurrido en createUser: ", error);
        return res.status(500).json({ message: "Error al crear usuario", error });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password'); // opcional ocultar contraseña
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};
