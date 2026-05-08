const API_BASE = 'http://localhost:8000'

// LocalStorageからトークン取得
const getToken = (): string | null => {
  return localStorage.getItem('token')
}

// 認証付きヘッダー生成
const getAuthHeaders = (): HeadersInit => {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// ==========================================
// 認証API
// ==========================================
export const register = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.detail || '登録に失敗しました')
  }
  return res.json()
}

export const login = async (username: string, password: string) => {
  // OAuth2形式のフォームデータ
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })
  if (!res.ok) {
    throw new Error('ログインに失敗しました')
  }
  return res.json()
}

// ==========================================
// スキルAPI
// ==========================================
export const getSkills = async () => {
  const res = await fetch(`${API_BASE}/skills`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('スキル取得失敗')
  return res.json()
}

export const createSkill = async (name: string, level: number, category: string) => {
  const res = await fetch(`${API_BASE}/skills`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, level, category }),
  })
  if (!res.ok) throw new Error('スキル登録失敗')
  return res.json()
}

export const updateSkill = async (skillId: number, name: string, level: number, category: string) => {
  const res = await fetch(`${API_BASE}/skills/${skillId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, level, category }),
  })
  if (!res.ok) throw new Error('スキル更新失敗')
  return res.json()
}

export const deleteSkill = async (skillId: number) => {
  const res = await fetch(`${API_BASE}/skills/${skillId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('スキル削除失敗')
  return res.json()
}