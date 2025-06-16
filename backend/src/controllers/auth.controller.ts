import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import NodeCache from "node-cache";
import dayjs from "dayjs";
import { User } from "../models/User";
import bcrypt from 'bcrypt';

const cache = new NodeCache();

// LOGIN
export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Correo electrónico o usuario no registrado" }); //opcion 2
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        cache.set(user._id.toString(), accessToken, 60 * 15); // TTL: 15 minutos

        return res.json({
            message: 'Login exitoso',
            accessToken,
            refreshToken, // nuevo
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

// CONSULTAR TIEMPO RESTANTE DEL TOKEN
export const getTime = (req: Request, res: Response) => {
    const { userId } = req.params;
    const ttl = cache.getTtl(userId);

    if (!ttl) {
        return res.status(404).json({ message: "Token no encontrado" });
    }

    const now = Date.now();
    const timeToLifeSeconds = Math.floor((ttl - now) / 1000);
    const expTime = dayjs(ttl).format('HH:mm:ss');

    return res.json({
        timeToLifeSeconds,
        expTime
    });
};

// ACTUALIZAR TIEMPO DE VIDA DEL TOKEN
export const updateTime = (req: Request, res: Response) => {
    const { userId } = req.body;
    const ttl = cache.getTtl(userId);

    if (!ttl) {
        return res.status(404).json({ message: 'Token no encontrado o expirado' });
    }

    cache.ttl(userId, 60 * 15); // 15 minutos
    res.json({ message: 'Tiempo actualizado correctamente' });
};

//REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ message: 'Token de actualización requerido' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET || 'refresh_secret') as { userId: string };

    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);
    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(403).json({ message: 'Refresh token inválido o expirado' });
  }
};


// OBTENER TODOS LOS USUARIOS
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const userList = await User.find();
        return res.json({ userList });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

// BUSCAR USUARIO POR NOMBRE
export const getUserName = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar el usuario', error });
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
            nombre,
            apellidos,
            tarjeta,
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
            nombre,
            apellidos,
            tarjeta,
            createdAt: new Date(),      // asignar la fecha actual
            ultimoAcceso: null,         // aún no ha iniciado sesión
            status: true
        });

        const savedUser = await newUser.save();

        return res.status(201).json({ user: savedUser });

    } catch (error) {
        console.error("Error ocurrido en createUser: ", error);
        return res.status(500).json({ message: "Error al crear usuario", error });
    }
};
