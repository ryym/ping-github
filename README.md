## Ping GitHub

Ping GitHub periodically.

### Usage:

```js
const { watchGitHub } = require('./lib')

watchGitHub({
  interval: 1000,
  handlers: {
    onNoChange: () => console.log('no change'),
    onError: data => console.log('GitHub died..!'),
    onRecovered: data => console.log('GitHub came back!'),
  },
})
```
