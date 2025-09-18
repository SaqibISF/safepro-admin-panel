"use client";

import React, { FC, ReactNode, useId, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { LabelProps } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const DateRangePicker: FC<{
  label?: ReactNode;
  labelProps?: LabelProps;
  dateRange?: DateRange;
  setDateRange?: (dateRange: DateRange | undefined) => void;
}> = ({ label, labelProps, dateRange, setDateRange }) => {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <Label
          htmlFor={id}
          className={cn("px-1", labelProps?.className)}
          {...labelProps}
        >
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            className="w-fit"
          >
            {dateRange
              ? `${dateRange.from?.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString()}`
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            captionLayout="dropdown"
            numberOfMonths={2}
            onSelect={(dateRange) => {
              if (setDateRange) {
                setDateRange(dateRange);
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
