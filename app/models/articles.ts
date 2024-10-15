import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'

import ArticlesTranslation from '#models/articles_translations'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { ArticleType } from '#types/article'

export default class Articles extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @hasOne(() => ArticlesTranslation)
  declare article_translations: HasOne<typeof ArticlesTranslation>

  @column()
  declare image: string

  @column()
  declare title: string

  @column()
  declare type: ArticleType

  @column()
  declare postedAt: Date

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
