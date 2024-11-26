"use client";

import { useEffect, useState } from "react";
import DonorTable from "@/components/DonorTable";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { DonorStats } from "@/components/DonorStats";
import { DonorTasks } from "@/components/DonorTasks";

export default function Home() {
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({
    stage: "",
    searchTerm: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchDonors = async (params = {}) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: String(params.page || pagination.page),
        limit: String(params.limit || pagination.limit),
        stage: params.stage !== undefined ? params.stage : currentFilter.stage,
        searchTerm:
          params.searchTerm !== undefined
            ? params.searchTerm
            : currentFilter.searchTerm,
      });

      // Clean up empty params
      for (const [key, value] of queryParams.entries()) {
        if (!value) queryParams.delete(key);
      }

      const response = await fetch(
        `http://localhost:3000/api/donors?${queryParams}`
      );

      if (!response.ok) throw new Error("Failed to fetch donors");

      const result = await response.json();
      setDonors(result.data);
      setPagination(result.pagination);

      // Update current filter state with new params
      setCurrentFilter((prevFilter) => ({
        ...prevFilter,
        stage: params.stage !== undefined ? params.stage : prevFilter.stage,
        searchTerm:
          params.searchTerm !== undefined
            ? params.searchTerm
            : prevFilter.searchTerm,
      }));
    } catch (error) {
      console.error("Error fetching donors:", error);
      toast.error("Failed to load donors");
    } finally {
      setIsLoading(false);
    }
  };

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
        fetchDonors({
          page: 1,
          stage: currentFilter.stage,
          searchTerm: currentFilter.searchTerm,
        });
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
      fetchDonors({
        page: pagination.page,
        stage: currentFilter.stage,
        searchTerm: currentFilter.searchTerm,
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  const handlePageChange = (page) => {
    fetchDonors({
      page,
      stage: currentFilter.stage,
      searchTerm: currentFilter.searchTerm,
    });

    const donorTableElement = document.getElementById("donor-table");
    if (donorTableElement) {
      donorTableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFilterChange = (stage) => {
    fetchDonors({
      page: 1,
      stage,
      searchTerm: currentFilter.searchTerm,
    });
  };

  const handleSearchChange = (searchTerm) => {
    fetchDonors({
      page: 1,
      stage: currentFilter.stage,
      searchTerm,
    });
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

      <DonorStats />
      <DonorTasks />
      <div id="donor-table" className="min-h-[500px]">
        <DonorTable
          data={donors}
          isLoading={isLoading}
          pagination={pagination}
          currentFilter={currentFilter}
          onCommentChange={handleCommentChange}
          onPageChange={handlePageChange}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
      </div>

      <Toaster />
    </div>
  );
}
