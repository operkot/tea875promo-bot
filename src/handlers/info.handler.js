import { Composer, InlineKeyboard } from 'grammy'
import MODES from '../constants/mode.constants.js'
import api from '../api/api.js'
import { getPromoInfo } from '../utils/promotion.js'

const composer = new Composer()

composer.command('info', async ctx => {
  if (ctx.session.mode === MODES.WAIT_PHOTO) return

  try {
    // Запрос к API для получения информации о активном розыгрыше
    const strapiPromotionResponse = await api.promotion.findActive()

    // Проверяем есть ли активный розыгрыш и если активного нет отпрвляем сообщение пользователю
    if (!strapiPromotionResponse.data.length) {
      await ctx.reply(ctx.t('no-active-promotion'), { parse_mode: 'HTML' })
      return
    }

    // Получаем данные о розыгрыше из ответа
    const { documentId, description, photo } = getPromoInfo(
      strapiPromotionResponse.data[0]
    )

    // Создаем inline-клавиатуру с кнопкой "Принять участие"
    const inlineKeyboard = new InlineKeyboard().text(
      'Принять участие',
      `participate_${documentId}`
    )

    // const replyMessage = ctx.t('promotion-info', { title, description })
    const replyOptions = {
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard,
    }

    // Проверяем, есть ли изображение, если есть отправляем сообщение с фото и inline-клавиатурой
    // if (photo) {
    //   await ctx.replyWithPhoto(process.env.API_URL + photo, {
    //     caption: description,
    //     ...replyOptions,
    //   })
    //   return
    // }

    //Отправляем просто текстовое сообщение с inline-клавиатурой если изображения нет
    await ctx.reply(description, replyOptions)
  } catch (error) {
    console.error('Ошибка при получении информации о розыгрыше:', error)
    await ctx.reply('Произошла ошибка при получении информации о розыгрыше.')
  }
})

export default composer
