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

  useEffect(() => {
    fetch('http://localhost:8000/skills')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTPエラー: ${res.status}`)
        }
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

  if (loading) return <div className="container"><h1>読み込み中...</h1></div>
  if (error) return <div className="container"><h1>エラー: {error}</h1></div>

  return (
    <div className="container">
      <h1>🎮 スキル図鑑</h1>
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