import { AiAssistantBar } from './ai-assistant-bar'
import { YearStatisticsDashboard } from './year-statistics-dashboard'
import { HARDCODED_TV_YEAR_STATISTICS } from '../features/statistics/year-statistics'

interface HomeInsightsScreenProps {
  onAssistantQuery: (query: string) => void
}

export function HomeInsightsScreen({ onAssistantQuery }: HomeInsightsScreenProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <AiAssistantBar onSubmitQuery={onAssistantQuery} compact clearOnSubmit />
      <YearStatisticsDashboard stats={HARDCODED_TV_YEAR_STATISTICS} />
    </div>
  )
}
