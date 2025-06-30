"use client";

import { Armchair, Users, Building, Calendar, MapPin, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TripDetails as TripDetailsType, Seat } from "@/types/trip";

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="h-5 w-5 text-muted-foreground mt-1" />
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

// Component để hiển thị sơ đồ ghế
const SeatMapView = ({
  allSeats,
  bookedSeats,
}: {
  allSeats: Seat[];
  bookedSeats: Seat[];
}) => {
  const bookedSeatCodes = new Set(bookedSeats.map((s) => s.code));

  const renderFloor = (floorNumber: number) => {
    const floorSeats = allSeats
      .filter((s) => s.floor === floorNumber)
      .sort((a, b) => a.code.localeCompare(b.code));
    if (floorSeats.length === 0) return null;

    return (
      <div key={floorNumber}>
        <h5 className="font-semibold mb-3">Tầng {floorNumber}</h5>
        <div className="grid grid-cols-5 gap-2">
          {floorSeats.map((seat) => {
            const isBooked = bookedSeatCodes.has(seat.code);
            return (
              <div
                key={seat.code}
                className={cn(
                  "flex flex-col items-center justify-center p-1 rounded-md border text-xs text-center",
                  isBooked
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground"
                )}
                title={isBooked ? "Ghế đã đặt" : "Ghế trống"}
              >
                <Armchair className="h-4 w-4 mb-1" />
                <span>{seat.code}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderFloor(1)}
      {renderFloor(2)}
    </div>
  );
};

export function TripDetails({ trip }: { trip: TripDetailsType | null }) {
  if (!trip) return null;

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("vi-VN");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <DetailRow
            icon={Building}
            label="Nhà xe"
            value={trip.carCompanyInfo.name}
          />
          <DetailRow
            icon={MapPin}
            label="Tuyến đường"
            value={`${trip.startLocation} → ${trip.endLocation}`}
          />
          <DetailRow
            icon={Calendar}
            label="Thời gian"
            value={`${formatDateTime(trip.startTime)} - ${formatDateTime(
              trip.endTime
            )}`}
          />
          <DetailRow
            icon={Tag}
            label="Giá vé"
            value={new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(trip.price)}
          />
          <DetailRow
            icon={Users}
            label="Tình trạng ghế"
            value={`${trip.bookedSeats.totalBookedSeats} / ${trip.totalSeats} ghế đã đặt`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sơ đồ ghế</CardTitle>
        </CardHeader>
        <CardContent>
          <SeatMapView
            allSeats={trip.carCompanyInfo.seatMap}
            bookedSeats={trip.bookedSeats.seats}
          />
        </CardContent>
      </Card>
    </div>
  );
}
