import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSkills, createSkill, deleteSkill } from '../api/client'
import type { Skill } from '../types'

function HomePage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formName, setFormName] = useState('')
  const [formLevel, setFormLevel] = useState(1)
  const [formCategory, setFormCategory] = useState('')

  const { username, logout } = useAuth()
  const navigate = useNavigate()

  // 認証チェック & データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSkills()
        setSkills(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formCategory) {
      alert('名前とカテゴリは必須です！')
      return
    }
    try {
      const newSkill = await createSkill(formName, formLevel, formCategory)
      setSkills([...skills, newSkill])
      setFormName('')
      setFormLevel(1)
      setFormCategory('')
    } catch (err) {
      alert(`登録失敗: ${(err as Error).message}`)
    }
  }

  const handleDelete = async (skillId: number, skillName: string) => {
    // 確認ダイアログ
    if (!confirm(`「${skillName}」を削除しますか？`)) {
      return
    }

    try {
      await deleteSkill(skillId)
      // 画面から即座に削除
      setSkills(skills.filter((skill) => skill.id !== skillId))
    } catch (err) {
      alert(`削除失敗: ${(err as Error).message}`)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return <div className="container"><h1>読み込み中...</h1></div>
  if (error) return <div className="container"><h1>エラー: {error}</h1></div>

  return (
    <div className="container">
      <div className="header">
        <h1>🎮 スキル図鑑</h1>
        <div className="user-info">
          <span>👤 {username}</span>
          <button onClick={handleLogout} className="logout-button">
            ログアウト
          </button>
        </div>
      </div>

      <form className="skill-form" onSubmit={handleSubmit}>
        <h2>新しいスキルを登録</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="スキル名（例：Rust）"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="form-input"
          />
          <select
            value={formLevel}
            onChange={(e) => setFormLevel(Number(e.target.value))}
            className="form-input"
          >
            <option value={1}>Lv.1</option>
            <option value={2}>Lv.2</option>
            <option value={3}>Lv.3</option>
            <option value={4}>Lv.4</option>
            <option value={5}>Lv.5</option>
          </select>
          <input
            type="text"
            placeholder="カテゴリ（例：プログラミング言語）"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            className="form-input"
          />
          <button type="submit" className="form-button">追加</button>
        </div>
      </form>

      <div className="skill-list">
        {skills.map((skill) => (
          <div key={skill.id} className="skill-card">
            <button
              onClick={() => handleDelete(skill.id, skill.name)}
              className="delete-button"
              title="削除"
            >
              ×
            </button>
            <h2>{skill.name}</h2>
            <p className="category">{skill.category}</p>
            <div className="level-bar">
              <div
                className="level-fill"
                style={{ width: `${skill.level * 20}%` }}
              />
            </div>
            <p className="level-text">Lv.{skill.level}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage