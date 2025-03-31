import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ActivityCard from "../components/ActivityCard";
import UserCard from "../components/UserCard";
import { activitiesAPI, usersAPI } from "../utils/api";

const DashboardPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [userActivities, setUserActivities] = useState([]);
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activitiesJoined: 0,
    messagesExchanged: 0,
    connectionsFormed: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch user's activities
        const userActivitiesResponse = await activitiesAPI.getUserActivities();
        setUserActivities(userActivitiesResponse.data);

        // Set stats (would typically come from API)
        setStats({
          activitiesJoined: userActivitiesResponse.data.length,
          messagesExchanged: 32, // Example value - replace with actual data
          connectionsFormed: 8, // Example value - replace with actual data
        });

        // Fetch suggested activities based on user's interests
        const suggestedActivitiesResponse = await activitiesAPI.getAll();
        // Filter out activities user has already joined
        const joinedActivityIds = userActivitiesResponse.data.map(
          (activity) => activity.id
        );
        const filteredSuggestions = suggestedActivitiesResponse.data.filter(
          (activity) => !joinedActivityIds.includes(activity.id)
        );
        // Take only the first 3 suggestions
        setSuggestedActivities(filteredSuggestions.slice(0, 3));

        // Fetch online users
        const onlineUsersResponse = await usersAPI.getOnlineUsers();
        setOnlineUsers(onlineUsersResponse.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Polling for online users every 60 seconds
    const onlineUsersInterval = setInterval(async () => {
      try {
        const onlineUsersResponse = await usersAPI.getOnlineUsers();
        setOnlineUsers(onlineUsersResponse.data);
      } catch (err) {
        console.error("Error fetching online users:", err);
      }
    }, 60000);

    return () => clearInterval(onlineUsersInterval);
  }, []);

  const handleJoinActivity = async (activityId) => {
    try {
      await activitiesAPI.joinActivity(activityId);

      // Update the activities lists
      const activity = suggestedActivities.find((a) => a.id === activityId);
      if (activity) {
        setUserActivities([...userActivities, activity]);
        setSuggestedActivities(
          suggestedActivities.filter((a) => a.id !== activityId)
        );

        // Update stats
        setStats((prev) => ({
          ...prev,
          activitiesJoined: prev.activitiesJoined + 1,
        }));
      }
    } catch (err) {
      console.error("Error joining activity:", err);
      setError("Failed to join activity. Please try again.");
    }
  };

  const handleLeaveActivity = async (activityId) => {
    try {
      await activitiesAPI.leaveActivity(activityId);

      // Update the activities lists
      const activity = userActivities.find((a) => a.id === activityId);
      if (activity) {
        setUserActivities(userActivities.filter((a) => a.id !== activityId));
        // Only add back to suggestions if we have less than 3
        if (suggestedActivities.length < 3) {
          setSuggestedActivities([...suggestedActivities, activity]);
        }

        // Update stats
        setStats((prev) => ({
          ...prev,
          activitiesJoined: prev.activitiesJoined - 1,
        }));
      }
    } catch (err) {
      console.error("Error leaving activity:", err);
      setError("Failed to leave activity. Please try again.");
    }
  };

  const handleFindPeers = (activityId) => {
    // Navigate to activity page with the activity ID
    window.location.href = `/activities?findPeers=${activityId}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get current time period greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section with Background */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {getGreeting()}, {currentUser?.name || "User"}!
              </h1>
              <p className="mt-1 text-blue-100">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/activities"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Browse All Activities
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

        {/* Stats Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Activity Stats */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Activities Joined
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900">
                          {stats.activitiesJoined}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Stats */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Messages Exchanged
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900">
                          {stats.messagesExchanged}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Connections Stats */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Connections Formed
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900">
                          {stats.connectionsFormed}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content - Activities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your Activities */}
            <section className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Your Activities
                  </h3>
                  <Link
                    to="/activities"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    View all
                  </Link>
                </div>
              </div>

              <div className="px-4 py-5 sm:p-6">
                {userActivities.length === 0 ? (
                  <div className="text-center py-4">
                    <svg
                      className="h-12 w-12 text-gray-400 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      You haven't joined any activities yet.
                    </p>
                    <Link
                      to="/activities"
                      className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                    >
                      Browse Activities
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
              </div>
            </section>

            {/* Suggested Activities */}
            <section className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Suggested For You
                  </h3>
                  <Link
                    to="/activities"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    See more
                  </Link>
                </div>
              </div>

              <div className="px-4 py-5 sm:p-6">
                {suggestedActivities.length === 0 ? (
                  <div className="text-center py-4">
                    <svg
                      className="h-12 w-12 text-gray-400 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      No suggested activities at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {suggestedActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        isJoined={false}
                        onJoin={handleJoinActivity}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar - Online Users */}
          <div className="space-y-8">
            {/* User Profile Summary */}
            <section className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Your Profile
                </h3>
              </div>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {currentUser?.avatar ? (
                      <img
                        className="h-16 w-16 rounded-full object-cover border-2 border-blue-500"
                        src={currentUser.avatar}
                        alt={currentUser.name}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {currentUser?.name || "User"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {currentUser?.college || "University"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to="/profile"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </section>

            {/* Online Users */}
            <section className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Online Now{" "}
                  <span className="bg-green-100 text-green-800 text-xs font-semibold ml-2 px-2.5 py-0.5 rounded-full">
                    {onlineUsers.length}
                  </span>
                </h3>
              </div>

              <div>
                {onlineUsers.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg
                      className="h-12 w-12 text-gray-400 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      No users are online at the moment.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {onlineUsers.map((user) => (
                      <li
                        key={user._id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 relative">
                            {user.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatar}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="absolute -right-1 -bottom-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.college}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <Link
                              to={`/chat/${user._id}`}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              Message
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
