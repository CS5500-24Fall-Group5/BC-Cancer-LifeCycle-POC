"use client";

import { useEffect, useState } from "react";
import DonorTable from "@/components/DonorTable";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function Home() {
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch donors from API
  const fetchDonors = async (params = {}) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: String(params.page || pagination.page),
        limit: String(params.limit || pagination.limit),
        ...(params.stage && { stage: params.stage }),
        ...(params.searchTerm && { searchTerm: params.searchTerm }),
      });

      const response = await fetch(
        `http://localhost:3000/api/donors?${queryParams}`
      );

      if (!response.ok) throw new Error("Failed to fetch donors");

      const result = await response.json();
      console.log(result.data);
      setDonors(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching donors:", error);
      toast.error("Failed to load donors");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data with faux API
  const syncData = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch("http://localhost:3000/api/sync", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Sync failed");

      const result = await response.json();
      if (result.success) {
        toast.success(`Synced ${result.results.processed} donors`);
        fetchDonors(); // Refresh data after sync
      } else {
        throw new Error(result.error || "Sync failed");
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("Failed to sync data");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle comment updates
  const handleCommentChange = async (donorId, content) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/donors/${donorId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) throw new Error("Failed to update comment");
      toast.success("Comment updated");
      fetchDonors(); // Refresh to show new comment
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Donor Lifecycle Management</h1>
        <Button
          onClick={syncData}
          disabled={isSyncing}
          className="flex items-center gap-2"
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              Sync New Data
            </>
          )}
        </Button>
      </div>

      <DonorTable
        data={donors}
        isLoading={isLoading}
        pagination={pagination}
        onCommentChange={handleCommentChange}
        onPageChange={(page) => fetchDonors({ page })}
        onFilterChange={(stage) => fetchDonors({ stage })}
      />

      <Toaster />
    </div>
  );
}
