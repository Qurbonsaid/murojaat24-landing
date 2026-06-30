import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isTMA, retrieveLaunchParams, miniApp } from "@tma.js/sdk-react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchTrackedRequest,
  useRateRequest,
  useRequestOtp,
} from "@/lib/api/requests";
import { cn } from "@/lib/utils";

const rateableStatuses = new Set(["completed", "verified"]);

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("998") ? digits.slice(3) : digits;
  return normalized ? `+998${normalized}` : "";
};

const RateRequest = () => {
  const [searchParams] = useSearchParams();
  const requestNumber = searchParams.get("id")?.trim() || "";
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpPhone, setOtpPhone] = useState("");
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [request, setRequest] = useState<Awaited<
    ReturnType<typeof fetchTrackedRequest>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(requestNumber));
  const [loadError, setLoadError] = useState("");
  const rateRequest = useRateRequest();
  const requestOtp = useRequestOtp();

  const isTelegramMiniApp = isTMA();
  const existingRating = request?.rating?.score ? request.rating : null;
  const canRate = request
    ? rateableStatuses.has(request.status) && !existingRating
    : false;
  const isSubmitting = rateRequest.isPending || requestOtp.isPending;

  const statusLabel = useMemo(() => {
    const labels: Record<string, string> = {
      new: "Yangi",
      assigned: "Tayinlangan",
      accepted: "Qabul qilingan",
      "in-progress": "Bajarilmoqda",
      completed: "Yakunlangan",
      verified: "Tasdiqlangan",
      rejected: "Rad etilgan",
    };

    return request ? request.statusLabel || labels[request.status] : "";
  }, [request]);

  useEffect(() => {
    if (!requestNumber) {
      setIsLoading(false);
      setLoadError("Murojaat raqami topilmadi.");
      return;
    }

    setIsLoading(true);
    setLoadError("");

    fetchTrackedRequest(requestNumber)
      .then((data) => {
        setRequest(data);
        if (data.rating?.score) {
          setScore(data.rating.score);
          setComment(data.rating.comment || "");
        }
      })
      .catch((error) => {
        const message =
          typeof error?.message === "string"
            ? error.message
            : "Murojaat topilmadi";
        setLoadError(message);
      })
      .finally(() => setIsLoading(false));
  }, [requestNumber]);

  const handleSubmit = async () => {
    if (!request?._id) return;

    if (!score) {
      toast.error("Baho tanlang");
      return;
    }

    const payload: {
      id: string;
      score: number;
      comment?: string;
      phone?: string;
      telegramId?: number;
      otp?: string;
    } = {
      id: request._id,
      score,
      comment: comment.trim() || undefined,
    };

    if (isTelegramMiniApp) {
      const telegramUser = retrieveLaunchParams().tgWebAppData.user;
      payload.telegramId = telegramUser.id;
    } else {
      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        toast.error("Telefon raqamingizni kiriting");
        return;
      }

      if (!otpRequested || otpPhone !== normalizedPhone) {
        try {
          await requestOtp.mutateAsync(normalizedPhone);
          setOtpRequested(true);
          setOtpPhone(normalizedPhone);
          setOtp("");
          toast.success("Tasdiqlash kodi yuborildi");
        } catch (error) {
          const message =
            typeof error?.message === "string"
              ? error.message
              : "Kod yuborishda xatolik";
          toast.error(message);
        }
        return;
      }

      if (!/^\d{6}$/.test(otp)) {
        toast.error("6 xonali tasdiqlash kodini kiriting");
        return;
      }

      payload.phone = normalizedPhone;
      payload.otp = otp;
    }

    try {
      await rateRequest.mutateAsync(payload);
      const updatedRequest = await fetchTrackedRequest(request.requestNumber);
      setRequest(updatedRequest);
      setOtpRequested(false);
      setOtp("");
      setOtpPhone("");
      toast.success("Rahmat! Bahoingiz qabul qilindi");

      if (isTelegramMiniApp) {
        window.setTimeout(() => miniApp.close(), 900);
      }
    } catch (error) {
      const message =
        typeof error?.message === "string"
          ? error.message
          : "Baholashda xatolik yuz berdi";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-10 md:py-16">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Murojaat24
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
              Murojaatni baholash
            </h1>
            <p className="mt-2 text-muted-foreground">
              Bajarilgan ish sifati haqida fikringizni qoldiring.
            </p>
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>
                {requestNumber
                  ? `Murojaat raqami: ${requestNumber}`
                  : "Murojaat raqami"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Murojaat yuklanmoqda...
                </div>
              )}

              {!isLoading && loadError && (
                <div className="space-y-4 rounded-lg border border-dashed p-6 text-center">
                  <p className="font-medium text-foreground">{loadError}</p>
                  <Button asChild variant="outline">
                    <Link to="/kuzatish">Murojaatni qidirish</Link>
                  </Button>
                </div>
              )}

              {!isLoading && request && (
                <>
                  <div className="grid gap-4 rounded-lg bg-background p-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Holati</p>
                      <p className="font-semibold">{statusLabel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tashkilot</p>
                      <p className="font-semibold">
                        {typeof request.organization === "object"
                          ? request.organization?.name || "-"
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {existingRating && (
                    <div className="flex items-start gap-3 rounded-lg border border-secondary/30 bg-secondary/10 p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-secondary" />
                      <div>
                        <p className="font-medium">Bu murojaat baholangan.</p>
                        <p className="text-sm text-muted-foreground">
                          Berilgan baho: {existingRating.score}/5
                        </p>
                      </div>
                    </div>
                  )}

                  {!canRate && (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Faqat yakunlangan murojaatlarni baholash mumkin.
                    </div>
                  )}

                  {canRate && (
                    <div className="space-y-5">
                      <div>
                        <Label>Baho</Label>
                        <div className="mt-3 flex gap-2">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const value = index + 1;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setScore(value)}
                                className="rounded-full p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                                aria-label={`${value} yulduz`}
                              >
                                <Star
                                  className={cn(
                                    "h-10 w-10",
                                    value <= score
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground",
                                  )}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {!isTelegramMiniApp && (
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon raqamingiz</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.startsWith("998")) {
                                value = value.slice(3);
                              }
                              if (value.length > 9) {
                                value = value.slice(0, 9);
                              }
                              const formatted = value
                                ? `+998 ${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 7)} ${value.slice(7, 9)}`.trim()
                                : "";
                              setPhone(formatted);
                              setOtpRequested(false);
                              setOtpPhone("");
                              setOtp("");
                            }}
                            placeholder="+998 __ ___ __ __"
                            inputMode="tel"
                          />

                          {otpRequested && (
                            <div className="space-y-2 pt-3">
                              <Label htmlFor="otp">Tasdiqlash kodi</Label>
                              <Input
                                id="otp"
                                value={otp}
                                onChange={(event) =>
                                  setOtp(
                                    event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 6),
                                  )
                                }
                                placeholder="6 xonali kod"
                                inputMode="numeric"
                                maxLength={6}
                              />
                              <p className="text-sm text-muted-foreground">
                                Kod SMS orqali yuborildi. Kodni kiriting va
                                bahoni yuboring.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="comment">Izoh</Label>
                        <Textarea
                          id="comment"
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                          placeholder="Fikringizni yozing"
                          rows={4}
                        />
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Yuborilmoqda..."
                          : !isTelegramMiniApp && !otpRequested
                            ? "SMS kod yuborish"
                            : "Bahoni yuborish"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RateRequest;
