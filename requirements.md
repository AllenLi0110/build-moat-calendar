Requirements: 2026 Live Session Calendar
1. Project Overview
建立一個基於 Vue 3 的前端日曆應用程式，展示 2026 年 1 月至 6 月的時程，並特別標註 5 月至 6 月間的 8 場直播活動。核心功能是讓學生能切換時區，並看到活動在當地時間的正確日期與時間。
2. Tech Stack
Framework: Vue 3 (SFC, <script setup>)
Styling: Tailwind CSS
Date Handling: dayjs (must include utc and timezone plugins)
Icons: Lucide Vue or Heroicons
3. Data & Logic Specs
A. Base Event Information
Event Name: 實戰營 Live Session
First Session: 2026-05-02 10:00 AM (Asia/Taipei, GMT+8)
Recurrence: 每週一次，連續 8 週（最後一場為 2026-06-20）。
Description: Zoom Webinar 形式，錄影檔將上傳至 Teachable。
B. Timezone Logic
提供一個 Timezone Selector，預設抓取使用者瀏覽器時區。
選項需至少包含：
Asia/Taipei (GMT+8)
Australia/Sydney (AEST/AEDT)
America/New_York (EST/EDT)
America/Los_Angeles (PST/PDT)
Dynamic Date Shifting: 當時區切換導致時間跨越午夜（如台北週六 10 AM 對應美西週五 7 PM），日曆上的標記必須自動移動到正確的日期格（週五）。
4. UI/UX Requirements
A. Layout Structure
Overall: 垂直捲動列表，依序顯示 2026 年 1、2、3、4、5、6 月。
Month Grid: 標準 7 欄格式（週日至週六）。
Responsiveness:
Desktop: 2 或 3 欄顯示月份。
Mobile: 1 欄顯示月份。
B. Calendar Styling (Tailwind)
Base Date: 灰色系文字，當月日期 text-gray-700，非當月 text-gray-300。
Live Event Date:
日期格背景淺橘色 bg-orange-50。
圓形標註 bg-orange-500 text-white。
下方顯示該時區的時間字樣（例：10:00 AM）。
Hover/Click: 點擊活動日期彈出 Modal，顯示詳細資訊（Zoom 連結說明、錄影檔資訊）。
5. Component Breakdown
App.vue: 管理全域 selectedTimezone 與 8 場活動的資料。
TimezonePicker.vue: 時區下拉選單。
CalendarManager.vue: 渲染 1-6 月的容器。
MonthGrid.vue: 接收月份參數，計算該月每一天的日期與活動關聯。
EventDetailModal.vue: 顯示活動詳情。