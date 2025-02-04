import { Composer } from 'grammy'
import MODES from '../constants/mode.constants.js'

const composer = new Composer()

composer.command('start', async ctx => {
  if (ctx.session.mode === MODES.WAIT_PHOTO) return

  const { first_name } = ctx.message.chat

  await ctx.reply(ctx.t('start', { first_name }), { parse_mode: 'HTML' })
})

export default composer
