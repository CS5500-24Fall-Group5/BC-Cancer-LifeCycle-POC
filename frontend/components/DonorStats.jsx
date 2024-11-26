"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const StatCard = ({ title, value, totalDonations, icon: Icon, percentage }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex flex-col gap-1 mt-1">
          <p className="text-xs text-muted-foreground">
            {percentage}% of total donors
          </p>
          <p className="text-xs text-muted-foreground">
            ${new Intl.NumberFormat("en-US").format(totalDonations)} total
            donations
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export function DonorStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/donors/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching donor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
      <StatCard
        title="Active Donors"
        value={stats.stats.ACTIVE.count}
        totalDonations={stats.stats.ACTIVE.totalDonations}
        icon={Users}
        percentage={stats.stats.ACTIVE.percentage}
      />
      <StatCard
        title="New Donors"
        value={stats.stats.NEW.count}
        totalDonations={stats.stats.NEW.totalDonations}
        icon={TrendingUp}
        percentage={stats.stats.NEW.percentage}
      />
      <StatCard
        title="At Risk Donors"
        value={stats.stats.AT_RISK.count}
        totalDonations={stats.stats.AT_RISK.totalDonations}
        icon={AlertCircle}
        percentage={stats.stats.AT_RISK.percentage}
      />
      <StatCard
        title="Lapsed Donors"
        value={stats.stats.LAPSED.count}
        totalDonations={stats.stats.LAPSED.totalDonations}
        icon={Clock}
        percentage={stats.stats.LAPSED.percentage}
      />
    </div>
  );
}
