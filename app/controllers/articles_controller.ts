import type { HttpContext } from '@adonisjs/core/http'

import Articles from '#models/articles'
import ImageServices from '#services/image_services'

export default class ArticlesController {
  /**
   * Retrieves a paginated list of articles with their translations and additional metadata.
   *
   * @param {HttpContext} context - The HTTP context containing the request and response objects.
   * @param {object} context.request - The HTTP request object.
   * @param {object} context.response - The HTTP response object.
   *
   * @returns {Promise<void>} A JSON response containing the paginated list of articles,
   *                          their translations, and additional metadata.
   */
  async getArticles({ request, response }: HttpContext) {
    const { locale, page = 1, search = '' } = request.qs()
    const limit = 7

    const articles = await Articles.query()
      .select('id', 'postedAt', 'image', 'type')
      .preload('article_translations', (query) => {
        query.select('locale', 'url', 'title', 'description')
      })
      .whereHas('article_translations', (query) => {
        query.where('locale', locale).if(search, (subquery) => {
          subquery
            .where('title', 'ilike', `%${search}%`)
            .orWhere('description', 'ilike', `%${search}%`)
        })
      })
      .orderBy('posted_at', 'desc')
      .paginate(page, limit)

    const transformedArticles = await Promise.all(
      articles.toJSON().data.map(async (article) => {
        const translation = article.article_translations || {}
        const blurhash = await new ImageServices().blurhash(article.image)

        return {
          id: article.id,
          posted_at: article.postedAt,
          image: article.image,
          type: article.type,
          locale: translation.locale,
          url: translation.url,
          title: translation.title,
          description: translation.description.substring(0, 70).concat('...'),
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
