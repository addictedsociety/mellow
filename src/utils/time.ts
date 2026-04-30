export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes}m`
  }

  return `${hours}h ${remainingMinutes.toString().padStart(2, '0')}m`
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
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return [hours, minutes, remainingSeconds]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':')
}
