// Optimized image component with lazy loading

"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function LazyImage({ src, alt, width, height, className, priority = false }: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && <Skeleton className="absolute inset-0" />}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100", className)}
        onLoad={() => setIsLoading(false)}
        priority={priority}
      />
    </div>
  )
}
