import fetcher from './fetcher.js'

export default {
  promotion: {
    findActive: () =>
      fetcher({
        url: '/promotions',
        params: {
          populate: '*',
          filters: { is_active: { $eq: 'true' } },
        },
      }),
  },
  request: {
    create: data => fetcher({ url: '/requests', method: 'POST', data }),
    find: ({ promoUID, username }) =>
      fetcher({
        url: '/requests',
        method: 'GET',
        params: {
          populate: 'promotion',
          filters: {
            tg_username: { $eq: username },
            promotion: { documentId: { $eq: promoUID } },
          },
        },
      }),
  },
  images: {
    upload: data =>
      fetcher({
        url: '/upload',
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        data,
      }),
  },
}
