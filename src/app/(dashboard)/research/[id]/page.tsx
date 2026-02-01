'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  FileText,
  Search,
  Target,
  Loader2,
  Building2,
  Globe,
  Calendar,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']
type DataPull = Database['public']['Tables']['company_data_pulls']['Row']

interface ContentSection {
  section: string
  keywords: number
  volume: number
  top3: number
  top10: number
  pos1: number
  top10Rate: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string
  const [company, setCompany] = useState<Company | null>(null)
  const [dataPulls, setDataPulls] = useState<DataPull[]>([])
  const [loading, setLoading] = useState(true)
  const [pulling, setPulling] = useState(false)
  const supabase = createClient()

  const fetchData = async () => {
    // Fetch company
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !companyData) {
      console.error('Error fetching company:', companyError)
      setLoading(false)
      return
    }

    setCompany(companyData)

    // Fetch data pulls
    const { data: pullsData } = await supabase
      .from('company_data_pulls')
      .select('*')
      .eq('company_id', companyId)
      .order('pull_date', { ascending: false })

    setDataPulls(pullsData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [companyId])

  const handlePullData = async () => {
    if (!company) return
    setPulling(true)

    try {
      const response = await fetch('/api/research/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          domain: company.domain,
        }),
      })

      const result = await response.json()
      if (result.success) {
        fetchData()
      } else {
        alert('Failed to pull data: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error pulling data:', error)
      alert('Failed to pull data')
    }

    setPulling(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Company not found</p>
        <Button variant="link" onClick={() => router.push('/research')}>
          Back to Research
        </Button>
      </div>
    )
  }

  // Extract data from pulls
  const overviewPull = dataPulls.find(p => p.data_type === 'domain_overview')
  const keywordsPull = dataPulls.find(p => p.data_type === 'top_keywords')
  const indexedPull = dataPulls.find(p => p.data_type === 'indexed_pages')

  const overview = overviewPull?.raw_data as {
    totalKeywords?: number
    top10Keywords?: number
    top3Keywords?: number
    position1Keywords?: number
    efficiencyRate?: number
  } | null

  const keywordsData = keywordsPull?.raw_data as {
    keywords?: Array<{
      keyword: string
      searchVolume: number
      position: number
      url: string
    }>
    sections?: ContentSection[]
  } | null

  const indexedPages = (indexedPull?.raw_data as { totalIndexed?: number })?.totalIndexed

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/research')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              {company.name}
            </h1>
            <p className="text-gray-600 flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {company.domain}
              {company.industry && (
                <Badge variant="secondary" className="ml-2">{company.industry}</Badge>
              )}
            </p>
          </div>
        </div>
        <Button onClick={handlePullData} disabled={pulling}>
          {pulling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Pulling Data...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Pull Fresh Data
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              Total Keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {overview?.totalKeywords?.toLocaleString() || '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Top 10 Rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {overview?.top10Keywords?.toLocaleString() || '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Indexed Pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {indexedPages?.toLocaleString() || '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Efficiency Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {overview?.efficiencyRate ? `${overview.efficiencyRate}%` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tabs */}
      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">Content Sections</TabsTrigger>
          <TabsTrigger value="keywords">Top Keywords</TabsTrigger>
          <TabsTrigger value="history">Pull History</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          {keywordsData?.sections && keywordsData.sections.length > 0 ? (
            <>
              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Keywords by Content Section</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={keywordsData.sections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="section" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="keywords" fill="#3b82f6" name="Keywords" />
                      <Bar dataKey="top10" fill="#10b981" name="Top 10" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Section</th>
                          <th className="text-right py-2 font-medium">Keywords</th>
                          <th className="text-right py-2 font-medium">Volume</th>
                          <th className="text-right py-2 font-medium">Top 3</th>
                          <th className="text-right py-2 font-medium">Top 10</th>
                          <th className="text-right py-2 font-medium">Top 10 Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keywordsData.sections.map((section, i) => (
                          <tr key={i} className="border-b">
                            <td className="py-2">{section.section}</td>
                            <td className="text-right py-2">{section.keywords.toLocaleString()}</td>
                            <td className="text-right py-2">{section.volume.toLocaleString()}</td>
                            <td className="text-right py-2">{section.top3.toLocaleString()}</td>
                            <td className="text-right py-2">{section.top10.toLocaleString()}</td>
                            <td className="text-right py-2">{section.top10Rate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-600">No content section data available.</p>
                <Button onClick={handlePullData} className="mt-4">
                  Pull Data Now
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="keywords">
          {keywordsData?.keywords && keywordsData.keywords.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Top Keywords by Search Volume</CardTitle>
                <CardDescription>
                  Showing top {Math.min(50, keywordsData.keywords.length)} keywords
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Keyword</th>
                        <th className="text-right py-2 font-medium">Volume</th>
                        <th className="text-right py-2 font-medium">Position</th>
                        <th className="text-left py-2 font-medium">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywordsData.keywords.slice(0, 50).map((kw, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{kw.keyword}</td>
                          <td className="text-right py-2">{kw.searchVolume.toLocaleString()}</td>
                          <td className="text-right py-2">
                            <Badge variant={kw.position <= 3 ? 'default' : kw.position <= 10 ? 'secondary' : 'outline'}>
                              #{kw.position}
                            </Badge>
                          </td>
                          <td className="py-2 max-w-xs truncate text-gray-500 text-xs">
                            {kw.url.replace(/^https?:\/\/[^/]+/, '')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-600">No keyword data available.</p>
                <Button onClick={handlePullData} className="mt-4">
                  Pull Data Now
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Data Pull History</CardTitle>
            </CardHeader>
            <CardContent>
              {dataPulls.length > 0 ? (
                <div className="space-y-2">
                  {dataPulls.map((pull) => (
                    <div
                      key={pull.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{pull.data_type}</Badge>
                        <span className="text-sm text-gray-600">{pull.api_source}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(pull.pull_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No data pulls yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
