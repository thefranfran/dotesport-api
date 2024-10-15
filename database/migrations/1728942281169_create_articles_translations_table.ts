import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles_translations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('articles_id').unsigned().references('articles.id').onDelete('CASCADE')
      table.string('url').notNullable()
      table.string('locale').notNullable()
      table.string('title').notNullable()
      table.string('description').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.raw('DROP TYPE IF EXISTS "article_category"')
    this.schema.dropTable(this.tableName)
  }
}
