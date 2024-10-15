/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const ArticlesController = () => import('#controllers/articles_controller')
const TeamsController = () => import('#controllers/teams_controller')
const LeaguesController = () => import('#controllers/leagues_controller')

router
  .group(() => {
    router.get('/leagues', [LeaguesController, 'index'])
    router.get('/teams', [TeamsController, 'index'])
  })
  .prefix('/esports')

router
  .group(() => {
    router.get('/all', [ArticlesController, 'getArticles'])
  })
  .prefix('/articles')
