import { Composer } from 'grammy'
import MODES from '../constants/mode.constants.js'
import api from '../api/api.js'

const composer = new Composer()

composer.callbackQuery(/participate/, async ctx => {
  if (ctx.session.mode === MODES.WAIT_PHOTO) return

  try {
    const { username } = ctx.update.callback_query.from
    const promoUID = ctx.match.input.replace(/participate_/g, '')
    const strapiFindRequestResponse = await api.request.find({
      promoUID,
      username,
    })

    if (strapiFindRequestResponse.data.length > 0) {
      const message = {
        approved: ctx.t('request-find-approved'),
        rejected: ctx.t('request-find-rejected'),
        pending: ctx.t('request-find'),
      }[strapiFindRequestResponse.data[0].request_status]

      await ctx.answerCallbackQuery()
      await ctx.reply(message, { parse_mode: 'HTML' })
      return
    }

    ctx.session.mode = MODES.WAIT_PHOTO
    ctx.session.selected_promo_uid = promoUID

    await ctx.answerCallbackQuery({})
    await ctx.reply(ctx.t('participate'), { parse_mode: 'HTML' })
  } catch (error) {
    console.error('Ошибка при обработке callbackQuery:', error)
    await ctx.answerCallbackQuery({})
    await ctx.reply('Произошла ошибка. Попробуйте позже.')
  }
})

export default composer
