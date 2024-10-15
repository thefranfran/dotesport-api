import redis from '@adonisjs/redis/services/main'

import axios from 'axios'
import { encode } from 'blurhash'
import sharp from 'sharp'

export default class ImageServices {
  /**
   * Generates a blurhash for the given image URL. If the blurhash is already cached in Redis, it retrieves it from there.
   * Otherwise, it fetches the image, processes it, generates the blurhash, and stores it in Redis with a 24-hour expiration.
   *
   * @param {string} image - The URL of the image to generate the blurhash for.
   * @returns {Promise<string | null>} - The generated blurhash or null if an error occurs.
   */
  async blurhash(image: string) {
    let blurhash = await redis.get(`blurhash:${image}`)

    if (!blurhash) {
      try {
        const response = await axios.get(image, { responseType: 'arraybuffer' })
        const imageBuffer = Buffer.from(response.data, 'binary')
        const { data, info } = await sharp(imageBuffer)
          .raw()
          .ensureAlpha()
          .toBuffer({ resolveWithObject: true })
        blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
        await redis.set(`blurhash:${image}`, blurhash, 'EX', 60 * 60 * 24)
      } catch (error) {
        console.error('Error generating blurhash:', error)
      }
    }

    return blurhash
  }
}
