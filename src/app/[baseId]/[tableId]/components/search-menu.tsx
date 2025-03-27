"use client";

import { MenuButton, MenuItems, Menu } from "@headlessui/react";
import { Search, X, Shapes } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSearch } from "../contexts/search-context";

export default function SearchMenu() {
  const { searchValue, updateSearch } = useSearch();
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchValue(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      updateSearch(value);
    }, 300);
  };

  const handleClearSearch = () => {
    setLocalSearchValue("");
    updateSearch("");
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex-none p-2">
        <Search size={15} />
      </MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-64 border border-slate-300 bg-white">
        <div>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex items-center p-2"
          >
            <input
              className="h-full w-full flex-1 border-none text-sm outline-none"
              placeholder="Find in view"
              value={localSearchValue}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSearchChange(e);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
            />
            {localSearchValue && (
              <X
                size={15}
                className="ml-2 cursor-pointer text-gray-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSearch();
                }}
              />
            )}
          </div>
          <div className="bg-gray-100 p-2 text-xs">
            <p>Use advanced search options in the</p>
            <div className="flex items-center gap-1 text-blue-500">
              <Shapes size={15} />
              <span>search extension.</span>
            </div>
          </div>
        </div>
      </MenuItems>
    </Menu>
  );
}
