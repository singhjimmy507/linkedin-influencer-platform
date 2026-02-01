'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { systemVoiceGuides } from '@/lib/seed-data/voice-guides'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic2, Plus, ChevronRight, Sparkles, User } from 'lucide-react'
import type { Database } from '@/types/database'

type VoiceGuide = Database['public']['Tables']['voice_guides']['Row']

interface VoiceGuideWithDetails extends VoiceGuide {
  voice_identity: {
    core?: string
    traits?: string[]
    background?: string
  } | null
  core_rules: Array<{
    title: string
    description?: string
    examples?: string[]
    example?: { before?: string; after?: string } | string
  }> | null
  hook_formulas: string[] | null
  closing_formulas: Array<{
    name: string
    template: string
  }> | null
  forbidden_phrases: string[] | null
  formatting_rules: string[] | null
}

export default function VoiceGuidesPage() {
  const [voiceGuides, setVoiceGuides] = useState<VoiceGuideWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGuide, setSelectedGuide] = useState<VoiceGuideWithDetails | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchVoiceGuides = async () => {
      const { data, error } = await supabase
        .from('voice_guides')
        .select('*')
        .order('voice_type', { ascending: false })
        .order('name')

      if (error) {
        console.error('Error fetching voice guides:', error)
        // Fall back to system guides if no data in DB
        setVoiceGuides(systemVoiceGuides.map(guide => ({
          id: guide.name.toLowerCase().replace(/\s+/g, '-'),
          user_id: null,
          name: guide.name,
          voice_type: guide.voice_type,
          description: guide.description,
          voice_identity: guide.voice_identity,
          core_rules: guide.core_rules,
          hook_formulas: guide.hook_formulas,
          closing_formulas: guide.closing_formulas,
          forbidden_phrases: guide.forbidden_phrases,
          formatting_rules: guide.formatting_rules,
          is_active: true,
          created_at: new Date().toISOString(),
        })) as VoiceGuideWithDetails[])
      } else if (data && data.length > 0) {
        setVoiceGuides(data as VoiceGuideWithDetails[])
      } else {
        // No data, use system guides
        setVoiceGuides(systemVoiceGuides.map(guide => ({
          id: guide.name.toLowerCase().replace(/\s+/g, '-'),
          user_id: null,
          name: guide.name,
          voice_type: guide.voice_type,
          description: guide.description,
          voice_identity: guide.voice_identity,
          core_rules: guide.core_rules,
          hook_formulas: guide.hook_formulas,
          closing_formulas: guide.closing_formulas,
          forbidden_phrases: guide.forbidden_phrases,
          formatting_rules: guide.formatting_rules,
          is_active: true,
          created_at: new Date().toISOString(),
        })) as VoiceGuideWithDetails[])
      }
      setLoading(false)
    }

    fetchVoiceGuides()
  }, [supabase])

  const systemGuides = voiceGuides.filter(g => g.voice_type === 'system')
  const customGuides = voiceGuides.filter(g => g.voice_type === 'custom')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Voice Guides</h1>
            <p className="text-gray-600">Choose or create your writing voice</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voice Guides</h1>
          <p className="text-gray-600">Choose or create your writing voice</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Voice
        </Button>
      </div>

      {/* System Voice Guides */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          System Voices ({systemGuides.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemGuides.map((guide) => (
            <VoiceGuideCard
              key={guide.id}
              guide={guide}
              onSelect={() => setSelectedGuide(guide)}
            />
          ))}
        </div>
      </div>

      {/* Custom Voice Guides */}
      {customGuides.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Your Custom Voices ({customGuides.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customGuides.map((guide) => (
              <VoiceGuideCard
                key={guide.id}
                guide={guide}
                onSelect={() => setSelectedGuide(guide)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Voice Guide Detail Dialog */}
      <Dialog open={!!selectedGuide} onOpenChange={() => setSelectedGuide(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {selectedGuide && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mic2 className="h-5 w-5" />
                  {selectedGuide.name}
                  <Badge variant={selectedGuide.voice_type === 'system' ? 'secondary' : 'default'}>
                    {selectedGuide.voice_type}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <VoiceGuideDetail guide={selectedGuide} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function VoiceGuideCard({
  guide,
  onSelect,
}: {
  guide: VoiceGuideWithDetails
  onSelect: () => void
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{guide.name}</CardTitle>
          <Badge variant={guide.voice_type === 'system' ? 'secondary' : 'default'}>
            {guide.voice_type}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {guide.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{guide.hook_formulas?.length || 0} hooks</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  )
}

function VoiceGuideDetail({ guide }: { guide: VoiceGuideWithDetails }) {
  return (
    <ScrollArea className="h-[70vh]">
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="closings">Closings</TabsTrigger>
          <TabsTrigger value="forbidden">Forbidden</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-4 mt-4">
          <div>
            <h3 className="font-semibold mb-2">Core Identity</h3>
            <p className="text-gray-600">{guide.voice_identity?.core}</p>
          </div>
          {guide.voice_identity?.traits && (
            <div>
              <h3 className="font-semibold mb-2">Key Traits</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {guide.voice_identity.traits.map((trait, i) => (
                  <li key={i}>{trait}</li>
                ))}
              </ul>
            </div>
          )}
          {guide.voice_identity?.background && (
            <div>
              <h3 className="font-semibold mb-2">Background</h3>
              <p className="text-gray-600">{guide.voice_identity.background}</p>
            </div>
          )}
          {guide.formatting_rules && (
            <div>
              <h3 className="font-semibold mb-2">Formatting Rules</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {guide.formatting_rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4 mt-4">
          {guide.core_rules?.map((rule, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{rule.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rule.description && (
                  <p className="text-sm text-gray-600">{rule.description}</p>
                )}
                {rule.examples && (
                  <div>
                    <p className="text-sm font-medium">Examples:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {rule.examples.map((ex, j) => (
                        <li key={j}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {rule.example && typeof rule.example === 'object' && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {rule.example.before && (
                      <p className="text-red-600 mb-2">
                        <strong>Before:</strong> {rule.example.before}
                      </p>
                    )}
                    {rule.example.after && (
                      <p className="text-green-600">
                        <strong>After:</strong> {rule.example.after}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="hooks" className="space-y-2 mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Use these formulas to start your posts with compelling hooks.
          </p>
          {guide.hook_formulas?.map((hook, i) => (
            <Card key={i} className="bg-blue-50 border-blue-100">
              <CardContent className="py-3">
                <p className="text-sm font-mono">{hook}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="closings" className="space-y-4 mt-4">
          {guide.closing_formulas?.map((closing, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{closing.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-lg">
                  {closing.template}
                </pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="forbidden" className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Never use these phrases in posts using this voice.
          </p>
          <div className="flex flex-wrap gap-2">
            {guide.forbidden_phrases?.map((phrase, i) => (
              <Badge key={i} variant="destructive" className="font-normal">
                {phrase}
              </Badge>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </ScrollArea>
  )
}
