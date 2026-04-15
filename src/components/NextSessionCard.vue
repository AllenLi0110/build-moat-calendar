<script setup lang="ts">
import { computed, ref } from 'vue'
import { X, Video, FileVideo, CalendarDays, Clock } from 'lucide-vue-next'
import dayjs from 'dayjs'
import type { LiveEvent } from '../data/events'
import { getEventLocalDatetime } from '../data/events'

const props = defineProps<{
  events: LiveEvent[]
  timezone: string
}>()

const dismissed = ref(false)

const TODAY = dayjs().format('YYYY-MM-DD')

// Find today's session first, otherwise the next upcoming one
const featured = computed<{ event: LiveEvent; date: string; time: string } | null>(() => {
  // Check if any event falls on today in the selected timezone
  const todayEvent = props.events.find((ev) => {
    const { date } = getEventLocalDatetime(ev, props.timezone)
    return date === TODAY
  })
  if (todayEvent) {
    const { date, time } = getEventLocalDatetime(todayEvent, props.timezone)
    return { event: todayEvent, date, time }
  }

  // Otherwise find the next upcoming event
  const now = dayjs()
  const upcoming = props.events
    .map((ev) => {
      const { date, time } = getEventLocalDatetime(ev, props.timezone)
      return { event: ev, date, time, utc: dayjs(ev.datetimeUtc) }
    })
    .filter((e) => e.utc.isAfter(now))
    .sort((a, b) => a.utc.valueOf() - b.utc.valueOf())

  if (upcoming.length === 0) return null
  const { event, date, time } = upcoming[0]
  return { event, date, time }
})

const isToday = computed(() => {
  if (!featured.value) return false
  return featured.value.date === TODAY
})

const label = computed(() => (isToday.value ? 'TODAY' : 'NEXT SESSION'))
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="featured && !dismissed"
      class="relative rounded-2xl overflow-hidden"
      :style="isToday
        ? 'background: #111; border: 1px solid rgba(255,215,0,0.3); box-shadow: 0 0 0 1px rgba(255,215,0,0.08), 0 8px 32px rgba(255,215,0,0.08);'
        : 'background: #0e0e0e; border: 1px solid rgba(255,255,255,0.07);'"
    >
      <!-- Top accent bar -->
      <div
        class="h-0.5 w-full"
        :style="isToday
          ? 'background: linear-gradient(90deg, #ffd700, #ffec60, #ffd700);'
          : 'background: linear-gradient(90deg, rgba(255,215,0,0.4), rgba(255,215,0,0.1));'"
      ></div>

      <div class="px-5 py-4 sm:px-6 sm:py-5">
        <!-- Header row -->
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex items-center gap-3">
            <!-- Session badge -->
            <span
              class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-black shrink-0"
              style="background: linear-gradient(135deg, #ffd700, #ffec60); box-shadow: 0 2px 8px rgba(255,215,0,0.35);"
            >
              {{ featured.event.id }}
            </span>
            <div>
              <p
                class="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5"
                :style="isToday ? 'color: #ffd700;' : 'color: rgba(255,215,0,0.5);'"
              >
                {{ label }} &nbsp;·&nbsp; Live Session
              </p>
              <p class="text-white font-semibold text-base leading-tight">
                {{ featured.event.name }}
              </p>
            </div>
          </div>

          <!-- Dismiss -->
          <button
            @click="dismissed = true"
            class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 mt-0.5"
            style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3);"
            @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'"
          >
            <X :size="12" />
          </button>
        </div>

        <!-- Divider -->
        <div class="mb-4" style="height: 1px; background: rgba(255,255,255,0.05);"></div>

        <!-- Info grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <!-- Date & time -->
          <div class="flex items-start gap-2.5">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style="background: rgba(255,215,0,0.1);"
            >
              <CalendarDays :size="13" style="color: #ffd700;" />
            </div>
            <div>
              <p class="text-xs font-semibold text-white">{{ featured.date }}</p>
              <p class="text-[11px] mt-0.5 flex items-center gap-1" style="color: rgba(255,255,255,0.4);">
                <Clock :size="10" />
                {{ featured.time }} &nbsp;·&nbsp; {{ props.timezone }}
              </p>
            </div>
          </div>

          <!-- Zoom -->
          <div class="flex items-start gap-2.5">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style="background: rgba(255,215,0,0.1);"
            >
              <Video :size="13" style="color: #ffd700;" />
            </div>
            <div>
              <p class="text-xs font-semibold text-white">Zoom Webinar</p>
              <p class="text-[11px] mt-0.5 leading-relaxed" style="color: rgba(255,255,255,0.4);">
                連結將於活動開始前，寄送至您的個人信箱確認
              </p>
            </div>
          </div>

          <!-- Recording -->
          <div class="flex items-start gap-2.5">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style="background: rgba(255,215,0,0.1);"
            >
              <FileVideo :size="13" style="color: #ffd700;" />
            </div>
            <div>
              <p class="text-xs font-semibold text-white">課後錄影</p>
              <p class="text-[11px] mt-0.5 leading-relaxed" style="color: rgba(255,255,255,0.4);">
                直播後上傳至 Teachable，供學員重複觀看
              </p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div
          class="mt-4 px-4 py-3 rounded-xl text-[11px] leading-relaxed"
          style="background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.1); color: rgba(255,215,0,0.7);"
        >
          {{ featured.event.description }}
        </div>
      </div>
    </div>
  </Transition>
</template>
