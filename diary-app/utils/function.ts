import { Entry } from '@/utils/types'

export function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

type Section = {
    date: string
    data: Entry[]
}

export function groupEntriesByDate(entries: Entry[]): Section[] {
    const groups: Record<string, Entry[]> = {}

    for (const entry of entries) {
        const key = new Date(entry.created_at).toDateString() // clé stable

        if (!groups[key]) {
            groups[key] = []
        }

        groups[key].push(entry)
    }

    return Object.entries(groups)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()) // sort by raw key
        .map(([key, data]) => ({
            date: formatDate(key),
            data,
        }))
}