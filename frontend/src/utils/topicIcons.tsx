import {
  BookOpen,
  Brain,
  FileText,
  FlaskConical,
  Folder,
  Lightbulb,
  type LucideIcon,
  Rocket,
  Settings2,
} from 'lucide-react'

const ICON_MAP = {
  folder: Folder,
  brain: Brain,
  book: BookOpen,
  note: FileText,
  settings: Settings2,
  rocket: Rocket,
  idea: Lightbulb,
  science: FlaskConical,
} satisfies Record<string, LucideIcon>

const ICON_ALIASES: Record<string, keyof typeof ICON_MAP> = {
  '📁': 'folder',
  '🧠': 'brain',
  '📚': 'book',
  '📝': 'note',
  '⚙️': 'settings',
  '🚀': 'rocket',
  '💡': 'idea',
  '🔬': 'science',
  folder: 'folder',
  brain: 'brain',
  book: 'book',
  note: 'note',
  settings: 'settings',
  rocket: 'rocket',
  idea: 'idea',
  science: 'science',
}

export const TOPIC_ICON_OPTIONS = [
  { value: 'folder', label: 'Folder', icon: ICON_MAP.folder },
  { value: 'brain', label: 'Brain', icon: ICON_MAP.brain },
  { value: 'book', label: 'Books', icon: ICON_MAP.book },
  { value: 'note', label: 'Notes', icon: ICON_MAP.note },
  { value: 'settings', label: 'Tools', icon: ICON_MAP.settings },
  { value: 'rocket', label: 'Launch', icon: ICON_MAP.rocket },
  { value: 'idea', label: 'Ideas', icon: ICON_MAP.idea },
  { value: 'science', label: 'Science', icon: ICON_MAP.science },
] as const

export function getTopicIcon(icon: string | undefined | null): LucideIcon {
  const normalized = ICON_ALIASES[icon ?? ''] ?? 'folder'
  return ICON_MAP[normalized]
}

export function TopicIcon({
  icon,
  className,
}: {
  icon: string | undefined | null
  className?: string
}) {
  const Icon = getTopicIcon(icon)
  return <Icon className={className} strokeWidth={1.8} />
}
