import Articles from '#models/articles'
import type { HttpContext } from '@adonisjs/core/http'
import redis from '@adonisjs/redis/services/main'

import axios from 'axios'
import { encode } from 'blurhash'
import sharp from 'sharp'

export default class ArticlesController {
  async getArticles({ request, response }: HttpContext) {
    const { locale, page = 1 } = request.qs()
    const limit = 7

    const articles = await Articles.query()
      .select('id', 'posted_at', 'image', 'type', 'posted_at')
      .orderBy('posted_at', 'desc')
      .preload('article_translations', (query) => {
        query.select('locale', 'url', 'title', 'description')
      })
      .whereHas('article_translations', (query) => {
        query.where('locale', locale)
      })
      .paginate(page, limit)

    const transformedArticles = await Promise.all(
      articles.toJSON().data.map(async (article) => {
        const translation = article.article_translations || {}

        let blurhash = await redis.get(`blurhash:${article.image}`)
        if (!blurhash) {
          try {
            const image = await axios.get(article.image, { responseType: 'arraybuffer' })
            const imageBuffer = Buffer.from(image.data, 'binary')
            const { data, info } = await sharp(imageBuffer)
              .raw()
              .ensureAlpha()
              .toBuffer({ resolveWithObject: true })
            blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
            await redis.set(`blurhash:${article.image}`, blurhash, 'EX', 60 * 60 * 24)
          } catch (error) {
            console.error('Error generating blurhash:', error)
          }
        }

        return {
          id: article.id,
          postedAt: article.posted_at,
          image: article.image,
          type: article.type,
          locale: translation.locale,
          url: translation.url,
          title: translation.title,
          description: translation.description.substring(0, 70).concat('...'),
          articlesId: translation.article_id,
          blurhash,
        }
      })
    )

    const hasMore = page * limit < articles.total
    const lastPage = Math.ceil(articles.total / limit)

    return response.json({
      data: transformedArticles,
      total: articles.total,
      nextPage: hasMore ? Number(Number(page) + 1) : null,
      lastPage,
      hasMore,
    })
  }
}
