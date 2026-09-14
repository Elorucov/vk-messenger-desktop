var spawn = require('cross-spawn')

if (process.platform === 'darwin') {
  spawn.sync('npm', ['run', 'native_build'], {
    input: 'Build native module',
    stdio: 'inherit',
  })
}
