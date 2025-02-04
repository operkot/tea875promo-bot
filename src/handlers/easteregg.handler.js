import { Composer } from 'grammy'
import MODES from '../constants/mode.constants.js'

const composer = new Composer()

composer.hears(['❤️', '🍵'], async ctx => {
  if (ctx.session.mode === MODES.WAIT_PHOTO) return

  return ctx.reply(ctx.t('easteregg'))
})

export default composer
