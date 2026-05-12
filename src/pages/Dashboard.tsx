import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  Filter,
  X,
  User,
  ShieldAlert,
  CalendarDays,
  Copy,
  BarChart3,
} from 'lucide-react';
import { BugTable } from '../components/BugTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { bugService, BugHistoryItem } from '../services/api';

type SortOption = 'newest' | 'oldest' | 'confidence-high' | 'confidence-low';

const formatTeamLabel = (team: string) =>
  team
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const DashboardPage = () => {
  const [bugs, setBugs] = useState<BugHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedBug, setSelectedBug] = useState<BugHistoryItem | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await bugService.getHistory();
      setBugs(data);
    } catch (err) {
      console.error('Failed to fetch bug history', err);
      setBugs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const teams = useMemo(
    () => Array.from(new Set(bugs.map((bug) => bug.assigned_to))).sort(),
    [bugs]
  );

  const hasActiveFilters =
    selectedTeam !== 'all' ||
    selectedPriority !== 'all' ||
    showDuplicatesOnly ||
    sortBy !== 'newest';

  const filteredBugs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return bugs
      .filter((bug) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          bug.title.toLowerCase().includes(normalizedSearch) ||
          bug.assigned_to.toLowerCase().includes(normalizedSearch) ||
          bug.description.toLowerCase().includes(normalizedSearch);

        const matchesTeam = selectedTeam === 'all' || bug.assigned_to === selectedTeam;
        const matchesPriority =
          selectedPriority === 'all' || bug.priority.toLowerCase() === selectedPriority;
        const matchesDuplicate = !showDuplicatesOnly || bug.is_duplicate;

        return matchesSearch && matchesTeam && matchesPriority && matchesDuplicate;
      })
      .sort((left, right) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
          case 'confidence-high':
            return right.confidence - left.confidence;
          case 'confidence-low':
            return left.confidence - right.confidence;
          case 'newest':
          default:
            return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
        }
      });
  }, [bugs, searchTerm, selectedTeam, selectedPriority, showDuplicatesOnly, sortBy]);

  const clearFilters = () => {
    setSelectedTeam('all');
    setSelectedPriority('all');
    setShowDuplicatesOnly(false);
    setSortBy('newest');
  };

  const exportVisibleBugs = () => {
    const header = [
      'id',
      'title',
      'description',
      'assigned_to',
      'priority',
      'confidence',
      'created_at',
      'is_duplicate',
      'duplicate_of',
    ];

    const rows = filteredBugs.map((bug) =>
      [
        bug.id,
        bug.title,
        bug.description,
        bug.assigned_to,
        bug.priority,
        bug.confidence,
        bug.created_at,
        bug.is_duplicate,
        bug.duplicate_of ?? '',
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bug-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bug History</h1>
          <p className="text-slate-500 mt-1">Overview of all triaged bugs and their assignments.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={fetchHistory} isLoading={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button type="button" variant="outline" onClick={exportVisibleBugs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Bugs</p>
          <p className="text-3xl font-bold text-slate-900">{bugs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">High Priority</p>
          <p className="text-3xl font-bold text-rose-600">
            {bugs.filter((b) => b.priority.toLowerCase() === 'high').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Avg. Confidence</p>
          <p className="text-3xl font-bold text-indigo-600">
            {bugs.length > 0
              ? ((bugs.reduce((acc, b) => acc + b.confidence, 0) / bugs.length) * 100).toFixed(0)
              : 0}
            %
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Teams Active</p>
          <p className="text-3xl font-bold text-slate-900">
            {new Set(bugs.map((b) => b.assigned_to)).size}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, team, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterOpen((open) => !open)}
            className={isFilterOpen || hasActiveFilters ? 'border-indigo-300 text-indigo-700 bg-indigo-50/60' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters ? (
              <span className="ml-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                Active
              </span>
            ) : null}
          </Button>
        </div>

        {isFilterOpen ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="flex-1">
                <label htmlFor="team-filter" className="block text-sm font-medium text-slate-700 mb-2">
                  Team
                </label>
                <select
                  id="team-filter"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All teams</option>
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {formatTeamLabel(team)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="priority-filter" className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority-filter"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="sort-filter" className="block text-sm font-medium text-slate-700 mb-2">
                  Sort by
                </label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="confidence-high">Highest confidence</option>
                  <option value="confidence-low">Lowest confidence</option>
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={showDuplicatesOnly}
                  onChange={(e) => setShowDuplicatesOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Duplicate reports only
              </label>

              <Button type="button" variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <BugTable bugs={filteredBugs} onViewBug={setSelectedBug} />

      {selectedBug ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-indigo-600">Bug Detail</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedBug.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBug(null)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close bug details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <User className="h-4 w-4" />
                    Assigned team
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatTeamLabel(selectedBug.assigned_to)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <ShieldAlert className="h-4 w-4" />
                    Priority
                  </div>
                  <div className="mt-2">
                    <Badge variant={selectedBug.priority.toLowerCase() === 'high' ? 'error' : selectedBug.priority.toLowerCase() === 'medium' ? 'warning' : 'success'}>
                      {selectedBug.priority}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <BarChart3 className="h-4 w-4" />
                    Confidence
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {(selectedBug.confidence * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CalendarDays className="h-4 w-4" />
                    Created
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {new Date(selectedBug.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600">Description</p>
                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {selectedBug.description}
                </div>
              </div>

              {selectedBug.is_duplicate && selectedBug.duplicate_of ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Copy className="h-4 w-4" />
                    Duplicate signal detected
                  </div>
                  <p className="mt-2 text-sm">This report is marked as similar to report #{selectedBug.duplicate_of}.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
