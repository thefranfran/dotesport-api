import type { HttpContext } from '@adonisjs/core/http'

export default class TeamsController {
  async index({ response }: HttpContext) {
    return response.status(200).json({
      data: [
        { id: 1, league_id: 1, name: 'Karmine Corp', slug: 'karmine-corp' },
        { id: 2, league_id: 1, name: 'G2 Esports', slug: 'g2-esports' },
        { id: 3, league_id: 1, name: 'Fnatic', slug: 'fnatic' },
        { id: 4, league_id: 1, name: 'MAD Lions KOI', slug: 'mad-lions-koi' },
        { id: 5, league_id: 1, name: 'Rogue', slug: 'rogue' },
        { id: 6, league_id: 1, name: 'SK Gaming', slug: 'sk-gaming' },
        { id: 7, league_id: 1, name: 'Vitality', slug: 'vitality' },
        { id: 8, league_id: 1, name: 'Giantx', slug: 'giantx' },
        { id: 9, league_id: 1, name: 'Team BDS', slug: 'team-bds' },
        { id: 10, league_id: 1, name: 'Team Heretics', slug: 'team-heretics' },
      ],
    })
  }
}
