import {
  Activity,
  AlertTriangle,
  Anchor,
  Atom,
  Bell,
  Bot,
  BrainCircuit,
  CloudLightning,
  Copy,
  Crosshair,
  DollarSign,
  Eye,
  Flame,
  Gavel,
  Globe2,
  Layers,
  ListFilter,
  Map as MapIcon,
  Plane,
  Radar,
  RefreshCw,
  Route,
  Satellite,
  Search,
  Share2,
  ShieldAlert,
  Ship,
  SignalHigh,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  WifiOff,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/lib/utils'

type LayerId =
  | 'conflicts'
  | 'military'
  | 'maritime'
  | 'weather'
  | 'nuclear'
  | 'sanctions'
  | 'economic'
  | 'disasters'
  | 'internet'
  | 'cyber'

type Severity = 'critical' | 'high' | 'medium' | 'low'
type TimeRange = '1h' | '24h' | '7d'
type MapMode = 'flat' | 'globe'

interface IntelligenceLayer {
  id: LayerId
  label: string
  shortLabel: string
  icon: LucideIcon
  color: string
  glow: string
  description: string
}

interface IntelligenceEvent {
  id: string
  layer: LayerId
  severity: Severity
  title: string
  location: string
  lat: number
  lon: number
  ageMinutes: number
  source: string
  signal: string
  summary: string
  aiSummary: string
  confidence: number
  impact: number
  relationship: string
  nextWatch: string[]
}

interface MapOverlay {
  id: string
  layer: LayerId
  label: string
  lat: number
  lon: number
  intensity: number
}

const layerCatalog: IntelligenceLayer[] = [
  {
    id: 'conflicts',
    label: 'Conflicts',
    shortLabel: 'Conflict',
    icon: ShieldAlert,
    color: '#fb7185',
    glow: 'shadow-rose-500/35',
    description: 'Hotspots, escalation lines, reported clashes',
  },
  {
    id: 'military',
    label: 'Military',
    shortLabel: 'Military',
    icon: Plane,
    color: '#a78bfa',
    glow: 'shadow-violet-500/35',
    description: 'ISR flights, posture changes, air and naval activity',
  },
  {
    id: 'maritime',
    label: 'Maritime',
    shortLabel: 'Maritime',
    icon: Ship,
    color: '#22d3ee',
    glow: 'shadow-cyan-500/35',
    description: 'AIS anomalies, chokepoints, convoy disruptions',
  },
  {
    id: 'weather',
    label: 'Weather',
    shortLabel: 'Weather',
    icon: CloudLightning,
    color: '#38bdf8',
    glow: 'shadow-sky-500/35',
    description: 'Storms, wind fields, aviation and shipping hazards',
  },
  {
    id: 'nuclear',
    label: 'Nuclear',
    shortLabel: 'Nuclear',
    icon: Atom,
    color: '#facc15',
    glow: 'shadow-yellow-400/35',
    description: 'Nuclear facilities and safety-adjacent incidents',
  },
  {
    id: 'sanctions',
    label: 'Sanctions',
    shortLabel: 'Sanctions',
    icon: Gavel,
    color: '#fb923c',
    glow: 'shadow-orange-500/35',
    description: 'Sanctions, export controls, shipping restrictions',
  },
  {
    id: 'economic',
    label: 'Economic Zones',
    shortLabel: 'Economy',
    icon: DollarSign,
    color: '#34d399',
    glow: 'shadow-emerald-500/35',
    description: 'Market, commodity, port, and corridor exposure',
  },
  {
    id: 'disasters',
    label: 'Natural Disasters',
    shortLabel: 'Disaster',
    icon: Flame,
    color: '#f97316',
    glow: 'shadow-orange-500/35',
    description: 'Earthquakes, fires, floods, and humanitarian impact',
  },
  {
    id: 'internet',
    label: 'Internet Outages',
    shortLabel: 'Internet',
    icon: WifiOff,
    color: '#60a5fa',
    glow: 'shadow-blue-500/35',
    description: 'Connectivity drops, cable risks, traffic anomalies',
  },
  {
    id: 'cyber',
    label: 'Cyber Threats',
    shortLabel: 'Cyber',
    icon: Zap,
    color: '#2dd4bf',
    glow: 'shadow-teal-500/35',
    description: 'Intrusions, malware campaigns, DDoS and hacktivism',
  },
]

const intelligenceEvents: IntelligenceEvent[] = [
  {
    id: 'taiwan-strait-sortie',
    layer: 'military',
    severity: 'critical',
    title: 'Air defense sorties cross median line',
    location: 'Taiwan Strait',
    lat: 24.1,
    lon: 120.8,
    ageMinutes: 18,
    source: 'ADS-B, regional defense ministry, curated RSS',
    signal: '41 aircraft tracks, 9 naval contacts, elevated radar emissions',
    summary: 'Multiple air tracks and naval contacts are clustered around the median line with persistent ISR coverage.',
    aiSummary:
      'The pattern resembles a coercive pressure cycle rather than a short-duration exercise. Risk is concentrated around miscalculation, commercial rerouting, and insurance premium movement over the next 6 to 12 hours.',
    confidence: 92,
    impact: 88,
    relationship: 'Linked to semiconductor freight, regional air corridors, and JPY/TWD volatility.',
    nextWatch: ['Track follow-on NOTAMs', 'Watch insurance desk commentary', 'Compare sortie count to 30-day baseline'],
  },
  {
    id: 'red-sea-convoy',
    layer: 'maritime',
    severity: 'high',
    title: 'Convoy routing shift near Bab el-Mandeb',
    location: 'Red Sea corridor',
    lat: 12.7,
    lon: 43.4,
    ageMinutes: 34,
    source: 'AIS, port bulletins, maritime advisories',
    signal: 'AIS gaps, speed reductions, private security advisories',
    summary: 'Merchant traffic is bunching north of the strait while several vessels broadcast unusual destination updates.',
    aiSummary:
      'Routing behavior indicates a defensive posture by commercial operators. Disruption probability is elevated for container and refined-products traffic if the pattern persists into the next tide cycle.',
    confidence: 87,
    impact: 81,
    relationship: 'Correlates with freight rates, Suez transit timing, and regional military advisories.',
    nextWatch: ['Monitor dark vessel gaps', 'Compare Suez queue length', 'Flag tanker speed changes below 10 knots'],
  },
  {
    id: 'black-sea-isr',
    layer: 'military',
    severity: 'medium',
    title: 'Persistent ISR orbit over Black Sea',
    location: 'Western Black Sea',
    lat: 44.8,
    lon: 31.2,
    ageMinutes: 48,
    source: 'OpenSky, ADS-B Exchange, defense RSS',
    signal: 'High-altitude racetrack pattern, support tanker nearby',
    summary: 'A surveillance aircraft is maintaining an extended orbit with tanker support west of Crimea.',
    aiSummary:
      'The orbit suggests a collection window tied to naval or air defense activity. Operational risk is moderate unless paired with maritime closure notices or missile-warning chatter.',
    confidence: 79,
    impact: 63,
    relationship: 'Adjacent to grain export lanes, regional airspace closures, and naval base monitoring.',
    nextWatch: ['Look for tanker rotation', 'Check Black Sea NAVTEX notices', 'Review port call anomalies'],
  },
  {
    id: 'sahel-internet-drop',
    layer: 'internet',
    severity: 'high',
    title: 'Regional connectivity drop during unrest',
    location: 'Central Sahel',
    lat: 13.5,
    lon: 2.1,
    ageMinutes: 74,
    source: 'Network telemetry, NGO field feeds, local media',
    signal: 'Traffic down 42 percent, mobile ASN degradation',
    summary: 'Traffic telemetry indicates a sustained connectivity drop across several urban centers during protest activity.',
    aiSummary:
      'The outage is likely a compound event involving congestion, power instability, and possible administrative restrictions. Humanitarian coordination and media visibility are the primary exposure points.',
    confidence: 83,
    impact: 77,
    relationship: 'Overlaps with protest reports, fuel shortages, and embassy movement notices.',
    nextWatch: ['Track restoration by ASN', 'Watch embassy advisories', 'Check satellite fire and power data'],
  },
  {
    id: 'north-atlantic-storm',
    layer: 'weather',
    severity: 'medium',
    title: 'Rapidly deepening Atlantic low',
    location: 'North Atlantic',
    lat: 50.2,
    lon: -31.6,
    ageMinutes: 126,
    source: 'Open-Meteo, NOAA bulletins, aviation weather',
    signal: 'Pressure falls, 65 kt gusts, polar jet acceleration',
    summary: 'A storm system is intensifying across key transatlantic air and shipping lanes.',
    aiSummary:
      'The storm is a logistics event more than a geopolitical event. Expect schedule compression at western European airports and higher deviation costs for eastbound shipping lanes.',
    confidence: 89,
    impact: 59,
    relationship: 'Touches transatlantic cargo routes, LNG delivery timing, and aviation delay risk.',
    nextWatch: ['Watch EHAM and EGLL delays', 'Track wave height above 8 m', 'Review LNG arrival slippage'],
  },
  {
    id: 'persian-gulf-sanctions',
    layer: 'sanctions',
    severity: 'high',
    title: 'Sanctions advisory targets tanker network',
    location: 'Persian Gulf',
    lat: 26.4,
    lon: 52.1,
    ageMinutes: 210,
    source: 'Treasury notices, AIS, commodity desks',
    signal: 'New vessel entities, ship-to-ship transfer scrutiny',
    summary: 'A sanctions update identifies vessels and operators active around Gulf transfer points.',
    aiSummary:
      'The advisory may reduce available shadow-fleet capacity and create short-term compliance pauses for brokers. Watch for renamed vessels and insurance withdrawal language.',
    confidence: 85,
    impact: 74,
    relationship: 'Connected to crude benchmarks, freight spreads, and maritime risk scoring.',
    nextWatch: ['Check vessel renames', 'Track STS transfer pauses', 'Watch insurance circulars'],
  },
  {
    id: 'japan-quake-nuclear',
    layer: 'nuclear',
    severity: 'medium',
    title: 'Seismic review near coastal nuclear sites',
    location: 'Honshu coast',
    lat: 37.4,
    lon: 141.0,
    ageMinutes: 292,
    source: 'USGS, national regulator, utility updates',
    signal: 'M5.8 quake, automatic facility inspection protocol',
    summary: 'A moderate quake triggered inspection procedures at coastal energy facilities.',
    aiSummary:
      'Current indicators point to procedural inspection rather than facility damage. Market sensitivity is still elevated because power availability and public confidence can move quickly after seismic events.',
    confidence: 76,
    impact: 52,
    relationship: 'Energy generation, LNG demand, and industrial power continuity.',
    nextWatch: ['Wait for regulator follow-up', 'Check thermal generation mix', 'Review aftershock models'],
  },
  {
    id: 'caucasus-border',
    layer: 'conflicts',
    severity: 'high',
    title: 'Border exchange with artillery indicators',
    location: 'South Caucasus',
    lat: 40.2,
    lon: 46.8,
    ageMinutes: 365,
    source: 'Local media, OSINT imagery, diplomatic statements',
    signal: 'Reported shelling, troop movement, diplomatic calls',
    summary: 'Reports describe a localized exchange near a contested border corridor.',
    aiSummary:
      'The event appears contained but symbolically sensitive. Escalation risk depends on casualty confirmation, social-media amplification, and whether ceasefire observers gain access.',
    confidence: 72,
    impact: 68,
    relationship: 'Linked to pipeline security, corridor diplomacy, and regional power-broker mediation.',
    nextWatch: ['Verify casualty claims', 'Watch mediator statements', 'Monitor rail and pipeline notices'],
  },
  {
    id: 'europe-rail-cyber',
    layer: 'cyber',
    severity: 'critical',
    title: 'Rail operator ransomware spillover',
    location: 'Central Europe',
    lat: 50.0,
    lon: 14.4,
    ageMinutes: 420,
    source: 'CERT bulletins, dark-web tracking, transit status',
    signal: 'Ticketing outage, leaked sample data, OT segmentation alert',
    summary: 'A rail operator reports business-system disruption while threat actors claim access to internal data.',
    aiSummary:
      'The highest risk is cascading scheduling disruption, not immediate safety impact. However, any OT claim should be treated as unverified but urgent until segmentation evidence is published.',
    confidence: 81,
    impact: 83,
    relationship: 'Affects cross-border freight, commuter reliability, and public-sector cyber posture.',
    nextWatch: ['Track CERT indicators', 'Monitor station delays', 'Separate IT outage from OT claims'],
  },
  {
    id: 'panama-drought',
    layer: 'economic',
    severity: 'medium',
    title: 'Canal draft restrictions pressure freight',
    location: 'Panama Canal',
    lat: 9.1,
    lon: -79.7,
    ageMinutes: 620,
    source: 'Canal authority, commodity logistics, weather feeds',
    signal: 'Queue growth, draft adjustments, rainfall deficit',
    summary: 'Drought-linked draft limits are tightening transit planning for selected vessel classes.',
    aiSummary:
      'This is a slow-burn logistics constraint. The near-term signal is queue composition; the strategic signal is whether shippers reprice alternate routes before restrictions ease.',
    confidence: 84,
    impact: 66,
    relationship: 'Commodity flows, LNG cargo timing, and US Gulf to Asia routing.',
    nextWatch: ['Track queue by vessel class', 'Watch rainfall forecast', 'Compare Cape route pricing'],
  },
  {
    id: 'arctic-cable-watch',
    layer: 'internet',
    severity: 'medium',
    title: 'Arctic cable repair window narrows',
    location: 'Norwegian Sea',
    lat: 70.4,
    lon: 16.9,
    ageMinutes: 1810,
    source: 'Telecom operators, maritime weather, cable maps',
    signal: 'Repair vessel delayed, weather window closing',
    summary: 'A cable maintenance vessel is delayed while sea-state forecasts reduce the available repair window.',
    aiSummary:
      'The risk is resilience erosion rather than immediate broad outage. Redundancy is likely sufficient, but latency and reroute costs may rise if the repair slips another weather cycle.',
    confidence: 78,
    impact: 49,
    relationship: 'High-latency reroutes, subsea infrastructure risk, and Arctic maritime weather.',
    nextWatch: ['Track repair vessel AIS', 'Watch wave forecast', 'Check provider route notices'],
  },
  {
    id: 'andes-wildfire',
    layer: 'disasters',
    severity: 'low',
    title: 'Wildfire front nears power corridor',
    location: 'Central Chile',
    lat: -33.2,
    lon: -71.0,
    ageMinutes: 2860,
    source: 'NASA FIRMS, civil defense, grid operator',
    signal: 'Thermal anomalies, evacuation notices, transmission proximity',
    summary: 'Satellite fire detections are expanding toward a transmission corridor outside a major metro area.',
    aiSummary:
      'Local humanitarian impact is the key concern. Grid risk is still low but should be monitored because wind shifts can quickly turn a local fire into a continuity event.',
    confidence: 74,
    impact: 42,
    relationship: 'Electricity transmission, evacuation corridors, and insurance claims.',
    nextWatch: ['Track wind shift', 'Monitor evacuation zone', 'Check grid operator warnings'],
  },
]

const mapOverlays: MapOverlay[] = [
  { id: 'diego-garcia', layer: 'military', label: 'Diego Garcia', lat: -7.3, lon: 72.4, intensity: 74 },
  { id: 'guam', layer: 'military', label: 'Guam posture', lat: 13.4, lon: 144.8, intensity: 81 },
  { id: 'rotterdam', layer: 'economic', label: 'Port congestion', lat: 51.9, lon: 4.5, intensity: 58 },
  { id: 'singapore-route', layer: 'maritime', label: 'Malacca traffic', lat: 1.3, lon: 103.8, intensity: 71 },
  { id: 'gulf-weather', layer: 'weather', label: 'Cyclone watch', lat: 20.6, lon: 63.5, intensity: 64 },
  { id: 'baltic-cable', layer: 'internet', label: 'Cable latency', lat: 58.7, lon: 19.9, intensity: 61 },
  { id: 'levant-cyber', layer: 'cyber', label: 'DDoS campaign', lat: 33.8, lon: 35.5, intensity: 79 },
  { id: 'korean-nuclear', layer: 'nuclear', label: 'Facility watch', lat: 39.8, lon: 125.8, intensity: 67 },
]

const riskTrend = [
  { time: '00', risk: 54, military: 48, cyber: 38 },
  { time: '03', risk: 58, military: 52, cyber: 42 },
  { time: '06', risk: 63, military: 55, cyber: 51 },
  { time: '09', risk: 61, military: 58, cyber: 49 },
  { time: '12', risk: 69, military: 67, cyber: 57 },
  { time: '15', risk: 73, military: 72, cyber: 66 },
  { time: '18', risk: 78, military: 76, cyber: 73 },
  { time: '21', risk: 75, military: 71, cyber: 69 },
]

const rangeMinutes: Record<TimeRange, number> = {
  '1h': 60,
  '24h': 1440,
  '7d': 10080,
}

const severityClasses: Record<Severity, string> = {
  critical: 'border-rose-300 bg-rose-500 text-rose-50',
  high: 'border-orange-300 bg-orange-500 text-orange-50',
  medium: 'border-cyan-300 bg-cyan-500 text-cyan-950',
  low: 'border-emerald-300 bg-emerald-400 text-emerald-950',
}

const severityText: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const allLayerIds = layerCatalog.map((layer) => layer.id)

const layerById = Object.fromEntries(layerCatalog.map((layer) => [layer.id, layer])) as Record<LayerId, IntelligenceLayer>

const parseLayers = (value: string | null): LayerId[] => {
  if (!value) return allLayerIds

  const layers = value
    .split(',')
    .filter((layer): layer is LayerId => allLayerIds.includes(layer as LayerId))

  return layers.length > 0 ? layers : allLayerIds
}

const parseRange = (value: string | null): TimeRange => {
  if (value === '1h' || value === '24h' || value === '7d') return value
  return '24h'
}

const parseMapMode = (value: string | null): MapMode => (value === 'globe' ? 'globe' : 'flat')

const projectPoint = (lon: number, lat: number): { x: number; y: number } => ({
  x: ((lon + 180) / 360) * 100,
  y: ((90 - lat) / 180) * 100,
})

const projectGlobePoint = (lon: number, lat: number): { x: number; y: number } => ({
  x: 50 + (lon / 180) * 38,
  y: 50 - (lat / 90) * 40,
})

const formatAge = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`
  return `${Math.round(minutes / 1440)}d ago`
}

const GlobalMonitorPage = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mapMode, setMapMode] = useState<MapMode>(() => parseMapMode(searchParams.get('mode')))
  const [timeRange, setTimeRange] = useState<TimeRange>(() => parseRange(searchParams.get('range')))
  const [activeLayers, setActiveLayers] = useState<LayerId[]>(() => parseLayers(searchParams.get('layers')))
  const [selectedEventId, setSelectedEventId] = useState<string>(() => searchParams.get('event') ?? 'taiwan-strait-sortie')
  const [feedQuery, setFeedQuery] = useState('')
  const [liveStep, setLiveStep] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => setLiveStep((step) => step + 1), 5000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('mode', mapMode)
    params.set('range', timeRange)
    params.set('layers', activeLayers.join(','))
    params.set('event', selectedEventId)
    setSearchParams(params, { replace: true })
  }, [activeLayers, mapMode, selectedEventId, setSearchParams, timeRange])

  const visibleEvents = useMemo(() => {
    const query = feedQuery.trim().toLowerCase()

    return intelligenceEvents
      .filter((event) => activeLayers.includes(event.layer))
      .filter((event) => event.ageMinutes <= rangeMinutes[timeRange])
      .filter((event) => {
        if (!query) return true
        return [event.title, event.location, event.summary, layerById[event.layer].label].some((value) =>
          value.toLowerCase().includes(query),
        )
      })
      .sort((a, b) => a.ageMinutes - b.ageMinutes)
  }, [activeLayers, feedQuery, timeRange])

  useEffect(() => {
    if (visibleEvents.length > 0 && !visibleEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(visibleEvents[0].id)
    }
  }, [selectedEventId, visibleEvents])

  const selectedEvent =
    intelligenceEvents.find((event) => event.id === selectedEventId) ?? visibleEvents[0] ?? intelligenceEvents[0]

  const liveEvent = visibleEvents[liveStep % Math.max(visibleEvents.length, 1)] ?? intelligenceEvents[0]

  const stats = useMemo(() => {
    const critical = visibleEvents.filter((event) => event.severity === 'critical').length
    const high = visibleEvents.filter((event) => event.severity === 'high').length
    const impactAverage = Math.round(
      visibleEvents.reduce((total, event) => total + event.impact, 0) / Math.max(visibleEvents.length, 1),
    )

    return [
      { label: 'Active events', value: visibleEvents.length.toString(), icon: Radar, trend: '+12%' },
      { label: 'Critical alerts', value: critical.toString(), icon: AlertTriangle, trend: `${high} high` },
      { label: 'Risk index', value: impactAverage.toString(), icon: GaugeIcon, trend: 'Global' },
      { label: 'Feeds online', value: '184', icon: SignalHigh, trend: '3.1s lag' },
    ]
  }, [visibleEvents])

  const activeOverlayCount = mapOverlays.filter((overlay) => activeLayers.includes(overlay.layer)).length

  const toggleLayer = (layerId: LayerId): void => {
    setActiveLayers((current) => {
      if (current.includes(layerId)) return current.filter((layer) => layer !== layerId)

      return [...current, layerId].sort((a, b) => allLayerIds.indexOf(a) - allLayerIds.indexOf(b))
    })
  }

  const handleShare = async (): Promise<void> => {
    await navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="global-monitor-shell relative min-h-screen overflow-hidden bg-[#05070a] text-slate-100">
      <div className="intelligence-grid pointer-events-none fixed inset-0 opacity-80" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_78%_10%,rgba(248,113,113,0.12),transparent_30%),linear-gradient(180deg,rgba(6,10,18,0.36),rgba(3,5,10,0.94))]" />
      <div className="scanline pointer-events-none fixed inset-0 z-10 opacity-30" />

      <header className="relative z-20 border-b border-white/10 bg-slate-950/75 px-3 py-3 backdrop-blur-xl lg:px-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 shadow-lg shadow-cyan-500/20">
              <Satellite className="h-5 w-5 text-cyan-200" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-semibold leading-6 text-white sm:text-lg">Aegis Global Monitor</h1>
                <span className="rounded border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Live ops
                </span>
              </div>
              <p className="truncate text-xs text-slate-400">
                Real-time geopolitical, military, maritime, weather, cyber, and infrastructure intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:max-w-[42rem] xl:pb-0">
            {layerCatalog.map((layer) => {
              const Icon = layer.icon
              const isActive = activeLayers.includes(layer.id)

              return (
                <button
                  className={cn(
                    'group inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition',
                    isActive
                      ? 'border-white/20 bg-white/[0.12] text-white shadow-lg'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-100',
                  )}
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  style={isActive ? { boxShadow: `0 0 24px ${layer.color}28` } : undefined}
                  title={layer.description}
                  type="button"
                >
                  <Icon className="h-4 w-4" style={{ color: isActive ? layer.color : undefined }} aria-hidden="true" />
                  {layer.shortLabel}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-2 xl:justify-end">
            <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1">
              {(['flat', 'globe'] as MapMode[]).map((mode) => {
                const Icon = mode === 'flat' ? MapIcon : Globe2

                return (
                  <button
                    className={cn(
                      'inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-semibold capitalize transition',
                      mapMode === mode ? 'bg-cyan-300 text-slate-950' : 'text-slate-400 hover:text-white',
                    )}
                    key={mode}
                    onClick={() => setMapMode(mode)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {mode}
                  </button>
                )
              })}
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.08] px-3 text-xs font-semibold text-slate-100 transition hover:border-cyan-200/30 hover:bg-cyan-300/10"
              onClick={handleShare}
              type="button"
            >
              {copied ? <Copy className="h-4 w-4 text-emerald-200" /> : <Share2 className="h-4 w-4" />}
              {copied ? 'Copied' : 'Share'}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-20 grid min-h-[calc(100vh-4.8rem)] grid-cols-1 gap-3 p-3 lg:h-[calc(100vh-4.8rem)] lg:min-h-0 lg:grid-cols-[21rem_minmax(0,1fr)_23rem] lg:p-4">
        <aside className="order-2 flex min-h-[28rem] flex-col rounded-lg border border-white/10 bg-slate-950/72 shadow-2xl shadow-black/30 backdrop-blur-xl lg:order-1 lg:h-full lg:min-h-0">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Intelligence feed</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Live global events</h2>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-emerald-300/30 bg-emerald-300/10">
                <Activity className="h-4 w-4 text-emerald-200" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-black/[0.35] px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                onChange={(event) => setFeedQuery(event.target.value)}
                placeholder="Search region, signal, or layer"
                value={feedQuery}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['1h', '24h', '7d'] as TimeRange[]).map((range) => (
                <button
                  className={cn(
                    'h-9 rounded-md border text-xs font-semibold transition',
                    timeRange === range
                      ? 'border-cyan-200/50 bg-cyan-300 text-slate-950'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white',
                  )}
                  key={range}
                  onClick={() => setTimeRange(range)}
                  type="button"
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {visibleEvents.length > 0 ? (
              <div className="space-y-2">
                {visibleEvents.map((event) => {
                  const layer = layerById[event.layer]
                  const Icon = layer.icon
                  const isSelected = event.id === selectedEvent.id

                  return (
                    <button
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition',
                        isSelected
                          ? 'border-cyan-200/40 bg-cyan-300/10 shadow-lg shadow-cyan-500/10'
                          : 'border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.075]',
                      )}
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      type="button"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/30"
                          style={{ color: layer.color }}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-white">{event.title}</p>
                            <span
                              className={cn(
                                'shrink-0 rounded border px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide',
                                severityClasses[event.severity],
                              )}
                            >
                              {severityText[event.severity]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">{event.location}</p>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{event.summary}</p>
                          <div className="mt-3 flex items-center justify-between text-[0.68rem] text-slate-500">
                            <span>{formatAge(event.ageMinutes + liveStep)}</span>
                            <span>{event.confidence}% confidence</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
                <ListFilter className="h-8 w-8 text-slate-500" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-white">No events in this view</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Enable more layers or widen the time range.</p>
              </div>
            )}
          </div>
        </aside>

        <section className="order-1 min-h-[34rem] overflow-hidden rounded-lg border border-cyan-200/15 bg-[#070b12]/90 shadow-2xl shadow-cyan-950/20 lg:order-2 lg:h-full lg:min-h-0">
          <div className="relative h-full min-h-[34rem]">
            <div className="absolute left-4 top-4 z-20 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    className="min-w-[7.7rem] rounded-lg border border-white/10 bg-black/[0.45] px-3 py-2.5 shadow-xl shadow-black/20 backdrop-blur"
                    key={item.label}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.label}
                      </p>
                      <Icon className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
                    </div>
                    <div className="mt-1 flex items-end justify-between gap-3">
                      <p className="text-xl font-semibold text-white">{item.value}</p>
                      <p className="text-[0.67rem] text-emerald-200">{item.trend}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="absolute right-4 top-4 z-20 hidden rounded-lg border border-white/10 bg-black/[0.45] p-3 shadow-xl shadow-black/20 backdrop-blur 2xl:block">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-100">
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                Streaming update
              </div>
              <p className="mt-1 max-w-[17rem] text-xs text-slate-400">{liveEvent.title}</p>
            </div>

            {mapMode === 'flat' ? (
              <FlatWorldMap
                activeLayers={activeLayers}
                events={visibleEvents}
                liveStep={liveStep}
                onSelect={setSelectedEventId}
                selectedEventId={selectedEvent.id}
              />
            ) : (
              <GlobeWorldMap
                activeLayers={activeLayers}
                events={visibleEvents}
                liveStep={liveStep}
                onSelect={setSelectedEventId}
                selectedEventId={selectedEvent.id}
              />
            )}

            <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/[0.55] backdrop-blur">
              <div className="ticker-track flex items-center gap-8 whitespace-nowrap px-4 py-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2 text-cyan-200">
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  Alert center: {visibleEvents.length} visible events, {activeOverlayCount} active overlays
                </span>
                <span>Daily AI brief ready: Strait pressure, Red Sea insurance, cyber spillover, Atlantic weather.</span>
                <span>Route Explorer flags elevated Suez, Panama, and Taiwan Strait sensitivity.</span>
                <span>Scenario Engine: semiconductor delay model moved from moderate to elevated.</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="order-3 flex min-h-[34rem] flex-col gap-3 lg:h-full lg:min-h-0 lg:overflow-y-auto">
          <section className="rounded-lg border border-white/10 bg-slate-950/72 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">AI analysis</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Situation panel</h2>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-fuchsia-300/30 bg-fuchsia-300/10">
                  <BrainCircuit className="h-4 w-4 text-fuchsia-200" aria-hidden="true" />
                </div>
              </div>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded border px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide',
                      severityClasses[selectedEvent.severity],
                    )}
                  >
                    {severityText[selectedEvent.severity]}
                  </span>
                  <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400">
                    {layerById[selectedEvent.layer].label}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold leading-7 text-white">{selectedEvent.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{selectedEvent.location}</p>
              </div>

              <div className="rounded-lg border border-cyan-200/15 bg-cyan-300/[0.06] p-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  AI generated brief
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-200">{selectedEvent.aiSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricBar label="Confidence" value={selectedEvent.confidence} tone="cyan" />
                <MetricBar label="Impact" value={selectedEvent.impact} tone="rose" />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Crosshair className="h-4 w-4" aria-hidden="true" />
                  Relationship graph
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedEvent.relationship}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Target className="h-4 w-4" aria-hidden="true" />
                  Watch tasks
                </div>
                <div className="mt-3 space-y-2">
                  {selectedEvent.nextWatch.map((task) => (
                    <div
                      className="flex items-start gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-slate-300"
                      key={task}
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="min-h-0 flex-1 rounded-lg border border-white/10 bg-slate-950/72 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Threat pulse</p>
                <h2 className="mt-1 text-lg font-semibold text-white">24h risk model</h2>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-200" aria-hidden="true" />
            </div>
            <div className="mt-4 h-44">
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={riskTrend} margin={{ bottom: 0, left: -28, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="riskFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="cyberFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis axisLine={false} dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                  <YAxis axisLine={false} domain={[20, 90]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(2, 6, 23, 0.92)',
                      border: '1px solid rgba(148, 163, 184, 0.22)',
                      borderRadius: 8,
                      color: '#e2e8f0',
                    }}
                    cursor={{ stroke: 'rgba(34, 211, 238, 0.32)' }}
                  />
                  <Area dataKey="risk" fill="url(#riskFill)" stroke="#22d3ee" strokeWidth={2} type="monotone" />
                  <Area dataKey="cyber" fill="url(#cyberFill)" stroke="#2dd4bf" strokeWidth={2} type="monotone" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniSignal icon={Route} label="Routes" value="12 elevated" />
              <MiniSignal icon={Eye} label="OSINT" value="69 feeds" />
              <MiniSignal icon={TimerReset} label="Latency" value="3.1 sec" />
              <MiniSignal icon={Sparkles} label="AI briefs" value="8 ready" />
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}

interface MapProps {
  activeLayers: LayerId[]
  events: IntelligenceEvent[]
  liveStep: number
  onSelect: (eventId: string) => void
  selectedEventId: string
}

const FlatWorldMap = ({ activeLayers, events, liveStep, onSelect, selectedEventId }: MapProps): JSX.Element => {
  const activeOverlays = mapOverlays.filter((overlay) => activeLayers.includes(overlay.layer))

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1000 520"
      >
        <defs>
          <linearGradient id="landFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#14313d" />
            <stop offset="54%" stopColor="#102436" />
            <stop offset="100%" stopColor="#0f1b2c" />
          </linearGradient>
          <filter id="landGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur result="coloredBlur" stdDeviation="4" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect fill="#05070a" height="520" width="1000" />
        <g stroke="rgba(34,211,238,0.09)" strokeWidth="1">
          {Array.from({ length: 9 }).map((_, index) => (
            <line key={`v-${index}`} x1={100 + index * 100} x2={100 + index * 100} y1="0" y2="520" />
          ))}
          {Array.from({ length: 6 }).map((_, index) => (
            <line key={`h-${index}`} x1="0" x2="1000" y1={80 + index * 72} y2={80 + index * 72} />
          ))}
        </g>
        <g filter="url(#landGlow)" fill="url(#landFill)" stroke="rgba(125,211,252,0.24)" strokeWidth="1.4">
          <path d="M86 146 L139 106 L222 92 L286 127 L284 184 L239 225 L252 282 L219 330 L166 303 L134 252 L91 231 L69 184 Z" />
          <path d="M246 285 L304 304 L333 362 L317 442 L281 493 L246 462 L228 392 Z" />
          <path d="M452 111 L529 91 L620 108 L671 154 L649 207 L588 209 L559 253 L492 247 L443 205 L414 154 Z" />
          <path d="M591 230 L650 239 L702 294 L695 363 L649 438 L592 427 L565 364 L526 321 L545 266 Z" />
          <path d="M676 154 L744 119 L821 128 L877 171 L875 229 L810 247 L766 225 L713 229 L672 197 Z" />
          <path d="M805 301 L878 318 L928 369 L902 421 L823 414 L787 358 Z" />
          <path d="M394 353 L447 350 L482 386 L458 430 L399 418 L370 381 Z" />
          <path d="M512 74 L581 52 L648 69 L632 99 L556 103 Z" opacity="0.68" />
          <path d="M705 74 L796 53 L881 72 L850 104 L747 109 Z" opacity="0.68" />
        </g>
        {activeLayers.includes('maritime') && (
          <g fill="none" stroke="#22d3ee" strokeDasharray="8 10" strokeLinecap="round" strokeWidth="2" opacity="0.42">
            <path d="M215 235 C354 190 467 236 589 220 C682 206 745 234 822 285" />
            <path d="M340 334 C444 301 532 302 621 333 C707 365 796 372 887 349" />
            <path d="M486 265 C553 232 617 224 704 247" />
          </g>
        )}
        {activeLayers.includes('weather') && (
          <g fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.28">
            <circle cx="412" cy="123" r="72" />
            <circle cx="412" cy="123" r="114" />
            <circle cx="675" cy="212" r="82" />
          </g>
        )}
        {activeLayers.includes('conflicts') && (
          <g opacity="0.22">
            <circle cx="626" cy="225" fill="#fb7185" r="68" />
            <circle cx="718" cy="197" fill="#fb7185" r="54" />
            <circle cx="408" cy="188" fill="#fb7185" r="44" />
          </g>
        )}
      </svg>

      {activeOverlays.map((overlay) => {
        const layer = layerById[overlay.layer]
        const point = projectPoint(overlay.lon, overlay.lat)

        return (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            key={overlay.id}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <div
              className="rounded-full border bg-black/50 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-wide backdrop-blur"
              style={{ borderColor: `${layer.color}55`, color: layer.color }}
            >
              {overlay.label}
            </div>
          </div>
        )
      })}

      {events.map((event, index) => {
        const point = projectPoint(event.lon, event.lat)

        return (
          <EventMarker
            event={event}
            isLive={index === liveStep % Math.max(events.length, 1)}
            isSelected={event.id === selectedEventId}
            key={event.id}
            left={point.x}
            onSelect={onSelect}
            top={point.y}
          />
        )
      })}
    </div>
  )
}

const GlobeWorldMap = ({ activeLayers, events, liveStep, onSelect, selectedEventId }: MapProps): JSX.Element => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(14,116,144,0.16),transparent_55%)]">
    <div className="globe-shell relative rounded-full border border-cyan-200/20 shadow-[0_0_80px_rgba(34,211,238,0.18)]">
      <div className="globe-shade absolute inset-0 rounded-full" />
      <div className="globe-lines absolute inset-0 rounded-full" />
      <svg aria-hidden="true" className="absolute inset-[9%] h-[82%] w-[82%]" viewBox="0 0 500 500">
        <g fill="rgba(45,212,191,0.18)" stroke="rgba(125,211,252,0.36)" strokeWidth="2">
          <path d="M95 150 L145 112 L214 130 L230 185 L192 229 L127 220 Z" />
          <path d="M195 252 L240 283 L230 370 L189 410 L165 348 Z" />
          <path d="M251 129 L333 108 L391 151 L371 218 L300 226 L248 186 Z" />
          <path d="M310 237 L380 259 L406 335 L362 403 L306 365 L286 296 Z" />
          <path d="M371 138 L437 178 L422 233 L363 221 Z" />
        </g>
      </svg>

      {mapOverlays
        .filter((overlay) => activeLayers.includes(overlay.layer))
        .map((overlay) => {
          const layer = layerById[overlay.layer]
          const point = projectGlobePoint(overlay.lon, overlay.lat)

          return (
            <div
              className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-black"
              key={overlay.id}
              style={{
                borderColor: layer.color,
                boxShadow: `0 0 20px ${layer.color}`,
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
            />
          )
        })}

      {events.map((event, index) => {
        const point = projectGlobePoint(event.lon, event.lat)

        return (
          <EventMarker
            event={event}
            isLive={index === liveStep % Math.max(events.length, 1)}
            isSelected={event.id === selectedEventId}
            key={event.id}
            left={point.x}
            onSelect={onSelect}
            top={point.y}
          />
        )
      })}
    </div>
  </div>
)

interface EventMarkerProps {
  event: IntelligenceEvent
  isLive: boolean
  isSelected: boolean
  left: number
  onSelect: (eventId: string) => void
  top: number
}

const EventMarker = ({ event, isLive, isSelected, left, onSelect, top }: EventMarkerProps): JSX.Element => {
  const layer = layerById[event.layer]
  const size = event.severity === 'critical' ? 18 : event.severity === 'high' ? 15 : 12

  return (
    <button
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
      onClick={() => onSelect(event.id)}
      style={{ left: `${left}%`, top: `${top}%` }}
      title={`${event.title} - ${event.location}`}
      type="button"
    >
      <span
        className={cn(
          'absolute left-1/2 top-1/2 rounded-full border opacity-60',
          isLive || isSelected ? 'map-ping' : '',
        )}
        style={{
          borderColor: layer.color,
          height: size * 2.4,
          marginLeft: size * -1.2,
          marginTop: size * -1.2,
          width: size * 2.4,
        }}
      />
      <span
        className={cn(
          'block rounded-full border-2 bg-black transition group-hover:scale-125',
          isSelected ? 'scale-125 border-white' : 'border-slate-950',
        )}
        style={{
          boxShadow: `0 0 22px ${layer.color}`,
          height: size,
          width: size,
        }}
      >
        <span
          className="block h-full w-full rounded-full"
          style={{ background: `radial-gradient(circle, #fff 0%, ${layer.color} 46%, ${layer.color}66 100%)` }}
        />
      </span>
    </button>
  )
}

interface MetricBarProps {
  label: string
  tone: 'cyan' | 'rose'
  value: number
}

const MetricBar = ({ label, tone, value }: MetricBarProps): JSX.Element => (
  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-white">{value}%</p>
    </div>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className={cn('h-full rounded-full', tone === 'cyan' ? 'bg-cyan-300' : 'bg-rose-400')}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
)

interface MiniSignalProps {
  icon: LucideIcon
  label: string
  value: string
}

const MiniSignal = ({ icon: Icon, label, value }: MiniSignalProps): JSX.Element => (
  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <Icon className="h-4 w-4 text-cyan-200" aria-hidden="true" />
      {label}
    </div>
    <p className="mt-2 text-sm font-semibold text-white">{value}</p>
  </div>
)

const GaugeIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M4 14a8 8 0 0 1 16 0" strokeLinecap="round" />
    <path d="m12 14 4-4" strokeLinecap="round" />
    <path d="M7 17h10" strokeLinecap="round" />
  </svg>
)

export default GlobalMonitorPage
