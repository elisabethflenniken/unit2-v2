// data/types.ts
//
// Entity shapes per DATA.md. Keep this in sync with that doc if the schema changes.

export interface Region {
  id: string
  name: string
  code: string
}

export type CarrierMode = 'truckload' | 'ltl' | 'rail' | 'air' | 'ocean'

export interface Carrier {
  id: string
  name: string
  mode: CarrierMode
}

export type ShipmentStatus = 'in_transit' | 'delivered' | 'delayed' | 'exception'

export interface Shipment {
  id: string
  originRegionId: string
  destRegionId: string
  carrierId: string
  mode: CarrierMode
  shippedAt: string
  promisedDeliveryAt: string
  actualDeliveryAt: string | null
  status: ShipmentStatus
  weightLbs: number
  valueUsd: number
}

export type ExceptionSeverity = 'low' | 'medium' | 'high'
export type ExceptionCategory
  = | 'damage'
    | 'customs_hold'
    | 'weather_delay'
    | 'carrier_delay'
    | 'documentation'
    | 'lost'
export type ExceptionStatus = 'open' | 'resolved'

export interface ExceptionEvent {
  id: string
  shipmentId: string
  regionId: string
  carrierId: string
  raisedAt: string
  severity: ExceptionSeverity
  category: ExceptionCategory
  status: ExceptionStatus
  resolvedAt: string | null
  description: string
}

/** 'all' regionId is the company-wide rollup for that date. */
export interface DailyKpiSnapshot {
  date: string
  regionId: string | 'all'
  shipmentVolume: number
  onTimeRate: number
  openExceptions: number
  avgTransitDays: number
}

export interface GeneratedData {
  regions: Region[]
  carriers: Carrier[]
  shipments: Shipment[]
  exceptions: ExceptionEvent[]
  dailySnapshots: DailyKpiSnapshot[]
  generatedAt: string
}
