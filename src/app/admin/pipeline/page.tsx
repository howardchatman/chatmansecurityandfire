"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ArrowRight,
  GripVertical,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: string;
  createdAt: string;
  lastContact: string;
}

const stages = [
  { id: "new", name: "New Leads", color: "bg-blue-500" },
  { id: "contacted", name: "Contacted", color: "bg-yellow-500" },
  { id: "qualified", name: "Qualified", color: "bg-purple-500" },
  { id: "proposal", name: "Proposal Sent", color: "bg-orange-500" },
  { id: "negotiation", name: "Negotiation", color: "bg-pink-500" },
  { id: "won", name: "Won", color: "bg-green-500" },
];

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    company: "ABC Corp",
    email: "john@abccorp.com",
    phone: "(555) 123-4567",
    value: 15000,
    stage: "new",
    createdAt: "2024-01-15",
    lastContact: "2024-01-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    company: "Tech Solutions",
    email: "sarah@techsol.com",
    phone: "(555) 234-5678",
    value: 28000,
    stage: "new",
    createdAt: "2024-01-14",
    lastContact: "2024-01-16",
  },
  {
    id: "3",
    name: "Mike Williams",
    company: "Secure Homes LLC",
    email: "mike@securehomes.com",
    phone: "(555) 345-6789",
    value: 12000,
    stage: "contacted",
    createdAt: "2024-01-10",
    lastContact: "2024-01-17",
  },
  {
    id: "4",
    name: "Emily Davis",
    company: "Office Plus",
    email: "emily@officeplus.com",
    phone: "(555) 456-7890",
    value: 45000,
    stage: "qualified",
    createdAt: "2024-01-08",
    lastContact: "2024-01-18",
  },
  {
    id: "5",
    name: "Robert Brown",
    company: "Industrial Safety Co",
    email: "robert@indsafety.com",
    phone: "(555) 567-8901",
    value: 75000,
    stage: "proposal",
    createdAt: "2024-01-05",
    lastContact: "2024-01-18",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    company: "Retail Chain Inc",
    email: "lisa@retailchain.com",
    phone: "(555) 678-9012",
    value: 120000,
    stage: "negotiation",
    createdAt: "2024-01-01",
    lastContact: "2024-01-19",
  },
  {
    id: "7",
    name: "David Wilson",
    company: "Wilson Warehouses",
    email: "david@wilsonwh.com",
    phone: "(555) 789-0123",
    value: 55000,
    stage: "won",
    createdAt: "2023-12-20",
    lastContact: "2024-01-19",
  },
];

export default function PipelinePage() {
  const [leads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState("");

  const getLeadsByStage = (stageId: string) => {
    return leads.filter(
      (lead) =>
        lead.stage === stageId &&
        (lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getTotalValueByStage = (stageId: string) => {
    return getLeadsByStage(stageId).reduce((sum, lead) => sum + lead.value, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Drag and drop leads through your sales stages
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Add Lead
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${stage.color}`} />
              <span className="text-sm font-medium text-gray-700">
                {stage.name}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getLeadsByStage(stage.id).length}
            </div>
            <div className="text-sm text-gray-500">
              {formatCurrency(getTotalValueByStage(stage.id))}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">Filter</span>
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4"
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {getLeadsByStage(stage.id).length}
                </span>
              </div>
              <button className="p-1 hover:bg-gray-200 rounded">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Lead Cards */}
            <div className="space-y-3">
              {getLeadsByStage(stage.id).map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {lead.name}
                        </h4>
                        <p className="text-sm text-gray-500">{lead.company}</p>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(lead.value)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Call"
                    >
                      <Phone className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Schedule"
                    >
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="flex-1" />
                    <button
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Move to next stage"
                    >
                      <ArrowRight className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}

              {getLeadsByStage(stage.id).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No leads in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
