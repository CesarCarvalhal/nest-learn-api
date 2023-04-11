// ./users/user.service.ts
import { Injectable, NotFoundException, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>) {}


  /////////////////////////// GETS

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
  
  async findOneByUsername(username: string): Promise<User | null> {
    const regex = new RegExp(`^${username}`, 'i');            // Case-insensitive regular expression.
    return await this.userModel.findOne({ username: regex }).exec();
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async getUsersByUsername(username: string): Promise<User[]> {
    const regex = new RegExp(`^${username}`, 'i');            // Case-insensitive regular expression.
    return this.userModel.find({ username: regex }).exec();
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const regex = new RegExp(`^${role}`, 'i');            // Case-insensitive regular expression.
    return this.userModel.find({ role: regex }).exec();
  }



  /////////////////////////// POSTS

  // SIGN-UP
  async signUp(username: string, email: string, role: string, password: string): Promise<{ id: string, token: string }> {

    // Check if request its corretly formed
    if (!username || !email || !password || (role !== "admin" && role !== "student")) {
      throw new BadRequestException("Petición mal formada");
    }    

    // Check if the email its corretly formed
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException("Ingrese un correo electrónico válido");
    }

    // Check if username or email already exists
    const existingUser = await this.userModel.findOne({ username }).exec();
    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya existe');
    }
    const existingEmail = await this.userModel.findOne({ email }).exec();
    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya existe');
    }

    // Save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const timestamp = new Date().getTime()/1000;
    const created_at = timestamp;
    const newUser = new this.userModel({ username, email, password: hashedPassword, role, created_at });
    const savedUser = await newUser.save();
    const token = jwt.sign({ userId: savedUser._id }, process.env.SECRET_KEY, { expiresIn: '24h' });
    return { id: savedUser._id , token }
  }

  // LOG-IN
  async login(username: string, password: string): Promise<{ id: string, token: string }> {

    // Check if request its corretly formed
    if (!username || !password) {
      throw new BadRequestException("Petición mal formada");
    }    

    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('El usuario no existe');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('La contraseña es incorrecta');
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '24h' });

    return { id: user._id , token }
  }



  /////////////////////////// POSTS
  // update username
  async updateUser(auth_token: string, newUsername: string): Promise<{ message: string }> {
    // Verificar y decodificar el token
    try {
      const decoded = jwt.verify(auth_token, process.env.SECRET_KEY);

      // Buscar el usuario por su ID
      const user = await this.userModel.findById(decoded["userId"]).exec();
      if (!decoded) {
        throw new NotFoundException('El usuario no existe');
      }

      // Verificar si el nuevo nombre de usuario ya existe
      const existingUser = await this.userModel.findOne({ username: newUsername }).exec();
      if (existingUser) {
        throw new ConflictException('El nombre de usuario ya existe');
      }

      // Actualizar el nombre de usuario
      user.username = newUsername;
      await user.save();

      return { message: 'Nombre de usuario actualizado correctamente' };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Token inválido');
      } else {
        throw error;
      }
    }
  }
}