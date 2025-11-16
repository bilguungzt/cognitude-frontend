import React from "react";
import { motion } from "framer-motion";
import { Activity, Zap, ShieldCheck } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: "routing" | "caching" | "security";
  description: string;
  timestamp: string;
}

const iconMap: Record<ActivityEvent["type"], React.ElementType> = {
  routing: Activity,
  caching: Zap,
  security: ShieldCheck,
};

interface ActivityFeedProps {
  events: ActivityEvent[];
  emptyMessage?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  events,
  emptyMessage = "Send your first proxied request to see live activity.",
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Signals</h3>
        <a
          href="/logs"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View logs →
        </a>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => {
            const Icon = iconMap[event.type];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4"
              >
                <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{event.description}</p>
                  <p className="text-xs text-gray-500">{event.timestamp}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;