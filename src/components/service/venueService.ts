import { apiClient } from "./apiService";
import {
  VenueDto,
} from "../type/index";

// ===== Venue API Service =====
export const venueService = {
  async getAllVenues(): Promise<VenueDto[]> {
    return apiClient.get<VenueDto[]>("/api/venues");
  },

  async createVenue(venueData: VenueDto): Promise<VenueDto> {
    return apiClient.post<VenueDto>("/api/venues", venueData);
  },

  async getVenueById(venueId: number): Promise<VenueDto> {
    return apiClient.get<VenueDto>(`/api/venues/${venueId}`);
  },

  async updateVenue(venueId: number, venueData: VenueDto): Promise<VenueDto> {
    return apiClient.put<VenueDto>(`/api/venues/${venueId}`, venueData);
  },

  async deleteVenue(venueId: number): Promise<void> {
    return apiClient.delete<void>(`/api/venues/${venueId}`);
  },

  // Fetch venue seatmap JSON
  async getSeatMap<T = unknown>(venueId: number): Promise<T> {
    return apiClient.get<T>(`/api/venues/${venueId}/seatmap`);
  },
};
