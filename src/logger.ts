import env from './env'

export default function log(name: string, ...data: unknown[]): void {
  if (!env.log) {
    return
  }

  const dateTime = new Date()

  const timeList = [dateTime.getHours(), dateTime.getMinutes(), dateTime.getSeconds()].map(x => x.toString().padStart(1, '0'))
  const time = timeList.join(':')
  
  const dateList = [dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDay()].map(x => x.toString().padStart(1, '0'))
  const date = dateList.join('/')
  
  const logTime = `[${time}-${date}]:`

  console.log(logTime, name, ...data)
}
