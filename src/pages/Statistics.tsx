import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Header from "@/components/Header";
import { usePublicStatistics } from "@/lib/api/statistics";

const ChartSkeleton = () => (
  <Card className="h-full">
    <CardContent className="space-y-4 p-6">
      <div className="h-6 w-56 animate-pulse rounded-full bg-muted" />
      <div className="h-[380px] animate-pulse rounded-2xl bg-muted" />
    </CardContent>
  </Card>
);

const SummarySkeleton = () => (
  <Card className="mb-8">
    <CardContent className="space-y-3 p-6">
      <div className="h-6 w-52 animate-pulse rounded-full bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded-full bg-muted" />
      <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </CardContent>
  </Card>
);

const Statistics = () => {
  const { data: statistics, isLoading, isError } = usePublicStatistics();

  const governanceDistribution =
    statistics?.governanceDistribution.map((item) => ({
      name: item.governance,
      value: item.count,
      color: item.color,
    })) || [];

  const organizationData =
    statistics?.organizationDistribution.map((item) => ({
      name: item.name,
      value: item.count,
      color: item.color,
    })) || [];

  const dailyData = statistics?.dailyTrend || [];

  const statusData =
    statistics?.statusDistribution.map((item) => ({
      name: item.label,
      count: item.count,
      color: item.color,
    })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Statistika
          </h1>
          <p className="text-muted-foreground">
            Murojaatlar statistikasi va tahlili
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLoading && !statistics
              ? "Ma'lumotlar yuklanmoqda..."
              : isError
                ? "API vaqtincha javob bermadi."
                : `So'nggi yangilanish: ${new Date(
                    statistics.updatedAt,
                  ).toLocaleString("uz-UZ")}`}
          </p>
        </div>

        {isLoading && !statistics && <SummarySkeleton />}

        {isError && !isLoading && !statistics && (
          <Card className="mb-8 border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-base font-medium text-foreground">
                Statistika hozircha yuklanmadi.
              </p>
              <p className="text-sm text-muted-foreground">
                Iltimos, keyinroq qayta urinib ko'ring.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading && !statistics ? (
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        ) : statistics ? (
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Rahbariyat bo'yicha taqsimot</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <ResponsiveContainer width="100%" height={380}>
                    <PieChart>
                      <Pie
                        data={governanceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {governanceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Tashkilotlar bo'yicha taqsimot</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <ResponsiveContainer width="100%" height={380}>
                    <PieChart>
                      <Pie
                        data={organizationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {organizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Kunlik dinamika (oxirgi 7 kun)</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="received"
                        stroke="#3b82f6"
                        name="Qabul qilindi"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        name="Bajarilgan"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Status bo'yicha</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Statistika hozircha mavjud emas.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Statistics;
