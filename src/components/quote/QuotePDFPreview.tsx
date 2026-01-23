"use client";

import { forwardRef } from "react";
import { calculateLineItemTotal, type LineItem, type QuoteTotals } from "@/lib/quote-templates";

interface CustomerInfo {
  name: string;
  company?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface SiteInfo {
  name?: string;
  address: string;
  city: string;
  state?: string;
  zip?: string;
  buildingType?: string;
  squareFootage?: string;
  floors?: string;
  existingSystem?: string;
  notes?: string;
}

interface QuoteTerms {
  paymentTerms: string;
  warranty: string;
  validDays: number;
  assumptions: string[];
  disclaimers: string[];
}

interface QuotePDFPreviewProps {
  quoteNumber?: string;
  quoteType: string;
  customer: CustomerInfo;
  site: SiteInfo;
  lineItems: LineItem[];
  totals: QuoteTotals | null;
  terms: QuoteTerms;
  showProposalTerms?: boolean;
}

const QuotePDFPreview = forwardRef<HTMLDivElement, QuotePDFPreviewProps>(
  (
    {
      quoteNumber,
      quoteType,
      customer,
      site,
      lineItems,
      totals,
      terms,
      showProposalTerms = true,
    },
    ref
  ) => {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    };

    const today = new Date();
    const expiresDate = new Date(today);
    expiresDate.setDate(expiresDate.getDate() + terms.validDays);

    // Group line items by category
    const groupedItems = lineItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, LineItem[]>);

    return (
      <div
        ref={ref}
        className="bg-white p-8 max-w-[8.5in] mx-auto font-sans text-sm print:p-0"
        style={{ minHeight: "11in" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-orange-500">
          <div>
            <img
              src="/logo_full.png"
              alt="Chatman Security and Fire"
              className="h-16 w-auto mb-2"
            />
            <div className="text-xs text-gray-600">
              <p>Houston, TX</p>
              <p>(832) 430-1826</p>
              <p>info@chatmansecurityandfire.com</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {showProposalTerms ? "PROPOSAL" : "ESTIMATE"}
            </h1>
            <div className="text-gray-600">
              <p>
                <span className="font-medium">Quote #:</span>{" "}
                {quoteNumber || "DRAFT"}
              </p>
              <p>
                <span className="font-medium">Date:</span> {formatDate(today)}
              </p>
              <p>
                <span className="font-medium">Valid Until:</span>{" "}
                {formatDate(expiresDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Site Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Prepared For
            </h2>
            <div className="text-gray-900">
              <p className="font-semibold">{customer.name}</p>
              {customer.company && <p>{customer.company}</p>}
              {customer.address && <p>{customer.address}</p>}
              {customer.city && (
                <p>
                  {customer.city}, {customer.state} {customer.zip}
                </p>
              )}
              <p className="mt-2">{customer.phone}</p>
              {customer.email && <p>{customer.email}</p>}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Project Location
            </h2>
            <div className="text-gray-900">
              {site.name && <p className="font-semibold">{site.name}</p>}
              <p>{site.address}</p>
              <p>
                {site.city}, {site.state} {site.zip}
              </p>
              {site.buildingType && (
                <p className="mt-2 text-gray-600">
                  Building Type: {site.buildingType}
                </p>
              )}
              {site.squareFootage && (
                <p className="text-gray-600">
                  Approx. {site.squareFootage} sq ft
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quote Type Badge */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full uppercase">
            {quoteType.replace(/_/g, " ")}
          </span>
        </div>

        {/* Scope of Work */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Scope of Work
          </h2>

          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {category}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">
                      Description
                    </th>
                    <th className="text-center py-2 font-medium text-gray-700 w-16">
                      Qty
                    </th>
                    <th className="text-center py-2 font-medium text-gray-700 w-16">
                      Unit
                    </th>
                    <th className="text-right py-2 font-medium text-gray-700 w-24">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const itemTotal = calculateLineItemTotal(item);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100"
                      >
                        <td className="py-2">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="py-2 text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="py-2 text-center text-gray-600">
                          {item.unit}
                        </td>
                        <td className="py-2 text-right font-medium">
                          {item.isAllowance
                            ? `${formatCurrency(itemTotal.amountLow)} - ${formatCurrency(itemTotal.amountHigh)}`
                            : formatCurrency(itemTotal.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Totals */}
        {totals && (
          <div className="mb-8">
            <div className="ml-auto w-72 bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {totals.subtotalLow !== totals.subtotalHigh
                      ? `${formatCurrency(totals.subtotalLow)} - ${formatCurrency(totals.subtotalHigh)}`
                      : formatCurrency(totals.subtotal)}
                  </span>
                </div>
                {totals.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tax ({(totals.taxRate * 100).toFixed(2)}%)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(totals.tax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300 text-base">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-orange-600">
                    {totals.totalLow !== totals.totalHigh
                      ? `${formatCurrency(totals.totalLow)} - ${formatCurrency(totals.totalHigh)}`
                      : formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assumptions */}
        {terms.assumptions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Assumptions
            </h2>
            <ul className="text-xs text-gray-600 space-y-1">
              {terms.assumptions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimers */}
        {terms.disclaimers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Disclaimers
            </h2>
            <ul className="text-xs text-gray-600 space-y-1">
              {terms.disclaimers.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Terms & Conditions */}
        {showProposalTerms && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Terms & Conditions
            </h2>
            <div className="text-xs text-gray-600 space-y-2">
              {terms.paymentTerms && (
                <p>
                  <span className="font-medium text-gray-700">Payment Terms:</span>{" "}
                  {terms.paymentTerms}
                </p>
              )}
              {terms.warranty && (
                <p>
                  <span className="font-medium text-gray-700">Warranty:</span>{" "}
                  {terms.warranty}
                </p>
              )}
              <p>
                <span className="font-medium text-gray-700">Quote Validity:</span>{" "}
                This quote is valid for {terms.validDays} days from the date above.
              </p>
            </div>
          </div>
        )}

        {/* Signature Section */}
        {showProposalTerms && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Acceptance
            </h2>
            <p className="text-xs text-gray-600 mb-6">
              By signing below, you authorize Chatman Security and Fire to proceed
              with the work described in this proposal under the terms stated above.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="border-b border-gray-400 h-8 mb-1" />
                <p className="text-xs text-gray-500">Customer Signature</p>
              </div>
              <div>
                <div className="border-b border-gray-400 h-8 mb-1" />
                <p className="text-xs text-gray-500">Date</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="border-b border-gray-400 h-8 mb-1 w-1/2" />
              <p className="text-xs text-gray-500">Printed Name</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>
            Chatman Security and Fire | Houston, TX | (832) 430-1826 |
            chatmansecurityandfire.com
          </p>
          <p className="mt-1">
            Licensed Fire Alarm Contractor | Commercial Fire & Life-Safety Since 2009
          </p>
        </div>
      </div>
    );
  }
);

QuotePDFPreview.displayName = "QuotePDFPreview";

export default QuotePDFPreview;
