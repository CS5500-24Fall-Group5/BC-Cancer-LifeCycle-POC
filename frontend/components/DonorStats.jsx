"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const StatCard = ({
  title,
  value,
  totalDonations,
  icon: Icon,
  percentage,
  trend = 0,
}) => {
  // Get color scheme based on card type
  const getColorScheme = () => {
    switch (title) {
      case "Active Donors":
        return "text-emerald-500 dark:text-emerald-400";
      case "New Donors":
        return "text-blue-500 dark:text-blue-400";
      case "At Risk Donors":
        return "text-amber-500 dark:text-amber-400";
      case "Lapsed Donors":
        return "text-red-500 dark:text-red-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${getColorScheme()}`} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">{value}</div>
            <div className={`text-xs font-medium ${getColorScheme()}`}>
              {percentage}%
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(totalDonations)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total donations from {title.toLowerCase()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-1 text-xs">
              {trend > 0 ? (
                <ArrowUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500" />
              )}
              <span className={trend > 0 ? "text-emerald-500" : "text-red-500"}>
                {Math.abs(trend)}% from last month
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsGrid = ({ children }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {children}
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="h-4 w-[30px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
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
        const response = await fetch(
          "https://bc-cancer-lifecycle-poc.onrender.com/api/donors/stats"
        );
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
      <StatsGrid>
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </StatsGrid>
    );
  }

  return (
    <StatsGrid>
      <StatCard
        title="Active Donors"
        value={stats.stats.ACTIVE.count}
        totalDonations={stats.stats.ACTIVE.totalDonations}
        icon={Users}
        percentage={stats.stats.ACTIVE.percentage}
        trend={2.5}
      />
      <StatCard
        title="New Donors"
        value={stats.stats.NEW.count}
        totalDonations={stats.stats.NEW.totalDonations}
        icon={TrendingUp}
        percentage={stats.stats.NEW.percentage}
        trend={5.2}
      />
      <StatCard
        title="At Risk Donors"
        value={stats.stats.AT_RISK.count}
        totalDonations={stats.stats.AT_RISK.totalDonations}
        icon={AlertCircle}
        percentage={stats.stats.AT_RISK.percentage}
        trend={-1.8}
      />
      <StatCard
        title="Lapsed Donors"
        value={stats.stats.LAPSED.count}
        totalDonations={stats.stats.LAPSED.totalDonations}
        icon={Clock}
        percentage={stats.stats.LAPSED.percentage}
        trend={-3.1}
      />
    </StatsGrid>
  );
}
