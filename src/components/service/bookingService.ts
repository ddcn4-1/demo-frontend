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
    const resp = await apiClient.get<GetBookings200ResponseDto>(
      `/v1/bookings/me${query ? `?${query}` : ""}`
    );

    // Normalize each booking to ensure seats/seatCodes/seatCode/seatCount are consistent
    const normalized = {
      ...resp,
      bookings: (resp.bookings || []).map((b) => {
        const seats = (b as any).seats as any[] | undefined;
        const seatCodesFromSeats = Array.isArray(seats)
          ? seats
            .map((s: any) => `${s?.rowLabel ?? ''}${s?.colNum ?? ''}`.trim())
            .filter((v: string) => v.length > 0)
          : [];
        const seatCodes = seatCodesFromSeats.length > 0
          ? seatCodesFromSeats
          : (b.seatCodes && b.seatCodes.length > 0
            ? b.seatCodes
            : (b.seatCode ? String(b.seatCode).split(',').map(s => s.trim()).filter(Boolean) : []));
        const seatCodeAgg = seatCodes.length > 0 ? seatCodes.join(', ') : (b.seatCode || '');
        const seatCount = typeof b.seatCount === 'number' && b.seatCount > 0
          ? b.seatCount
          : (Array.isArray(seats) ? seats.length : 0);
        const seatZone = b.seatZone; // Do not derive from seats to avoid type coupling

        return {
          ...b,
          seats: Array.isArray(seats) ? seats : b.seats,
          seatCodes,
          seatCode: seatCodeAgg,
          seatCount,
          seatZone,
        };
      }),
    };

    return normalized;
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
    const resp = await apiClient.get<GetBookingDetail200ResponseDto>(
      `/v1/bookings/${bookingId}`
    );

    // Derive seatCodes from seatCode string only if not provided by backend
    const seats = (resp as any).seats as any[] | undefined;
    const seatCodesFromSeats = Array.isArray(seats)
      ? seats
        .map((s: any) => `${s?.rowLabel ?? ''}${s?.colNum ?? ''}`.trim())
        .filter((v: string) => v.length > 0)
      : [];
    const seatCodes = seatCodesFromSeats.length > 0
      ? seatCodesFromSeats
      : ((resp as any).seatCodes && (resp as any).seatCodes.length > 0
        ? (resp as any).seatCodes
        : ((resp as any).seatCode ? String((resp as any).seatCode).split(',').map((s: string) => s.trim()).filter(Boolean) : []));
    const seatCodeAgg = seatCodes.length > 0 ? seatCodes.join(', ') : ((resp as any).seatCode || '');

    return {
      ...resp,
      seatCodes,
      seatCode: seatCodeAgg,
      seatZone: (resp as any).seatZone,
      seatCount: typeof (resp as any).seatCount === 'number' && (resp as any).seatCount > 0
        ? (resp as any).seatCount
        : (Array.isArray(seats) ? seats.length : 0),
    } as GetBookingDetail200ResponseDto;
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
};
