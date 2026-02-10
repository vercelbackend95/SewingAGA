"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type CarouselEvent = "select"

type CarouselOptions = {
  breakpoints?: Record<string, { dragFree?: boolean }>
}

export interface CarouselApi {
  canScrollPrev: () => boolean
  canScrollNext: () => boolean
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  selectedScrollSnap: () => number
  on: (event: CarouselEvent, callback: () => void) => void
  off: (event: CarouselEvent, callback: () => void) => void
}

type CarouselContextValue = {
  containerRef: React.RefObject<HTMLDivElement | null>
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarouselContext() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("Carousel components must be used within <Carousel />")
  }

  return context
}

function createCarouselApi(container: HTMLDivElement) {
  const listeners = new Set<() => void>()

  const emitSelect = () => {
    listeners.forEach((listener) => listener())
  }

  const getSlides = () =>
    Array.from(container.querySelectorAll<HTMLElement>("[data-carousel-item='true']"))

  const selectedScrollSnap = () => {
    const slides = getSlides()
    if (!slides.length) {
      return 0
    }

    const containerLeft = container.scrollLeft
    const closestIndex = slides.reduce(
      (closest, slide, index) => {
        const distance = Math.abs(slide.offsetLeft - containerLeft)
        if (distance < closest.distance) {
          return { index, distance }
        }
        return closest
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    )

    return closestIndex.index
  }

  const canScrollPrev = () => container.scrollLeft > 0

  const canScrollNext = () => {
    const max = container.scrollWidth - container.clientWidth
    return container.scrollLeft < max - 1
  }

  const scrollTo = (index: number) => {
    const slide = getSlides()[index]
    if (!slide) {
      return
    }

    container.scrollTo({ left: slide.offsetLeft, behavior: "smooth" })
    setTimeout(emitSelect, 120)
  }

  const scrollByPage = (direction: -1 | 1) => {
    const pageWidth = container.clientWidth
    container.scrollBy({ left: direction * pageWidth, behavior: "smooth" })
    setTimeout(emitSelect, 120)
  }

  container.addEventListener("scroll", emitSelect, { passive: true })

  const api: CarouselApi = {
    canScrollPrev,
    canScrollNext,
    scrollPrev: () => scrollByPage(-1),
    scrollNext: () => scrollByPage(1),
    scrollTo,
    selectedScrollSnap,
    on: (event, callback) => {
      if (event === "select") {
        listeners.add(callback)
      }
    },
    off: (event, callback) => {
      if (event === "select") {
        listeners.delete(callback)
      }
    },
  }

  return {
    api,
    cleanup: () => {
      container.removeEventListener("scroll", emitSelect)
      listeners.clear()
    },
  }
}

function Carousel({
  className,
  setApi,
  children,
}: React.ComponentProps<"div"> & {
  opts?: CarouselOptions
  setApi?: (api: CarouselApi) => void
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const { api, cleanup } = createCarouselApi(containerRef.current)
    setApi?.(api)

    return cleanup
  }, [setApi])

  return (
    <CarouselContext.Provider value={{ containerRef }}>
      <div className={cn("relative", className)}>{children}</div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { containerRef } = useCarouselContext()

  return (
    <div
      ref={containerRef}
      className={cn("flex overflow-x-auto scroll-smooth snap-x snap-mandatory", className)}
      {...props}
    />
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-carousel-item="true"
      className={cn("snap-start shrink-0", className)}
      {...props}
    />
  )
}

export { Carousel, CarouselContent, CarouselItem }
