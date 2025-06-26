import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { User } from "../models/User";
import { RefreshToken } from "../utils/RefreshToken"; // Nuevo modelo para refresh tokens
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dayjs from "dayjs";



// EDITAR USUARIO (sin cambiar contraseña)
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            username,
            email,
            role,
            firstName,
            lastName,
            cardId
        } = req.body;

        // Buscar el usuario existente
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar si el nuevo username ya existe
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({ message: "El nombre de usuario ya está en uso" });
            }
        }

        // Actualizar solo los campos permitidos
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { 
                username: username || user.username,
                email: email || user.email,
                role: role || user.role,
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                cardId: cardId || user.cardId
            },
            { new: true, runValidators: true }
        ).select('-password');

        return res.status(200).json({ 
            message: "Usuario actualizado correctamente",
            user: updatedUser 
        });

    } catch (error) {
        console.error("Error en updateUser: ", error);
        return res.status(500).json({ 
            message: "Error al actualizar usuario", 
            error: error.message 
        });
    }
};




// CAMBIO DE CONTRASEÑA (SOLO PARA EL PROPIO USUARIO)
export const changePassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Verificar que el usuario que hace la petición es el mismo
        if (req.user._id.toString() !== id) {
            return res.status(403).json({ 
                message: "No tienes permiso para cambiar esta contraseña" 
            });
        }

        // Buscar el usuario
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar la contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña actual incorrecta" });
        }

        // Encriptar nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        await User.findByIdAndUpdate(id, { $set: { password: hashedPassword } });

        return res.status(200).json({ message: "Contraseña actualizada correctamente" });

    } catch (error) {
        console.error("Error en changePassword: ", error);
        return res.status(500).json({ 
            message: "Error al cambiar contraseña",
            error: error.message 
        });
    }
};


// DESHABILITAR USUARIO (cambiar status a false)
export const disableUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Verificar si el usuario existe
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Cambiar el status a false
        const disabledUser = await User.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        ).select('-password');

        return res.status(200).json({ 
            message: "Usuario deshabilitado correctamente",
            user: disabledUser 
        });

    } catch (error) {
        console.error("Error en disableUser: ", error);
        return res.status(500).json({ 
            message: "Error al deshabilitar usuario", 
            error: error.message 
        });
    }
};




// HABILITAR USUARIO (cambiar status a true)
export const enableUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const enabledUser = await User.findByIdAndUpdate(
            id,
            { status: true },
            { new: true }
        ).select('-password');

        return res.status(200).json({ 
            message: "Usuario habilitado correctamente",
            user: enabledUser 
        });

    } catch (error) {
        console.error("Error en enableUser: ", error);
        return res.status(500).json({ 
            message: "Error al habilitar usuario", 
            error: error.message 
        });
    }
};