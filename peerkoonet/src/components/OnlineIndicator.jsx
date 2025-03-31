import React from "react";

const OnlineIndicator = ({ isOnline }) => {
  return (
    <div className="absolute -bottom-1 -right-1">
      <div
        className={`w-4 h-4 rounded-full border-2 border-white ${
          isOnline ? "bg-green-500" : "bg-gray-300"
        }`}
      />
    </div>
  );
};

export default OnlineIndicator;
