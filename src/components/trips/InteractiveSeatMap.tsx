"use client";

import { Armchair } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seat } from "@/types/trip";

interface InteractiveSeatMapProps {
  allSeats: Seat[];
  bookedSeats: Seat[];
  selectedSeats: Seat[];
  onSeatToggle: (seat: Seat) => void;
}

export function InteractiveSeatMap({
  allSeats,
  bookedSeats,
  selectedSeats,
  onSeatToggle,
}: InteractiveSeatMapProps) {
  const bookedSeatCodes = new Set(bookedSeats.map((s) => s.code));
  const selectedSeatCodes = new Set(selectedSeats.map((s) => s.code));

  const renderFloor = (floorNumber: number) => {
    const floorSeats = allSeats
      .filter((s) => s.floor === floorNumber)
      .sort((a, b) => a.code.localeCompare(b.code));
      
    if (floorSeats.length === 0) return null;

    return (
      <div key={floorNumber}>
        <h5 className="font-semibold mb-3 text-sm">Tầng {floorNumber}</h5>
        <div className="grid grid-cols-5 gap-2">
          {floorSeats.map((seat) => {
            const isBooked = bookedSeatCodes.has(seat.code);
            const isSelected = selectedSeatCodes.has(seat.code);
            
            return (
              <button
                type="button" // Quan trọng để không submit form
                key={seat.code}
                onClick={() => !isBooked && onSeatToggle(seat)}
                disabled={isBooked}
                className={cn(
                  "flex flex-col items-center justify-center p-1 rounded-md border text-xs text-center transition-colors",
                  isBooked && "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
                  isSelected && "bg-primary text-primary-foreground border-primary",
                  !isBooked && !isSelected && "bg-accent text-accent-foreground hover:bg-primary/20"
                )}
                title={isBooked ? "Ghế đã đặt" : isSelected ? "Bỏ chọn" : `Chọn ghế ${seat.code}`}
              >
                <Armchair className="h-4 w-4 mb-1" />
                <span>{seat.code}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderFloor(1)}
      {renderFloor(2)}
    </div>
  );
}