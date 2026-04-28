import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login as loginApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 登録
      await register(username, password)
      // 続けて自動ログイン
      const data = await loginApi(username, password)
      login(data.access_token, username)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🎮 新規登録</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            required
            minLength={3}
          />
          <input
            type="password"
            placeholder="パスワード（8文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
            minLength={8}
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
        <p className="auth-link">
          既にアカウントある？ <Link to="/login">ログイン</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage