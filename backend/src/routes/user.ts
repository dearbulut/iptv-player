import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { auth } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

// Protected routes
router.get('/profile', auth, userController.getProfile.bind(userController));
router.put('/xtream-credentials', auth, userController.updateXtreamCredentials.bind(userController));
router.post('/toggle-adult-content', auth, userController.toggleAdultContent.bind(userController));

export default router;