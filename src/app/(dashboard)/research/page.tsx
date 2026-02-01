'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Building2,
  Globe,
  TrendingUp,
  Calendar,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']
type CompanyDataPull = Database['public']['Tables']['company_data_pulls']['Row']

interface CompanyWithData extends Company {
  latestPull?: string
  totalKeywords?: number
  indexedPages?: number
}

export default function ResearchPage() {
  const [companies, setCompanies] = useState<CompanyWithData[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newCompany, setNewCompany] = useState({ name: '', domain: '', industry: '' })
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  const fetchCompanies = async () => {
    const { data: companiesData, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching companies:', error)
      setLoading(false)
      return
    }

    // Fetch latest data pulls for each company
    const companiesWithData: CompanyWithData[] = []
    const companiesList = (companiesData || []) as Company[]
    for (const company of companiesList) {
      const { data: pullsData } = await supabase
        .from('company_data_pulls')
        .select('*')
        .eq('company_id', company.id)
        .order('pull_date', { ascending: false })
        .limit(5)

      const pulls = (pullsData || []) as CompanyDataPull[]
      const latestPull = pulls[0]?.pull_date
      const overviewPull = pulls.find(p => p.data_type === 'domain_overview')
      const indexedPull = pulls.find(p => p.data_type === 'indexed_pages')

      companiesWithData.push({
        ...company,
        latestPull,
        totalKeywords: (overviewPull?.raw_data as Record<string, number>)?.totalKeywords,
        indexedPages: (indexedPull?.raw_data as Record<string, number>)?.totalIndexed,
      })
    }

    setCompanies(companiesWithData)
    setLoading(false)
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)

    // Clean domain (remove protocol and trailing slash)
    const cleanDomain = newCompany.domain
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setAdding(false)
      return
    }

    const untypedClient = createUntypedClient()
    const { error } = await untypedClient.from('companies').insert({
      user_id: user.id,
      name: newCompany.name,
      domain: cleanDomain,
      industry: newCompany.industry || null,
    })

    if (error) {
      console.error('Error adding company:', error)
      alert('Failed to add company: ' + error.message)
    } else {
      setNewCompany({ name: '', domain: '', industry: '' })
      setIsAddOpen(false)
      fetchCompanies()
    }

    setAdding(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Research</h1>
            <p className="text-gray-600">Pull SEO data for companies</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Company Research</h1>
          <p className="text-gray-600">Pull SEO data for companies</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  placeholder="Wise"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="wise.com"
                  value={newCompany.domain}
                  onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry (optional)</Label>
                <Input
                  id="industry"
                  placeholder="Fintech"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={adding}>
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Company'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {companies.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies yet</h3>
            <p className="text-gray-600 mb-4">
              Add a company to start pulling SEO research data.
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link key={company.id} href={`/research/${company.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {company.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {company.domain}
                      </CardDescription>
                    </div>
                    {company.industry && (
                      <Badge variant="secondary">{company.industry}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Keywords</p>
                      <p className="font-semibold">
                        {company.totalKeywords?.toLocaleString() || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Indexed Pages</p>
                      <p className="font-semibold">
                        {company.indexedPages?.toLocaleString() || '—'}
                      </p>
                    </div>
                  </div>
                  {company.latestPull && (
                    <div className="flex items-center gap-1 mt-4 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Last pulled: {new Date(company.latestPull).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
