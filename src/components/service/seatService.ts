import { apiClient } from "./apiService";
import {
  ApiResponseSeatAvailabilityResponse,
  SeatLockRequest,
  ApiResponseSeatLockResponse,
  SeatReleaseRequest,
  SeatConfirmRequest,
  ApiResponseBoolean,
  ApiResponseString,
} from "../type/index";

export const seatService = {
  async getScheduleSeats(
    scheduleId: number
  ): Promise<ApiResponseSeatAvailabilityResponse> {
    return apiClient.get<ApiResponseSeatAvailabilityResponse>(
      `/v1/schedules/${scheduleId}/seats`
    );
  },

  async lockScheduleSeats(
    scheduleId: number,
    request: SeatLockRequest
  ): Promise<ApiResponseSeatLockResponse> {
    return apiClient.post<ApiResponseSeatLockResponse>(
      `/v1/schedules/${scheduleId}/seats/lock`,
      request
    );
  },

  async releaseScheduleSeats(
    scheduleId: number,
    request: SeatReleaseRequest
  ): Promise<ApiResponseBoolean> {
    return apiClient.delete<ApiResponseBoolean>(
      `/v1/schedules/${scheduleId}/seats/lock`,
      request
    );
  },

  async checkSeatsAvailability(seatIds: number[]): Promise<ApiResponseBoolean> {
    return apiClient.post<ApiResponseBoolean>(
      "/v1/seats/check-availability",
      seatIds
    );
  },

  async confirmSeats(request: SeatConfirmRequest): Promise<ApiResponseBoolean> {
    return apiClient.post<ApiResponseBoolean>("/v1/seats/confirm", request);
  },

  async cancelSeats(seatIds: number[]): Promise<ApiResponseBoolean> {
    return apiClient.post<ApiResponseBoolean>("/v1/seats/cancel", seatIds);
  },

  async cleanupExpiredLocks(): Promise<ApiResponseString> {
    return apiClient.post<ApiResponseString>("/v1/seats/cleanup-expired");
  },

  async releaseAllUserLocks(userId: number): Promise<ApiResponseString> {
    return apiClient.delete<ApiResponseString>(
      `/v1/users/${userId}/seat-locks`
    );
  },
};
