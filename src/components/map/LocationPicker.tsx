import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { LocateFixed, Loader2 } from 'lucide-react'
import { useLocale } from '@/i18n'
import { MAP_DEFAULT_CENTER } from '@/constants'
import {
  getTileLayerUrl,
  getTileLayerAttribution,
  isValidAlgeriaLatLng,
  normalizeLatLng,
} from '@/lib/mapHelpers'
import 'leaflet/dist/leaflet.css'

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  onChange: (lat: number, lng: number) => void
  /** Wilaya capital to fly to, e.g. Saida [34.8303, 0.1517]. Leaflet [lat, lng] order. */
  wilayaCenter?: [number, number] | null
  wilayaName?: string
}

function FlyToWilaya({ center }: { center: [number, number] | null }) {
  const map = useMap()
  const key = center ? `${center[0]},${center[1]}` : ''
  useEffect(() => {
    if (!center) return
    // Smooth pan/fly when the user picks a Wilaya.
    map.flyTo(center, 12, { duration: 1.5 })
  }, [map, key]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function ClickToPlace({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const fixed = normalizeLatLng(e.latlng.lat, e.latlng.lng)
      if (fixed) {
        onChange(fixed.lat, fixed.lng)
      } else {
        onChange(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

const PIN_ICON = L.divIcon({
  className: 'sakan-pin-marker',
  html: `<div style="
    width: 34px; height: 34px; border-radius: 50% 50% 50% 0;
    background: #059669; border: 3px solid #fff;
    transform: rotate(-45deg);
    box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
  "><div style="
    width: 12px; height: 12px; border-radius: 50%; background: #fff;
  "></div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
})

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  wilayaCenter = null,
  wilayaName = '',
}: LocationPickerProps) {
  const { locale } = useLocale()
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)

  const hasPin = typeof latitude === 'number' && typeof longitude === 'number'
  const valid = hasPin && isValidAlgeriaLatLng(latitude, longitude)

  const initialCenter: [number, number] = useMemo(() => {
    if (hasPin && Number.isFinite(latitude!) && Number.isFinite(longitude!)) {
      return [latitude as number, longitude as number]
    }
    if (wilayaCenter) return wilayaCenter
    return MAP_DEFAULT_CENTER
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const initialZoom = hasPin ? 13 : wilayaCenter ? 11 : 6

  const handleGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsError(locale === 'ar' ? 'المتصفح لا يدعم GPS' : 'GPS non supporté')
      return
    }
    setGpsLoading(true)
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const fixed = normalizeLatLng(lat, lng)
        if (fixed) {
          onChange(fixed.lat, fixed.lng)
        } else {
          // Still place the pin, but warn when outside Algeria.
          onChange(lat, lng)
          setGpsError(
            locale === 'ar'
              ? 'موقعك خارج الجزائر — حرّك الدبوس يدويًا'
              : 'Position hors Algérie — ajustez le pin manuellement'
          )
        }
        setGpsLoading(false)
      },
      () => {
        setGpsLoading(false)
        setGpsError(
          locale === 'ar'
            ? 'تعذّر الحصول على الموقع — اسمح بالوصول أو حرّك الدبوس'
            : 'Position indisponible — autorisez l’accès ou déplacez le pin'
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          className="h-[320px] w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            url={getTileLayerUrl()}
            attribution={getTileLayerAttribution()}
          />
          <FlyToWilaya center={wilayaCenter} />
          <ClickToPlace onChange={onChange} />
          {hasPin && (
            <Marker
              position={[latitude as number, longitude as number]}
              icon={PIN_ICON}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker
                  const ll = m.getLatLng()
                  const fixed = normalizeLatLng(ll.lat, ll.lng)
                  if (fixed) onChange(fixed.lat, fixed.lng)
                  else onChange(ll.lat, ll.lng)
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Hidden fields keep the form payload explicit: latitude (18..38), longitude (-9..12) */}
      <input type="hidden" name="latitude" value={hasPin ? String(latitude) : ''} />
      <input type="hidden" name="longitude" value={hasPin ? String(longitude) : ''} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleGps}
          disabled={gpsLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 disabled:opacity-60 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-primary-300"
        >
          {gpsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          {locale === 'ar' ? 'استخدم موقعي الحالي (GPS)' : 'Utiliser ma position (GPS)'}
        </button>
        <p
          className="text-xs text-zinc-500 dark:text-zinc-400"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          {hasPin ? (
            <>
              <span className="font-mono" dir="ltr">
                {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
              </span>
              {!valid && (
                <span className="ml-2 text-amber-600">
                  {locale === 'ar'
                    ? '— خارج الجزائر، تحقق من الإحداثيات'
                    : '— hors Algérie, vérifiez'}
                </span>
              )}
              {wilayaName && (
                <span className="ml-2">
                  {locale === 'ar' ? `— بالقرب من ${wilayaName}` : `— près de ${wilayaName}`}
                </span>
              )}
            </>
          ) : (
            <>
              {locale === 'ar'
                ? 'انقر على الخريطة لوضع الدبوس أو اسحب الدبوس — اختر الولاية أولًا للانتقال إليها'
                : 'Cliquez sur la carte pour placer le pin, ou déplacez-le — choisissez la wilaya pour y voler'}
            </>
          )}
        </p>
      </div>

      {gpsError && (
        <p className="rounded-xl bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          {gpsError}
        </p>
      )}
    </div>
  )
}
