

// src/components/dashboard/StatsCards.jsx
const StatsCards = ({ stats }) => {
  const statsArray =
    stats && typeof stats === 'object' && !Array.isArray(stats)
      ? [
          {
            id: 1,
            title: 'Total Courses',
            value: stats.totalCourses || 0,
            icon: '📚',
            tag: 'Library',
          },
          {
            id: 2,
            title: 'Completed',
            value: stats.completedCourses || 0,
            icon: '🏆',
            tag: 'Cleared',
          },
          {
            id: 3,
            title: 'Assignments',
            value: stats.totalAssignments || 0,
            icon: '📝',
            tag: 'Tasks',
          },
          {
            id: 4,
            title: 'Avg Progress',
            value: `${stats.averageProgress || 0}%`,
            icon: '📊',
            tag: 'Sync',
          },
        ]
      : Array.isArray(stats)
      ? stats
      : [];

  if (statsArray.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
      {statsArray.map((stat, index) => (
        <div
          key={stat.id}
          className="g-stat-card p-3 md:p-4 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] md:text-xs tracking-[0.18em] uppercase text-slate-400">
                {stat.title}
              </p>
              <p className="text-lg md:text-2xl font-extrabold text-slate-50 mt-1">
                {stat.value}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">
              {stat.icon}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="g-chip">
              {stat.tag || 'Stat'}
            </span>
            <span className="text-[9px] text-slate-400 tracking-[0.18em] uppercase hidden md:inline">
              Slot {index + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

