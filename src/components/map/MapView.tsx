import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Pane } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Layers, Maximize2, Pencil, X, Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProperties } from '@/hooks/useProperties'
import { useSearchStore } from '@/stores/searchStore'
import { useLocale } from '@/i18n'
import { getTileLayerUrl, getTileLayerAttribution, createPriceIcon, propertyToMarker } from '@/lib/mapHelpers'
import { filterPropertiesByPolygon } from '@/lib/geoUtils'
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/constants'
import { formatPrice, getOperationLabelFr } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { SaveSearchButton } from '@/components/SaveSearchButton'
import 'leaflet/dist/leaflet.css'
import type { Property } from '@/types'

const DRAWN_POLYGON_KEY = 'sakan-drawn-polygon'

const DRAWING_POLYLINE_STYLE: L.PolylineOptions = {
  color: '#059669',
  weight: 4,
  opacity: 0.9,
  lineCap: 'round',
  lineJoin: 'round',
}

const DRAWING_POLYGON_STYLE: L.PolylineOptions = {
  color: '#059669',
  fillColor: '#10b981',
  fillOpacity: 0.2,
  weight: 3,
  lineCap: 'round',
  lineJoin: 'round',
}

const DRAWING_MARKER_STYLE: L.CircleMarkerOptions = {
  radius: 5,
  color: '#059669',
  fillColor: '#10b981',
  fillOpacity: 1,
  weight: 2,
}

function MapBoundsHandler({ properties }: { properties: Property[] }) {
  const map = useMap()

  useEffect(() => {
    if (properties.length > 0) {
      const bounds = properties.map((p) => [p.latitude, p.longitude] as [number, number])
      if (bounds.length === 1) {
        map.setView(bounds[0], 12)
      } else {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [properties, map])

  return null
}

function DrawingLayer({
  isDrawing,
  currentPoints,
  drawnPolygon,
}: {
  isDrawing: boolean
  currentPoints: L.LatLng[]
  drawnPolygon: L.LatLng[] | null
}) {
  const map = useMap()
  const drawLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!map.getPane('drawingPane')) {
      map.createPane('drawingPane')
      const pane = map.getPane('drawingPane')
      if (pane) {
        pane.style.zIndex = '1000'
        pane.style.pointerEvents = 'none'
      }
    }
    drawLayerRef.current = L.layerGroup().addTo(map)
    return () => {
      if (drawLayerRef.current) {
        map.removeLayer(drawLayerRef.current)
      }
    }
  }, [map])

  useEffect(() => {
    if (!drawLayerRef.current) return
    drawLayerRef.current.clearLayers()

    if (isDrawing && currentPoints.length > 0) {
      if (currentPoints.length > 1) {
        L.polyline(currentPoints, DRAWING_POLYLINE_STYLE).addTo(drawLayerRef.current)
      }
      currentPoints.forEach((p) => {
        L.circleMarker(p, DRAWING_MARKER_STYLE).addTo(drawLayerRef.current!)
      })
    } else if (drawnPolygon && drawnPolygon.length > 2) {
      L.polygon(drawnPolygon, DRAWING_POLYGON_STYLE).addTo(drawLayerRef.current)
    }
  }, [isDrawing, currentPoints, drawnPolygon])

  return null
}

export function MapView() {
  const { filters } = useSearchStore()
  const { properties, loading } = useProperties(filters)
  const { locale, t } = useLocale()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnPolygon, setDrawnPolygon] = useState<L.LatLng[] | null>(null)
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [showResults, setShowResults] = useState(false)

  const [currentPoints, setCurrentPoints] = useState<L.LatLng[]>([])

  const isDrawingRef = useRef(false)
  const currentPointsRef = useRef<L.LatLng[]>([])

  useEffect(() => {
    if (mapRef.current && !mapRef.current.getPane('drawingPane')) {
      mapRef.current.createPane('drawingPane')
      const pane = mapRef.current.getPane('drawingPane')
      if (pane) {
        pane.style.zIndex = '1000'
        pane.style.pointerEvents = 'none'
      }
    }
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAWN_POLYGON_KEY)
      if (saved) {
        const points = JSON.parse(saved) as { lat: number; lng: number }[]
        if (points.length > 2) {
          const latLngs = points.map((p) => L.latLng(p.lat, p.lng))
          setDrawnPolygon(latLngs)
          const filtered = filterPropertiesByPolygon(properties, points)
          setFilteredProperties(filtered)
          setShowResults(true)
        }
      }
    } catch {
      // Ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (drawnPolygon && drawnPolygon.length > 2) {
      const points = drawnPolygon.map((p) => ({ lat: p.lat, lng: p.lng }))
      const filtered = filterPropertiesByPolygon(properties, points)
      setFilteredProperties(filtered)
    }
  }, [properties, drawnPolygon])

  const startDrawing = useCallback(() => {
    if (!mapRef.current) return
    setIsDrawing(true)
    isDrawingRef.current = true
    mapRef.current.dragging.disable()
    mapRef.current.touchZoom.disable()
    mapRef.current.scrollWheelZoom.disable()
    mapRef.current.doubleClickZoom.disable()
    mapRef.current.getContainer().style.cursor = 'crosshair'

    currentPointsRef.current = []
    setCurrentPoints([])
    setDrawnPolygon(null)
    setShowResults(false)
  }, [])

  const stopDrawing = useCallback(() => {
    if (!mapRef.current) return
    setIsDrawing(false)
    isDrawingRef.current = false
    mapRef.current.dragging.enable()
    mapRef.current.touchZoom.enable()
    mapRef.current.scrollWheelZoom.enable()
    mapRef.current.doubleClickZoom.enable()
    mapRef.current.getContainer().style.cursor = ''
  }, [])

  const clearDrawing = useCallback(() => {
    stopDrawing()
    currentPointsRef.current = []
    setCurrentPoints([])
    setDrawnPolygon(null)
    setFilteredProperties([])
    setShowResults(false)
    localStorage.removeItem(DRAWN_POLYGON_KEY)
  }, [stopDrawing])

  const saveDrawing = useCallback(() => {
    if (drawnPolygon) {
      const points = drawnPolygon.map((p) => ({ lat: p.lat, lng: p.lng }))
      localStorage.setItem(DRAWN_POLYGON_KEY, JSON.stringify(points))
    }
  }, [drawnPolygon])

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current || !mapRef.current) return
      const point = mapRef.current.mouseEventToContainerPoint(e)
      const latLng = mapRef.current.containerPointToLatLng(point)
      currentPointsRef.current = [latLng]
      setCurrentPoints([latLng])
      isDrawingRef.current = true
    },
    []
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current || !mapRef.current || currentPointsRef.current.length === 0) return
      const point = mapRef.current.mouseEventToContainerPoint(e)
      const latLng = mapRef.current.containerPointToLatLng(point)
      currentPointsRef.current.push(latLng)
      setCurrentPoints([...currentPointsRef.current])
    },
    []
  )

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current || !mapRef.current) return

    isDrawingRef.current = false
    mapRef.current.dragging.enable()
    mapRef.current.touchZoom.enable()
    mapRef.current.scrollWheelZoom.enable()
    mapRef.current.doubleClickZoom.enable()
    mapRef.current.getContainer().style.cursor = ''
    setIsDrawing(false)

    if (currentPointsRef.current.length > 2) {
      const polygon = [...currentPointsRef.current, currentPointsRef.current[0]]
      setDrawnPolygon(polygon)

      const points = polygon.map((p) => ({ lat: p.lat, lng: p.lng }))
      const filtered = filterPropertiesByPolygon(properties, points)
      setFilteredProperties(filtered)
      setShowResults(true)
    }

    currentPointsRef.current = []
    setCurrentPoints([])
  }, [properties])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        const pointerEvent = { clientX: touch.clientX, clientY: touch.clientY } as PointerEvent
        handlePointerDown(pointerEvent)
      }
    },
    [handlePointerDown]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        const pointerEvent = { clientX: touch.clientX, clientY: touch.clientY } as PointerEvent
        handlePointerMove(pointerEvent)
      }
    },
    [handlePointerMove]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()
      handlePointerUp()
    },
    [handlePointerUp]
  )

  useEffect(() => {
    const container = mapRef.current?.getContainer()
    if (!container) return

    container.addEventListener('pointerdown', handlePointerDown)
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', handlePointerUp)
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', handlePointerUp)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handleTouchStart, handleTouchMove, handleTouchEnd])

  const displayProperties = showResults ? filteredProperties : properties
  const markers = displayProperties.map(propertyToMarker)

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full">
      {/* Map Controls */}
      <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="glass shadow-soft-lg rounded-xl"
          onClick={() => mapRef.current?.setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM)}
          title="Reset view"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="glass shadow-soft-lg rounded-xl"
          title="Change layer"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Draw & Save Search Buttons */}
      {!showResults && (
        <div className="absolute bottom-8 left-1/2 z-[1000] flex -translate-x-1/2 gap-2">
          <Button
            onClick={isDrawing ? stopDrawing : startDrawing}
            className={cn(
              'shadow-soft-lg rounded-xl',
              isDrawing && 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
            )}
          >
            {isDrawing ? (
              <>
                <X className="h-4 w-4" />
                {t.map.cancelDrawing}
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                {t.map.drawSearch}
              </>
            )}
          </Button>
          <SaveSearchButton className="shadow-soft-lg rounded-xl" />
        </div>
      )}

      {/* Drawing instruction banner */}
      {isDrawing && (
        <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 animate-slide-down">
          <div className="glass-strong rounded-xl px-4 py-2 shadow-soft-lg">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {locale === 'ar' ? 'اسحب بإصبعك لتحديد الحي' : 'Glissez pour dessiner la zone'}
            </p>
          </div>
        </div>
      )}

      {/* Results Chip */}
      {showResults && (
        <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 animate-fade-in">
          <div className="glass-strong flex items-center gap-3 rounded-xl px-4 py-2 shadow-soft-lg">
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {filteredProperties.length} {t.map.propertiesFound}
            </span>
            <Button variant="ghost" size="sm" onClick={clearDrawing}>
              <RotateCcw className="h-3.5 w-3.5" />
              {t.map.clearFilter}
            </Button>
            <Button variant="default" size="sm" onClick={saveDrawing}>
              <Save className="h-3.5 w-3.5" />
              {t.map.saveDrawnSearch}
            </Button>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="glass-strong absolute bottom-4 left-4 z-[1000] rounded-xl p-3 shadow-soft-lg">
        <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t.map.title}</p>
        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-primary-600" />
            <span>{t.filters.rent}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-accent-500" />
            <span>{t.property.featured}</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 dark:bg-zinc-900/50">
          <div className="glass-strong rounded-xl p-4 shadow-soft-lg">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.common.loading}</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={MAP_DEFAULT_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          url={getTileLayerUrl()}
          attribution={getTileLayerAttribution()}
        />
        <MapBoundsHandler properties={displayProperties} />

        <Pane name="drawingPane" style={{ zIndex: 1000, pointerEvents: 'none' }}>
          <DrawingLayer
            isDrawing={isDrawing}
            currentPoints={currentPoints}
            drawnPolygon={drawnPolygon}
          />
        </Pane>

        {markers.map((marker) => {
          const property = displayProperties.find((p) => p.id === marker.id)
          if (!property) return null

          const priceText = property.operationType === 'vacation' && property.pricePerNight
            ? `${formatPrice(property.pricePerNight, property.currency)}/n`
            : formatPrice(property.price, property.currency)

          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createPriceIcon(priceText, property.isFeatured)}
              eventHandlers={{
                click: () => setSelectedProperty(property),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="mb-2 h-32 w-full rounded-lg object-cover"
                  />
                  <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {getOperationLabelFr(property.operationType)} • {property.bedrooms} {t.property.bedrooms} • {property.area} {t.property.m2}
                  </p>
                  <p className="mt-1 text-sm font-bold text-primary-600">
                    {priceText}
                    {property.operationType === 'rent' && <span className="text-xs font-normal text-zinc-500"> {t.property.perMonth}</span>}
                    {property.operationType === 'vacation' && <span className="text-xs font-normal text-zinc-500"> {t.property.perNight}</span>}
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => {
                      window.location.href = '/property/' + property.id
                    }}
                  >
                    {t.property.viewDetails}
                  </Button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Selected Property Panel */}
      {selectedProperty && (
        <div className="glass-strong absolute bottom-4 right-4 z-[1000] w-80 rounded-2xl p-4 shadow-soft-xl animate-slide-up">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2">
                {selectedProperty.title}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3 w-3" />
                {selectedProperty.address || selectedProperty.commune}
              </div>
            </div>
            <button
              onClick={() => setSelectedProperty(null)}
              className="ml-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="default">{getOperationLabelFr(selectedProperty.operationType)}</Badge>
            {selectedProperty.isFeatured && <Badge variant="accent">{t.property.featured}</Badge>}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(selectedProperty.price, selectedProperty.currency)}
              {selectedProperty.operationType === 'rent' && <span className="text-xs font-normal text-zinc-500"> {t.property.perMonth}</span>}
            </p>
            <Button size="sm" onClick={() => (window.location.href = `/property/${selectedProperty.id}`)}>
              {t.property.viewDetails}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
