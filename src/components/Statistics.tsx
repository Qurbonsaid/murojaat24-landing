import { Card, CardContent } from "@/components/ui/card";
import { usePublicStatistics } from "@/lib/api/statistics";

const StatSkeleton = () => (
  <Card className="border-2 shadow-sm">
    <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
      <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
      <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
    </CardContent>
  </Card>
);

const Statistics = () => {
  const { data, isLoading, isError } = usePublicStatistics();
  const stats = data
    ? [
        {
          value: data.overview.total,
          label: "Jami murojaatlar",
          color: "text-primary",
        },
        {
          value: data.overview.today,
          label: "Bugun qabul qilindi",
          color: "text-secondary",
        },
        {
          value: data.overview.inProgress,
          label: "Jarayonda",
          color: "text-warning",
        },
        {
          value: data.overview.completed,
          label: "Bajarilgan",
          color: "text-secondary",
        },
      ]
    : [];

  return (
    <section className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Ochiq statistika
          </p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            Murojaatlar statistikasi va tahlili
          </h2>
          <p className="mt-2 text-muted-foreground">
            Fuqarolar uchun asosiy ko'rsatkichlar real ma'lumotlar bilan
            yangilanadi.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && !data
            ? Array.from({ length: 4 }).map((_, index) => (
                <StatSkeleton key={index} />
              ))
            : stats.map((stat, index) => (
                <Card
                  key={index}
                  className="border-2 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                >
                  <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                    <div className={`text-4xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {isLoading && !data
            ? "Statistika yuklanmoqda..."
            : isError
              ? "Statistika vaqtincha yuklanmadi."
              : `So'nggi yangilanish: ${new Date(data.updatedAt).toLocaleString("uz-UZ")}`}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
