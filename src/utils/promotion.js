export const getPromoInfo = promo => ({
  documentId: promo.documentId,
  title: promo.title,
  description: promo.description,
  photo: promo.photo?.url,
})
