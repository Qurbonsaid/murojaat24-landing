import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MapPin, Loader2, Check, ChevronsUpDown } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import SuccessModal from "@/components/SuccessModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { useCreateCitizenRequest, useRequestOtp } from "@/lib/api/requests";
import { uploadImages } from "@/lib/api/uploads";
import { fetchOrganizations, Organization } from "../lib/api/organizations";
import { isTMA, retrieveLaunchParams } from "@tma.js/sdk-react";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

const formSchema = z.object({
  citizenName: z
    .string()
    .min(2, { message: "Ism-familiyani kiriting" })
    .max(120, { message: "Ism-familiya juda uzun" }),
  organization: z.string().min(1, { message: "Tashkilotni tanlang" }),
  description: z
    .string()
    .min(20, { message: "Tavsif kamida 20 ta belgidan iborat bo'lishi kerak" })
    .max(1000, {
      message: "Tavsif maksimal 1000 ta belgidan iborat bo'lishi kerak",
    }),
  address: z.string().min(5, { message: "Aniq manzilni kiriting" }),
  coordinates: z.any().nullable(),
  phone: z.string().regex(/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, {
    message: "Telefon raqamini to'g'ri formatda kiriting",
  }),
  otp: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const SubmitRequest = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [openOrg, setOpenOrg] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const requestOtpMutation = useRequestOtp();
  const createRequestMutation = useCreateCitizenRequest();

  const isSubmitting =
    requestOtpMutation.isPending || createRequestMutation.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      citizenName: "",
      organization: "",
      description: "",
      address: "",
      coordinates: null,
      phone: "",
      otp: "",
      additionalInfo: "",
    },
  });

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const normalized = digits.startsWith("998") ? digits.slice(3) : digits;
    return normalized ? `+998${normalized}` : "";
  };

  const onSubmit = async (data: FormData) => {
    const normalizedPhone = normalizePhone(data.phone);

    // Upload images and get public URLs
    let imageUrls: string[] = [];
    if (uploadedImages.length > 0) {
      try {
        const uploadedUrls = await uploadImages(uploadedImages);
        imageUrls = uploadedUrls.map((url) => `${API_BASE_URL}/uploads${url}`);
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Rasmlari yuklashda xatolik";
        toast.error(message);
        return;
      }
    }

    // If opened from Telegram Mini App, skip SMS verification and attach telegramId
    if (isTMA()) {
      const telegramUser = retrieveLaunchParams().tgWebAppData.user;
      try {
        const detailLines = [];

        if (data.additionalInfo) {
          detailLines.push(`Qo'shimcha ma'lumot: ${data.additionalInfo}`);
        }

        detailLines.push(`Tashkilot: ${data.organization}`);

        const fullDescription = detailLines.length
          ? `${data.description}\n\n${detailLines.join("\n")}`
          : data.description;

        const response = await createRequestMutation.mutateAsync({
          citizenName: data.citizenName,
          citizenPhone: normalizedPhone || undefined,
          telegramId: telegramUser.id,
          organization: data.organization,
          description: fullDescription,
          address: { full: data.address, coordinates: data.coordinates },
          images: imageUrls,
        });

        setTrackingNumber(response.requestNumber);
        setShowSuccess(true);
        setOtpRequested(false);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Murojaat yuborilmadi";
        toast.error(message);
      }

      return;
    }

    if (!normalizedPhone) {
      toast.error("Telefon raqamni to'g'ri kiriting");
      return;
    }

    if (!otpRequested) {
      try {
        await requestOtpMutation.mutateAsync(normalizedPhone);
        setOtpRequested(true);
        toast.success("Tasdiqlash kodi yuborildi");
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Kod yuborishda xatolik";
        toast.error(message);
      }
      return;
    }

    if (!data.otp) {
      form.setError("otp", {
        message: "Tasdiqlash kodi kiritilishi shart",
      });
      return;
    }

    try {
      const detailLines = [];

      if (data.additionalInfo) {
        detailLines.push(`Qo'shimcha ma'lumot: ${data.additionalInfo}`);
      }

      detailLines.push(`Tashkilot: ${data.organization}`);

      const fullDescription = detailLines.length
        ? `${data.description}\n\n${detailLines.join("\n")}`
        : data.description;

      const response = await createRequestMutation.mutateAsync({
        citizenName: data.citizenName,
        citizenPhone: normalizedPhone,
        otp: data.otp,
        organization: data.organization,
        description: fullDescription,
        address: { full: data.address, coordinates: data.coordinates },
        images: imageUrls,
      });

      setTrackingNumber(response.requestNumber);
      setShowSuccess(true);
      setOtpRequested(false);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Murojaat yuborilmadi";
      toast.error(message);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would use reverse geocoding here
          form.setValue("coordinates", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    form.reset();
    setUploadedImages([]);
    setDescriptionLength(0);
    setOtpRequested(false);
  };

  const selectedOrganization =
    organizations.find(
      (organization) => organization._id === form.watch("organization"),
    ) ?? null;

  useEffect(() => {
    const loadOrganizations = async () => {
      const orgs = await fetchOrganizations();
      setOrganizations(orgs);
    };

    loadOrganizations();
  }, []);

  // Prefill citizen name from Telegram user data if available
  useEffect(() => {
    if (!isTMA()) return;
    const telegramUser = retrieveLaunchParams().tgWebAppData.user;
    if (telegramUser) {
      form.setValue(
        "citizenName",
        `${telegramUser.first_name}${telegramUser.last_name ? ` ${telegramUser.last_name}` : ""}`.trim(),
      );
    }
  }, [form]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Yangi Murojaat Yuborish
              </h1>
              <p className="text-muted-foreground">
                Muammoning tafsilotlarini kiriting
              </p>
            </div>

            <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Image Upload */}
                  <ImageUpload
                    uploadedImages={uploadedImages}
                    setUploadedImages={setUploadedImages}
                  />

                  {/* Citizen Name */}
                  <FormField
                    control={form.control}
                    name="citizenName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ism-familiya *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masalan: Aliyev Ali" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Department Selection */}
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tashkilotni tanlang *</FormLabel>
                        <Popover open={openOrg} onOpenChange={setOpenOrg}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {selectedOrganization?.name ||
                                  "Tashkilotni tanlang"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Qidirish..." />
                              <CommandEmpty>Tashkilot topilmadi.</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {organizations?.map((organization) => (
                                  <CommandItem
                                    key={organization._id}
                                    value={organization._id}
                                    onSelect={() => {
                                      form.setValue(
                                        "organization",
                                        organization._id,
                                      );
                                      setOpenOrg(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        organization._id === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {organization.name}
                                  </CommandItem>
                                )) || []}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Muammo tavsifi *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Muammoni batafsil tasvirlab bering..."
                            className="resize-none"
                            rows={4}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setDescriptionLength(e.target.value.length);
                            }}
                          />
                        </FormControl>
                        <div className="flex justify-between items-center">
                          <FormMessage />
                          <span className="text-sm text-muted-foreground">
                            {descriptionLength} / 1000
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aniq manzil *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Masalan: Yunusobod tumani, Abdulla Qodiriy ko'chasi, 12-uy"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGetLocation}
                            className="shrink-0"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon raqami *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+998 90 123 45 67"
                            {...field}
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
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {otpRequested && !isTMA() && (
                    <FormField
                      control={form.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tasdiqlash kodi *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123456"
                              inputMode="numeric"
                              maxLength={6}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Telefoningizga yuborilgan kodni kiriting
                          </p>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Additional Info */}
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qo'shimcha ma'lumot (ixtiyoriy)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Agar qo'shimcha tafsilotlar bo'lsa, yozing..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        form.reset();
                        setUploadedImages([]);
                        setDescriptionLength(0);
                        setOtpRequested(false);
                      }}
                      disabled={isSubmitting}
                    >
                      Bekor qilish
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Yuklanmoqda...
                        </>
                      ) : isTMA() ? (
                        "Murojaatni yuborish"
                      ) : otpRequested ? (
                        "Murojaatni yuborish"
                      ) : (
                        "Kod yuborish"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <SuccessModal
        open={showSuccess}
        onClose={handleSuccessClose}
        trackingNumber={trackingNumber}
      />
    </div>
  );
};

export default SubmitRequest;
