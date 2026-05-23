export const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = safeSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${remainingSeconds
      .toString()
      .padStart(2, '0')}s`
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`
  }

  return `${remainingSeconds}s`
}

export const formatDate = (value?: string | null) => {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export const getElapsedSeconds = (startTime?: string | null) => {
  if (!startTime) {
    return 0
  }

  return Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 1000))
}

export const formatSeconds = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = safeSeconds % 60

  return [hours, minutes, remainingSeconds]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':')
}
