import type { HttpContext } from '@adonisjs/core/http'

export default class LeaguesController {
  async index({ response }: HttpContext) {
    return response.status(200).json({
      data: [
        { id: 1, name: 'LEC', slug: 'lec', is_available: true },
        { id: 2, name: 'LCS', slug: 'lcs', is_available: true },
        { id: 3, name: 'LCK', slug: 'lck', is_available: false },
        { id: 4, name: 'LPL', slug: 'lpl', is_available: false },
      ],
    })
  }
}
