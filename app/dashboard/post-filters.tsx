"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function PostFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Aktuelle Filter-Werte aus URL lesen
  const currentStatus = searchParams.get("status") || "all";
  const currentType = searchParams.get("type") || "all";
  const currentSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Filter-Optionen definieren
  const statusOptions = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "post", label: "Post" },
    { value: "page", label: "Page" },
    { value: "service", label: "Service" },
  ];

  // URL aktualisieren wenn Filter sich ändert
  function updateFilter(key: string, value: string) {
    // Neue URLSearchParams basierend auf aktuellen erstellen
    const params = new URLSearchParams(searchParams.toString());

    // Filter setzen oder entfernen
    if (value === "all" || value === "") {
      params.delete(key); // "all" = kein Filter = Parameter entfernen
    } else {
      params.set(key, value);
    }

    // Pagination zurücksetzen bei Filter-Änderung
    params.delete("page");

    // Navigation zur neuen URL
    router.push(`/dashboard?${params.toString()}`);
  }

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateFilter("search", searchInput);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div>
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts..."
            className="w-full sm:w-80 px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
        <div className="inline-flex rounded-md shadow-sm">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter("status", option.value)}
              className={`px-3 py-1.5 text-sm font-medium border ${
                currentStatus === option.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } ${
                option.value === "all" ? "rounded-l-md" : option.value === "draft" ? "rounded-r-md" : ""
              } -ml-px first:ml-0`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <span className="text-sm font-medium text-gray-700 mr-2">Type:</span>
        <div className="inline-flex rounded-md shadow-sm">
          {typeOptions.map((option, index) => (
            <button
              key={option.value}
              onClick={() => updateFilter("type", option.value)}
              className={`px-3 py-1.5 text-sm font-medium border ${
                currentType === option.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } ${
                index === 0 ? "rounded-l-md" : index === typeOptions.length - 1 ? "rounded-r-md" : ""
              } -ml-px first:ml-0`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
