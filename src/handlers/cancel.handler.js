import { Composer } from 'grammy'
import MODES from '../constants/mode.constants.js'

const composer = new Composer()

composer.command('cancel', async ctx => {
  if (ctx.session.mode !== MODES.WAIT_PHOTO) return

  ctx.session.mode = MODES.IDLE
  await ctx.reply(ctx.t('cancel'))
})

export default composer
