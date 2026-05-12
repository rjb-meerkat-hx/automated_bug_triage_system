import React from 'react';
import { motion } from 'motion/react';
import { Search, Clock, User, ChevronRight, Copy } from 'lucide-react';
import { Badge } from './ui/Badge';
import { BugHistoryItem } from '@/src/services/api';

interface BugTableProps {
  bugs: BugHistoryItem[];
  onViewBug?: (bug: BugHistoryItem) => void;
}

export const BugTable = ({ bugs, onViewBug }: BugTableProps) => {
  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (bugs.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No bugs found</h3>
        <p className="text-slate-500">Start by submitting a bug report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Bug Details</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned To</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bugs.map((bug, index) => (
              <motion.tr
                key={bug.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="font-semibold text-slate-900 truncate">{bug.title}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{bug.description}</p>
                    {bug.is_duplicate && bug.duplicate_of ? (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                        <Copy className="h-3 w-3" />
                        Similar to report #{bug.duplicate_of}
                      </div>
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{bug.assigned_to}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getPriorityVariant(bug.priority)}>
                    {bug.priority}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${bug.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {(bug.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">{new Date(bug.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onViewBug?.(bug)}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    aria-label={`View details for ${bug.title}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
