<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import dayjs from 'dayjs'
import type { LiveEvent } from '../data/events'
import { getEventLocalDatetime } from '../data/events'

const props = defineProps<{
  year: number
  month: number // 1-based
  timezone: string
  events: LiveEvent[]
  // When provided, collapse state is controlled externally
  externalCollapsed?: boolean
  defaultCollapsed?: boolean
}>()

const emit = defineEmits<{
  eventClick: [event: LiveEvent, localDate: string, localTime: string]
  toggleCollapse: []
}>()

const internalCollapsed = ref(props.defaultCollapsed ?? false)

// If externalCollapsed is provided, use it; otherwise use internal state
const collapsed = computed(() =>
  props.externalCollapsed !== undefined ? props.externalCollapsed : internalCollapsed.value
)

function handleHeaderClick() {
  if (props.externalCollapsed !== undefined) {
    emit('toggleCollapse')
  } else {
    internalCollapsed.value = !internalCollapsed.value
  }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TODAY = dayjs().format('YYYY-MM-DD')
const NOW = dayjs()

interface EventEntry {
  event: LiveEvent
  time: string
  shortTime: string // compact format e.g. "10am", "11am"
  isPast: boolean
}

interface DayCell {
  date: string // YYYY-MM-DD
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  events: EventEntry[]
}

const cells = computed<DayCell[]>(() => {
  const firstOfMonth = dayjs(`${props.year}-${String(props.month).padStart(2, '0')}-01`)
  const startPad = firstOfMonth.day() // 0=Sun
  const daysInMonth = firstOfMonth.daysInMonth()

  // Build event lookup: date string -> sorted list of events
  const eventMap = new Map<string, EventEntry[]>()
  for (const ev of props.events) {
    const { date, time } = getEventLocalDatetime(ev, props.timezone)
    const shortTime = dayjs.utc(ev.datetimeUtc).tz(props.timezone).format('ha') // e.g. "10am"
    const entry: EventEntry = { event: ev, time, shortTime, isPast: dayjs.utc(ev.datetimeUtc).isBefore(NOW) }
    const existing = eventMap.get(date)
    if (existing) {
      existing.push(entry)
      existing.sort((a, b) => (a.event.datetimeUtc < b.event.datetimeUtc ? -1 : 1))
    } else {
      eventMap.set(date, [entry])
    }
  }

  const result: DayCell[] = []

  // Padding before
  for (let i = 0; i < startPad; i++) {
    const d = firstOfMonth.subtract(startPad - i, 'day')
    const dateStr = d.format('YYYY-MM-DD')
    result.push({
      date: dateStr,
      dayNumber: d.date(),
      isCurrentMonth: false,
      isToday: dateStr === TODAY,
      events: eventMap.get(dateStr) ?? [],
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = firstOfMonth.date(d).format('YYYY-MM-DD')
    result.push({
      date: dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === TODAY,
      events: eventMap.get(dateStr) ?? [],
    })
  }

  // Padding after (fill to complete last row)
  const remaining = result.length % 7 === 0 ? 0 : 7 - (result.length % 7)
  for (let i = 1; i <= remaining; i++) {
    const d = firstOfMonth.date(daysInMonth).add(i, 'day')
    const dateStr = d.format('YYYY-MM-DD')
    result.push({
      date: dateStr,
      dayNumber: d.date(),
      isCurrentMonth: false,
      isToday: dateStr === TODAY,
      events: eventMap.get(dateStr) ?? [],
    })
  }

  return result
})

const monthLabel = computed(() => {
  return dayjs(`${props.year}-${String(props.month).padStart(2, '0')}-01`).format('MMMM YYYY')
})

function handleCellClick(cell: DayCell) {
  if (cell.events.length === 1) {
    handleEventClick(cell.events[0], cell)
  }
}

function cellBg(cell: DayCell): string {
  const primary = cell.events[0]
  if (!primary) return cell.isToday ? 'rgba(255,255,255,0.03)' : 'transparent'
  if (primary.event.type === 'kickoff') return primary.isPast ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'
  if (primary.isPast) return 'rgba(255,215,0,0.025)'
  return 'rgba(255,215,0,0.06)'
}

function cellBorder(cell: DayCell): string {
  const primary = cell.events[0]
  if (!primary) return '1px solid rgba(255,255,255,0.03)'
  if (primary.event.type === 'kickoff') return primary.isPast ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.1)'
  if (primary.isPast) return '1px solid rgba(255,215,0,0.04)'
  return '1px solid rgba(255,215,0,0.08)'
}

function numberStyle(cell: DayCell): string {
  const primary = cell.events[0]
  const isKickoff = primary?.event.type === 'kickoff'
  const isPast = primary?.isPast ?? false
  const hasEvent = !!primary

  if (isKickoff && cell.isToday) {
    return 'background: #fff; box-shadow: 0 0 0 2px rgba(255,255,255,0.4), 0 2px 8px rgba(255,255,255,0.3); color: #000;'
  }
  if (isKickoff && isPast) {
    return 'background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.5);'
  }
  if (isKickoff) {
    return 'background: rgba(255,255,255,0.9); box-shadow: 0 2px 8px rgba(255,255,255,0.2); color: #000;'
  }
  if (hasEvent && cell.isToday) {
    return 'background: linear-gradient(135deg, #ffd700, #ffec60); box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px rgba(255,215,0,0.5), 0 2px 10px rgba(255,215,0,0.5); color: #000;'
  }
  if (hasEvent && isPast) {
    return 'background: rgba(160,120,0,0.45); color: rgba(255,215,0,0.6);'
  }
  if (hasEvent) {
    return 'background: linear-gradient(135deg, #ffd700, #ffec60); box-shadow: 0 2px 8px rgba(255,215,0,0.4); color: #000;'
  }
  if (cell.isToday) {
    return 'box-shadow: 0 0 0 1.5px rgba(255,255,255,0.6); color: #fff; font-weight: 700;'
  }
  if (cell.isCurrentMonth) return 'color: rgba(255,255,255,0.7);'
  return 'color: rgba(255,255,255,0.15);'
}

function eventChipStyle(entry: EventEntry): string {
  if (entry.event.type === 'kickoff') {
    return entry.isPast
      ? 'background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3);'
      : 'background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.75);'
  }
  if (entry.event.type === 'sharing') {
    return entry.isPast
      ? 'background: rgba(100,180,255,0.08); color: rgba(100,180,255,0.35);'
      : 'background: rgba(100,180,255,0.15); color: rgba(100,180,255,0.9);'
  }
  // live
  return entry.isPast
    ? 'background: rgba(255,215,0,0.08); color: rgba(255,215,0,0.35);'
    : 'background: rgba(255,215,0,0.15); color: rgba(255,215,0,0.9);'
}

function eventLabel(entry: EventEntry, short = false): string {
  if (entry.event.type === 'kickoff') return 'START'
  if (entry.event.isRecord) return 'REC'
  return short ? entry.shortTime : entry.time
}

function handleEventClick(entry: EventEntry, cell: DayCell) {
  emit('eventClick', entry.event, cell.date, entry.time)
}
</script>

<template>
  <div
    class="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(255,215,0,0.15),0_8px_32px_rgba(0,0,0,0.4)]"
    style="background: #0e0e0e; border: 1px solid rgba(255,255,255,0.06);"
  >
    <!-- Month header -->
    <div
      class="px-5 py-4 flex items-center justify-between cursor-pointer select-none"
      style="background: linear-gradient(180deg, #161616 0%, #0e0e0e 100%); border-bottom: 1px solid rgba(255,255,255,0.05);"
      @click="handleHeaderClick"
    >
      <h3
        class="font-bold text-sm tracking-wider uppercase"
        style="background: linear-gradient(90deg, #ffd700, #ffe566); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
      >
        {{ monthLabel }}
      </h3>
      <ChevronDown
        :size="14"
        class="transition-transform duration-300 shrink-0"
        :class="collapsed ? '-rotate-90' : 'rotate-0'"
        style="color: rgba(255,215,0,0.4);"
      />
    </div>

    <!-- Collapsible body -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[600px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in overflow-hidden"
      leave-from-class="max-h-[600px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
    <div v-show="!collapsed">

    <!-- Weekday labels -->
    <div class="grid grid-cols-7" style="border-bottom: 1px solid rgba(255,255,255,0.04);">
      <div
        v-for="day in WEEKDAYS"
        :key="day"
        class="text-center text-[10px] font-semibold tracking-widest uppercase py-2.5"
        style="color: rgba(255,215,0,0.3);"
      >
        {{ day }}
      </div>
    </div>

    <!-- Day cells -->
    <div class="grid grid-cols-7">
      <div
        v-for="cell in cells"
        :key="cell.date"
        :class="[
          'relative min-h-[72px] flex flex-col items-center justify-start pt-2 pb-1',
          cell.events.length === 1 ? 'cursor-pointer group' : '',
        ]"
        :style="cell.isCurrentMonth
          ? `background: ${cellBg(cell)}; border-bottom: ${cellBorder(cell)}; border-right: ${cellBorder(cell)};`
          : 'border-bottom: 1px solid rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.03);'"
        @click="handleCellClick(cell)"
      >
        <!-- Only render content for current month cells -->
        <template v-if="cell.isCurrentMonth">

        <!-- Hover glow overlay for single-event cells -->
        <div
          v-if="cell.events.length === 1"
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style="background: rgba(255,215,0,0.06);"
        ></div>

        <!-- Day number -->
        <span
          :class="[
            'relative z-10 text-xs w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200',
            cell.events.length === 1 ? 'group-hover:scale-110' : '',
          ]"
          :style="numberStyle(cell)"
        >
          {{ cell.dayNumber }}
        </span>

        <!-- Today label (no events) -->
        <span
          v-if="cell.isToday && cell.events.length === 0"
          class="relative z-10 text-[8px] font-bold tracking-widest uppercase mt-1 leading-none"
          style="color: rgba(255,255,255,0.4);"
        >
          TODAY
        </span>

        <!-- Single event: time + optional TODAY badge -->
        <span
          v-if="cell.events.length === 1"
          class="relative z-10 text-[9px] font-semibold tracking-wide mt-1 leading-none flex items-center gap-1"
          :style="cell.events[0].isPast ? 'color: rgba(255,215,0,0.35);' : 'color: rgba(255,215,0,0.8);'"
        >
          {{ eventLabel(cell.events[0]) }}
          <span
            v-if="cell.isToday"
            class="text-[7px] font-bold tracking-widest uppercase px-1 py-0.5 rounded"
            style="background: rgba(255,255,255,0.15); color: #fff; line-height: 1;"
          >TODAY</span>
        </span>

        <!-- Multiple events: stacked chips, each individually clickable -->
        <div
          v-if="cell.events.length > 1"
          class="relative z-10 mt-1 flex flex-col gap-0.5 w-full items-center"
        >
          <span
            v-if="cell.isToday"
            class="text-[7px] font-bold tracking-widest uppercase text-center mb-0.5"
            style="color: rgba(255,255,255,0.4);"
          >TODAY</span>
          <span
            v-for="entry in cell.events"
            :key="entry.event.datetimeUtc"
            class="text-[8px] font-semibold leading-none px-1 py-0.5 rounded truncate cursor-pointer transition-opacity duration-150 hover:opacity-70"
            :style="eventChipStyle(entry)"
            @click.stop="handleEventClick(entry, cell)"
          >
            {{ eventLabel(entry) }}
          </span>
        </div>

        </template>
      </div>
    </div>

    </div>
    </Transition>
  </div>
</template>
