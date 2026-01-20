"use client";

import {
  Shield,
  Camera,
  Lock,
  Flame,
  Bell,
  Wifi,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      id: "1",
      name: "Security Monitoring",
      description: "24/7 professional monitoring of your security system",
      status: "active",
      icon: Shield,
      details: {
        plan: "Premium Monitoring",
        startDate: "Jan 15, 2023",
        monthlyFee: "$49.99",
        responseTime: "< 30 seconds",
      },
    },
    {
      id: "2",
      name: "Video Surveillance",
      description: "8-camera HD surveillance system with cloud storage",
      status: "active",
      icon: Camera,
      details: {
        cameras: "8 HD Cameras",
        storage: "30-day cloud storage",
        startDate: "Jan 15, 2023",
        monthlyFee: "$29.99",
      },
    },
    {
      id: "3",
      name: "Access Control",
      description: "Smart locks and keypad entry for 4 entry points",
      status: "active",
      icon: Lock,
      details: {
        entryPoints: "4 doors",
        type: "Smart Locks + Keypads",
        startDate: "Jan 15, 2023",
        monthlyFee: "Included",
      },
    },
    {
      id: "4",
      name: "Fire Detection",
      description: "Smoke and heat detectors with monitoring",
      status: "active",
      icon: Flame,
      details: {
        detectors: "6 smoke/heat detectors",
        type: "Monitored",
        startDate: "Jan 15, 2023",
        monthlyFee: "Included",
      },
    },
  ];

  const equipment = [
    { name: "Control Panel", model: "DSC PowerSeries Neo", status: "online", lastCheck: "Today, 2:30 PM" },
    { name: "Front Door Camera", model: "Hikvision DS-2CD2143", status: "online", lastCheck: "Today, 2:30 PM" },
    { name: "Backyard Camera", model: "Hikvision DS-2CD2143", status: "online", lastCheck: "Today, 2:30 PM" },
    { name: "Garage Camera", model: "Hikvision DS-2CD2143", status: "online", lastCheck: "Today, 2:30 PM" },
    { name: "Driveway Camera", model: "Hikvision DS-2CD2143", status: "online", lastCheck: "Today, 2:30 PM" },
    { name: "Front Door Lock", model: "Yale Assure Lock 2", status: "online", lastCheck: "Today, 2:30 PM" },
    { name: "Garage Door Sensor", model: "DSC PG9312", status: "online", lastCheck: "Today, 2:30 PM" },
    { name: "Living Room Smoke Detector", model: "DSC PG9936", status: "online", lastCheck: "Today, 2:30 PM" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
        <p className="text-gray-600 mt-1">
          View and manage your security services
        </p>
      </div>

      {/* Active Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <service.icon className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              {Object.entries(service.details).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Equipment List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Equipment Status</h2>
          <p className="text-sm text-gray-500 mt-1">
            All devices connected to your security system
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Last Check
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {equipment.map((item) => (
                <tr key={item.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.model}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700 font-medium capitalize">
                        {item.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.lastCheck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
