"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Building2,
  ClipboardList,
  DollarSign,
  Send,
  Baby,
  GraduationCap,
  ShoppingBag,
  UtensilsCrossed,
  Warehouse,
  ClipboardCheck,
  Plus,
  Trash2,
  Edit,
  X,
  Wind,
  Save,
  Download,
  Eye,
  Loader2,
  Printer,
  Sparkles,
  Wand2,
  Search,
  Users,
} from "lucide-react";
import {
  TEMPLATE_PRESETS,
  QUOTE_TYPE_OPTIONS,
  generateItemId,
  calculateQuoteTotals,
  calculateLineItemTotal,
  generateRTULineItems,
  DEFAULT_LABOR_RATE,
  type QuoteType,
  type TemplateName,
  type LineItem,
  type RTUUnit,
  type QuoteTotals,
} from "@/lib/quote-templates";
import RTUPackageModal from "@/components/quote/RTUPackageModal";
import QuotePDFPreview from "@/components/quote/QuotePDFPreview";

// ============================================
// TYPES
// ============================================

interface CustomerInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface SiteInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  buildingType: string;
  squareFootage: string;
  floors: string;
  existingSystem: string;
  notes: string;
}

interface QuoteTerms {
  paymentTerms: string;
  warranty: string;
  validDays: number;
  assumptions: string[];
  disclaimers: string[];
}

interface QuoteState {
  quoteType: QuoteType | null;
  template: TemplateName | null;
  customer: CustomerInfo;
  site: SiteInfo;
  lineItems: LineItem[];
  enabledAddOns: string[];
  terms: QuoteTerms;
  totals: QuoteTotals | null;
  taxEnabled: boolean;
  taxRate: number;
}

interface CrmCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// ============================================
// ICONS MAP
// ============================================

const TEMPLATE_ICONS: Record<TemplateName, React.ElementType> = {
  daycare: Baby,
  school: GraduationCap,
  retail: ShoppingBag,
  restaurant: UtensilsCrossed,
  warehouse: Warehouse,
  office: Building2,
  inspection: ClipboardCheck,
};

// ============================================
// STEP COMPONENTS
// ============================================

const STEPS = [
  { id: 0, name: "Quote Type", icon: FileText },
  { id: 1, name: "Customer", icon: Building2 },
  { id: 2, name: "Site", icon: Building2 },
  { id: 3, name: "Scope", icon: ClipboardList },
  { id: 4, name: "Pricing", icon: DollarSign },
  { id: 5, name: "Review", icon: Send },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function QuoteBuilderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showRTUModal, setShowRTUModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<Array<{category: string; name: string; quantity: number; reason: string}> | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiNarrative, setAINarrative] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<CrmCustomer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const customerSearchRef = useRef<HTMLDivElement>(null);

  const [quote, setQuote] = useState<QuoteState>({
    quoteType: null,
    template: null,
    customer: {
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "TX",
      zip: "",
    },
    site: {
      name: "",
      address: "",
      city: "",
      state: "TX",
      zip: "",
      buildingType: "",
      squareFootage: "",
      floors: "1",
      existingSystem: "none",
      notes: "",
    },
    lineItems: [],
    enabledAddOns: [],
    terms: {
      paymentTerms: "",
      warranty: "",
      validDays: 30,
      assumptions: [],
      disclaimers: [],
    },
    totals: null,
    taxEnabled: true,
    taxRate: 0.0825,
  });

  // Handle template selection
  const handleTemplateSelect = useCallback((templateName: TemplateName) => {
    const template = TEMPLATE_PRESETS[templateName];
    const lineItems: LineItem[] = template.lineItems.map((item) => ({
      ...item,
      id: generateItemId(),
    }));

    setQuote((prev) => ({
      ...prev,
      template: templateName,
      quoteType: template.defaultQuoteType,
      lineItems,
      enabledAddOns: template.addOns
        .filter((ao) => ao.defaultEnabled)
        .map((ao) => ao.id),
      terms: {
        ...prev.terms,
        paymentTerms: template.paymentTerms,
        warranty: template.warranty,
        assumptions: [...template.assumptions],
        disclaimers: [...template.disclaimers],
      },
    }));
  }, []);

  // Handle quote type selection
  const handleQuoteTypeSelect = useCallback((quoteType: QuoteType) => {
    setQuote((prev) => ({
      ...prev,
      quoteType,
    }));
  }, []);

  // Handle customer info change
  const handleCustomerChange = useCallback(
    (field: keyof CustomerInfo, value: string) => {
      setQuote((prev) => ({
        ...prev,
        customer: { ...prev.customer, [field]: value },
      }));
    },
    []
  );

  // Handle site info change
  const handleSiteChange = useCallback((field: keyof SiteInfo, value: string) => {
    setQuote((prev) => ({
      ...prev,
      site: { ...prev.site, [field]: value },
    }));
  }, []);

  // Copy customer address to site
  const copyCustomerToSite = useCallback(() => {
    setQuote((prev) => ({
      ...prev,
      site: {
        ...prev.site,
        name: prev.customer.company || prev.customer.name,
        address: prev.customer.address,
        city: prev.customer.city,
        state: prev.customer.state,
        zip: prev.customer.zip,
      },
    }));
  }, []);

  // Search customers from CRM
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const response = await fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`);
        const data = await response.json();
        if (data.success && data.data) {
          setCustomerResults(data.data);
          setShowCustomerDropdown(true);
        }
      } catch {
        // Silently fail
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerSearchRef.current && !customerSearchRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Select existing customer from CRM
  const selectCustomer = useCallback((customer: CrmCustomer) => {
    setQuote((prev) => ({
      ...prev,
      customer: {
        name: customer.name || "",
        company: customer.company || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "TX",
        zip: customer.zip || "",
      },
    }));
    setSelectedCustomerId(customer.id);
    setCustomerSearch("");
    setShowCustomerDropdown(false);
  }, []);

  // Handle line item changes
  const handleLineItemChange = useCallback(
    (itemId: string, field: keyof LineItem, value: string | number | boolean) => {
      setQuote((prev) => ({
        ...prev,
        lineItems: prev.lineItems.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        ),
      }));
    },
    []
  );

  // Add new line item
  const addLineItem = useCallback(() => {
    const newItem: LineItem = {
      id: generateItemId(),
      category: "Custom",
      name: "",
      description: "",
      unit: "ea",
      quantity: 1,
      unitPrice: 0,
      taxable: true,
    };
    setQuote((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
    setEditingItem(newItem);
  }, []);

  // Remove line item
  const removeLineItem = useCallback((itemId: string) => {
    setQuote((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== itemId),
    }));
  }, []);

  // Handle RTU package save
  const handleRTUSave = useCallback((units: RTUUnit[]) => {
    const rtuLineItems = generateRTULineItems(units).map((item) => ({
      ...item,
      id: generateItemId(),
    }));

    setQuote((prev) => {
      // Remove existing RTU items
      const filteredItems = prev.lineItems.filter(
        (item) => item.category !== "RTU/Duct Smoke"
      );
      return {
        ...prev,
        lineItems: [...filteredItems, ...rtuLineItems],
      };
    });
    setShowRTUModal(false);
  }, []);

  // Toggle add-on
  const toggleAddOn = useCallback((addOnId: string) => {
    setQuote((prev) => {
      const isEnabled = prev.enabledAddOns.includes(addOnId);
      const template = prev.template ? TEMPLATE_PRESETS[prev.template] : null;
      const addOn = template?.addOns.find((ao) => ao.id === addOnId);

      if (!addOn) return prev;

      if (isEnabled) {
        // Remove add-on items
        return {
          ...prev,
          enabledAddOns: prev.enabledAddOns.filter((id) => id !== addOnId),
          lineItems: prev.lineItems.filter(
            (item) =>
              !addOn.lineItems.some(
                (aoItem) =>
                  aoItem.name === item.name && aoItem.category === item.category
              )
          ),
        };
      } else {
        // Add add-on items
        const newItems = addOn.lineItems.map((item) => ({
          ...item,
          id: generateItemId(),
        }));
        return {
          ...prev,
          enabledAddOns: [...prev.enabledAddOns, addOnId],
          lineItems: [...prev.lineItems, ...newItems],
        };
      }
    });
  }, []);

  // Calculate totals
  const recalculateTotals = useCallback(() => {
    const totals = calculateQuoteTotals(
      quote.lineItems,
      quote.taxEnabled ? quote.taxRate : 0
    );
    setQuote((prev) => ({ ...prev, totals }));
  }, [quote.lineItems, quote.taxEnabled, quote.taxRate]);

  // Save quote to database
  const saveQuote = useCallback(async () => {
    if (!quote.quoteType || !quote.customer.name) {
      setSaveMessage({ type: "error", text: "Please complete required fields" });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_type: quote.quoteType,
          template_name: quote.template,
          status: "draft",
          customer: quote.customer,
          site: quote.site,
          line_items: quote.lineItems,
          totals: quote.totals,
          terms: quote.terms,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage({ type: "success", text: `Saved as ${data.data.quote_number}` });
      } else {
        setSaveMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      setSaveMessage({ type: "error", text: "Failed to save quote" });
    } finally {
      setIsSaving(false);
    }
  }, [quote]);

  // Print/Download PDF
  const handlePrint = useCallback(() => {
    setShowPDFPreview(true);
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  // Get AI suggestions for scope
  const getAISuggestions = useCallback(async () => {
    setIsAILoading(true);
    setAISuggestions(null);

    try {
      const response = await fetch("/api/quotes/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest_scope",
          quoteType: quote.quoteType,
          site: quote.site,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.suggestions) {
        setAISuggestions(data.data.suggestions);
        setShowAISuggestions(true);
      } else {
        setSaveMessage({ type: "error", text: data.error || "AI suggestions unavailable" });
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      setSaveMessage({ type: "error", text: "Failed to get AI suggestions" });
    } finally {
      setIsAILoading(false);
    }
  }, [quote.quoteType, quote.site]);

  // Apply AI suggestions to line items
  const applyAISuggestions = useCallback((suggestions: Array<{category: string; name: string; quantity: number; reason: string}>) => {
    const newItems: LineItem[] = suggestions.map((s) => ({
      id: generateItemId(),
      category: s.category,
      name: s.name,
      description: s.reason,
      unit: "ea",
      quantity: s.quantity,
      unitPrice: 145, // Default price, user should adjust
      taxable: true,
    }));

    setQuote((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, ...newItems],
    }));
    setShowAISuggestions(false);
    setAISuggestions(null);
  }, []);

  // Generate AI narrative for proposal
  const generateNarrative = useCallback(async () => {
    setIsAILoading(true);

    try {
      const response = await fetch("/api/quotes/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_narrative",
          quoteType: quote.quoteType,
          site: quote.site,
          existingItems: quote.lineItems.map((i) => ({ name: i.name, quantity: i.quantity })),
        }),
      });

      const data = await response.json();

      if (data.success && data.data.narrative) {
        setAINarrative(data.data.narrative);
      } else {
        setSaveMessage({ type: "error", text: data.error || "Narrative generation failed" });
      }
    } catch (error) {
      console.error("Narrative generation error:", error);
      setSaveMessage({ type: "error", text: "Failed to generate narrative" });
    } finally {
      setIsAILoading(false);
    }
  }, [quote.quoteType, quote.site, quote.lineItems]);

  // Navigate steps
  const nextStep = () => {
    if (currentStep === 3) {
      recalculateTotals();
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Check if step is complete
  const isStepComplete = (stepId: number) => {
    switch (stepId) {
      case 0:
        return quote.quoteType !== null;
      case 1:
        return quote.customer.name && quote.customer.phone;
      case 2:
        return quote.site.address && quote.site.city;
      case 3:
        return quote.lineItems.length > 0;
      case 4:
        return quote.totals !== null;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quote Builder</h1>
        <p className="text-gray-600 mt-1">
          Create professional estimates and proposals
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isComplete = isStepComplete(step.id);
            const isPast = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-orange-600 text-white"
                      : isPast || isComplete
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isComplete && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline font-medium">{step.name}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isPast ? "bg-orange-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[500px]">
        <AnimatePresence mode="wait">
          {/* Step 0: Quote Type & Quick Templates */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Quick Templates */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Templates
                </h2>
                <p className="text-gray-600 mb-4">
                  Select a template to auto-populate common line items and settings
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {(Object.keys(TEMPLATE_PRESETS) as TemplateName[]).map(
                    (templateName) => {
                      const template = TEMPLATE_PRESETS[templateName];
                      const Icon = TEMPLATE_ICONS[templateName];
                      const isSelected = quote.template === templateName;

                      return (
                        <button
                          key={templateName}
                          onClick={() => handleTemplateSelect(templateName)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 hover:border-orange-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="w-8 h-8" />
                          <span className="text-sm font-medium text-center">
                            {template.label}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Quote Type */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quote Type
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {QUOTE_TYPE_OPTIONS.map((option) => {
                    const isSelected = quote.quoteType === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleQuoteTypeSelect(option.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900">
                          {option.label}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Customer Info */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Information
                </h2>
                {selectedCustomerId && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    Linked to CRM
                  </span>
                )}
              </div>

              {/* Customer Search */}
              <div ref={customerSearchRef} className="relative mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Search Existing Customers
                  </label>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Search by name, email, company, or phone..."
                  />
                  {isSearchingCustomers && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>
                {showCustomerDropdown && customerResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => selectCustomer(c)}
                        className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500">
                          {[c.company, c.email, c.phone].filter(Boolean).join(" \u2022 ")}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {showCustomerDropdown && customerResults.length === 0 && customerSearch.length >= 2 && !isSearchingCustomers && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-sm text-gray-500">
                    No customers found. Fill in the form below to create a new one.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={quote.customer.name}
                    onChange={(e) => handleCustomerChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={quote.customer.company}
                    onChange={(e) => handleCustomerChange("company", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ABC Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={quote.customer.email}
                    onChange={(e) => handleCustomerChange("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={quote.customer.phone}
                    onChange={(e) => handleCustomerChange("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={quote.customer.address}
                    onChange={(e) => handleCustomerChange("address", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={quote.customer.city}
                    onChange={(e) => handleCustomerChange("city", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Houston"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={quote.customer.state}
                      onChange={(e) => handleCustomerChange("state", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="TX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={quote.customer.zip}
                      onChange={(e) => handleCustomerChange("zip", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="77001"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Site Info */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Site Information
                </h2>
                <button
                  onClick={copyCustomerToSite}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Copy from customer
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={quote.site.name}
                    onChange={(e) => handleSiteChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Main Office Building"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Building Type
                  </label>
                  <select
                    value={quote.site.buildingType}
                    onChange={(e) => handleSiteChange("buildingType", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select type...</option>
                    <option value="office">Office</option>
                    <option value="retail">Retail</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="school">School</option>
                    <option value="daycare">Daycare</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed">Mixed Use</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={quote.site.address}
                    onChange={(e) => handleSiteChange("address", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="123 Business Blvd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={quote.site.city}
                    onChange={(e) => handleSiteChange("city", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Houston"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={quote.site.state}
                      onChange={(e) => handleSiteChange("state", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="TX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={quote.site.zip}
                      onChange={(e) => handleSiteChange("zip", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="77001"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Square Footage
                  </label>
                  <input
                    type="text"
                    value={quote.site.squareFootage}
                    onChange={(e) => handleSiteChange("squareFootage", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="5,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Floors
                  </label>
                  <input
                    type="text"
                    value={quote.site.floors}
                    onChange={(e) => handleSiteChange("floors", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Fire Alarm
                  </label>
                  <select
                    value={quote.site.existingSystem}
                    onChange={(e) => handleSiteChange("existingSystem", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="none">None</option>
                    <option value="conventional">Conventional</option>
                    <option value="addressable">Addressable</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={quote.site.notes}
                    onChange={(e) => handleSiteChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Any additional site details..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Scope Builder */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Scope of Work
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={getAISuggestions}
                    disabled={isAILoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {isAILoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    AI Suggest
                  </button>
                  <button
                    onClick={() => setShowRTUModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Wind className="w-4 h-4" />
                    RTU Package
                  </button>
                  <button
                    onClick={addLineItem}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Add-ons Toggle */}
              {quote.template && TEMPLATE_PRESETS[quote.template].addOns.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Optional Add-ons
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {TEMPLATE_PRESETS[quote.template].addOns.map((addOn) => {
                      const isEnabled = quote.enabledAddOns.includes(addOn.id);
                      // Skip RTU package add-on since it has its own modal
                      if (addOn.id === "rtu_package") return null;
                      return (
                        <button
                          key={addOn.id}
                          onClick={() => toggleAddOn(addOn.id)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                            isEnabled
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 hover:border-orange-300 text-gray-600"
                          }`}
                        >
                          {isEnabled && <Check className="w-4 h-4" />}
                          {addOn.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Item
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">
                        Qty
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">
                        Unit
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28">
                        Price
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28">
                        Total
                      </th>
                      <th className="w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quote.lineItems.map((item) => {
                      const itemTotal = calculateLineItemTotal(item);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.category}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {item.name || "(New Item)"}
                              </p>
                              {item.description && (
                                <p className="text-xs text-gray-500">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleLineItemChange(
                                  item.id,
                                  "quantity",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-1 text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {item.unit}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {item.isAllowance ? (
                              <span className="text-gray-600">
                                {formatCurrency(item.allowanceLow || 0)} -{" "}
                                {formatCurrency(item.allowanceHigh || 0)}
                              </span>
                            ) : item.laborHours ? (
                              <span className="text-gray-600">
                                {formatCurrency(item.laborRate || DEFAULT_LABOR_RATE)}
                                /hr
                              </span>
                            ) : (
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    item.id,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 px-2 py-1 text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900 text-sm">
                            {item.isAllowance ? (
                              <span>
                                {formatCurrency(itemTotal.amountLow)} -{" "}
                                {formatCurrency(itemTotal.amountHigh)}
                              </span>
                            ) : (
                              formatCurrency(itemTotal.amount)
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {quote.lineItems.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          No items yet. Select a template or add items manually.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Step 4: Pricing & Terms */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Pricing & Terms
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Totals */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Quote Summary
                  </h3>
                  {quote.totals && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Labor</span>
                        <span className="font-medium">
                          {formatCurrency(quote.totals.laborTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Materials</span>
                        <span className="font-medium">
                          {formatCurrency(quote.totals.materialsTotal)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">
                          {quote.totals.subtotalLow !== quote.totals.subtotalHigh
                            ? `${formatCurrency(quote.totals.subtotalLow)} - ${formatCurrency(quote.totals.subtotalHigh)}`
                            : formatCurrency(quote.totals.subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-gray-600">
                          <input
                            type="checkbox"
                            checked={quote.taxEnabled}
                            onChange={(e) =>
                              setQuote((prev) => ({
                                ...prev,
                                taxEnabled: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          Tax ({(quote.taxRate * 100).toFixed(2)}%)
                        </label>
                        <span className="font-medium">
                          {formatCurrency(quote.totals.tax)}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 pt-3 flex justify-between text-lg">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-orange-600">
                          {quote.totals.totalLow !== quote.totals.totalHigh
                            ? `${formatCurrency(quote.totals.totalLow)} - ${formatCurrency(quote.totals.totalHigh)}`
                            : formatCurrency(quote.totals.total)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms
                    </label>
                    <textarea
                      value={quote.terms.paymentTerms}
                      onChange={(e) =>
                        setQuote((prev) => ({
                          ...prev,
                          terms: { ...prev.terms, paymentTerms: e.target.value },
                        }))
                      }
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                      placeholder="50% deposit, balance due upon completion"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty
                    </label>
                    <textarea
                      value={quote.terms.warranty}
                      onChange={(e) =>
                        setQuote((prev) => ({
                          ...prev,
                          terms: { ...prev.terms, warranty: e.target.value },
                        }))
                      }
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                      placeholder="1-year parts and labor warranty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quote Valid For (Days)
                    </label>
                    <input
                      type="number"
                      value={quote.terms.validDays}
                      onChange={(e) =>
                        setQuote((prev) => ({
                          ...prev,
                          terms: {
                            ...prev.terms,
                            validDays: parseInt(e.target.value) || 30,
                          },
                        }))
                      }
                      className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Assumptions & Disclaimers */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assumptions
                  </label>
                  <ul className="space-y-2">
                    {quote.terms.assumptions.map((assumption, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{assumption}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disclaimers
                  </label>
                  <ul className="space-y-2">
                    {quote.terms.disclaimers.map((disclaimer, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{disclaimer}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Review & Send */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Review & Deliver
              </h2>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer</h3>
                  <p className="font-medium text-gray-900">{quote.customer.name}</p>
                  {quote.customer.company && (
                    <p className="text-sm text-gray-600">{quote.customer.company}</p>
                  )}
                  <p className="text-sm text-gray-600">{quote.customer.phone}</p>
                  <p className="text-sm text-gray-600">{quote.customer.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Site</h3>
                  <p className="font-medium text-gray-900">{quote.site.name || "—"}</p>
                  <p className="text-sm text-gray-600">{quote.site.address}</p>
                  <p className="text-sm text-gray-600">
                    {quote.site.city}, {quote.site.state} {quote.site.zip}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Quote Total</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {quote.totals
                      ? quote.totals.totalLow !== quote.totals.totalHigh
                        ? `${formatCurrency(quote.totals.totalLow)} - ${formatCurrency(quote.totals.totalHigh)}`
                        : formatCurrency(quote.totals.total)
                      : "—"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {quote.lineItems.length} line items
                  </p>
                </div>
              </div>

              {/* Line Items Summary */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Scope Summary
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      {quote.lineItems.map((item) => {
                        const total = calculateLineItemTotal(item);
                        return (
                          <tr key={item.id}>
                            <td className="py-2 text-gray-900">{item.name}</td>
                            <td className="py-2 text-center text-gray-600">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-2 text-right font-medium">
                              {item.isAllowance
                                ? `${formatCurrency(total.amountLow)} - ${formatCurrency(total.amountHigh)}`
                                : formatCurrency(total.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Narrative Generation */}
              <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    <h3 className="text-sm font-semibold text-purple-900">
                      AI Scope Narrative
                    </h3>
                  </div>
                  <button
                    onClick={generateNarrative}
                    disabled={isAILoading || quote.lineItems.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isAILoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate Narrative
                  </button>
                </div>
                {aiNarrative ? (
                  <div className="bg-white rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
                    {aiNarrative}
                  </div>
                ) : (
                  <p className="text-sm text-purple-700">
                    Click "Generate Narrative" to create a professional scope of work description using AI.
                  </p>
                )}
              </div>

              {/* Delivery Actions */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={saveQuote}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save as Draft
                </button>
                <button
                  onClick={() => setShowPDFPreview(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  Preview PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  Print / Download
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors">
                  <Send className="w-5 h-5" />
                  Send to Customer
                </button>
              </div>

              {/* Save Message */}
              {saveMessage && (
                <div
                  className={`mt-4 px-4 py-3 rounded-lg ${
                    saveMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        {currentStep < STEPS.length - 1 && (
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* RTU Package Modal */}
      {showRTUModal && (
        <RTUPackageModal
          onClose={() => setShowRTUModal(false)}
          onSave={handleRTUSave}
        />
      )}

      {/* AI Suggestions Modal */}
      {showAISuggestions && aiSuggestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAISuggestions(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI Suggestions</h2>
                  <p className="text-sm text-gray-500">Based on your site information</p>
                </div>
              </div>
              <button
                onClick={() => setShowAISuggestions(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{suggestion.name}</p>
                        <p className="text-sm text-gray-500">{suggestion.category}</p>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                        Qty: {suggestion.quantity}
                      </span>
                    </div>
                    {suggestion.reason && (
                      <p className="mt-2 text-sm text-gray-600 italic">{suggestion.reason}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> These are AI-generated suggestions based on typical requirements.
                  Please verify quantities and adjust pricing after adding to your quote.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAISuggestions(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => applyAISuggestions(aiSuggestions)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Add All to Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 print:hidden"
            onClick={() => setShowPDFPreview(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden print:max-w-none print:shadow-none print:rounded-none">
            {/* Modal Header - hidden when printing */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden">
              <h2 className="text-lg font-semibold text-gray-900">
                Quote Preview
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPDFPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-80px)] print:max-h-none print:overflow-visible">
              <QuotePDFPreview
                ref={pdfRef}
                quoteNumber={undefined}
                quoteType={quote.quoteType || ""}
                customer={quote.customer}
                site={quote.site}
                lineItems={quote.lineItems}
                totals={quote.totals}
                terms={quote.terms}
                showProposalTerms={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [class*="QuotePDFPreview"],
          [class*="QuotePDFPreview"] * {
            visibility: visible;
          }
          [class*="QuotePDFPreview"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
