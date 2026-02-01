import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Note: This would use Anthropic's API in production
// For now, we'll structure the prompt and return a placeholder

interface GenerateRequest {
  voiceGuide: {
    name: string
    voice_identity: unknown
    core_rules: unknown[]
    hook_formulas: string[]
    closing_formulas: unknown[]
    forbidden_phrases: string[]
    formatting_rules: string[]
  }
  template?: {
    name: string
    structure: unknown
  }
  topic: string
  companyContext?: {
    name: string
    domain: string
    data: unknown
  }
  length?: 'short' | 'medium' | 'long'
}

function buildPrompt(request: GenerateRequest): string {
  const { voiceGuide, template, topic, companyContext, length = 'medium' } = request

  let prompt = `You are writing a LinkedIn post in the voice of ${voiceGuide.name}.

## Voice Identity
${JSON.stringify(voiceGuide.voice_identity, null, 2)}

## Core Rules
${voiceGuide.core_rules.map((rule, i) => `${i + 1}. ${JSON.stringify(rule)}`).join('\n')}

## Hook Formulas (use one of these patterns)
${voiceGuide.hook_formulas.map(h => `- ${h}`).join('\n')}

## Closing Formulas
${voiceGuide.closing_formulas.map(c => JSON.stringify(c)).join('\n')}

## Forbidden Phrases (NEVER use these)
${voiceGuide.forbidden_phrases.join(', ')}

## Formatting Rules
${voiceGuide.formatting_rules.join('\n')}

---

## Task
Write a ${length} LinkedIn post about: ${topic}
`

  if (template) {
    prompt += `\n## Template to Follow\n${JSON.stringify(template.structure, null, 2)}\n`
  }

  if (companyContext) {
    prompt += `\n## Company Context\nCompany: ${companyContext.name} (${companyContext.domain})\nData: ${JSON.stringify(companyContext.data, null, 2)}\n`
  }

  prompt += `
## Length Guide
- Short: 100-150 words
- Medium: 200-300 words
- Long: 400-500 words

Write the post now. Start with a compelling hook.`

  return prompt
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GenerateRequest = await request.json()

    if (!body.voiceGuide || !body.topic) {
      return NextResponse.json({ error: 'Missing voiceGuide or topic' }, { status: 400 })
    }

    const prompt = buildPrompt(body)

    // In production, this would call the Anthropic API:
    // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    // const response = await anthropic.messages.create({
    //   model: 'claude-sonnet-4-20250514',
    //   max_tokens: 1024,
    //   messages: [{ role: 'user', content: prompt }]
    // })

    // For now, return a placeholder that shows the prompt was built correctly
    return NextResponse.json({
      success: true,
      prompt,
      content: `[AI Content Generation Placeholder]

This is where the AI-generated post would appear.

Topic: ${body.topic}
Voice: ${body.voiceGuide.name}
Length: ${body.length || 'medium'}

To enable AI generation:
1. Add your ANTHROPIC_API_KEY to .env.local
2. Install the Anthropic SDK: npm install @anthropic-ai/sdk
3. Uncomment the API call in this route

The prompt has been built using:
- Voice identity and rules from ${body.voiceGuide.name}
- ${body.voiceGuide.hook_formulas.length} hook formulas
- ${body.voiceGuide.forbidden_phrases.length} forbidden phrases
${body.companyContext ? `- Company context for ${body.companyContext.name}` : ''}
`,
    })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
