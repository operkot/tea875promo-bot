import axios from 'axios'

const API_URL = process.env.API_URL
const API_TOKEN = process.env.API_TOKEN

if (!API_URL || !API_TOKEN) {
  throw new Error('Необходимые переменные окружения не найдены в .env файле.')
}

const instance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
  },
})

export default ({
  url = '/',
  method = 'GET',
  params = {},
  data = {},
  headers = {},
}) => instance({ url, method, headers, params, data }).then(res => res.data)
