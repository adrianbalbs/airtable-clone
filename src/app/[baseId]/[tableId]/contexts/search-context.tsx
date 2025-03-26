"use client";

import { createContext, useContext, useState, useCallback } from "react";

type SearchContextType = {
  searchValue: string;
  updateSearch: (value: string) => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchValue, setSearchValue] = useState("");

  const updateSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return (
    <SearchContext.Provider value={{ searchValue, updateSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
