import 'dotenv/config'
import { Bot, GrammyError, HttpError, session } from 'grammy'
import { I18n } from '@grammyjs/i18n'
import express from 'express'
import cors from 'cors'

import MODES from './constants/mode.constants.js'
import photoHandler from './handlers/photo.handler.js'
import infoHandler from './handlers/info.handler.js'
import participateHandler from './handlers/participate.handler.js'
import startHandler from './handlers/start.handler.js'
import cancelHandler from './handlers/cancel.handler.js'
import eastereggHandler from './handlers/easteregg.handler.js'

// Получаем переменные окружения
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN
const API_URL = process.env.API_URL

if (!TG_BOT_TOKEN || !API_URL) {
  throw new Error('Необходимые переменные окружения не найдены в .env файле.')
}

// Создаем экземпляр бота
const bot = new Bot(TG_BOT_TOKEN)
const i18n = new I18n({
  defaultLocale: 'ru',
  directory: 'locales',
})

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(cors())

// Создаем хранилище в сессии бота
const store = () => ({
  mode: MODES.IDLE,
  selected_promo_uid: null,
})

// Подключаем middleware
bot.use(i18n)
bot.use(session({ initial: store }))

// Задаем меню команд бота
bot.api.setMyCommands([
  { command: 'start', description: 'Начало работы с ботом' },
  { command: 'info', description: 'Информация о проводимом розыгрыше' },
])

// Обработчик команды /start
bot.command('start', startHandler)

// Обработчик команды /info
bot.command('info', infoHandler)

// Обработчик нажатия на кнопку "Принять участие"
bot.callbackQuery(/participate/, participateHandler)

// Обработчик отмены режима ожидания фото
bot.hears(['Отмена', 'отмена'], cancelHandler)

// Обработчик сообщения с "пасхалкой"
bot.hears(['❤️', '🍵'], eastereggHandler)

// Обработчик сообщений с фото
bot.on('message:photo', photoHandler)

// Обработка ошибок
bot.catch(err => {
  const ctx = err.ctx
  console.error(`Error while handling update ${ctx.update.update_id}:`)
  const e = err.error
  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description)
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e)
  } else {
    console.error('Unknown error:', e)
  }
})

// Запуск бота
bot.start()

app.post('/notifyuser', async (req, res) => {
  const { chat_id, comment, request_status } = req.body

  if (request_status === 'pending') return

  try {
    if (request_status === 'approved') {
      await bot.api.sendMessage(chat_id, 'Ваша заявка одобрена! Удачи вам! 🎉')
    }

    if (request_status === 'rejected' && !comment) {
      await bot.api.sendMessage(chat_id, 'Ваша заявка отклонена! 😔')
    }

    if (request_status === 'rejected' && comment) {
      await bot.api.sendMessage(
        chat_id,
        `Ваша заявка отклонена! 😔 \nПричина:\n${comment}`
      )
    }
    return res.status(200).json({})
  } catch (error) {
    return res.status(501).json({ error })
  }
})

app.listen(PORT, () => console.log(`server started on PORT: ${PORT}`))
