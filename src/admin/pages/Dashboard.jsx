import { ArrowRight, CalendarDays, Inbox, MessageSquare, PhoneCall, Star, Trophy } from 'lucide-react'
import { ENQUIRY_STATUSES, getEnquiryStats, listEnquiries } from '../../services/enquiryService'
import { formatDateTime } from '../../utils/format'
import { BreakdownBars, MonthlyChart } from '../components/Charts'
import { Card, EmptyState, EnquiryStatusBadge, ErrorState, PageHeader, Spinner } from '../components/ui'
import useLoader from '../components/useLoader'

const STATUS_COLORS = {
  new: '#d8a94b',
  contacted: '#6fa0d6',
  interested: '#d6a76f',
  converted: '#6fc794',
  not_interested: '#6d6d6d',
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{label}</p>
        <Icon className={`size-4 ${accent ? 'text-gold' : 'text-white/30'}`} strokeWidth={1.6} aria-hidden="true" />
      </div>
      <p className="display mt-4 text-5xl leading-none text-bone tabular-nums">{value}</p>
    </Card>
  )
}

export default function Dashboard() {
  const { data, loading, error, reload } = useLoader(async () => {
    const [stats, recent] = await Promise.all([getEnquiryStats(), listEnquiries({ page: 1, pageSize: 5 })])
    return { stats, recent: recent.rows }
  })

  if (loading && !data) return <Spinner />
  if (error && !data) return <ErrorState message={error} onRetry={reload} />

  const { stats, recent } = data
  const by = stats.by_status ?? {}
  const total = stats.total ?? 0
  const goals = Object.entries(stats.by_goal ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }))
  const conversion = total ? Math.round(((by.converted ?? 0) / total) * 100) : 0

  return (
    <>
      <PageHeader title="Dashboard" description="Live numbers from your enquiry database." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Total enquiries" value={total} icon={Inbox} accent />
        <StatCard label="New" value={by.new ?? 0} icon={MessageSquare} accent />
        <StatCard label="Contacted" value={by.contacted ?? 0} icon={PhoneCall} />
        <StatCard label="Interested" value={by.interested ?? 0} icon={Star} />
        <StatCard label="Converted" value={by.converted ?? 0} icon={Trophy} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="p-5 sm:p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="display text-2xl leading-none">Monthly overview</h2>
            <CalendarDays className="size-4 text-white/30" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <MonthlyChart data={stats.monthly ?? []} />
          <p className="mt-4 text-[11px] text-white/40">Enquiries received per month, last 6 months (India time).</p>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2">
          <h2 className="display mb-5 text-2xl leading-none">By status</h2>
          <BreakdownBars
            total={total}
            items={ENQUIRY_STATUSES.map((s) => ({ label: s.label, value: by[s.value] ?? 0, color: STATUS_COLORS[s.value] }))}
          />
          <p className="mt-5 border-t border-white/10 pt-4 text-xs text-mist">
            Conversion rate: <span className="text-gold">{conversion}%</span> of all enquiries
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5 sm:px-6">
            <h2 className="display text-2xl leading-none">Recent enquiries</h2>
            <a href="/admin/enquiries" className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold hover:text-gold-soft">
              View all <ArrowRight className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={Inbox} title="No enquiries yet" description="Enquiries sent from the website contact form will appear here." />
          ) : (
            <ul className="divide-y divide-white/10">
              {recent.map((row) => (
                <li key={row.id}>
                  <a href="/admin/enquiries" className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-bone">{row.full_name}</p>
                      <p className="mt-0.5 truncate text-xs text-mist">{row.fitness_goal} · {formatDateTime(row.created_at)}</p>
                    </div>
                    <EnquiryStatusBadge status={row.status} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2">
          <h2 className="display mb-5 text-2xl leading-none">By fitness goal</h2>
          <BreakdownBars items={goals} total={total} />
        </Card>
      </div>
    </>
  )
}
