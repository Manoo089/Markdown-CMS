"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchField from "@/ui/SearchField";

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
      <SearchField
        value={searchInput}
        placeholder="Search posts (Title and Excerpt)"
        fullWidth
        onChange={(e) => setSearchInput(e.target.value)}
        onClear={() => setSearchInput("")}
      />

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
