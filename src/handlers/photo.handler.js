import { Composer } from 'grammy'
import axios from 'axios'
import FormData from 'form-data'

import api from '../api/api.js'
import MODES from '../constants/mode.constants.js'

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN
const composer = new Composer()

composer.on('message:photo', async ctx => {
  if (ctx.session.mode !== MODES.WAIT_PHOTO) return

  try {
    const { id, username } = ctx.message.chat
    const { selected_promo_uid } = ctx.session

    // Получаем фото с наивысшим разрешением
    const photo = ctx.message.photo[ctx.message.photo.length - 1]
    const fileId = photo.file_id

    // Получаем информацию о файле
    const file = await ctx.api.getFile(fileId)
    const fileUrl = `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${file.file_path}`

    // Скачиваем файл как поток (stream)
    const response = await axios.get(fileUrl, { responseType: 'stream' })

    // Создаем FormData и добавляем файл
    const formData = new FormData()
    formData.append('files', response.data, {
      filename: `${username}_${selected_promo_uid}_screenshot`,
      contentType: 'image/jpeg',
    })

    // Отправляем файл в Strapi
    const strapiImageUploadResponse = await api.images.upload(formData)
    console.log(strapiImageUploadResponse.data.data)

    // Создаем объект заявки на участие в розыгрыше
    const userRequestData = {
      data: {
        tg_username: username,
        chat_id: id,
        promotion: {
          connect: [{ documentId: selected_promo_uid }],
        },
        screenshot: strapiImageUploadResponse[0]?.id,
      },
    }

    // Отправляем зявку в Strapi
    const strapiRequestCreateResponse = await api.request.create(
      userRequestData
    )

    // Выходим из режима одидания фото и сбрасываем выбранный розыгрыш.
    ctx.session.mode = MODES.IDLE
    ctx.session.selected_promo_uid = null

    // Отправляем ответ пользователю
    await ctx.reply(ctx.t('request-created'))
  } catch (error) {
    // Выходим из режима одидания фото и сбрасываем выбранный розыгрыш.
    ctx.session.mode = MODES.IDLE
    ctx.session.selected_promo_uid = null
    console.error('Ошибка:', error)
    await ctx.reply('Произошла ошибка при обработке фото.')
  }
})

export default composer
