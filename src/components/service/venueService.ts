import { apiClient } from "../../libs/api-client";
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
};