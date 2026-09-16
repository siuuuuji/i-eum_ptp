interface SplitScene {
  id: string
  index: number
  text: string
}

interface SplitResult {
  scenes: SplitScene[]
  method: 'manual' | 'paragraph' | 'clause' | 'ai'
}

export const manualSplit = (text: string): SplitScene[] => {
  const scenes = text.split('\n\n').filter(s => s.trim())
  return scenes.map((text, index) => ({
    id: `scene-${Date.now()}-${index}`,
    index,
    text: text.trim()
  }))
}

export const paragraphSplit = (text: string): SplitScene[] => {
  const scenes = text
    .split(/\n+/)
    .filter(s => s.trim())
    .reduce((acc, line, idx) => {
      if (line.trim().length > 100) {
        acc.push(line.trim())
      } else if (acc.length > 0 && acc[acc.length - 1].length < 300) {
        acc[acc.length - 1] += ' ' + line.trim()
      } else {
        acc.push(line.trim())
      }
      return acc
    }, [] as string[])

  return scenes.map((text, index) => ({
    id: `scene-${Date.now()}-${index}`,
    index,
    text
  }))
}

export const clauseSplit = (text: string): SplitScene[] => {
  const clauses = text
    .replace(/([.!?。！？…])/g, '$1|')
    .split('|')
    .filter(s => s.trim())
    .reduce((acc, clause, idx) => {
      const trimmed = clause.trim()
      if (trimmed) {
        if (acc.length > 0 && acc[acc.length - 1].length < 200) {
          acc[acc.length - 1] += ' ' + trimmed
        } else {
          acc.push(trimmed)
        }
      }
      return acc
    }, [] as string[])

  return clauses.map((text, index) => ({
    id: `scene-${Date.now()}-${index}`,
    index,
    text
  }))
}

export const aiSplit = async (text: string): Promise<SplitScene[]> => {
  const prompt = `당신은 텍스트를 의미있는 장면들로 나누는 전문가입니다.

다음 텍스트를 5-10개의 장면으로 나누세요. 각 장면은:
- 독립적인 주제나 분위기를 가져야 함
- 2-5문장 정도의 적당한 길이
- 표현 가능한 시각적 장면이어야 함

JSON 형식으로만 응답하세요:
{
  "scenes": [
    {"text": "장면 텍스트..."},
    ...
  ]
}

텍스트:
${text}`

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: '당신은 텍스트를 의미있는 장면들로 나누는 전문가입니다. 항상 유효한 JSON으로만 응답하세요.',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        responseMimeType: 'application/json',
        temperature: 0.6
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API 오류: ${response.status}`)
    }

    const data = await response.json()
    if (!data.ok) {
      throw new Error(data.error || 'AI 분할에 실패했습니다.')
    }

    const textContent = data.text
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다.')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const scenes = parsed.scenes || []

    if (scenes.length === 0) {
      throw new Error('AI가 장면을 생성하지 못했습니다.')
    }

    return scenes.map((scene: { text: string }, index: number) => ({
      id: `scene-${Date.now()}-${index}`,
      index,
      text: scene.text
    }))
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('텍스트 분할 중 오류가 발생했습니다.')
  }
}

export const splitText = async (
  text: string,
  method: 'manual' | 'paragraph' | 'clause' | 'ai'
): Promise<SplitResult> => {
  let scenes: SplitScene[]

  switch (method) {
    case 'manual':
      scenes = manualSplit(text)
      break
    case 'paragraph':
      scenes = paragraphSplit(text)
      break
    case 'clause':
      scenes = clauseSplit(text)
      break
    case 'ai':
      scenes = await aiSplit(text)
      break
    default:
      scenes = manualSplit(text)
  }

  return { scenes, method }
}
