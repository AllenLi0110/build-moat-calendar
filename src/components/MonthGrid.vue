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

interface DayCell {
  date: string // YYYY-MM-DD
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isPast: boolean
  event: LiveEvent | null
  eventTime: string
}

const cells = computed<DayCell[]>(() => {
  const firstOfMonth = dayjs(`${props.year}-${String(props.month).padStart(2, '0')}-01`)
  const startPad = firstOfMonth.day() // 0=Sun
  const daysInMonth = firstOfMonth.daysInMonth()

  // Build event lookup: date string -> event
  const eventMap = new Map<string, { event: LiveEvent; time: string; isPast: boolean }>()
  for (const ev of props.events) {
    const { date, time } = getEventLocalDatetime(ev, props.timezone)
    eventMap.set(date, { event: ev, time, isPast: dayjs.utc(ev.datetimeUtc).isBefore(NOW) })
  }

  const result: DayCell[] = []

  // Padding before
  for (let i = 0; i < startPad; i++) {
    const d = firstOfMonth.subtract(startPad - i, 'day')
    const dateStr = d.format('YYYY-MM-DD')
    const ev = eventMap.get(dateStr)
    result.push({
      date: dateStr,
      dayNumber: d.date(),
      isCurrentMonth: false,
      isToday: dateStr === TODAY,
      event: ev?.event ?? null,
      eventTime: ev?.time ?? '',
      isPast: ev?.isPast ?? false,
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = firstOfMonth.date(d).format('YYYY-MM-DD')
    const ev = eventMap.get(dateStr)
    result.push({
      date: dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === TODAY,
      event: ev?.event ?? null,
      eventTime: ev?.time ?? '',
      isPast: ev?.isPast ?? false,
    })
  }

  // Padding after (fill to complete last row)
  const remaining = result.length % 7 === 0 ? 0 : 7 - (result.length % 7)
  for (let i = 1; i <= remaining; i++) {
    const d = firstOfMonth.date(daysInMonth).add(i, 'day')
    const dateStr = d.format('YYYY-MM-DD')
    const ev = eventMap.get(dateStr)
    result.push({
      date: dateStr,
      dayNumber: d.date(),
      isCurrentMonth: false,
      isToday: dateStr === TODAY,
      event: ev?.event ?? null,
      eventTime: ev?.time ?? '',
      isPast: ev?.isPast ?? false,
    })
  }

  return result
})

const monthLabel = computed(() => {
  return dayjs(`${props.year}-${String(props.month).padStart(2, '0')}-01`).format('MMMM YYYY')
})

function handleCellClick(cell: DayCell) {
  if (cell.event) {
    emit('eventClick', cell.event, cell.date, cell.eventTime)
  }
}

const isKickoff = (cell: DayCell) => cell.event?.type === 'kickoff'

function cellBg(cell: DayCell): string {
  if (!cell.event) return cell.isToday ? 'rgba(255,255,255,0.03)' : 'transparent'
  if (isKickoff(cell)) return cell.isPast ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'
  if (cell.isPast) return 'rgba(255,215,0,0.025)'
  return 'rgba(255,215,0,0.06)'
}

function cellBorder(cell: DayCell): string {
  if (!cell.event) return '1px solid rgba(255,255,255,0.03)'
  if (isKickoff(cell)) return cell.isPast ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.1)'
  if (cell.isPast) return '1px solid rgba(255,215,0,0.04)'
  return '1px solid rgba(255,215,0,0.08)'
}

function numberStyle(cell: DayCell): string {
  // Kickoff date
  if (isKickoff(cell) && cell.isToday) {
    return 'background: #fff; box-shadow: 0 0 0 2px rgba(255,255,255,0.4), 0 2px 8px rgba(255,255,255,0.3); color: #000;'
  }
  if (isKickoff(cell) && cell.isPast) {
    return 'background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.5);'
  }
  if (isKickoff(cell)) {
    return 'background: rgba(255,255,255,0.9); box-shadow: 0 2px 8px rgba(255,255,255,0.2); color: #000;'
  }
  // Live session
  if (cell.event && cell.isToday) {
    return 'background: linear-gradient(135deg, #ffd700, #ffec60); box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px rgba(255,215,0,0.5), 0 2px 10px rgba(255,215,0,0.5); color: #000;'
  }
  if (cell.event && cell.isPast) {
    return 'background: rgba(160,120,0,0.45); color: rgba(255,215,0,0.6);'
  }
  if (cell.event) {
    return 'background: linear-gradient(135deg, #ffd700, #ffec60); box-shadow: 0 2px 8px rgba(255,215,0,0.4); color: #000;'
  }
  if (cell.isToday) {
    return 'box-shadow: 0 0 0 1.5px rgba(255,255,255,0.6); color: #fff; font-weight: 700;'
  }
  if (cell.isCurrentMonth) return 'color: rgba(255,255,255,0.7);'
  return 'color: rgba(255,255,255,0.15);'
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
          cell.event ? 'cursor-pointer group' : '',
        ]"
        :style="cell.isCurrentMonth
          ? `background: ${cellBg(cell)}; border-bottom: ${cellBorder(cell)}; border-right: ${cellBorder(cell)};`
          : 'border-bottom: 1px solid rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.03);'"
        @click="handleCellClick(cell)"
      >
        <!-- Only render content for current month cells -->
        <template v-if="cell.isCurrentMonth">

        <!-- Hover glow overlay for event cells -->
        <div
          v-if="cell.event"
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style="background: rgba(255,215,0,0.06);"
        ></div>

        <!-- Day number -->
        <span
          :class="[
            'relative z-10 text-xs w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200',
            cell.event ? 'group-hover:scale-110' : '',
          ]"
          :style="numberStyle(cell)"
        >
          {{ cell.dayNumber }}
        </span>

        <!-- Today label (non-event) -->
        <span
          v-if="cell.isToday && !cell.event"
          class="relative z-10 text-[8px] font-bold tracking-widest uppercase mt-1 leading-none"
          style="color: rgba(255,255,255,0.4);"
        >
          TODAY
        </span>

        <!-- Event time + today badge (event day) -->
        <span
          v-if="cell.event"
          class="relative z-10 text-[9px] font-semibold tracking-wide mt-1 leading-none flex items-center gap-1"
          :style="cell.isPast ? 'color: rgba(255,215,0,0.35);' : 'color: rgba(255,215,0,0.8);'"
        >
          {{ cell.event.type === 'kickoff' ? 'START' : cell.event.isRecord ? 'RECORD' : cell.eventTime }}
          <span
            v-if="cell.isToday"
            class="text-[7px] font-bold tracking-widest uppercase px-1 py-0.5 rounded"
            style="background: rgba(255,255,255,0.15); color: #fff; line-height: 1;"
          >TODAY</span>
        </span>

        </template>
      </div>
    </div>

    </div>
    </Transition>
  </div>
</template>
