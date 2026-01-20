"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Wrench,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Appointment {
  id: string;
  title: string;
  customer: string;
  address: string;
  technician: string;
  time: string;
  duration: string;
  type: string;
  status: string;
}

interface Technician {
  id: string;
  name: string;
  avatar: string;
  jobsToday: number;
  status: "available" | "busy" | "off";
}

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    title: "Fire alarm panel replacement",
    customer: "ABC Corporation",
    address: "123 Business Park Dr, Austin",
    technician: "Mike Thompson",
    time: "9:00 AM",
    duration: "2 hours",
    type: "service",
    status: "in_progress",
  },
  {
    id: "2",
    title: "Motion sensor installation",
    customer: "Smith Residence",
    address: "456 Oak Lane, Dallas",
    technician: "Sarah Chen",
    time: "10:30 AM",
    duration: "1.5 hours",
    type: "installation",
    status: "scheduled",
  },
  {
    id: "3",
    title: "Annual system inspection",
    customer: "Tech Solutions Inc",
    address: "789 Tech Blvd, Houston",
    technician: "David Rodriguez",
    time: "1:00 PM",
    duration: "1 hour",
    type: "inspection",
    status: "scheduled",
  },
  {
    id: "4",
    title: "Camera system upgrade",
    customer: "Medical Center West",
    address: "321 Health Way, Fort Worth",
    technician: "Mike Thompson",
    time: "3:00 PM",
    duration: "3 hours",
    type: "installation",
    status: "scheduled",
  },
];

const mockTechnicians: Technician[] = [
  { id: "1", name: "Mike Thompson", avatar: "MT", jobsToday: 2, status: "busy" },
  { id: "2", name: "Sarah Chen", avatar: "SC", jobsToday: 1, status: "busy" },
  { id: "3", name: "David Rodriguez", avatar: "DR", jobsToday: 1, status: "available" },
  { id: "4", name: "James Wilson", avatar: "JW", jobsToday: 0, status: "available" },
  { id: "5", name: "Emily Davis", avatar: "ED", jobsToday: 0, status: "off" },
];

const typeColors: Record<string, string> = {
  service: "border-l-amber-500",
  installation: "border-l-blue-500",
  inspection: "border-l-green-500",
};

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  busy: "bg-amber-100 text-amber-700",
  off: "bg-gray-100 text-gray-500",
};

export default function SchedulingPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduling</h1>
          <p className="text-gray-500 mt-1">
            Manage appointments and technician schedules
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDate(currentDate)}
            </h2>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-gray-900">
            Today&apos;s Appointments ({mockAppointments.length})
          </h3>

          <div className="space-y-3">
            {mockAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`bg-white rounded-xl border border-gray-200 p-4 border-l-4 ${
                  typeColors[appointment.type]
                } hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {appointment.title}
                      </h4>
                      <StatusBadge status={appointment.status} size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {appointment.customer}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.time} ({appointment.duration})
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {appointment.address}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {appointment.technician}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded capitalize">
                      {appointment.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mockAppointments.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No appointments scheduled for this day</p>
            </div>
          )}
        </div>

        {/* Technicians Sidebar */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Technicians</h3>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {mockTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-600">
                        {tech.avatar}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{tech.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tech.status]}`}>
                          {tech.status === "off" ? "Day Off" : tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
                        </span>
                        {tech.status !== "off" && (
                          <span className="text-gray-500">
                            {tech.jobsToday} jobs today
                          </span>
                        )}
                      </div>
                    </div>
                    <Wrench className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3">Today&apos;s Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Appointments</span>
                <span className="font-medium text-gray-900">{mockAppointments.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">In Progress</span>
                <span className="font-medium text-amber-600">
                  {mockAppointments.filter((a) => a.status === "in_progress").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available Techs</span>
                <span className="font-medium text-green-600">
                  {mockTechnicians.filter((t) => t.status === "available").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
