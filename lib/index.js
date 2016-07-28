const {
  pingGitHubPeriodically
} = require('./status-checker')

module.exports = function watchGitHub() {
  pingGitHubPeriodically.apply(this, arguments)
}
