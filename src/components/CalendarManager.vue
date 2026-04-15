<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import MonthGrid from './MonthGrid.vue'
import type { LiveEvent } from '../data/events'

const props = defineProps<{
  timezone: string
  events: LiveEvent[]
}>()

const emit = defineEmits<{
  eventClick: [event: LiveEvent, localDate: string, localTime: string]
}>()

const EARLY_MONTHS = [1, 2, 3]
const LATE_MONTHS = [4, 5, 6]
const YEAR = 2026

const earlyCollapsed = ref(true)
</script>

<template>
  <div class="space-y-5">

    <!-- Group toggle for Jan–Mar -->
    <div>
      <!-- Group header -->
      <button
        class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-3 transition-colors duration-150"
        style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);"
        @click="earlyCollapsed = !earlyCollapsed"
      >
        <span class="text-xs font-semibold tracking-widest uppercase" style="color: rgba(255,255,255,0.3);">
          January – March 2026
        </span>
        <ChevronDown
          :size="14"
          class="transition-transform duration-300"
          :class="earlyCollapsed ? '-rotate-90' : 'rotate-0'"
          style="color: rgba(255,255,255,0.25);"
        />
      </button>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MonthGrid
          v-for="month in EARLY_MONTHS"
          :key="month"
          :year="YEAR"
          :month="month"
          :timezone="props.timezone"
          :events="props.events"
          :external-collapsed="earlyCollapsed"
          @toggle-collapse="earlyCollapsed = !earlyCollapsed"
          @event-click="(ev, date, time) => emit('eventClick', ev, date, time)"
        />
      </div>
    </div>

    <!-- Apr–Jun: each month controls itself -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <MonthGrid
        v-for="month in LATE_MONTHS"
        :key="month"
        :year="YEAR"
        :month="month"
        :timezone="props.timezone"
        :events="props.events"
        @event-click="(ev, date, time) => emit('eventClick', ev, date, time)"
      />
    </div>

  </div>
</template>
