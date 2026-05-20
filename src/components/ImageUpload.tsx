import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  uploadedImages: File[];
  setUploadedImages: (images: File[]) => void;
}

const ImageUpload = ({
  uploadedImages,
  setUploadedImages,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} fayli 5MB dan oshmasligi kerak`);
        return false;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} faqat rasm fayli bo'lishi kerak`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    setUploadedImages([...uploadedImages, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      handleFilesSelect(files);
    }
    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(
      uploadedImages.filter((_, index) => index !== indexToRemove),
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Muammoning rasmlari (ixtiyoriy)
      </label>

      {uploadedImages.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {uploadedImages.map((image, index) => (
              <div key={`${image.name}-${index}`} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Yuklangan rasm ${index + 1}`}
                  className="h-40 w-full rounded-lg border-2 border-border object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Yana rasm qo'shish
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Muammoning rasmlarini yuklang
              </p>
              <p className="text-xs text-muted-foreground">
                Yoki bir nechta faylni bu yerga sudrab oling
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Faylni tanlash
            </Button>
            <p className="text-xs text-muted-foreground">
              Maksimal hajmi: 5MB har bir rasm uchun. Formatlar: JPG, PNG
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
