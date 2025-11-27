import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";

const FilterSidebar = ({
  filterOptions,
  appliedFilters,
  onLocationChange,
  onPlatformChange,
  onJobTypeChange,
  onExperienceChange,
  onSalaryRangeChange,
  onResetFilters,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    sortBy: true,
    datePosted: true,
    experienceLevel: true,
    company: true,
    jobType: true,
    remote: true,
    location: true,
    industry: false,
    jobFunction: false,
    title: false,
  });

  const [sortBy, setSortBy] = useState("recent");
  const [datePosted, setDatePosted] = useState("anytime");

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const locations = [
    "India - Bengaluru",
    "India - Mumbai",
    "India - Hyderabad",
    "India - Pune",
    "India - Chennai",
    "China - Beijing",
    "China - Shanghai",
    "China - Shenzhen",
    "USA - New York",
    "USA - San Francisco",
    "USA - Austin",
    "USA - Seattle",
    "Japan - Tokyo",
    "Japan - Osaka",
    "Germany - Berlin",
    "Germany - Munich",
    "Russia - Moscow",
    "Russia - St. Petersburg",
  ];

  const experienceLevels = [
    "Internship",
    "Entry level",
    "Associate",
    "Mid-Senior level",
    "Director",
    "Executive",
  ];

  const companies = [
    "Accenture in India",
    "Uplers",
    "Bajaj Finserv",
    "EY",
    "Tata Consultancy Services",
    "Oracle",
    "Wipro",
    "Turing",
    "IDFC FIRST Bank",
    "IBM",
    "Infosys",
    "PwC India",
    "Accenture services Pvt Ltd",
  ];

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Volunteer",
    "Internship",
    "Other",
  ];

  const remoteOptions = ["On-site", "Hybrid", "Remote"];

  const industries = [
    "IT Services and IT Consulting",
    "Software Development",
    "Technology, Information and Internet",
    "Financial Services",
    "Business Consulting and Services",
    "Staffing and Recruiting",
    "Professional Services",
    "Banking",
    "Advertising Services",
    "Pharmaceutical Manufacturing",
    "Appliances, Electrical, and Electronics Manufacturing",
    "Telecommunications",
  ];

  const jobFunctions = [
    "Information Technology",
    "Engineering",
    "Sales",
    "Business Development",
    "Finance",
    "Consulting",
    "Management",
    "Marketing",
    "Manufacturing",
    "Other",
  ];

  const titles = [
    "Software Engineer",
    "Electrical Engineer",
    "Full Stack Engineer",
    "Data Analyst",
    "Information Technology Consultant",
    "Sales Manager",
    "Senior Software Engineer",
    "Project Manager",
    "Artificial Intelligence Engineer",
    "Cloud Engineer",
    "Python Developer",
  ];

  return (
    <div className="w-full bg-white p-6 h-screen overflow-y-scroll sticky top-0 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <div className="flex items-center gap-2">
          {Object.values(appliedFilters).some(
            (v) => v && (Array.isArray(v) ? v.length > 0 : false)
          ) && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <X size={14} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.values(appliedFilters).some(
        (v) => v && (Array.isArray(v) ? v.length > 0 : false)
      ) && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">
            Active Filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {appliedFilters.location && appliedFilters.location.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded-full font-medium">
                {appliedFilters.location.length} Location
                {appliedFilters.location.length > 1 ? "s" : ""}
              </span>
            )}
            {appliedFilters.jobType && appliedFilters.jobType.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded-full font-medium">
                💼 {appliedFilters.jobType.length} Type
                {appliedFilters.jobType.length > 1 ? "s" : ""}
              </span>
            )}
            {appliedFilters.experienceLevels &&
              appliedFilters.experienceLevels.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded-full font-medium">
                  🎯 {appliedFilters.experienceLevels.length} Level
                  {appliedFilters.experienceLevels.length > 1 ? "s" : ""}
                </span>
              )}
            {appliedFilters.platforms &&
              appliedFilters.platforms.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded-full font-medium">
                  🌐 {appliedFilters.platforms.length} Platform
                  {appliedFilters.platforms.length > 1 ? "s" : ""}
                </span>
              )}
          </div>
        </div>
      )}

      {/* Sort By */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("sortBy")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">Sort by</span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.sortBy ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.sortBy && (
          <div className="space-y-2 ml-2">
            {[
              { value: "recent", label: "Most recent" },
              { value: "relevant", label: "Most relevant" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="sortBy"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Date Posted */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("datePosted")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">
            Date posted
          </span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.datePosted ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.datePosted && (
          <div className="space-y-2 ml-2">
            {[
              { value: "anytime", label: "Any time" },
              { value: "month", label: "Past month" },
              { value: "week", label: "Past week" },
              { value: "24h", label: "Past 24 hours" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="datePosted"
                  value={option.value}
                  checked={datePosted === option.value}
                  onChange={(e) => setDatePosted(e.target.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("experienceLevel")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">
            Experience level
          </span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.experienceLevel ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.experienceLevel && (
          <div className="space-y-2 ml-2 max-h-48 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {experienceLevels.map((level) => (
              <label key={level} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appliedFilters.experience?.includes(level) || false}
                  onChange={() => onExperienceChange(level)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Company */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("company")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">Company</span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.company ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.company && (
          <div className="space-y-2 ml-2 max-h-48 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {companies.map((company) => (
              <label key={company} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{company}</span>
              </label>
            ))}
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
              + Add a company
            </button>
          </div>
        )}
      </div>

      {/* Job Type */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("jobType")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">Job type</span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.jobType ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.jobType && (
          <div className="space-y-2 ml-2">
            {jobTypes.map((type) => (
              <label key={type} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appliedFilters.jobType?.includes(type) || false}
                  onChange={() => onJobTypeChange(type)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Remote */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("remote")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">Remote</span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.remote ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.remote && (
          <div className="space-y-2 ml-2">
            {remoteOptions.map((option) => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("location")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">Location</span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.location ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.location && (
          <div className="space-y-2 ml-2 max-h-48 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {locations.map((location) => (
              <label
                key={location}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={appliedFilters.location?.includes(location) || false}
                  onChange={() => onLocationChange(location)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{location}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Industry */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("industry")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">Industry</span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.industry ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.industry && (
          <div className="space-y-2 ml-2 max-h-48 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {industries.map((industry) => (
              <label
                key={industry}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{industry}</span>
              </label>
            ))}
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
              + Add an industry
            </button>
          </div>
        )}
      </div>

      {/* Job Function */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection("jobFunction")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">
            Job function
          </span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.jobFunction ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.jobFunction && (
          <div className="space-y-2 ml-2 max-h-48 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {jobFunctions.map((func) => (
              <label key={func} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{func}</span>
              </label>
            ))}
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
              + Add a job function
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("title")}
          className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 p-2 rounded -ml-2"
        >
          <span className="font-semibold text-gray-900 text-sm">Title</span>
          <ChevronDown
            size={18}
            className={`transform transition ${
              expandedSections.title ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.title && (
          <div className="space-y-2 ml-2 max-h-48 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {titles.map((title) => (
              <label key={title} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{title}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
