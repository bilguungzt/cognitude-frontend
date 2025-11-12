import React from 'react';
import { motion } from 'framer-motion';
import { FaRoute, FaBolt, FaShieldAlt } from 'react-icons/fa';

// Define the type for a single activity event
interface ActivityEvent {
  id: string;
  type: 'routing' | 'caching' | 'security';
  description: string;
  timestamp: string;
}

// Map event types to icons
const iconMap: Record<ActivityEvent['type'], React.ElementType> = {
  routing: FaRoute,
  caching: FaBolt,
  security: FaShieldAlt,
};

// Define the props for the ActivityFeed component
interface ActivityFeedProps {
  events: ActivityEvent[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Real-time Activity</h3>
      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = iconMap[event.type];
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div className="bg-gray-700 rounded-full p-2">
                <Icon className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white">{event.description}</p>
                <p className="text-sm text-gray-400">{event.timestamp}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;