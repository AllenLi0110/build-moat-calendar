<script setup lang="ts">
import { computed } from 'vue'
import { X, Video, FileVideo, CalendarDays, PlayCircle, Rocket } from 'lucide-vue-next'
import dayjs from 'dayjs'
import type { LiveEvent } from '../data/events'

const props = defineProps<{
  event: LiveEvent
  localDate: string
  localTime: string
  timezone: string
}>()

const emit = defineEmits<{
  close: []
}>()

const isPast = computed(() => dayjs.utc(props.event.datetimeUtc).isBefore(dayjs()))
const isKickoff = computed(() => props.event.type === 'kickoff')
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
    style="background: rgba(0,0,0,0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);"
    @click.self="emit('close')"
  >
    <Transition
      appear
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-[0.97]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
    >
      <div
        class="w-full max-w-2xl mb-4 sm:mb-0 rounded-2xl overflow-hidden"
        style="background: #111; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.08);"
      >
        <!-- Top bar: white for kickoff, gold for live -->
        <div :style="isKickoff
          ? 'height: 3px; background: linear-gradient(90deg, #e0e0e0, #ffffff, #e0e0e0);'
          : 'height: 3px; background: linear-gradient(90deg, #ffd700, #ffec60, #ffd700);'"
        ></div>

        <!-- Header -->
        <div
          class="px-6 pt-5 pb-4 flex items-start justify-between"
          style="border-bottom: 1px solid rgba(255,255,255,0.06);"
        >
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <!-- Kickoff icon badge -->
              <span
                v-if="isKickoff"
                class="inline-flex items-center justify-center w-5 h-5 rounded-full"
                style="background: rgba(255,255,255,0.15);"
              >
                <Rocket :size="11" style="color: #fff;" />
              </span>
              <!-- Live session number badge -->
              <span
                v-else
                class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-black"
                style="background: linear-gradient(135deg, #ffd700, #ffec60);"
              >
                {{ props.event.id }}
              </span>
              <span
                class="text-[10px] font-semibold tracking-[0.15em] uppercase"
                :style="isKickoff ? 'color: rgba(255,255,255,0.5);' : 'color: rgba(255,215,0,0.6);'"
              >
                {{ isKickoff ? 'Course Start' : 'Live Session' }}
              </span>
            </div>
            <h2 class="text-white font-bold text-lg leading-tight">{{ props.event.name }}</h2>
          </div>
          <button
            @click="emit('close')"
            class="ml-4 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 shrink-0"
            style="background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4);"
            @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'"
          >
            <X :size="14" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-5 overflow-y-auto">

          <!-- Date & Time -->
          <div class="flex items-start gap-3.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(255,215,0,0.1);">
              <CalendarDays :size="15" style="color: #ffd700;" />
            </div>
            <div>
              <p class="text-sm font-semibold text-white">{{ props.localDate }}</p>
              <p v-if="!props.event.isRecord" class="text-xs mt-0.5" style="color: rgba(255,255,255,0.4);">
                {{ props.localTime }} &nbsp;·&nbsp; {{ props.timezone }}
              </p>
              <span
                v-else
                class="inline-block mt-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                style="background: rgba(255,215,0,0.12); color: rgba(255,215,0,0.7); letter-spacing: 0.12em;"
              >RECORD</span>
            </div>
          </div>

          <template v-if="!isKickoff">
          <div style="height: 1px; background: rgba(255,255,255,0.05);"></div>

          <!-- Format -->
          <div class="flex items-start gap-3.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(255,215,0,0.1);">
              <Video :size="15" style="color: #ffd700;" />
            </div>
            <div>
              <p class="text-sm font-semibold text-white">Zoom Webinar</p>
              <p class="text-xs mt-0.5 leading-relaxed" style="color: rgba(255,255,255,0.4);">
                Zoom 連結將於活動開始前寄送至您的個人信箱，請至信箱確認。
              </p>
            </div>
          </div>

          <!-- Recording -->
          <div class="flex items-start gap-3.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(255,215,0,0.1);">
              <FileVideo :size="15" style="color: #ffd700;" />
            </div>
            <div>
              <p class="text-sm font-semibold text-white">課後錄影</p>
              <p class="text-xs mt-0.5 leading-relaxed" style="color: rgba(255,255,255,0.4);">
                直播結束後錄影檔將上傳至 Teachable，供學員隨時回放複習。
              </p>
            </div>
          </div>
          </template>

          <!-- Recording link for past events -->
          <a
            v-if="isPast && props.event.liveUrl"
            :href="props.event.liveUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
            style="background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.25); color: rgba(255,215,0,0.85);"
            @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(255,215,0,0.16)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = 'rgba(255,215,0,0.1)'"
          >
            <PlayCircle :size="15" />
            觀看直播紀錄
          </a>

          <!-- Description pill -->
          <div
            class="px-3.5 py-2.5 rounded-xl text-xs leading-relaxed"
            style="background: rgba(255,215,0,0.06); border: 1px solid rgba(255,215,0,0.12); color: rgba(255,215,0,0.7);"
          >
            {{ props.event.description }}
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-6 py-4"
          style="border-top: 1px solid rgba(255,255,255,0.05);"
        >
          <button
            @click="emit('close')"
            class="w-full py-2.5 rounded-xl text-sm font-semibold text-black transition-all duration-150 active:scale-[0.98]"
            style="background: linear-gradient(135deg, #ffd700, #ffec60); box-shadow: 0 4px 16px rgba(255,215,0,0.25);"
            @mouseenter="($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(255,215,0,0.4)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(255,215,0,0.25)'"
          >
            關閉
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
