import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles'

  async up() {
    this.schema.raw('DROP TYPE IF EXISTS "article_category"')
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('image').notNullable()
      table
        .enu('type', ['news', 'patch', 'esports', 'Annonces'], {
          useNative: true,
          enumName: 'article_category',
          existingType: false,
          schemaName: 'public',
        })
        .notNullable()
      table.string('title').notNullable()
      table.date('posted_at').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.raw('DROP TYPE IF EXISTS "article_category"')
    this.schema.dropTable(this.tableName)
  }
}
