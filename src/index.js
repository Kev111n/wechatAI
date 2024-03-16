import {
  WechatyBuilder,
  ScanStatus,
  log
} from 'wechaty'
import qrcodeTerminal from 'qrcode-terminal'
import sendQuestion from './test.js'

let prompt = {
  model: "glm-4",
  messages: [
    // {"role": "user", "content": "作为一名营销专家，请为我的产品创作一个吸引人的slogan"},
    // {"role": "assistant", "content": "当然，为了创作一个吸引人的slogan，请告诉我一些关于您产品的信息"},
  ]
}

function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')

    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin(user) {
  log.info('StarterBot', '%s login', user)
}

function onLogout(user) {
  log.info('StarterBot', '%s logout', user)
}

async function onFriendship(friendship) {
  if (friendship.type() === this.Friendship.Type.Receive) {
    await friendship.accept()
  }
}

async function onMessage(message) {
  const talker = message.talker()

  if (!talker.payload.friend || message.payload.roomId || talker.payload.type != 1) {
    return
  }

  if (message.payload.type != 7) {
    await talker.say("我只能处理文字消息,请发送文字内容")
    return
  }

  log.info(`${talker.name()} : ${message.text()}`)

  await sendQuestion(message.text(), prompt).then(async res => {
    await talker.say(res)
    log.info(`Bot-01 : ${res}`)
  })
}

const bot = WechatyBuilder.build({
  name: 'bot',
  /**
   * How to set Wechaty Puppet Provider:
   *
   *  1. Specify a `puppet` option when instantiating Wechaty. (like `{ puppet: 'wechaty-puppet-padlocal' }`, see below)
   *  1. Set the `WECHATY_PUPPET` environment variable to the puppet NPM module name. (like `wechaty-puppet-padlocal`)
   *
   * You can use the following providers:
   *  - wechaty-puppet-wechat (no token required)
   *  - wechaty-puppet-padlocal (token required)
   *  - wechaty-puppet-service (token required, see: <https://wechaty.js.org/docs/puppet-services>)
   *  - etc. see: <https://github.com/wechaty/wechaty-puppet/wiki/Directory>
   */
  // puppet: 'wechaty-puppet-wechat',
})

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)
bot.on('friendship', onFriendship.bind(bot))

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))