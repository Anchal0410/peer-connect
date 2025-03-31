import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

// Mock Data
const MOCK_ACTIVITIES = [
  {
    id: "act1",
    name: "Tennis Club",
    description:
      "Join weekly tennis matches and improve your skills with fellow enthusiasts",
    category: "sports",
    participants: 12,
    maxParticipants: 20,
    location: "University Tennis Courts",
    schedule: "Tuesdays and Thursdays, 4-6 PM",
    image:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000",
    createdAt: "2025-01-15T12:00:00.000Z",
  },
  {
    id: "act2",
    name: "Gaming Tournament",
    description:
      "Compete in our monthly gaming tournament featuring popular titles like Valorant and League of Legends",
    category: "gaming",
    participants: 28,
    maxParticipants: 32,
    location: "Student Union Gaming Center",
    schedule: "Last Saturday of every month, 12-8 PM",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000",
    createdAt: "2025-02-05T14:30:00.000Z",
  },
  {
    id: "act3",
    name: "Data Science Study Group",
    description:
      "Collaborate on data science projects and prepare for exams together",
    category: "study",
    participants: 8,
    maxParticipants: 15,
    location: "Engineering Library, Room 204",
    schedule: "Mondays and Wednesdays, 5-7 PM",
    image:
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=1000",
    createdAt: "2025-02-10T09:15:00.000Z",
  },
  {
    id: "act4",
    name: "International Food Club",
    description:
      "Experience cuisine from around the world with monthly themed potlucks",
    category: "dining",
    participants: 15,
    maxParticipants: 25,
    location: "Community Kitchen, Student Center",
    schedule: "First Friday of every month, 6-9 PM",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
    createdAt: "2025-01-20T16:45:00.000Z",
  },
  {
    id: "act5",
    name: "Movie Night",
    description: "Weekly movie screenings followed by thoughtful discussions",
    category: "entertainment",
    participants: 22,
    maxParticipants: 40,
    location: "Campus Theater",
    schedule: "Friday nights, 7-10 PM",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000",
    createdAt: "2025-02-15T11:20:00.000Z",
  },
  {
    id: "act6",
    name: "Basketball League",
    description: "Join our 3v3 basketball league for all skill levels",
    category: "sports",
    participants: 24,
    maxParticipants: 30,
    location: "Campus Gymnasium",
    schedule: "Weekends, 2-5 PM",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000",
    createdAt: "2025-02-08T13:10:00.000Z",
  },
  {
    id: "act7",
    name: "Coding Bootcamp",
    description:
      "Intensive weekend coding sessions focusing on web development",
    category: "study",
    participants: 18,
    maxParticipants: 20,
    location: "Computer Science Building, Lab 101",
    schedule: "Saturdays, 9 AM-4 PM",
    image:
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1000",
    createdAt: "2025-01-25T10:05:00.000Z",
  },
  {
    id: "act8",
    name: "Coffee Tastings",
    description:
      "Discover artisanal coffees from around the world with expert baristas",
    category: "dining",
    participants: 10,
    maxParticipants: 15,
    location: "Campus Coffee Shop",
    schedule: "Every other Sunday, 10 AM-12 PM",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000",
    createdAt: "2025-02-12T15:50:00.000Z",
  },
  {
    id: "act9",
    name: "Virtual Reality Club",
    description: "Explore VR gaming and development with the latest equipment",
    category: "gaming",
    participants: 14,
    maxParticipants: 20,
    location: "Innovation Center",
    schedule: "Thursdays, 6-9 PM",
    image:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1000",
    createdAt: "2025-01-30T17:25:00.000Z",
  },
];

// Mock user activities (activities the current user has joined)
const MOCK_USER_ACTIVITIES = ["act1", "act3", "act8"];

// Mock matched users for "Find Peers" functionality
const MOCK_MATCHED_USERS = [
  {
    _id: "user1",
    name: "Emma Davis",
    college: "Stanford University",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Computer Science major with a passion for AI and machine learning.",
    interests: ["Data Science", "Hiking", "Photography"],
    isOnline: true,
  },
  {
    _id: "user2",
    name: "James Wilson",
    college: "UC Berkeley",
    avatar: "https://i.pravatar.cc/150?img=2",
    bio: "Studying Biology with a focus on environmental conservation.",
    interests: ["Environmental Science", "Tennis", "Reading"],
    isOnline: false,
  },
  {
    _id: "user3",
    name: "Sophia Martinez",
    college: "MIT",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Electrical Engineering major working on renewable energy projects.",
    interests: ["Robotics", "Chess", "Cooking"],
    isOnline: true,
  },
  {
    _id: "user4",
    name: "Ethan Brown",
    college: "Harvard University",
    avatar: "https://i.pravatar.cc/150?img=4",
    bio: "Business Administration student with an interest in entrepreneurship.",
    interests: ["Startups", "Basketball", "Travel"],
    isOnline: false,
  },
];

// List of activity categories for the filter
const CATEGORIES = [
  { id: "all", name: "All Categories", icon: "🌟" },
  { id: "sports", name: "Sports", icon: "🏀" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "study", name: "Study Groups", icon: "📚" },
  { id: "dining", name: "Dining", icon: "🍽️" },
  { id: "entertainment", name: "Entertainment", icon: "🎬" },
];

// Activity Card Component
const ActivityCard = ({ activity, isJoined, onJoin, onLeave, onFindPeers }) => {
  const categoryObj =
    CATEGORIES.find((cat) => cat.id === activity.category) || CATEGORIES[0];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-70"></div>
        <img
          className="h-full w-full object-cover"
          src={activity.image}
          alt={activity.name}
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {categoryObj.icon} {categoryObj.name}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="text-xl font-bold">{activity.name}</h3>
          <p className="text-sm text-white opacity-90">{activity.schedule}</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-600 text-sm mb-3">{activity.description}</p>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{activity.location}</span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Participants</span>
            <span>
              {activity.participants}/{activity.maxParticipants}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${
                activity.participants === activity.maxParticipants
                  ? "bg-red-500"
                  : "bg-blue-600"
              } h-2 rounded-full`}
              style={{
                width: `${
                  (activity.participants / activity.maxParticipants) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="flex space-x-2">
          {isJoined ? (
            <>
              <button
                onClick={() => onLeave(activity.id)}
                className="flex-1 bg-white text-red-600 border border-red-600 font-medium py-2 px-4 rounded-md hover:bg-red-50 transition-colors duration-300"
              >
                Leave
              </button>
              <button
                onClick={() => onFindPeers(activity.id)}
                className="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
              >
                Find Peers
              </button>
            </>
          ) : (
            <button
              onClick={() => onJoin(activity.id)}
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Join Activity
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// User Card Component for Matched Users
const UserCard = ({ user, onConnect, onDismiss }) => (
  <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-start space-x-4">
      <div className="relative flex-shrink-0">
        {user.avatar ? (
          <img
            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
            src={user.avatar}
            alt={user.name}
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          className={`absolute -bottom-1 -right-1 h-4 w-4 ${
            user.isOnline ? "bg-green-500" : "bg-gray-300"
          } rounded-full border-2 border-white`}
        ></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{user.name}</h4>
            <p className="text-xs text-gray-500">{user.college}</p>
          </div>
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              user.isOnline ? "bg-green-500" : "bg-gray-300"
            }`}
          ></span>
        </div>
        <p className="text-xs text-gray-600 mt-1">{user.bio}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {user.interests.map((interest, index) => (
            <span
              key={index}
              className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-800"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-4 flex justify-end space-x-2">
      <button
        onClick={() => onDismiss(user._id)}
        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
      >
        Dismiss
      </button>
      <button
        onClick={() => onConnect(user._id)}
        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
      >
        Connect
      </button>
    </div>
  </div>
);

const ActivityPage = () => {
  const [activities] = useState(MOCK_ACTIVITIES);
  const [userActivities, setUserActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showMatches, setShowMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("explore");

  const location = useLocation();

  // Initialize data
  useEffect(() => {
    // Simulate loading
    setIsLoading(true);

    setTimeout(() => {
      // Get user's activities based on mock data
      const userActs = activities.filter((activity) =>
        MOCK_USER_ACTIVITIES.includes(activity.id)
      );
      setUserActivities(userActs);

      // Set all activities as filtered initially
      setFilteredActivities(activities);
      setIsLoading(false);
    }, 1000);
  }, [activities]);

  // Check if there's a query parameter for finding peers
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const findPeersParam = params.get("findPeers");

    if (findPeersParam) {
      handleFindPeers(findPeersParam);
    }
  }, [location]);

  // Apply filters when search term or category changes
  useEffect(() => {
    if (activities.length > 0) {
      applyFilters();
    }
  }, [activities, searchTerm, categoryFilter, sortBy]);

  const applyFilters = () => {
    let filtered = [...activities];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.category === categoryFilter
      );
    }

    // Apply sorting
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => b.participants - a.participants);
    } else if (sortBy === "available") {
      filtered.sort(
        (a, b) =>
          b.maxParticipants -
          b.participants -
          (a.maxParticipants - a.participants)
      );
    }

    setFilteredActivities(filtered);
  };

  const handleJoinActivity = (activityId) => {
    const activityToJoin = activities.find((a) => a.id === activityId);
    if (activityToJoin) {
      // Add to user activities
      setUserActivities((prev) => [...prev, activityToJoin]);

      // Update activities list (increment participant count)
      const updatedActivities = activities.map((activity) => {
        if (activity.id === activityId) {
          return { ...activity, participants: activity.participants + 1 };
        }
        return activity;
      });

      // Show success message (could be implemented)
    }
  };

  const handleLeaveActivity = (activityId) => {
    // Remove from user activities
    setUserActivities((prev) => prev.filter((a) => a.id !== activityId));

    // Update activities list (decrement participant count)
    const updatedActivities = activities.map((activity) => {
      if (activity.id === activityId) {
        return {
          ...activity,
          participants: Math.max(0, activity.participants - 1),
        };
      }
      return activity;
    });

    // Show success message (could be implemented)
  };

  const handleFindPeers = (activityId) => {
    setIsLoading(true);
    setCurrentActivity(activities.find((a) => a.id === activityId));

    // Simulate API call with timeout
    setTimeout(() => {
      setMatchedUsers(MOCK_MATCHED_USERS);
      setShowMatches(true);
      setIsLoading(false);
    }, 800);
  };

  const handleConnectWithUser = (userId) => {
    // Redirect to chat with this user
    window.location.href = `/chat/${userId}`;
  };

  const handleDismissUser = (userId) => {
    setMatchedUsers((prev) => prev.filter((user) => user._id !== userId));
  };

  const handleCloseMatches = () => {
    setShowMatches(false);
    setMatchedUsers([]);
  };

  if (isLoading && !showMatches && activities.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Campus Activities
            </h1>
            <p className="mt-4 text-lg">
              Find activities that match your interests and connect with
              like-minded peers
            </p>
            <div className="mt-8">
              <button
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 sm:text-lg"
                onClick={() => setShowCreateModal(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end space-y-4 md:space-y-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "explore"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("explore")}
              >
                Explore Activities
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "joined"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("joined")}
              >
                My Activities
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {userActivities.length}
                </span>
              </button>
            </div>

            {/* Sort and View Options */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative inline-block text-left">
                <label
                  htmlFor="sort"
                  className="text-sm font-medium text-gray-700 mr-2"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  name="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="available">Most Available</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-xl overflow-hidden mb-8">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
              {/* Search filter */}
              <div className="flex-grow">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search Activities
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Find activities by name or description"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setCategoryFilter(category.id)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        categoryFilter === category.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      } transition-colors duration-200`}
                    >
                      <span className="mr-1">{category.icon}</span>{" "}
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Activities (when My Activities tab is active) */}
        {activeTab === "joined" && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Your Activities
            </h2>

            {userActivities.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  You haven't joined any activities yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Browse the available activities and join ones that interest
                  you.
                </p>
                <button
                  onClick={() => setActiveTab("explore")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Activities
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {userActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    isJoined={true}
                    onLeave={handleLeaveActivity}
                    onFindPeers={handleFindPeers}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
