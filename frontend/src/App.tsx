import { useState, useEffect } from 'react'
import './App.css'

type Skill = {
  id: number
  name: string
  level: number
  category: string
}

function App() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 🆕 フォーム入力用の状態
  const [formName, setFormName] = useState<string>('')
  const [formLevel, setFormLevel] = useState<number>(1)
  const [formCategory, setFormCategory] = useState<string>('')

  // スキル一覧取得
  useEffect(() => {
    fetch('http://localhost:8000/skills')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`)
        return res.json()
      })
      .then((data: Skill[]) => {
        setSkills(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // 🆕 新規登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formName || !formCategory) {
      alert('名前とカテゴリは必須です！')
      return
    }

    try {
      const res = await fetch('http://localhost:8000/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          level: formLevel,
          category: formCategory,
        }),
      })

      if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`)

      const newSkill: Skill = await res.json()
      
      // 画面に即反映（既存リストに追加）
      setSkills([...skills, newSkill])

      // フォームをリセット
      setFormName('')
      setFormLevel(1)
      setFormCategory('')
    } catch (err) {
      alert(`登録失敗: ${(err as Error).message}`)
    }
  }

  if (loading) return <div className="container"><h1>読み込み中...</h1></div>
  if (error) return <div className="container"><h1>エラー: {error}</h1></div>

  return (
    <div className="container">
      <h1>🎮 スキル図鑑</h1>

      {/* 🆕 登録フォーム */}
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
          <button type="submit" className="form-button">
            追加
          </button>
        </div>
      </form>

      <div className="skill-list">
        {skills.map((skill) => (
          <div key={skill.id} className="skill-card">
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

export default App