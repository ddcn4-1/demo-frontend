import { apiClient } from "./apiService";
import {
  VenueDto,
} from "../type/index";

// ===== Venue API Service =====
export const venueService = {
  async getAllVenues(): Promise<VenueDto[]> {
    return apiClient.get<VenueDto[]>("/v1/venues");
  },

  async createVenue(venueData: VenueDto): Promise<VenueDto> {
    return apiClient.post<VenueDto>("/v1/venues", venueData);
  },

  async getVenueById(venueId: number): Promise<VenueDto> {
    return apiClient.get<VenueDto>(`/v1/venues/${venueId}`);
  },

  async updateVenue(venueId: number, venueData: VenueDto): Promise<VenueDto> {
    return apiClient.put<VenueDto>(`/v1/venues/${venueId}`, venueData);
  },

  async deleteVenue(venueId: number): Promise<void> {
    return apiClient.delete<void>(`/v1/venues/${venueId}`);
  },

  // Fetch venue seatmap JSON
  async getSeatMap<T = unknown>(venueId: number): Promise<T> {
    return apiClient.get<T>(`/v1/venues/${venueId}/seatmap`);
  },
};
