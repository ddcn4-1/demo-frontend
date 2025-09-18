import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Users, X } from "lucide-react";
import services from "./service/apiService";
import {serverAPI} from "./service/apiService";
import { venueService } from "./service/venueService";
import {
  SeatDto,
  CreateBookingRequestDto,
  PerformanceResponse,
  ScheduleResponse,
  UserInfo,
  SeatMapJson,
  SeatMapSection,
} from "./type/index";
// Removed ScrollArea for simpler overflow handling
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

interface SeatSelectionProps {
  performanceId: number;
  user: UserInfo;
  onBack: () => void;
  onComplete: () => void;
}

export function SeatSelection({
  performanceId,
  user,
  onBack,
  onComplete,
}: SeatSelectionProps) {
  const [performance, setPerformance] = useState<PerformanceResponse | null>(
    null
  );
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [seats, setSeats] = useState<SeatDto[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedSeatCodes, setSelectedSeatCodes] = useState<string[]>([]);
  const [selectedSeatIdsFromSelector, setSelectedSeatIdsFromSelector] = useState<number[]>([]);
  const [occupiedSeatCodes, setOccupiedSeatCodes] = useState<Set<string>>(new Set());
  const [selectorTotal, setSelectorTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState<
    "schedule" | "seats" | "confirm"
  >("schedule");
  const [venueId, setVenueId] = useState<number | null>(null);

  type GradeKey = string;

  const seatColorClasses = {
    VIP: {
      selected: 'bg-fuchsia-600 border-fuchsia-700 ring-fuchsia-300 text-white',
      normal: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
      hovered: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
      light: 'bg-fuchsia-50',
      labelBg: 'bg-fuchsia-100',
      labelText: 'text-fuchsia-800',
      labelBorder: 'border-fuchsia-300'
    },
    R: {
      selected: 'bg-blue-600 border-blue-700 ring-blue-300 text-white',
      normal: 'bg-blue-100 border-blue-300 text-blue-800',
      hovered: 'bg-blue-100 border-blue-300 text-blue-800',
      light: 'bg-blue-50',
      labelBg: 'bg-blue-100',
      labelText: 'text-blue-800',
      labelBorder: 'border-blue-300'
    },
    S: {
      selected: 'bg-emerald-600 border-emerald-700 ring-emerald-300 text-white',
      normal: 'bg-emerald-100 border-emerald-300 text-emerald-800',
      hovered: 'bg-emerald-100 border-emerald-300 text-emerald-800',
      light: 'bg-emerald-50',
      labelBg: 'bg-emerald-100',
      labelText: 'text-emerald-800',
      labelBorder: 'border-emerald-300'
    },
    A: {
      selected: 'bg-orange-600 border-orange-700 ring-orange-300 text-white',
      normal: 'bg-orange-100 border-orange-300 text-orange-800',
      hovered: 'bg-orange-100 border-orange-300 text-orange-800',
      light: 'bg-orange-50',
      labelBg: 'bg-orange-100',
      labelText: 'text-orange-800',
      labelBorder: 'border-orange-300'
    },
  } as const;

  const gradeSwatchClass: Record<string, string> = {
    VIP: 'bg-fuchsia-600',
    R: 'bg-blue-600',
    S: 'bg-emerald-600',
    A: 'bg-orange-600',
  };

  const defaultGradePrices: Record<GradeKey, number> = {
    VIP: 150000,
    R: 120000,
    S: 90000,
    Premium: 95000,
    A: 60000,
  };

  // Seat map state must be declared before any hooks that reference it
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [seatMap, setSeatMap] = useState<SeatMapJson | null>(null);
  const [rowRemap, setRowRemap] = useState<Map<string, string>>(new Map());
  const [selectorSelectedCodes, setSelectorSelectedCodes] = useState<Set<string>>(new Set());
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Helper functions moved up for useMemo access
  const normalizeZoneValue = (value?: string | null) => {
    if (value === undefined || value === null) return undefined;
    const trimmed = String(value).trim();
    return trimmed ? trimmed.toUpperCase() : undefined;
  };

  const getSectionIdentifier = (section: SeatMapSection, index: number) => {
    return (
      normalizeZoneValue(section.zone) ||
      normalizeZoneValue(section.name) ||
      `SECTION-${index + 1}`
    );
  };

  // Performance optimization: Cache for section-seat mapping using useMemo
  const sectionCache = useMemo(() => {
    if (!seatMap?.sections) return { rowToSection: new Map(), zoneToSections: new Map() };

    const rowToSection = new Map<string, { section: SeatMapSection; index: number; grade: string }>();
    const zoneToSections = new Map<string, { section: SeatMapSection; index: number }[]>();

    seatMap.sections.forEach((section, sectionIndex) => {
      const grade = (section.grade as GradeKey) || 'A';
      const zoneId = getSectionIdentifier(section, sectionIndex);

      // Cache zone to sections mapping
      if (!zoneToSections.has(zoneId)) {
        zoneToSections.set(zoneId, []);
      }
      zoneToSections.get(zoneId)!.push({ section, index: sectionIndex });

      // Cache all row labels for this section
      for (let r = 0; r < section.rows; r++) {
        const rowLabel = generateRowLabel(section.rowLabelFrom, r);
        const cacheKey = zoneId ? `${zoneId}:${rowLabel}` : rowLabel;

        if (!rowToSection.has(cacheKey)) {
          rowToSection.set(cacheKey, { section, index: sectionIndex, grade });
        }
      }
    });

    return { rowToSection, zoneToSections };
  }, [seatMap?.sections]);

  // Reset all seat selection-related states
  const resetSelection = useCallback(() => {
    setSelectedSeats([]);
    setSelectedSeatCodes([]);
    setSelectorSelectedCodes(new Set<string>());
    setSelectedSeatIdsFromSelector([]);
    setSelectorTotal(0);
    setHoveredSeat(null);
  }, []);

  const gradePrices = useMemo(() => {
    // Prefer pricing from seatMap if available
    const pricing = seatMap?.pricing ?? undefined;
    if (pricing && typeof pricing === 'object') {
      return { ...defaultGradePrices, ...pricing } as Record<string, number>;
    }
    return defaultGradePrices as Record<string, number>;
  }, [seatMap]);

  // Excel-style alpha increment with optional custom alphabet (e.g., skip I/O)
  function alphaToIndex(label: string, alphabet: string): number {
    const up = label.toUpperCase();
    const base = alphabet.length;
    let v = 0;
    for (let i = 0; i < up.length; i++) {
      const ch = up.charAt(i);
      const pos = alphabet.indexOf(ch);
      if (pos < 0) throw new Error(`Invalid row label: ${label}`);
      v = v * base + (pos + 1);
    }
    return v - 1; // zero-based
  }

  function indexToAlpha(index: number, alphabet: string): string {
    const base = alphabet.length;
    let v = index + 1; // one-based
    let out = "";
    while (v > 0) {
      const rem = (v - 1) % base;
      out = alphabet.charAt(rem) + out;
      v = Math.floor((v - 1) / base);
    }
    return out;
  }

  function generateRowLabel(startLabel: string, offset: number): string {
    const alphabet = seatMap?.meta?.alphabet?.toUpperCase() || "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const startIndex = alphaToIndex(startLabel, alphabet);
    const targetIndex = startIndex + offset;
    return indexToAlpha(targetIndex, alphabet);
  }


  const resolveSeatGrade = useCallback((seatId: string, sections: SeatMapSection[]): GradeKey | undefined => {
    const { rowLabel, seatNumber, zone } = parseSeatCode(seatId);
    if (!rowLabel) return undefined;

    const normalizedZone = normalizeZoneValue(zone);
    const numericSeat = parseInt(seatNumber, 10);

    // Try cache first
    const cacheKey = normalizedZone ? `${normalizedZone}:${rowLabel}` : rowLabel;
    const cached = sectionCache.rowToSection.get(cacheKey);

    if (cached) {
      // Validate seat number range if numeric
      if (!isNaN(numericSeat)) {
        const start = cached.section.seatStart ?? 1;
        const end = start + cached.section.cols - 1;
        if (numericSeat >= start && numericSeat <= end) {
          return cached.grade;
        }
      } else {
        return cached.grade;
      }
    }

    // Fallback to original logic if cache miss
    for (let idx = 0; idx < sections.length; idx++) {
      const sec = sections[idx];
      if (normalizedZone && getSectionIdentifier(sec, idx) !== normalizedZone) continue;
      for (let r = 0; r < sec.rows; r++) {
        const label = generateRowLabel(sec.rowLabelFrom, r);
        if (label !== rowLabel) continue;
        if (!isNaN(numericSeat)) {
          const start = sec.seatStart ?? 1;
          const end = start + sec.cols - 1;
          if (numericSeat < start || numericSeat > end) continue;
        }
        return (sec.grade as GradeKey) || 'A';
      }
    }
    return undefined;
  }, [sectionCache]);

  const findSectionForSeat = useCallback((rowLabel: string, col: number, zone: string | undefined, sections: SeatMapSection[]): { section: SeatMapSection; index: number } | undefined => {
    const normalizedZone = normalizeZoneValue(zone);
    const numericCol = typeof col === 'number' ? col : Number(col);

    // Try cache first
    const cacheKey = normalizedZone ? `${normalizedZone}:${rowLabel}` : rowLabel;
    const cached = sectionCache.rowToSection.get(cacheKey);

    if (cached) {
      // Validate seat number range if numeric
      if (!isNaN(numericCol)) {
        const start = cached.section.seatStart ?? 1;
        const end = start + cached.section.cols - 1;
        if (numericCol >= start && numericCol <= end) {
          return { section: cached.section, index: cached.index };
        }
      } else {
        return { section: cached.section, index: cached.index };
      }
    }

    // Fallback to original logic if cache miss
    for (let idx = 0; idx < sections.length; idx++) {
      const sec = sections[idx];
      if (normalizedZone && getSectionIdentifier(sec, idx) !== normalizedZone) continue;
      for (let r = 0; r < sec.rows; r++) {
        const label = generateRowLabel(sec.rowLabelFrom, r);
        if (label !== rowLabel) continue;
        if (!isNaN(numericCol)) {
          const start = sec.seatStart ?? 1;
          const end = start + sec.cols - 1;
          if (numericCol < start || numericCol > end) continue;
        }
        return { section: sec, index: idx };
      }
    }
    return undefined;
  }, [sectionCache]);

  // Fetch seat map when venueId becomes available
  useEffect(() => {
    let didCancel = false;
    const fetchSeatMap = async () => {
      if (!venueId) return;
      setSeatMapLoading(true);
      try {
        // Accept both wrapped response ({ seatMapJson }) and plain seatmap JSON
        const data = await venueService.getSeatMap<any>(venueId);
        if (!didCancel) {
          let resolved: any = data;
          if (data && typeof data === 'object') {
            if ('seatMapJson' in data) {
              resolved = (data as any).seatMapJson;
            } else if ('data' in data && (data as any).data?.seatMapJson) {
              resolved = (data as any).data.seatMapJson;
            } else if ('data' in data && (data as any).data?.sections) {
              resolved = (data as any).data;
            }
          }
          if (resolved && Array.isArray(resolved.sections)) {
            setSeatMap(resolved as SeatMapJson);
          } else {
            setSeatMap({ sections: [] });
          }
        }
      } catch (e) {
        console.error('Failed to load seatmap', e);
        if (!didCancel) setSeatMap({ sections: [] });
      } finally {
        if (!didCancel) setSeatMapLoading(false);
      }
    };
    fetchSeatMap();
    return () => {
      didCancel = true;
    };
  }, [venueId]);

  // Build row remap between backend rows and seatmap labels
  useEffect(() => {
    try {
      if (!seatMap || !seatMap.sections || seats.length === 0) return;
      const labels: string[] = [];
      for (const sec of seatMap.sections) {
        for (let r = 0; r < sec.rows; r++) labels.push(generateRowLabel(sec.rowLabelFrom, r));
      }
      const uniqueSeatRows: string[] = Array.from(
        new Set(seats.map((s) => String(s.seatRow).trim().toUpperCase()))
      );
      const numericRows = uniqueSeatRows
        .map(v => (/^\d+$/.test(v) ? Number(v) : NaN))
        .filter(n => !isNaN(n))
        .sort((a,b) => a-b);
      const remap = new Map<string, string>();
      if (numericRows.length > 0) {
        numericRows.forEach((num, idx) => {
          const label = labels[idx];
          if (label) remap.set(String(num), label);
        });
      }
      setRowRemap(remap);
    } catch (e) {
      console.warn('Failed to compute row remap', e);
      setRowRemap(new Map());
    }
  }, [seatMap, seats]);

  // Convert backend seat to unique code including zone/section when available
  const seatToCode = useCallback((s: SeatDto) => {
    const rawRow = String(s.seatRow).trim().toUpperCase();
    const mapped = rowRemap.get(rawRow);
    const rowLabel = mapped ?? (() => {
      const letters = rawRow.match(/[A-Z]+/g);
      const digitsInRow = rawRow.match(/\d+/g);
      return letters && letters.length > 0 ? letters[letters.length - 1] : (digitsInRow ? String(parseInt(digitsInRow[0], 10)) : rawRow);
    })();
    const parsedNumber = parseInt(String(s.seatNumber).trim(), 10);
    const numLabel = isNaN(parsedNumber) ? String(s.seatNumber).trim() : String(parsedNumber);

    let zoneKey = normalizeZoneValue(s.seatZone);
    const numericSeat = isNaN(parsedNumber) ? NaN : parsedNumber;
    if (!zoneKey && seatMap?.sections?.length) {
      const match = findSectionForSeat(rowLabel, numericSeat, undefined, seatMap.sections);
      if (match) {
        zoneKey = getSectionIdentifier(match.section, match.index);
      }
    }

    return buildSeatCode({ zone: zoneKey, rowLabel, seatNumber: numLabel });
  }, [rowRemap, seatMap, findSectionForSeat]);

  // Keep occupied codes in sync when seats or remap change
  useEffect(() => {
    try {
      const occ = new Set<string>();
      for (const s of seats) {
        const status = s.status?.toString().toUpperCase();
        if (status && status !== 'AVAILABLE') occ.add(seatToCode(s));
      }
      setOccupiedSeatCodes(occ);
    } catch (e) {
      console.warn('Failed to compute occupied seats', e);
      setOccupiedSeatCodes(new Set());
    }
  }, [seats, seatToCode]);

  const handleSelectorSeatClick = (seatId: string) => {
    if (occupiedSeatCodes.has(seatId)) return;
    const next = new Set(selectorSelectedCodes);
    if (next.has(seatId)) {
      next.delete(seatId);
    } else {
      if (next.size >= 4) {
        alert(`최대 4개의 좌석까지 선택 가능합니다.`);
        return;
      }
      next.add(seatId);
    }
    setSelectorSelectedCodes(next);
  };

  // Keep external selected codes and totals in sync with selector state
  useEffect(() => {
    const selectedSeatsArray = Array.from(selectorSelectedCodes) as string[];
    const amount = selectedSeatsArray.reduce((sum: number, seatId: string) => {
      const grade = resolveSeatGrade(seatId, seatMap?.sections ?? []);
      return sum + (grade ? (gradePrices[grade] ?? 0) : 0);
    }, 0);
    setSelectedSeatCodes(selectedSeatsArray);
    setSelectorTotal(amount);
    // Map codes to IDs when we have backend seats
    const map = new Map<string, number>();
    seats.forEach((s) => map.set(seatToCode(s), s.seatId));
    const ids = selectedSeatsArray
      .map((code) => {
        return map.get(String(code));
      })
      .filter((v): v is number => typeof v === 'number');
    setSelectedSeatIdsFromSelector(ids);
  }, [selectorSelectedCodes, seatMap, seats, resolveSeatGrade, seatToCode]);

  const renderSection = (section: SeatMapSection, sectionIndex: number) => {
    const nodes: React.ReactNode[] = [];
    const seatStart = section.seatStart ?? 1;
    const grade = section.grade ?? 'A';

    for (let row = 0; row < section.rows; row++) {
      const rowLabel = generateRowLabel(section.rowLabelFrom, row);
      const rowSeats: React.ReactNode[] = [];
      for (let col = 0; col < section.cols; col++) {
        const seatNumber = seatStart + col;
        const zoneKey = getSectionIdentifier(section, sectionIndex);
        const seatId = buildSeatCode({ zone: zoneKey, rowLabel, seatNumber });
        const isSelected = selectorSelectedCodes.has(seatId);
        const isOccupied = occupiedSeatCodes.has(seatId);
        const isHovered = hoveredSeat === seatId;

        const baseClasses = 'relative w-8 h-8 m-1 rounded-md border transition-colors text-xs font-medium flex items-center justify-center';
        let seatClasses;
        if (isOccupied) {
          seatClasses = `${baseClasses} bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed`;
        } else if (isSelected) {
          seatClasses = `${baseClasses} bg-blue-600 border-blue-600 text-white`;
        } else {
          seatClasses = `${baseClasses} bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200`;
        }

        rowSeats.push(
          <Tooltip key={seatId}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSelectorSeatClick(seatId)}
                onMouseEnter={() => setHoveredSeat(seatId)}
                onMouseLeave={() => setHoveredSeat(null)}
                disabled={isOccupied}
                className={seatClasses + ' !w-8 !h-8 !p-0'}
              >
                {isOccupied ? (
                  <X className="w-4 h-4 text-gray-600" />
                ) : (
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : ''}`}>
                    {seatNumber}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {section.zone || section.name ? `${section.zone || section.name} · ` : ''}
              {`${rowLabel}-${seatNumber}`} · {grade}석 · ₩{(gradePrices[grade] ?? 0).toLocaleString()}
            </TooltipContent>
          </Tooltip>
        );
      }

      nodes.push(
        <div key={rowLabel} className="flex items-center justify-center mb-1">
          <span className={`text-xs font-medium w-8 text-center mr-2 rounded-sm py-0.5 px-1 border border-gray-300 text-black`}>
            {rowLabel}
          </span>
          <div className="flex gap-1">{rowSeats}</div>
        </div>
      );
    }

    return (
      <div key={sectionIndex} className="mb-6">
        {(section.name || section.grade) && (
          <div className="w-full flex justify-center mt-2 mb-4">
            <div className="px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {section.name ?? 'Section'}{section.grade ? ` (${section.grade}석)` : ''}
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center">{nodes}</div>
      </div>
    );
  };

  // Load performance data and schedules on component mount
  useEffect(() => {
    if (performanceId) {
      loadPerformanceData();
    }
  }, [performanceId]);

  const loadPerformanceData = async () => {
    if (!performanceId) {
      console.error("Performance ID is required");
      return;
    }

    console.log("Loading performance data for ID:", performanceId);
    setLoading(true);
    try {
      // Load performance details
      console.log("Fetching performance details...");
      const performanceData = await serverAPI.getPerformanceById(
        performanceId
      );
      console.log("Performance data:", performanceData);
      setPerformance(performanceData as unknown as PerformanceResponse);

      // Try resolve venueId from performance or venue list
      try {
        const maybeVenueId = (performanceData as any).venue_id ?? (performanceData as any).venueId;
        if (maybeVenueId) {
          setVenueId(Number(maybeVenueId));
        } else if ((performanceData as any).venue || (performanceData as any).venue_name) {
          const venueName = (performanceData as any).venue || (performanceData as any).venue_name;
          const venues = await services.venue.getAllVenues();
          const matched = venues.find((v: any) => v.venueName === venueName);
          if (matched?.venueId) setVenueId(matched.venueId);
        }
      } catch (e) {
        console.warn("Failed to resolve venueId", e);
      }

      // Load schedules for this performance
      console.log("Fetching performance schedules...");
      try {
        const schedulesData = await serverAPI.getPerformanceSchedules(
          performanceId
        );
        console.log("Schedules data received:", schedulesData);
        console.log("Individual schedules:", schedulesData.schedules);
        setSchedules(schedulesData.schedules || []);
      } catch (scheduleError: any) {
        console.error("Failed to load schedules:", scheduleError);

        // Check if performance data already includes schedules
        if (performanceData.schedules && performanceData.schedules.length > 0) {
          console.log(
            "Using schedules from performance data:",
            performanceData.schedules
          );
          setSchedules(performanceData.schedules as unknown as ScheduleResponse[]);
        } else {
          console.log("No schedules available");
          setSchedules([]);
          alert(
            "스케줄 정보를 불러올 수 없습니다. 서버에서 문제가 발생했습니다."
          );
        }
      }
    } catch (error: any) {
      console.error("Failed to load performance data:", error);

      // Show specific error message if available
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "공연 정보를 불러올 수 없습니다.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const SEAT_ZONE_SEPARATOR = "::";

  const buildSeatCode = ({
    zone,
    rowLabel,
    seatNumber,
  }: {
    zone?: string | null;
    rowLabel: string;
    seatNumber: string | number;
  }) => {
    const normalizedRow = String(rowLabel).trim();
    const normalizedSeat = String(seatNumber).trim();
    const zoneKey = normalizeZoneValue(zone);
    const base = `${normalizedRow}-${normalizedSeat}`;
    return zoneKey ? `${zoneKey}${SEAT_ZONE_SEPARATOR}${base}` : base;
  };

  const parseSeatCode = (code: string) => {
    const raw = String(code ?? "");
    const sepIndex = raw.indexOf(SEAT_ZONE_SEPARATOR);
    let zone: string | undefined;
    let remainder = raw;
    if (sepIndex >= 0) {
      zone = raw.slice(0, sepIndex).trim() || undefined;
      remainder = raw.slice(sepIndex + SEAT_ZONE_SEPARATOR.length);
    }
    const [rowLabelRaw = "", seatRaw = ""] = remainder.split("-");
    return {
      zone,
      rowLabel: rowLabelRaw.trim(),
      seatNumber: seatRaw.trim(),
    };
  };

  const normalizeSeatCode = (row: string | number, num: string | number, zone?: string | null) => {
    const rawRow = String(row).trim().toUpperCase();
    const letters = rawRow.match(/[A-Z]+/g);
    const digitsInRow = rawRow.match(/\d+/g);
    // Prefer the last letter group as the row label (e.g., "VIP-A" -> "A", "ROW A" -> "A")
    const rowLabel = letters && letters.length > 0 ? letters[letters.length - 1] : (digitsInRow ? String(parseInt(digitsInRow[0], 10)) : rawRow);

    const rawNum = String(num).trim();
    const parsed = parseInt(rawNum, 10);
    const numLabel = isNaN(parsed) ? rawNum : String(parsed);
    return buildSeatCode({ zone, rowLabel, seatNumber: numLabel });
  };

  const loadSeats = async (scheduleId: number) => {
    console.log("loadSeats called with scheduleId:", scheduleId);
    setLoading(true);
    try {
      // Clear any previous selection when loading seats for a new schedule
      resetSelection();
      // Get seat availability for the selected schedule
      console.log("Fetching seats for schedule:", scheduleId);
      const seatResponse = await services.seat.getScheduleSeats(scheduleId);
      console.log("Seat response received:", seatResponse);
      setSeats(seatResponse.data.seats);
      // Build occupied code set for seat map selector
      try {
        const occ = new Set<string>();
        for (const s of seatResponse.data.seats) {
          const status = s.status?.toString().toUpperCase();
          if (status && status !== "AVAILABLE") {
            occ.add(normalizeSeatCode(s.seatRow, s.seatNumber, s.seatZone));
          }
        }
        setOccupiedSeatCodes(occ);
      } catch (e) {
        console.warn("Failed to compute occupied seats", e);
        setOccupiedSeatCodes(new Set());
      }
      console.log("Setting booking step to seats");
      setBookingStep("seats");
    } catch (error) {
      console.error("Failed to load seats:", error);
      alert("좌석 정보를 불러올 수 없습니다: " + (error as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSelect = (scheduleId: string) => {
    console.log("handleScheduleSelect called with:", scheduleId);
    const id = parseInt(scheduleId);
    console.log("Parsed schedule ID:", id);
    resetSelection();
    setSelectedSchedule(id);
    loadSeats(id);
  };

  const handleSeatClick = useCallback(
    (seatId: number) => {
      console.log("=== Seat Click Debug ===");
      console.log("Clicked seat ID:", seatId);

      const seat = seats.find((s) => s.seatId === seatId);
      console.log("Found seat:", seat);

      if (!seat) {
        console.log("Seat not found!");
        return;
      }

      console.log("Seat status:", seat.status);
      if (seat.status !== "AVAILABLE") {
        console.log("Seat not available, status:", seat.status);
        return;
      }

      setSelectedSeats((prev: number[]) => {
        console.log("Current selected seats:", prev);
        console.log("Prev length:", prev.length);

        if (prev.includes(seatId)) {
          console.log("Removing seat from selection");
          const newSelection = prev.filter((id: number) => id !== seatId);
          console.log("New selection after removal:", newSelection);
          return newSelection;
        } else {
          if (prev.length < 4) {
            console.log("Adding seat to selection");
            const newSelection = [...prev, seatId];
            console.log("New selection after addition:", newSelection);
            return newSelection;
          } else {
            console.log("Maximum seats (4) already selected");
            // 사용자에게 알림 표시 (너무 자주 뜨지 않도록 조건부)
            if (prev.length === 4) {
              alert("최대 4개의 좌석까지만 선택할 수 있습니다.");
            }
            return prev;
          }
        }
      });
    },
    [seats]
  );

  // Keep selectedSeatIdsFromSelector in sync when seat list or codes change
  useEffect(() => {
    if (!selectedSeatCodes || selectedSeatCodes.length === 0 || seats.length === 0) return;
    const map = new Map<string, number>();
    seats.forEach((s) => map.set(seatToCode(s), s.seatId));
    const ids = selectedSeatCodes
      .map((code) => {
        const direct = map.get(String(code));
        if (typeof direct === 'number') return direct;
        const parsed = parseSeatCode(String(code));
        return map.get(normalizeSeatCode(parsed.rowLabel, parsed.seatNumber, parsed.zone));
      })
      .filter((v): v is number => typeof v === 'number');
    setSelectedSeatIdsFromSelector(ids);
  }, [selectedSeatCodes, seats, seatToCode]);

  const totalPrice = useMemo(() => {
    // Prefer selectorTotal if using new selector
    if (selectedSeatCodes.length > 0) return selectorTotal;
    if (selectedSeats.length > 0) {
      return selectedSeats.reduce((total: number, seatId: number) => {
        const seat = seats.find((s: SeatDto) => s.seatId === seatId);
        return total + (seat?.price || 0);
      }, 0);
    }
    return 0;
  }, [selectedSeats, selectedSeatCodes, selectorTotal, seats]);

  // 좌석 데이터에서 동적으로 행 추출 및 정렬
  const seatRows = useMemo(() => {
    if (!seats || seats.length === 0) return [];

    // 모든 고유한 행을 추출
    const uniqueRows = [
      ...new Set(seats.map((seat: SeatDto) => String(seat.seatRow))),
    ];

    // 행을 알파벳 순으로 정렬 (A, B, C, D... 또는 1, 2, 3, 4...)
    return uniqueRows.sort((a, b) => {
      // 숫자인지 문자인지 확인
      const aIsNumber = !isNaN(Number(a));
      const bIsNumber = !isNaN(Number(b));

      if (aIsNumber && bIsNumber) {
        return Number(a) - Number(b);
      } else {
        return String(a).localeCompare(String(b));
      }
    });
  }, [seats]);

  // 각 행의 좌석을 번호순으로 정렬
  const getSortedSeatsForRow = useCallback(
    (row: string) => {
      return seats
        .filter((seat) => seat.seatRow === row)
        .sort((a: SeatDto, b: SeatDto) => {
          // 좌석 번호가 숫자인지 문자인지 확인
          const aIsNumber = !isNaN(Number(a.seatNumber));
          const bIsNumber = !isNaN(Number(b.seatNumber));

          if (aIsNumber && bIsNumber) {
            return Number(a.seatNumber) - Number(b.seatNumber);
          } else {
            return a.seatNumber.localeCompare(b.seatNumber);
          }
        });
    },
    [seats]
  );

  const handleBooking = useCallback(async () => {
    if (!selectedSchedule) return;

    // 토큰 확인 디버깅
    const token = localStorage.getItem("authToken");
    console.log("=== 예약 요청 디버깅 ===");
    console.log("저장된 토큰:", token ? "있음" : "없음");
    console.log("토큰 길이:", token?.length || 0);
    console.log("선택된 스케줄:", selectedSchedule);
    console.log("선택된 좌석 seatIds:", selectedSeats);
    console.log("선택된 좌석 seatCodes:", selectedSeatCodes);

    if (!token) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      return;
    }

    setLoading(true);
    try {
      // Build booking seats from selected seat codes and seatMap sections
      if (!seatMap || !Array.isArray(seatMap.sections) || seatMap.sections.length === 0) {
        alert('좌석 지도가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      const codes = selectedSeatCodes.length > 0
        ? selectedSeatCodes
        : Array.from(selectorSelectedCodes);
      if (codes.length === 0) {
        alert('좌석을 선택해주세요.');
        return;
      }

      // Prefer zone/grade from backend seats if available to avoid section overlap issues
      const codeToSeat = new Map<string, SeatDto>();
      seats.forEach((s) => codeToSeat.set(seatToCode(s), s));

      const seatsPayload = codes.map((code) => {
        const parsed = parseSeatCode(String(code));
        const fromSeat = codeToSeat.get(code);
        const rowLabel = parsed.rowLabel || '';
        const colNumStr = parsed.seatNumber || '';
        const zoneFromSeat = fromSeat?.seatZone;
        return {
          grade: String(fromSeat?.seatGrade ?? ''),
          zone: String(zoneFromSeat ?? parsed.zone ?? ''),
          rowLabel,
          colNum: colNumStr,
        };
      });

      const queueToken = localStorage.getItem('queueToken') || undefined;
      const bookingRequest: CreateBookingRequestDto = {
        scheduleId: selectedSchedule,
        seats: seatsPayload,
        queueToken,
      };

      console.log("예약 요청 데이터:", bookingRequest);
      const bookingResponse = await services.booking.createBooking(bookingRequest);
      console.log("예약 응답:", bookingResponse);

      const confirmedBooking = bookingResponse;

      // Remove any pending expiration overrides for this booking now that it is confirmed
      try {
        if (confirmedBooking.bookingNumber) {
          const key = 'bookingExpiresOverrides';
          const raw = localStorage.getItem(key);
          if (raw) {
            const map = JSON.parse(raw);
            if (map && typeof map === 'object' && confirmedBooking.bookingNumber in map) {
              delete map[confirmedBooking.bookingNumber];
              localStorage.setItem(key, JSON.stringify(map));
            }
          }
        }
      } catch (e) {
        console.warn('Failed to clear booking expiration override', e);
      }

      // Persist selected seat codes for this booking (for display when backend doesn't return seatCodes)
      try {
        if (confirmedBooking.bookingNumber) {
          const key = 'bookingSeatCodes';
          const raw = localStorage.getItem(key);
          const map = raw ? JSON.parse(raw) : {};
          const codesToPersist = (selectedSeatCodes.length > 0
            ? selectedSeatCodes
            : Array.from(selectorSelectedCodes)) as string[];
          if (Array.isArray(codesToPersist) && codesToPersist.length > 0) {
            map[confirmedBooking.bookingNumber] = codesToPersist;
            localStorage.setItem(key, JSON.stringify(map));
          }
        }
      } catch (e) {
        console.warn('Failed to persist booking seat codes', e);
      }

      alert(`Booking confirmed! Booking number: ${confirmedBooking.bookingNumber}`);
      // Clear current selection after booking completes
      resetSelection();
      onComplete();
    } catch (error) {
      console.error("Failed to create booking:", error);
      alert("Booking failed. Please try again.");

      // Clear any stale seat selections before prompting the user again
      resetSelection();

      // 예약 실패 시 좌석 상태를 다시 조회하여 최신 상태로 업데이트
      console.log("예약 실패로 인한 좌석 상태 재조회 시작...");
      try {
        const seatResponse = await services.seat.getScheduleSeats(selectedSchedule);
        console.log("좌석 상태 재조회 완료:", seatResponse);
        setSeats(seatResponse.data.seats);
      } catch (refreshError) {
        console.error("좌석 상태 재조회 실패:", refreshError);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSchedule, selectedSeatCodes, selectorSelectedCodes, seatMap, resolveSeatGrade, findSectionForSeat, onComplete]);


  // Early return if performanceId is invalid
  if (!performanceId || isNaN(performanceId)) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Invalid performance ID</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && !performance) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!performance) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Performance not found</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (bookingStep === "schedule") {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <CardTitle>{performance.title}</CardTitle>
              <p className="text-muted-foreground">{performance.venue}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3>Select a Show Time</h3>
            {schedules.length === 0 ? (
              <p className="text-center text-muted-foreground">
                스케줄을 불러오는 중이거나 사용 가능한 스케줄이 없습니다.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                총 {schedules.length}개의 스케줄이 있습니다.
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {schedules.map((schedule) => (
                <Card
                  key={schedule.scheduleId}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    console.log("=== Schedule Card Clicked ===");
                    console.log("Schedule object:", schedule);
                    console.log("Schedule ID:", schedule.scheduleId);
                    console.log("Schedule status:", schedule.status);
                    console.log("Available seats:", schedule.availableSeats);

                    // Try to proceed regardless of status for debugging
                    console.log("Attempting to select schedule...");
                    handleScheduleSelect(schedule.scheduleId.toString());
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(schedule.showDatetime).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(schedule.showDatetime).toLocaleTimeString(
                            "ko-KR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            schedule.status === "AVAILABLE" ||
                            schedule.status === "OPEN" ||
                            schedule.availableSeats > 0
                              ? "default"
                              : "destructive"
                          }
                        >
                          {schedule.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Users className="w-3 h-3 inline mr-1" />
                          {schedule.availableSeats}/{schedule.totalSeats}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setBookingStep("schedule")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <CardTitle>{performance.title}</CardTitle>
              <p className="text-muted-foreground">{performance.venue}</p>
            </div>
          </div>
          {/* Time display removed as requested 
          {selectedSeats.length > 0 && (
            <div className="text-right">
              <Badge variant="destructive">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
              <p className="text-xs text-muted-foreground">Time remaining</p>
            </div>
          )}
          */}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer alert removed as requested
        {selectedSeats.length > 0 && (
          <Alert>
            <AlertDescription>
              Seats are temporarily reserved for 5 minutes. Please complete your booking before the timer expires.
            </AlertDescription>
          </Alert>
        )}
        */}



        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {venueId ? (
              seatMapLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : !seatMap || (seatMap.sections?.length ?? 0) === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  좌석 지도를 불러오지 못했습니다.
                </div>
              ) : (
                <div className="min-h-[60vh] p-6 bg-white">
                  <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                      <div className="flex flex-col lg:flex-row gap-8 p-6">
                        <div className="flex-1">
                          <div className="w-full pb-4 overflow-x-auto overflow-y-auto">
                            <div className="min-w-max">
                              {seatMap.sections.map((section, index) => renderSection(section, index))}
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-6 justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center text-gray-800 text-xs">1</div>
                              <span className="text-sm text-gray-600">선택가능</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-blue-600 border border-blue-600 rounded-md flex items-center justify-center text-white text-xs">2</div>
                              <span className="text-sm text-gray-600">선택됨</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gray-300 border border-gray-400 rounded-md flex items-center justify-center text-gray-600 text-xs">
                                <X className="w-3 h-3" />
                              </div>
                              <span className="text-sm text-gray-600">예매완료</span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:w-80">
                          <Card className="bg-gray-50 rounded-md sticky top-4">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base font-semibold">선택 좌석</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-4">
                              <div>
                                <h3 className="text-xs font-medium text-gray-600 mb-2">좌석 등급 (요금)</h3>
                                <div className="space-y-1">
                                  {(Object.entries(gradePrices) as [string, number][]) .map(([grade, price]) => (
                                    <div key={grade} className="flex items-center justify-between text-xs text-gray-700">
                                      <span className="flex items-center gap-2">
                                        <span className={`inline-block w-3 h-3 rounded-sm ${gradeSwatchClass[grade] ?? 'bg-orange-600'}`} />
                                        {grade}석
                                      </span>
                                      <span className="text-gray-900">₩{Number(price).toLocaleString()}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              <div>
                                <h3 className="text-xs font-medium text-gray-600 mb-2">선택한 좌석</h3>
                                <div className="bg-white rounded border border-gray-200 p-3">
                                  {selectorSelectedCodes.size > 0 ? (
                                    <div className="space-y-2">
                                      {Array.from(selectorSelectedCodes).map((seatId) => {
                                        const grade = resolveSeatGrade(seatId, seatMap?.sections ?? []) || 'A';
                                        const price = gradePrices[grade] ?? 0;
                                        return (
                                          <div key={seatId} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">{seatId} · {grade}석</span>
                                            <span className="text-sm font-medium text-gray-900">₩{price.toLocaleString()}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-10">
                                      <p className="text-gray-400 text-sm">좌석을 선택해주세요</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">총 금액</span>
                                  <span className="text-lg font-semibold text-blue-600">₩{selectorTotal.toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  disabled={selectorSelectedCodes.size === 0 || loading}
                                  onClick={handleBooking}
                                  className="flex-1 py-5 text-base font-semibold bg-blue-600 text-white"
                                >
                                  예매하기
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={resetSelection}
                                  className="flex-1"
                                >
                                  초기화
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center text-muted-foreground py-8">
                공연장의 좌석 지도를 불러오는 중입니다...
              </div>
            )}
          </div>

        )}
      </CardContent>
    </Card>
  );
}
