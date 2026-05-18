import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface RequestDetails {
  id: string;
  organization: { name: string; governance: string };
  address: string;
  phone?: string | null;
  submittedDate: string;
  status: string;
  statusLabel?: string;
}

interface RequestDetailsCardProps {
  request: RequestDetails;
}

const RequestDetailsCard = ({ request }: RequestDetailsCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-primary text-primary-foreground";
      case "assigned":
        return "bg-blue-500 text-white";
      case "in-progress":
        return "bg-warning text-warning-foreground";
      case "completed":
      case "verified":
        return "bg-secondary text-secondary-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-2 sticky top-20">
      <CardHeader>
        <CardTitle>Murojaat ma'lumotlari</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Murojaat raqami
            </p>
            <p className="font-semibold text-primary">{request.id}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Murojaat yuborilgan tashkilot
            </p>
            <p className="font-medium">{request.organization.name}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Manzil</p>
            <p className="font-medium text-sm">{request.address}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Telefon</p>
            <p className="font-medium">{request.phone || "-"}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Yuborilgan vaqt
            </p>
            <p className="font-medium">{request.submittedDate}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Holati</p>
            <Badge className={getStatusColor(request.status)}>
              {request.statusLabel || request.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestDetailsCard;
