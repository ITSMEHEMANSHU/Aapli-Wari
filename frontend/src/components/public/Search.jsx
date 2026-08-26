import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import Loader from '../common/Loader';
import Card from '../common/Card';
import Select from '../common/Loader';
export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: 'all', language: 'all' });

  useEffect(() => {
    if (query) performSearch();
  }, [query, filters]);

  const performSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setResults([
        { id: 1, title: `"${query}" - Palkhi History`, type: 'Video', channel: 'Sant Dnyaneshwar' },
        { id: 2, title: `"${query}" - Wari Traditions`, type: 'Image', channel: 'Sant Tukaram' },
      ]);
      setLoading(false);
    }, 500);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Search Results</h1>
      {query && <p className="text-gray-600 mb-4">Showing results for: <strong>"{query}"</strong></p>}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500" />
          <Select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'video', label: 'Video' },
              { value: 'image', label: 'Image' },
              { value: 'audio', label: 'Audio' },
            ]}
            className="w-auto"
          />
        </div>
        <Select
          value={filters.language}
          onChange={(e) => setFilters({...filters, language: e.target.value})}
          options={[
            { value: 'all', label: 'All Languages' },
            { value: 'mr', label: 'Marathi' },
            { value: 'hi', label: 'Hindi' },
            { value: 'en', label: 'English' },
          ]}
          className="w-auto"
        />
      </div>

      {results.length === 0 ? (
        <Card className="text-center text-gray-500 py-8">
          No results found for "{query}"
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map(result => (
            <Card key={result.id} className="hover:shadow-lg transition">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{result.title}</h3>
                  <p className="text-gray-600 text-sm">{result.channel}</p>
                </div>
                <span className="bg-gray-200 px-3 py-1 rounded text-sm">{result.type}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;