import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ArticlesTranslations extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare articlesId: number

  @column()
  declare url: string

  @column()
  declare locale: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
