export enum ArticleType {
  Patch = 'patch',
  News = 'news',
  Esports = 'esports',
}

export interface Article {
  id?: number
  title: string
  description: string
  image?: string
  locale: string
  url: string
  type: ArticleType
  posted_at: Date
  created_at?: Date
  updated_at?: Date
}
