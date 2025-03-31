import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { usersAPI, activitiesAPI } from "../utils/api";
import ActivityCard from "../components/ActivityCard";
import OnlineIndicator from "../components/OnlineIndicator";

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser, updateUserProfile } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    college: "",
    bio: "",
    interests: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Determine if viewing own profile or someone else's
  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);

  useEffect(() => {
    fetchUserData();
  }, [userId, currentUser]);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let userData;
      if (isOwnProfile) {
        userData = currentUser;
      } else {
        const response = await usersAPI.getById(userId);
        userData = response.data;
      }

      setUser(userData);

      // Set initial form values if viewing own profile
      if (isOwnProfile) {
        setEditForm({
          name: userData?.name || "",
          college: userData?.college || "",
          bio: userData?.bio || "",
          interests: userData?.interests || [],
        });
      }

      // Fetch user's activities
      const activitiesResponse = await activitiesAPI.getUserActivities(
        isOwnProfile ? undefined : userId
      );
      setUserActivities(activitiesResponse.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user profile. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setEditForm({
        ...editForm,
        interests: [...editForm.interests, value],
      });
    } else {
      setEditForm({
        ...editForm,
        interests: editForm.interests.filter((interest) => interest !== value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const updatedUser = await updateUserProfile(editForm);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden p-6 text-center">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            User not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // List of available interests for the edit form
  const availableInterests = [
    "Sports",
    "Gaming",
    "Music",
    "Reading",
    "Dining",
    "Movies",
    "Travel",
    "Cooking",
    "Study",
    "Art",
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
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

        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="relative">
                  {user.avatar ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary-500 flex items-center justify-center text-2xl font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <OnlineIndicator isOnline={user.isOnline} />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  <p className="text-sm text-gray-500">{user.college}</p>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex space-x-3">
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                ) : (
                  <Link
                    to={`/chat/${user._id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                    Message
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            {isEditing ? (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Edit Profile
                  </h3>

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={editForm.name}
                          onChange={handleEditFormChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="college"
                          className="block text-sm font-medium text-gray-700"
                        >
                          College/University
                        </label>
                        <input
                          type="text"
                          name="college"
                          id="college"
                          value={editForm.college}
                          onChange={handleEditFormChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={3}
                          value={editForm.bio}
                          onChange={handleEditFormChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Tell others a bit about yourself..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interests
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableInterests.map((interest) => (
                            <div key={interest} className="flex items-center">
                              <input
                                id={`interest-${interest}`}
                                name="interests"
                                type="checkbox"
                                value={interest}
                                checked={editForm.interests.includes(interest)}
                                onChange={handleInterestChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`interest-${interest}`}
                                className="ml-2 block text-sm text-gray-900"
                              >
                                {interest}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Profile Information
                  </h3>

                  {user.bio ? (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Bio
                      </h4>
                      <p className="text-sm text-gray-700">{user.bio}</p>
                    </div>
                  ) : isOwnProfile ? (
                    <div className="mb-6 text-center py-4 border border-dashed border-gray-300 rounded-md">
                      <svg
                        className="h-8 w-8 text-gray-400 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">
                        Add a bio to tell others about yourself
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Add Bio
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500">
                        This user hasn't added a bio yet.
                      </p>
                    </div>
                  )}

                  {user.interests && user.interests.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Interests
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((interest) => (
                          <span
                            key={interest}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : isOwnProfile ? (
                    <div className="text-center py-4 border border-dashed border-gray-300 rounded-md">
                      <svg
                        className="h-8 w-8 text-gray-400 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">
                        Add your interests to find better matches
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Add Interests
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Interests
                      </h4>
                      <p className="text-sm text-gray-500">
                        This user hasn't added any interests yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {isOwnProfile
                    ? "Your Activities"
                    : `${user.name}'s Activities`}
                </h3>
              </div>

              <div className="px-4 py-5 sm:p-6">
                {userActivities.length === 0 ? (
                  <div className="text-center py-8">
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
                      {isOwnProfile
                        ? "You haven't joined any activities yet."
                        : `${user.name} hasn't joined any activities yet.`}
                    </p>

                    {isOwnProfile && (
                      <Link
                        to="/activities"
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Browse Activities
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {userActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        isJoined={isOwnProfile}
                        onFindPeers={
                          isOwnProfile
                            ? () =>
                                (window.location.href = `/activities?findPeers=${activity.id}`)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
