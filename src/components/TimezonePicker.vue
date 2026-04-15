<script setup lang="ts">
import { computed } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { Globe, Check, ChevronDown } from 'lucide-vue-next'
import { TIMEZONE_OPTIONS } from '../data/events'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selected = computed({
  get: () => TIMEZONE_OPTIONS.find((o) => o.value === props.modelValue) ?? TIMEZONE_OPTIONS[0],
  set: (opt) => emit('update:modelValue', opt.value),
})
</script>

<template>
  <Listbox v-model="selected">
    <div class="relative">
      <!-- Trigger button -->
      <ListboxButton
        class="flex items-center gap-2.5 pl-3.5 pr-3 py-2 rounded-xl transition-all duration-150 focus:outline-none group"
        style="background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.2);"
      >
        <Globe :size="14" style="color: rgba(255,215,0,0.7); flex-shrink: 0;" />
        <span class="text-sm font-medium text-white/80 whitespace-nowrap">
          {{ selected.label }}
        </span>
        <ChevronDown
          :size="13"
          class="transition-transform duration-200 ui-open:rotate-180"
          style="color: rgba(255,215,0,0.5); flex-shrink: 0;"
        />
      </ListboxButton>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-1 scale-95"
      >
        <ListboxOptions
          class="absolute right-0 mt-2 w-64 rounded-xl overflow-hidden focus:outline-none z-50"
          style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.06);"
        >
          <!-- Header label -->
          <div
            class="px-4 py-2.5"
            style="border-bottom: 1px solid rgba(255,255,255,0.06);"
          >
            <p class="text-[10px] font-bold tracking-[0.15em] uppercase" style="color: rgba(255,215,0,0.5);">
              Select Timezone
            </p>
          </div>

          <!-- Options -->
          <div class="py-1.5">
            <ListboxOption
              v-for="tz in TIMEZONE_OPTIONS"
              :key="tz.value"
              :value="tz"
              v-slot="{ active, selected: isSelected }"
              as="template"
            >
              <li
                :class="['flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-100']"
                :style="active
                  ? 'background: rgba(255,215,0,0.08);'
                  : 'background: transparent;'"
              >
                <div class="flex items-center gap-3">
                  <Globe
                    :size="13"
                    :style="isSelected ? 'color: #ffd700;' : 'color: rgba(255,255,255,0.25);'"
                  />
                  <span
                    class="text-sm"
                    :style="isSelected
                      ? 'color: #fff; font-weight: 600;'
                      : 'color: rgba(255,255,255,0.55);'"
                  >
                    {{ tz.label }}
                  </span>
                </div>
                <Check
                  v-if="isSelected"
                  :size="13"
                  style="color: #ffd700; flex-shrink: 0;"
                />
              </li>
            </ListboxOption>
          </div>
        </ListboxOptions>
      </Transition>
    </div>
  </Listbox>
</template>
