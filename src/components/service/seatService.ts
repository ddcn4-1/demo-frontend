import { apiClient } from "../../libs/api-client";
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
      `/api/v1/schedules/${scheduleId}/seats`
    );
  },

  async lockScheduleSeats(
    scheduleId: number,
    request: SeatLockRequest
  ): Promise<ApiResponseSeatLockResponse> {
    return apiClient.post<ApiResponseSeatLockResponse>(
      `/api/v1/schedules/${scheduleId}/seats/lock`,
      request
    );
  },

  async releaseScheduleSeats(
    scheduleId: number,
    request: SeatReleaseRequest
  ): Promise<ApiResponseBoolean> {
    return apiClient.delete<ApiResponseBoolean>(
      `/api/v1/schedules/${scheduleId}/seats/lock`,
      { data: request }
    );
  },

  async checkSeatsAvailability(seatIds: number[]): Promise<ApiResponseBoolean> {
    return apiClient.post<ApiResponseBoolean>(
      "/api/v1/seats/check-availability",
      seatIds
    );
  },

  async confirmSeats(request: SeatConfirmRequest): Promise<ApiResponseBoolean> {
    return apiClient.post<ApiResponseBoolean>("/api/v1/seats/confirm", request);
  },

  async cancelSeats(seatIds: number[]): Promise<ApiResponseBoolean> {
    return apiClient.post<ApiResponseBoolean>("/api/v1/seats/cancel", seatIds);
  },

  async cleanupExpiredLocks(): Promise<ApiResponseString> {
    return apiClient.post<ApiResponseString>("/api/v1/seats/cleanup-expired");
  },

  async releaseAllUserLocks(userId: number): Promise<ApiResponseString> {
    return apiClient.delete<ApiResponseString>(
      `/api/v1/users/${userId}/seat-locks`
    );
  },
};
