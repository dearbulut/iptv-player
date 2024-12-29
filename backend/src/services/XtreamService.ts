import axios from 'axios';
import { User } from '../entities/User';

export class XtreamService {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(user: User) {
    if (!user.xtream_url || !user.xtream_username || !user.xtream_password) {
      throw new Error('Xtream credentials not configured');
    }

    this.baseUrl = user.xtream_url;
    this.username = user.xtream_username;
    this.password = user.xtream_password;
  }

  private getApiUrl(action: string) {
    return `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=${action}`;
  }

  async authenticate() {
    try {
      const response = await axios.get(this.getApiUrl(''), {
        timeout: parseInt(process.env.XTREAM_API_TIMEOUT || '30000')
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to authenticate with Xtream server');
    }
  }

  async getLiveStreams() {
    try {
      const response = await axios.get(this.getApiUrl('get_live_streams'), {
        timeout: parseInt(process.env.XTREAM_API_TIMEOUT || '30000')
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch live streams');
    }
  }

  async getVodStreams() {
    try {
      const response = await axios.get(this.getApiUrl('get_vod_streams'), {
        timeout: parseInt(process.env.XTREAM_API_TIMEOUT || '30000')
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch VOD streams');
    }
  }

  async getSeriesStreams() {
    try {
      const response = await axios.get(this.getApiUrl('get_series'), {
        timeout: parseInt(process.env.XTREAM_API_TIMEOUT || '30000')
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch series');
    }
  }

  async getSeriesInfo(seriesId: string) {
    try {
      const response = await axios.get(this.getApiUrl('get_series_info') + `&series_id=${seriesId}`, {
        timeout: parseInt(process.env.XTREAM_API_TIMEOUT || '30000')
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch series info');
    }
  }

  async getEPG(streamId: string) {
    try {
      const response = await axios.get(this.getApiUrl('get_epg') + `&stream_id=${streamId}`, {
        timeout: parseInt(process.env.XTREAM_API_TIMEOUT || '30000')
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch EPG');
    }
  }
}