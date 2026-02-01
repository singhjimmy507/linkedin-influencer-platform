'use client'

import { useEffect, useState } from 'react'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Linkedin,
  Save,
  Loader2,
  Plus,
  X,
} from 'lucide-react'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    linkedinUrl: '',
    linkedinHandle: '',
    brandPositioning: '',
    contentPillars: [] as string[],
  })
  const [newPillar, setNewPillar] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else if (data) {
        const profileData = data as Profile
        setProfile(profileData)
        setFormData({
          fullName: profileData.full_name || '',
          linkedinUrl: profileData.linkedin_url || '',
          linkedinHandle: profileData.linkedin_handle || '',
          brandPositioning: profileData.brand_positioning || '',
          contentPillars: (profileData.content_pillars as string[]) || [],
        })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    const untypedClient = createUntypedClient()
    const { error } = await untypedClient
      .from('profiles')
      .update({
        full_name: formData.fullName,
        linkedin_url: formData.linkedinUrl,
        linkedin_handle: formData.linkedinHandle,
        brand_positioning: formData.brandPositioning,
        content_pillars: formData.contentPillars,
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } else {
      alert('Profile updated successfully!')
    }

    setSaving(false)
  }

  const addPillar = () => {
    if (newPillar && !formData.contentPillars.includes(newPillar)) {
      setFormData({
        ...formData,
        contentPillars: [...formData.contentPillars, newPillar],
      })
      setNewPillar('')
    }
  }

  const removePillar = (pillar: string) => {
    setFormData({
      ...formData,
      contentPillars: formData.contentPillars.filter(p => p !== pillar),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your profile and brand positioning</p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ''} disabled />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Your full name"
            />
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5" />
            LinkedIn Profile
          </CardTitle>
          <CardDescription>Connect your LinkedIn for content analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>LinkedIn Profile URL</Label>
            <Input
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="space-y-2">
            <Label>LinkedIn Handle</Label>
            <Input
              value={formData.linkedinHandle}
              onChange={(e) => setFormData({ ...formData, linkedinHandle: e.target.value })}
              placeholder="yourprofile"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brand Positioning */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Positioning</CardTitle>
          <CardDescription>Define your unique value proposition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Positioning Statement</Label>
            <Textarea
              value={formData.brandPositioning}
              onChange={(e) => setFormData({ ...formData, brandPositioning: e.target.value })}
              placeholder="The growth operator for fast-growing companies who runs experiments relentlessly — find the best, do it today, whatever it takes."
              rows={3}
            />
            <p className="text-xs text-gray-500">
              A clear statement of who you help and how
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Content Pillars</Label>
            <p className="text-sm text-gray-500 mb-2">
              Topics you&apos;ll consistently post about
            </p>

            <div className="flex flex-wrap gap-2 mb-2">
              {formData.contentPillars.map((pillar) => (
                <Badge key={pillar} variant="secondary" className="flex items-center gap-1">
                  {pillar}
                  <button
                    onClick={() => removePillar(pillar)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newPillar}
                onChange={(e) => setNewPillar(e.target.value)}
                placeholder="Add a content pillar"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPillar())}
              />
              <Button type="button" variant="outline" onClick={addPillar}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Examples: SEO/GEO Intel, Growth Operations, Case Studies, Operator Mindset
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
