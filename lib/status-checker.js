const {
  Statuses,
  fetchCurrentStatus,
  fetchLastMessage
} = require('./github-status-api')

const Events = {
  NO_CHANGE: 'NO_CHANGE',
  BECAME_GOOD: 'BECAME_GOOD',
  BECAME_BAD: 'BECAME_BAD',
}

function pingGitHubPeriodically({
  interval = 600000,
  handlers,
  onRuntimeError
}) {
  let lastStatus = Statuses.GREEN
  let running = false

  const emitEvent = makeEmitter(handlers)
  const alarmIfNecessary = makeGitHubStatusAlarm(
    emitEvent, compareGitHubStatus
  )
  const updateStatus = (status) => {
    running = false
    lastStatus = status
  }

  // XXX: Can I execute an async function recursively?
  setInterval(() => {
    if (running) {
      return
    }
    running = true

    alarmIfNecessary(lastStatus)
      .then(updateStatus)
      .catch(onRuntimeError)
  }, interval)
}

function makeGitHubStatusAlarm(emitEvent, compareGitHubStatus) {
  return function checkStatus(lastStatus) {
    return compareGitHubStatus(lastStatus).then(({ type, status, data }) => {
      emitEvent(type, data)
      return status
    })
  }
}

function compareGitHubStatus(lastStatus) {
  return fetchCurrentStatus().then(({ status, last_updated }) => {
    const type = detectStatusChange(lastStatus, status)
    return generateComparisonData(type, status)
  })
}

function makeEmitter({ onNoChange, onError, onRecovered }) {
  const handlers = {
    [Events.NO_CHANGE]: onNoChange,
    [Events.BECAME_GOOD]: onRecovered,
    [Events.BECAME_BAD]: onError
  }
  return function emit(type, data) {
    if (handlers.hasOwnProperty(type)) {
      handlers[type](data)
    }
  }
}

function generateComparisonData(type, status) {
  switch (type) {
    case Events.NO_CHANGE:
      return Promise.resolve({
        type,
        status
      })
    case Events.BECAME_BAD:
    case Events.BECAME_GOOD:
      return fetchLastMessage().then(data => ({
        type,
        status,
        data,
      }))
  }
}

function detectStatusChange(prev, next) {
  if (prev === next) {
    return Events.NO_CHANGE
  }

  if (prev === Statuses.GREEN) {
    return Events.BECAME_BAD
  }

  if (prev === Statuses.YELLOW || prev === Statuses.RED) {
    return next === Statuses.GREEN
      ? Events.BECAME_GOOD
      : Events.NO_CHANGE
  }
}

module.exports = {
  Events,
  pingGitHubPeriodically
}
