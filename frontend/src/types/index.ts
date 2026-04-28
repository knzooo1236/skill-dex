export type Skill = {
  id: number
  name: string
  level: number
  category: string
}

export type User = {
  id: number
  username: string
}

export type AuthResponse = {
  access_token: string
  token_type: string
}