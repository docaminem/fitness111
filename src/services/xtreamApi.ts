import type {
  XtreamCredentials,
  XtreamAuthResponse,
  Category,
  LiveStream,
  VODStream,
  VODInfo,
  Series,
  SeriesInfo,
  EPGItem,
} from '../types/xtream';

class XtreamApiService {
  private creds: XtreamCredentials | null = null;

  setCredentials(creds: XtreamCredentials) {
    this.creds = creds;
  }

  getCredentials(): XtreamCredentials | null {
    return this.creds;
  }

  private get baseUrl(): string {
    if (!this.creds) throw new Error('No credentials set');
    const { host, port } = this.creds;
    const h = host.startsWith('http') ? host : `http://${host}`;
    return port ? `${h}:${port}` : h;
  }

  private get apiBase(): string {
    if (!this.creds) throw new Error('No credentials set');
    return `${this.baseUrl}/player_api.php?username=${this.creds.username}&password=${this.creds.password}`;
  }

  private async fetch<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  async authenticate(): Promise<XtreamAuthResponse> {
    return this.fetch<XtreamAuthResponse>(this.apiBase);
  }

  async getLiveCategories(): Promise<Category[]> {
    return this.fetch<Category[]>(`${this.apiBase}&action=get_live_categories`);
  }

  async getLiveStreams(categoryId?: string): Promise<LiveStream[]> {
    const url = categoryId
      ? `${this.apiBase}&action=get_live_streams&category_id=${categoryId}`
      : `${this.apiBase}&action=get_live_streams`;
    return this.fetch<LiveStream[]>(url);
  }

  async getVODCategories(): Promise<Category[]> {
    return this.fetch<Category[]>(`${this.apiBase}&action=get_vod_categories`);
  }

  async getVODStreams(categoryId?: string): Promise<VODStream[]> {
    const url = categoryId
      ? `${this.apiBase}&action=get_vod_streams&category_id=${categoryId}`
      : `${this.apiBase}&action=get_vod_streams`;
    return this.fetch<VODStream[]>(url);
  }

  async getVODInfo(vodId: number): Promise<VODInfo> {
    return this.fetch<VODInfo>(`${this.apiBase}&action=get_vod_info&vod_id=${vodId}`);
  }

  async getSeriesCategories(): Promise<Category[]> {
    return this.fetch<Category[]>(`${this.apiBase}&action=get_series_categories`);
  }

  async getSeries(categoryId?: string): Promise<Series[]> {
    const url = categoryId
      ? `${this.apiBase}&action=get_series&category_id=${categoryId}`
      : `${this.apiBase}&action=get_series`;
    return this.fetch<Series[]>(url);
  }

  async getSeriesInfo(seriesId: number): Promise<SeriesInfo> {
    return this.fetch<SeriesInfo>(`${this.apiBase}&action=get_series_info&series_id=${seriesId}`);
  }

  async getEPG(streamId: number, limit = 5): Promise<{ epg_listings: EPGItem[] }> {
    return this.fetch(`${this.apiBase}&action=get_short_epg&stream_id=${streamId}&limit=${limit}`);
  }

  async getSimpleDataTable(streamId: number): Promise<{ epg_listings: EPGItem[] }> {
    return this.fetch(`${this.apiBase}&action=get_simple_data_table&stream_id=${streamId}`);
  }

  getLiveStreamUrl(streamId: number): string {
    if (!this.creds) throw new Error('No credentials');
    return `${this.baseUrl}/live/${this.creds.username}/${this.creds.password}/${streamId}.m3u8`;
  }

  getVODStreamUrl(streamId: number, ext: string): string {
    if (!this.creds) throw new Error('No credentials');
    return `${this.baseUrl}/movie/${this.creds.username}/${this.creds.password}/${streamId}.${ext}`;
  }

  getSeriesEpisodeUrl(episodeId: string, ext: string): string {
    if (!this.creds) throw new Error('No credentials');
    return `${this.baseUrl}/series/${this.creds.username}/${this.creds.password}/${episodeId}.${ext}`;
  }
}

export const xtreamApi = new XtreamApiService();
