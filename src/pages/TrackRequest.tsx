import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import TrackingTimeline from "@/components/TrackingTimeline";
import RequestDetailsCard from "@/components/RequestDetailsCard";
import RequestProblemSection from "@/components/RequestProblemSection";
import { useTrackRequest } from "@/lib/api/requests";

const TrackRequest = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const {
    data: requestData,
    isLoading,
    isFetching,
    refetch,
  } = useTrackRequest(trackingNumber);
  const [searchParams] = useSearchParams();
  const isPending = isLoading || isFetching;

  const statusLabels: Record<string, string> = {
    new: "Yangi",
    assigned: "Tayinlangan",
    accepted: "Qabul qilingan",
    "in-progress": "Bajarilmoqda",
    completed: "Yakunlangan",
    verified: "Tasdiqlangan",
    rejected: "Rad etilgan",
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const buildTimelineSteps = (data: typeof requestData) => {
    if (!data.timeline?.length) {
      return [];
    }
    const isFinal = ["completed", "verified", "rejected"].includes(data.status);

    return data.timeline.map((entry, index) => {
      const isLast = index === data.timeline.length - 1;
      const isCurrent = isLast && !isFinal;
      const status = isCurrent ? "in-progress" : "completed";

      return {
        id: index + 1,
        title: statusLabels[entry.status] || entry.status,
        time: formatDateTime(entry.timestamp),
        description: entry.comment || "Holat yangilandi",
        badge: isCurrent ? statusLabels[data.status] || data.status : undefined,
        status: status as "completed" | "in-progress" | "pending",
      };
    });
  };

  useEffect(() => {
    // Auto-search if requestId is provided in query params
    const requestId = searchParams.get("id");
    if (requestId && !trackingNumber) {
      setTrackingNumber(requestId);
      refetch();
    }
  }, [searchParams, trackingNumber, refetch]);

  const handleSearch = async () => {
    if (trackingNumber.trim().length < 8) return;
    refetch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const timelineSteps = requestData ? buildTimelineSteps(requestData) : [];

  const requestDetails = requestData
    ? {
        id: requestData.requestNumber,
        citizenName: requestData.citizen?.name || undefined,
        citizenPhone: requestData.citizen?.phone || undefined,
        organization: requestData.organization || {
          name: "-",
          governance: "-",
        },
        address: requestData.address?.full || "-",
        submittedDate: formatDateTime(requestData.createdAt),
        estimatedTime: requestData.assignment?.estimatedTime,
        status: requestData.status,
        statusLabel:
          requestData.statusLabel || statusLabels[requestData.status],
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Murojaatni Kuzatish</h1>
              <p className="text-muted-foreground">
                Murojaat raqamingizni kiriting
              </p>
            </div>

            <div className="bg-card rounded-2xl shadow-lg p-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Masalan: 26060001"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    onKeyUp={handleKeyPress}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleSearch}
                  disabled={isPending || trackingNumber.trim().length < 8}
                  className="px-8"
                >
                  {isPending ? "Qidirilmoqda..." : "Qidirish"}
                </Button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {requestData && requestDetails && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Timeline - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <TrackingTimeline steps={timelineSteps} />
                </div>

                {/* Request Details Card - Takes 1 column */}
                <div>
                  <RequestDetailsCard request={requestDetails} />
                </div>
              </div>

              {/* Problem Section */}
              <RequestProblemSection
                description={requestData.description}
                images={requestData.images}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackRequest;
