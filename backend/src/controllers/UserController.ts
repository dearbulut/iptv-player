import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async register(req: Request, res: Response) {
    try {
      const { email, password, username } = req.body;

      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        username
      });

      await this.userRepository.save(user);
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      res.status(201).json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  }

  async updateXtreamCredentials(req: Request, res: Response) {
    try {
      const { xtream_username, xtream_password, xtream_url } = req.body;
      const user = req.user!;

      user.xtream_username = xtream_username;
      user.xtream_password = xtream_password;
      user.xtream_url = xtream_url;

      await this.userRepository.save(user);

      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Error updating Xtream credentials' });
    }
  }

  async toggleAdultContent(req: Request, res: Response) {
    try {
      const user = req.user!;
      user.adult_content_enabled = !user.adult_content_enabled;
      await this.userRepository.save(user);

      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Error toggling adult content' });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = req.user!;
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching profile' });
    }
  }
}