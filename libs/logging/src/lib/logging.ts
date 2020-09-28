import { createLogger, format, LoggerOptions, transports } from 'winston'
import { SentryTransport } from './transports'
import { utilities } from 'nest-winston'

// Default log settings for debug mode
let logLevel = 'debug'
let logFormat = format.combine(
  format.timestamp(),
  utilities.format.nestLike('App'),
)

// Production overrides
if (process.env.NODE_ENV === 'production') {
  logLevel = process.env.LOG_LEVEL || 'info'
  logFormat = format.combine(format.timestamp(), format.json())
}

const logTransports = [new transports.Console(), new SentryTransport()]
export const logger = createLogger({
  level: logLevel,
  format: logFormat,
  transports: logTransports,
  handleExceptions: true,
  exitOnError: true,
  exceptionHandlers: logTransports,
  rejectionHandlers: logTransports,
} as LoggerOptions)
