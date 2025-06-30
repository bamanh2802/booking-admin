"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { vi } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [time, setTime] = React.useState({
    hours: date ? date.getHours() : 0,
    minutes: date ? date.getMinutes() : 0,
  });

  // Cập nhật state nội bộ khi prop `date` thay đổi từ bên ngoài
  React.useEffect(() => {
    if (date) {
      setTime({
        hours: date.getHours(),
        minutes: date.getMinutes(),
      });
    }
  }, [date]);

  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) {
      setDate(undefined);
      return;
    }
    const newDate = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate(),
      time.hours,
      time.minutes
    );
    setDate(newDate);
  };

  const handleTimeChange = (part: "hours" | "minutes", value: number) => {
    const newTime = { ...time, [part]: value };
    setTime(newTime);

    if (date) {
      const newDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        newTime.hours,
        newTime.minutes
      );
      setDate(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPPp", { locale: vi }) // Sử dụng format 'PPPp' để hiển thị cả ngày và giờ
          ) : (
            <span>Chọn ngày giờ</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={vi} // Sử dụng locale tiếng Việt cho lịch
        />
        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-center gap-2">
            <div>
              <Label htmlFor="hours" className="text-xs">
                Giờ
              </Label>
              <Input
                id="hours"
                type="number"
                min={0}
                max={23}
                value={String(time.hours).padStart(2, "0")}
                onChange={(e) =>
                  handleTimeChange("hours", parseInt(e.target.value, 10))
                }
                className="w-16 h-8 text-center"
              />
            </div>
            <span>:</span>
            <div>
              <Label htmlFor="minutes" className="text-xs">
                Phút
              </Label>
              <Input
                id="minutes"
                type="number"
                min={0}
                max={59}
                value={String(time.minutes).padStart(2, "0")}
                onChange={(e) =>
                  handleTimeChange("minutes", parseInt(e.target.value, 10))
                }
                className="w-16 h-8 text-center"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
