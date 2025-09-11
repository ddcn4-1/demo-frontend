import { apiClient } from "./apiService";
import {
  CreateBookingRequestDto,
  CreateBookingResponseDto,
  GetBookings200ResponseDto,
  GetBookingDetail200ResponseDto,
  CancelBookingRequestDto,
  CancelBooking200ResponseDto,
  BookingSearchParams,
} from "../type/index";

export const bookingService = {
  async getBookings(
    params?: BookingSearchParams
  ): Promise<GetBookings200ResponseDto> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return apiClient.get<GetBookings200ResponseDto>(
      `/v1/bookings/me${query ? `?${query}` : ""}`
    );
  },

  async createBooking(
    bookingData: CreateBookingRequestDto
  ): Promise<CreateBookingResponseDto> {
    return apiClient.post<CreateBookingResponseDto>(
      "/v1/bookings",
      bookingData
    );
  },

  async getBookingDetail(
    bookingId: number
  ): Promise<GetBookingDetail200ResponseDto> {
    return apiClient.get<GetBookingDetail200ResponseDto>(
      `/v1/bookings/${bookingId}`
    );
  },

  async cancelBooking(
    bookingId: number,
    request?: CancelBookingRequestDto
  ): Promise<CancelBooking200ResponseDto> {
    return apiClient.patch<CancelBooking200ResponseDto>(
      `/v1/bookings/${bookingId}/cancel`,
      request
    );
  },

  async adminGetBookings(
    params?: BookingSearchParams
  ): Promise<GetBookings200ResponseDto> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return apiClient.get<GetBookings200ResponseDto>(
      `/v1/admin/bookings${query ? `?${query}` : ""}`
    );
  },

  async adminGetBookingDetail(
    bookingId: number
  ): Promise<GetBookingDetail200ResponseDto> {
    return apiClient.get<GetBookingDetail200ResponseDto>(
      `/v1/admin/bookings/${bookingId}`
    );
  },

  // Confirms a pending booking - Admin only (PUT)
  async adminConfirmBooking(
    bookingId: number
  ): Promise<GetBookingDetail200ResponseDto> {
    await apiClient.put<unknown>(`/v1/admin/bookings/${bookingId}/confirm`);
    return apiClient.get<GetBookingDetail200ResponseDto>(
      `/v1/admin/bookings/${bookingId}`
    );
  },
};
