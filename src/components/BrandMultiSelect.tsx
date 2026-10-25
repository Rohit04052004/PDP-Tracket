"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function BrandMultiSelect({
  value,
  onChange,
  options,
  placeholder = "Select brands to compare...",
  maxSelected,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder?: string;
  maxSelected?: number;
}) {
  const [open, setOpen] = useState(false);

  function toggle(brand: string) {
    if (value.includes(brand)) {
      onChange(value.filter((b) => b !== brand));
      return;
    }
    if (maxSelected && value.length >= maxSelected) return;
    onChange([...value, brand]);
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between font-normal sm:w-[280px]"
          )}
        >
          <span className={cn("truncate", value.length === 0 && "text-muted-foreground")}>
            {value.length === 0
              ? placeholder
              : `${value.length} brand${value.length > 1 ? "s" : ""} selected`}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search brands..." />
            <CommandList>
              <CommandEmpty>No matches.</CommandEmpty>
              <CommandGroup>
                {options.map((o) => {
                  const checked = value.includes(o);
                  return (
                    <CommandItem key={o} value={o} onSelect={() => toggle(o)}>
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-sm border",
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        )}
                      >
                        {checked && <Check className="size-3" />}
                      </span>
                      {o}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((b) => (
            <Badge key={b} variant="secondary" className="gap-1 pr-1">
              {b}
              <button
                type="button"
                onClick={() => toggle(b)}
                aria-label={`Remove ${b}`}
                className="rounded-full hover:bg-foreground/10"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
