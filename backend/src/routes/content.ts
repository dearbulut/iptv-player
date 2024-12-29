import { Router } from 'express';
import { ContentController } from '../controllers/ContentController';
import { auth } from '../middleware/auth';

const router = Router();
const contentController = new ContentController();

// All routes require authentication
router.use(auth);

// Streams routes
router.get('/live', contentController.getLiveStreams.bind(contentController));
router.get('/vod', contentController.getVodStreams.bind(contentController));
router.get('/series', contentController.getSeriesStreams.bind(contentController));
router.get('/series/:seriesId', contentController.getSeriesInfo.bind(contentController));
router.get('/epg/:streamId', contentController.getEPG.bind(contentController));

// Favorites routes
router.get('/favorites', contentController.getFavorites.bind(contentController));
router.post('/favorites', contentController.addToFavorites.bind(contentController));
router.delete('/favorites/:id', contentController.removeFromFavorites.bind(contentController));

// Watch history routes
router.get('/history', contentController.getWatchHistory.bind(contentController));
router.post('/history', contentController.updateWatchHistory.bind(contentController));

export default router;