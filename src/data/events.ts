import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export type EventType = 'live' | 'kickoff' | 'sharing'

export interface LiveEvent {
  id: number
  name: string
  description: string
  // ISO string in UTC
  datetimeUtc: string
  liveUrl?: string
  isRecord?: boolean
  type?: EventType
}

// First session: 2026-05-02 10:00 AM Asia/Taipei (UTC+8) => 2026-05-02T02:00:00Z
const FIRST_SESSION_TZ = 'Asia/Taipei'
const FIRST_SESSION_LOCAL = '2026-05-02 10:00'
const SESSION_COUNT = 8

function generateEvents(): LiveEvent[] {
  const events: LiveEvent[] = []
  for (let i = 0; i < SESSION_COUNT; i++) {
    const localDt = dayjs.tz(FIRST_SESSION_LOCAL, FIRST_SESSION_TZ).add(i * 7, 'day')
    events.push({
      id: i + 1,
      name: `實戰營 Live Session ${i + 1}`,
      description:
        'Zoom Webinar 形式進行。課後錄影檔將上傳至 Teachable 平台，供學員回放複習。如需 Zoom 連結，請至個人信箱確認。',
      datetimeUtc: localDt.utc().toISOString(),
    })
  }
  return events
}

// One-off sessions outside the main weekly series
const ONE_OFF_EVENTS: LiveEvent[] = [
  {
    id: 0,
    name: '實戰營 直播聊聊 1',
    description: 'YouTube 直播形式，歡迎觀看重播。',
    datetimeUtc: '2026-02-01T13:00:00.000Z',
    liveUrl: 'https://www.youtube.com/live/TESDaEH5B8s?si=2mOEEoanlus3Vro',
    isRecord: true,
  },
  {
    id: 0,
    name: '實戰營 直播聊聊 2',
    description: 'YouTube 直播形式，歡迎觀看重播。',
    datetimeUtc: '2026-02-08T15:00:00.000Z',
    liveUrl: 'https://youtube.com/live/TR6pgOPn2Ws?feature=share',
    isRecord: true,
  },
  {
    id: 0,
    name: '實戰營 直播聊聊 3',
    description: 'YouTube 直播形式，歡迎觀看重播。',
    datetimeUtc: '2026-02-21T01:25:00.000Z',
    liveUrl: 'https://youtube.com/live/CrV82o6Mg2A?feature=share',
    isRecord: true,
  },
]

const KICKOFF_EVENTS: LiveEvent[] = [
  {
    id: 0,
    name: '實戰營正式開課',
    description: '歡迎加入 BuildMoat 系統設計實戰營！課程正式開始，請確認已完成報名並收到開課通知信。如有任何問題，歡迎於社群中提問。',
    // 2026-03-15 00:00 UTC+8 => 2026-03-14T16:00:00Z
    datetimeUtc: '2026-03-14T16:00:00.000Z',
    type: 'kickoff',
  },
]

const SHARING_EVENTS: LiveEvent[] = [
  {
    id: 0,
    name: '專業分享 EP01',
    description: '專業分享系列第一集，歡迎參與。',
    // 2026-05-16 11:00 AM Asia/Taipei (UTC+8) => 2026-05-16T03:00:00Z
    datetimeUtc: '2026-05-16T03:00:00.000Z',
    type: 'sharing',
  },
  {
    id: 1,
    name: '專業分享 EP02',
    description: '專業分享系列第二集，歡迎參與。',
    // 2026-06-06 11:00 AM Asia/Taipei (UTC+8) => 2026-06-06T03:00:00Z
    datetimeUtc: '2026-06-06T03:00:00.000Z',
    type: 'sharing',
  },
]

export const LIVE_EVENTS: LiveEvent[] = [
  ...ONE_OFF_EVENTS,
  ...KICKOFF_EVENTS,
  ...SHARING_EVENTS,
  ...generateEvents(),
]

export const TIMEZONE_OPTIONS = [
  { label: 'Asia/Taipei (GMT+8)', value: 'Asia/Taipei' },
  { label: 'Australia/Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
  { label: 'America/New_York (EST/EDT)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (PST/PDT)', value: 'America/Los_Angeles' },
]

export function getUserTimezone(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const supported = TIMEZONE_OPTIONS.map((o) => o.value)
  return supported.includes(tz) ? tz : 'Asia/Taipei'
}

export function getEventLocalDatetime(
  event: LiveEvent,
  tz: string,
): { date: string; time: string } {
  const local = dayjs.utc(event.datetimeUtc).tz(tz)
  return {
    date: local.format('YYYY-MM-DD'),
    time: local.format('h:mm A'),
  }
}
