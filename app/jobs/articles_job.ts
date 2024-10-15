import { BaseJob } from '#types/job'
import { Article, ArticleType } from '#types/article'
import Articles from '#models/articles'

import axios from 'axios'
import puppeteer from 'puppeteer'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

const LANGUES_HANDLED = ['fr-fr', 'en-us']

export default class ArticlesJob extends BaseJob {
  run() {
    const urls = LANGUES_HANDLED.map((lang) => `https://www.leagueoflegends.com/${lang}/news/`)

    urls.forEach(async (url, index) => {
      await this.getArticles(url, LANGUES_HANDLED[index])
    })
  }

  private urlRefactoring(url: string) {
    const s = url.split('/')
    if (s[1].includes(LANGUES_HANDLED[0]) || s[1].includes(LANGUES_HANDLED[1])) {
      return `https://www.leagueoflegends.com${url}`
    }

    return url
  }

  /**
   * Fetches images from a given URL using a headless browser.
   *
   * @param url - The URL of the page to fetch images from.
   * @returns A promise that resolves to an array of image URLs.
   * @throws Will throw an error if the browser operation fails.
   */
  async getImageFromBrowser(url: string) {
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      return await page.goto(url, { waitUntil: 'networkidle2' }).then(async () => {
        const images = await page.evaluate(() => {
          return [...document.querySelectorAll('img[data-testid="mediaImage"]')].map((el) =>
            el.getAttribute('src')
          )
        })

        await browser.close()

        return images
      })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   * Fetches articles from the specified URL, processes them, and saves them.
   *
   * @param url - The URL to fetch articles from.
   * @param locale - The locale to associate with the articles.
   * @returns A promise that resolves when the articles have been fetched, processed, and saved.
   *
   * @throws Will throw an error if the fetching or processing fails.
   */
  async getArticles(url: string, locale: string) {
    try {
      let data: Article[] = []

      await axios.get(url).then(function (response) {
        const dom = new JSDOM(response.data, {
          includeNodeLocations: true,
        })
        ;[
          ...dom.window.document.querySelectorAll('a[data-testid="articlefeaturedcard-component"]'),
        ].forEach((el) => {
          data.push({
            locale,
            title: el.querySelector('div[data-testid="card-title"]')?.textContent || '',
            description: el.querySelector('div[data-testid="card-description"]')?.textContent || '',
            type:
              el.querySelector('div[data-testid="card-category"]')?.textContent || ArticleType.News,
            url: el.getAttribute('href')!,
            posted_at: new Date(
              el.querySelector('div[data-testid="card-date"] > time')?.getAttribute('datetime') ||
                new Date()
            ),
          })
        })
      })

      const images = await this.getImageFromBrowser(url)

      data = data.map((article, index) => {
        return {
          ...article,
          image: images[index]!,
          url: this.urlRefactoring(article.url),
          type: this.convertTypeArticle(article.type, article.title),
        }
      })

      this.saveArticles(data)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  private convertTypeArticle(type: string, title: string) {
    if (title.includes('Patch') || title.includes('Notes de patch')) {
      return ArticleType.Patch
    }

    switch (type) {
      case 'E-sport':
        return ArticleType.Esports
      case 'Esports':
        return ArticleType.Esports
      default:
        return ArticleType.News
    }
  }

  /**
   * Saves an array of articles to the database. This function updates existing articles
   * or creates new ones based on the 'title' field. After saving the articles, it ensures
   * that each article has a related translation entry.
   *
   * @param {Article[]} data - An array of articles to be saved. Each article should contain
   *                           the fields: image, title, posted_at, type, url, locale, and description.
   * @returns {Promise<void>} - A promise that resolves when the articles have been saved and
   *                            their translations have been created or updated.
   */
  async saveArticles(data: Article[]) {
    const articles = await Articles.updateOrCreateMany(
      'title',
      data.map((article) => {
        return {
          image: article.image,
          title: article.title,
          postedAt: article.posted_at,
          type: article.type,
        }
      })
    )

    articles.forEach((article, index) => {
      article.related('article_translations').firstOrCreate({
        url: data[index].url,
        locale: data[index].locale,
        title: data[index].title,
        description: data[index].description,
      })
    })
  }
}
