<script setup lang="ts">
import { ref } from 'vue'
import TimezonePicker from './components/TimezonePicker.vue'
import CalendarManager from './components/CalendarManager.vue'
import EventDetailModal from './components/EventDetailModal.vue'
import { LIVE_EVENTS, getUserTimezone } from './data/events'
import type { LiveEvent } from './data/events'

const selectedTimezone = ref(getUserTimezone())

interface ModalState {
  event: LiveEvent
  localDate: string
  localTime: string
}

const modalState = ref<ModalState | null>(null)

function openModal(event: LiveEvent, localDate: string, localTime: string) {
  modalState.value = { event, localDate, localTime }
}

function closeModal() {
  modalState.value = null
}
</script>

<template>
  <div class="min-h-screen bg-[#080808]" style="background-image: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,215,0,0.06) 0%, transparent 70%);">

    <!-- Sticky header -->
    <header class="sticky top-0 z-40 border-b border-white/5" style="background: rgba(8,8,8,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);">
      <div class="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <!-- Gold dot accent -->
          <span class="w-2 h-2 rounded-full bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.8)] shrink-0"></span>
          <div>
            <h1 class="text-base font-semibold tracking-tight text-white leading-tight">
              2026 實戰營 Live Session
            </h1>
            <p class="text-xs text-white/35 mt-0.5 tracking-wide">8 SESSIONS &nbsp;·&nbsp; MAY – JUN 2026 &nbsp;·&nbsp; WEEKLY</p>
          </div>
        </div>
        <TimezonePicker v-model="selectedTimezone" />
      </div>
    </header>

    <!-- Hero section -->
    <section class="max-w-6xl mx-auto px-6 pt-12 pb-8">
      <p class="text-xs font-semibold tracking-[0.2em] text-[#ffd700]/60 uppercase mb-3">BuildMoat · 2026</p>
      <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-3"
        style="background: linear-gradient(135deg, #ffffff 10%, #ffd700 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        Modern System Design - Live Session Calendar
      </h2>
      <p class="text-white/40 text-sm max-w-lm leading-relaxed">
        選擇你的時區，確認每場直播在本地時間的日期與時間。點擊標記日期查看詳情。
      </p>

      <!-- Stats chips -->
      <div class="flex flex-wrap gap-2 mt-6">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#ffd700] border border-[#ffd700]/20 bg-[#ffd700]/5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#ffd700]"></span>
          8 場直播
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/50 border border-white/10 bg-white/5">
          每週六 10:00 AM（台北時間）
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/50 border border-white/10 bg-white/5">
          Zoom Webinar
        </span>
      </div>
    </section>

    <!-- Calendar -->
    <main class="max-w-6xl mx-auto px-6 pb-16">
      <CalendarManager
        :timezone="selectedTimezone"
        :events="LIVE_EVENTS"
        @event-click="openModal"
      />
    </main>

    <!-- Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <EventDetailModal
        v-if="modalState"
        :event="modalState.event"
        :local-date="modalState.localDate"
        :local-time="modalState.localTime"
        :timezone="selectedTimezone"
        @close="closeModal"
      />
    </Transition>
  </div>
</template>
