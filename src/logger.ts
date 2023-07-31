import env from './env'

export default function log(name: string, ...data: unknown[]): void {
  const dateTime = new Date()
  const time = `${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds().toString().padStart(1, '0')}`
  const date = `${dateTime.getFullYear()}/${dateTime.getMonth()}/${dateTime.getDay()}`
  const logTime = `[${time}-${date}]:`
  if (env.log) {
    console.log(logTime, name, ...data)
  }
}
