import { Request, Response } from 'express';
import { XtreamService } from '../services/XtreamService';
import { AppDataSource } from '../index';
import { Favorite } from '../entities/Favorite';
import { WatchHistory } from '../entities/WatchHistory';

export class ContentController {
  private favoriteRepository = AppDataSource.getRepository(Favorite);
  private watchHistoryRepository = AppDataSource.getRepository(WatchHistory);

  async getLiveStreams(req: Request, res: Response): Promise<void> {
    try {
      const xtreamService = new XtreamService(req.user!);
      const response = await xtreamService.getLiveStreams();
      const streams = response as any[];
      
      const filteredStreams = !req.user!.adult_content_enabled
        ? streams.filter(stream => 
            !stream.category_name?.toLowerCase().includes('adult') &&
            !stream.name?.toLowerCase().includes('adult')
          )
        : streams;

      res.json(filteredStreams);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching live streams' });
    }
  }

  async getVodStreams(req: Request, res: Response): Promise<void> {
    try {
      const xtreamService = new XtreamService(req.user!);
      const response = await xtreamService.getVodStreams();
      const streams = response as any[];
      
      const filteredStreams = !req.user!.adult_content_enabled
        ? streams.filter(stream => 
            !stream.category_name?.toLowerCase().includes('adult') &&
            !stream.name?.toLowerCase().includes('adult')
          )
        : streams;

      res.json(filteredStreams);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching VOD streams' });
    }
  }

  async getSeriesStreams(req: Request, res: Response): Promise<void> {
    try {
      const xtreamService = new XtreamService(req.user!);
      const response = await xtreamService.getSeriesStreams();
      const series = response as any[];
      
      const filteredSeries = !req.user!.adult_content_enabled
        ? series.filter(show => 
            !show.category_name?.toLowerCase().includes('adult') &&
            !show.name?.toLowerCase().includes('adult')
          )
        : series;

      res.json(filteredSeries);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching series' });
    }
  }

  async getSeriesInfo(req: Request, res: Response): Promise<void> {
    try {
      const { seriesId } = req.params;
      const xtreamService = new XtreamService(req.user!);
      const seriesInfo = await xtreamService.getSeriesInfo(seriesId);
      res.json(seriesInfo);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching series info' });
    }
  }

  async getEPG(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const xtreamService = new XtreamService(req.user!);
      const epg = await xtreamService.getEPG(streamId);
      res.json(epg);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching EPG' });
    }
  }

  async addToFavorites(req: Request, res: Response): Promise<void> {
    try {
      const { content_id, content_type, title, poster_url } = req.body;
      
      const existingFavorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: req.user!.id },
          content_id,
          content_type
        }
      });

      if (existingFavorite) {
        res.status(400).json({ error: 'Already in favorites' });
        return;
      }

      const favorite = this.favoriteRepository.create({
        user: req.user!,
        content_id,
        content_type,
        title,
        poster_url
      });

      await this.favoriteRepository.save(favorite);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ error: 'Error adding to favorites' });
    }
  }

  async getFavorites(req: Request, res: Response): Promise<void> {
    try {
      const favorites = await this.favoriteRepository.find({
        where: { user: { id: req.user!.id } },
        order: { created_at: 'DESC' }
      });
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching favorites' });
    }
  }

  async removeFromFavorites(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.favoriteRepository.delete({
        id,
        user: { id: req.user!.id }
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error removing from favorites' });
    }
  }

  async updateWatchHistory(req: Request, res: Response): Promise<void> {
    try {
      const {
        content_id,
        content_type,
        title,
        watched_duration,
        total_duration,
        season_number,
        episode_number,
        poster_url
      } = req.body;

      let watchHistory = await this.watchHistoryRepository.findOne({
        where: {
          user: { id: req.user!.id },
          content_id,
          content_type,
          season_number,
          episode_number
        }
      });

      if (!watchHistory) {
        watchHistory = this.watchHistoryRepository.create({
          user: req.user!,
          content_id,
          content_type,
          title,
          season_number,
          episode_number,
          poster_url
        });
      }

      watchHistory.watched_duration = watched_duration;
      watchHistory.total_duration = total_duration;

      await this.watchHistoryRepository.save(watchHistory);
      res.json(watchHistory);
    } catch (error) {
      res.status(500).json({ error: 'Error updating watch history' });
    }
  }

  async getWatchHistory(req: Request, res: Response): Promise<void> {
    try {
      const watchHistory = await this.watchHistoryRepository.find({
        where: { user: { id: req.user!.id } },
        order: { updated_at: 'DESC' }
      });
      res.json(watchHistory);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching watch history' });
    }
  }
}