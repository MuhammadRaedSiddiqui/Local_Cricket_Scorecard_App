type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  category: string
  message: string
  data?: any
}

class DebugLogger {
  private logs: LogEntry[] = []
  private enabled: boolean = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, category: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    }

    this.logs.push(entry)

    if (this.enabled) {
      const emoji = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        debug: '🔍',
      }

      const color = {
        info: 'color: #3b82f6',
        success: 'color: #10b981',
        warning: 'color: #f59e0b',
        error: 'color: #ef4444',
        debug: 'color: #8b5cf6',
      }

      console.log(
        `%c${emoji[level]} [${category}] ${message}`,
        color[level],
        data || ''
      )
    }
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data)
  }

  success(category: string, message: string, data?: any) {
    this.log('success', category, message, data)
  }

  warning(category: string, message: string, data?: any) {
    this.log('warning', category, message, data)
  }

  error(category: string, message: string, data?: any) {
    this.log('error', category, message, data)
  }

  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data)
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }

  downloadLogs() {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scoring-logs-${Date.now()}.json`
    a.click()
  }
}

export const logger = new DebugLogger()