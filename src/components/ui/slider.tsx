"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  onValueChange?: (value: number[]) => void
}

function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  onValueChange,
}: SliderProps) {
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(
    defaultValue?.[0] ?? min
  )
  const current = controlled ? (value?.[0] ?? min) : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value)
    if (!controlled) setInternalValue(next)
    onValueChange?.([next])
  }

  const percent = max > min ? ((current - min) / (max - min)) * 100 : 0

  return (
    <div className={cn("relative flex w-full touch-none items-center", className)}>
      <div className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
        <div
          className="absolute h-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:pointer-events-none"
      />
      <div
        className="absolute size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] hover:ring-3 focus-visible:ring-3"
        style={{ left: `calc(${percent}% - 6px)` }}
      />
    </div>
  )
}

export { Slider }
