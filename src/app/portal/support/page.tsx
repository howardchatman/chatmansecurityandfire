"use client";

import { useState } from "react";
import {
  Ticket,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Send,
} from "lucide-react";

export default function SupportPage() {
  const [showNewTicket, setShowNewTicket] = useState(false);

  const tickets = [
    {
      id: "TKT-2024-001",
      subject: "Camera 3 showing offline",
      status: "open",
      priority: "medium",
      created: "Jan 18, 2024",
      lastUpdate: "Jan 19, 2024",
      messages: 3,
    },
    {
      id: "TKT-2023-042",
      subject: "Request for additional motion sensor",
      status: "closed",
      priority: "low",
      created: "Dec 10, 2023",
      lastUpdate: "Dec 15, 2023",
      messages: 5,
    },
    {
      id: "TKT-2023-038",
      subject: "False alarm investigation",
      status: "closed",
      priority: "high",
      created: "Nov 25, 2023",
      lastUpdate: "Nov 27, 2023",
      messages: 8,
    },
  ];

  const statusConfig = {
    open: { label: "Open", color: "bg-yellow-100 text-yellow-700" },
    in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
    closed: { label: "Closed", color: "bg-gray-100 text-gray-700" },
  };

  const priorityConfig = {
    low: { label: "Low", color: "text-gray-600" },
    medium: { label: "Medium", color: "text-yellow-600" },
    high: { label: "High", color: "text-red-600" },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-600 mt-1">
            Get help and manage your support requests
          </p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Phone Support</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">24/7 emergency support line</p>
          <a
            href="tel:1-800-555-1234"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            1-800-555-1234
          </a>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Email Support</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">Response within 24 hours</p>
          <a
            href="mailto:support@securityplatform.com"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            support@securityplatform.com
          </a>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Live Chat</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">Mon-Fri, 8am-8pm EST</p>
          <button className="text-red-600 hover:text-red-700 font-medium">
            Start Chat
          </button>
        </div>
      </div>

      {/* New Ticket Form */}
      {showNewTicket && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Create Support Ticket
            </h2>
            <button
              onClick={() => setShowNewTicket(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option>Equipment Issue</option>
                <option>Billing Question</option>
                <option>Service Request</option>
                <option>False Alarm</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="low">Low - General inquiry</option>
                <option value="medium">Medium - Issue affecting service</option>
                <option value="high">High - Urgent issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Please provide details about your issue..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Tickets</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {tickets.map((ticket) => {
            const status = statusConfig[ticket.status as keyof typeof statusConfig];
            const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];
            return (
              <div
                key={ticket.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">
                        {ticket.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                      <span className={`text-xs font-medium ${priority.color}`}>
                        {priority.label} Priority
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Created {ticket.created}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {ticket.messages} messages
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Updated {ticket.lastUpdate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
