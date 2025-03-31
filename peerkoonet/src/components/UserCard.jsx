import React from "react";
import { Link } from "react-router-dom";
import OnlineIndicator from "./OnlineIndicator";

const UserCard = ({ user, isMatch = false, onConnect, onDismiss }) => {
  const { _id, name, college, avatar, interests, isOnline, bio, matchScore } =
    user;

  return (
    <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200">
      <div className="px-6 py-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 relative">
            {avatar ? (
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={avatar}
                alt={name}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-500 flex items-center justify-center text-xl font-medium text-white">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <OnlineIndicator isOnline={isOnline} />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                <p className="text-sm text-gray-500">{college}</p>
              </div>
              {isMatch && matchScore && (
                <div className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm font-medium">
                  {matchScore}% Match
                </div>
              )}
            </div>
          </div>
        </div>

        {bio && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 line-clamp-2">{bio}</p>
          </div>
        )}

        {interests && interests.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex space-x-2">
          {isMatch ? (
            <>
              <button
                onClick={() => onConnect(_id)}
                className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                Connect
              </button>
              <button
                onClick={() => onDismiss(_id)}
                className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Dismiss
              </button>
            </>
          ) : (
            <Link
              to={`/profile/${_id}`}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
