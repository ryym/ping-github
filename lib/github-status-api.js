// https://status.github.com/api

const fetch = require('isomorphic-fetch')

const GitHubURLs = {
  STATUS: 'https://status.github.com/api/status.json',
  LAST_MESSAGE: 'https://status.github.com/api/last-message.json'
}

const Statuses = {
  GREEN: 'good',
  YELLOW: 'minor',
  RED: 'major'
}

function fetchCurrentStatus() {
  return getJSON(GitHubURLs.STATUS)
}

function fetchLastMessage() {
  return getJSON(GitHubURLs.LAST_MESSAGE)
}

function getJSON(url) {
  return fetch(url).then(res => res.json())
}

module.exports = {
  Statuses,
  fetchCurrentStatus,
  fetchLastMessage
}
