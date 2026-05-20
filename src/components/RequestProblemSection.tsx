import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RequestProblemSectionProps {
  description: string;
  images?: string[] | null;
}

const RequestProblemSection = ({
  description,
  images,
}: RequestProblemSectionProps) => {
  return (
    <Card
      className="border-2 animate-fade-in"
      style={{ animationDelay: "0.4s" }}
    >
      <CardHeader>
        <CardTitle>Dastlabki muammo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {images && images.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">
              Rasmlari ({images.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="rounded-lg overflow-hidden shadow-md"
                >
                  <img
                    src={image}
                    alt={`Muammo rasmi ${index + 1}`}
                    className="w-full h-auto object-cover max-h-64"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Tavsif</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestProblemSection;
