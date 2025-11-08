import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Prestation } from "@shared/schema";

export default function AdminPrestations() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrestation, setEditingPrestation] = useState<Prestation | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    horaireDebut: "",
    horaireFin: "",
    prix: 0,
    unite: "",
    actif: true,
  });

  // Fetch prestations
  const { data: prestations = [], isLoading } = useQuery<Prestation[]>({
    queryKey: ["/api/prestations"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/prestations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prestations"] });
      toast({ title: "Prestation créée avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création", variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<typeof formData> }) =>
      apiRequest("PATCH", `/api/prestations/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prestations"] });
      toast({ title: "Prestation modifiée avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la modification", variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/prestations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prestations"] });
      toast({ title: "Prestation supprimée avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  const openCreateDialog = () => {
    setEditingPrestation(null);
    setFormData({
      nom: "",
      description: "",
      horaireDebut: "",
      horaireFin: "",
      prix: 0,
      unite: "",
      actif: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (prestation: Prestation) => {
    setEditingPrestation(prestation);
    setFormData({
      nom: prestation.nom,
      description: prestation.description || "",
      horaireDebut: prestation.horaireDebut || "",
      horaireFin: prestation.horaireFin || "",
      prix: prestation.prix,
      unite: prestation.unite,
      actif: prestation.actif ?? true,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPrestation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPrestation) {
      updateMutation.mutate({
        id: editingPrestation.id,
        updates: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette prestation ?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(145,25%,97%)] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-semibold font-['Poppins']">
                Gestion des Prestations
              </h1>
            </div>
            <Button
              onClick={openCreateDialog}
              className="bg-white text-[hsl(145,63%,49%)] hover:bg-white/90"
              data-testid="button-add-prestation"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : prestations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune prestation trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Nom</TableHead>
                  <TableHead className="font-semibold text-gray-700 hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 hidden md:table-cell">
                    Horaires
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">Prix</TableHead>
                  <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">
                    Statut
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prestations.map((prestation) => (
                  <TableRow
                    key={prestation.id}
                    className="hover:bg-[hsl(145,63%,95%)]"
                    data-testid={`row-prestation-${prestation.id}`}
                  >
                    <TableCell className="font-medium" data-testid={`text-nom-${prestation.id}`}>
                      {prestation.nom}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {prestation.description}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {prestation.horaireDebut && prestation.horaireFin
                        ? `${prestation.horaireDebut} - ${prestation.horaireFin}`
                        : "-"}
                    </TableCell>
                    <TableCell data-testid={`text-prix-${prestation.id}`}>
                      {prestation.prix > 0 ? `${prestation.prix} ${prestation.unite}` : prestation.unite}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          prestation.actif
                            ? "bg-[hsl(145,63%,95%)] text-[hsl(145,63%,30%)]"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        data-testid={`status-${prestation.id}`}
                      >
                        {prestation.actif ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(prestation)}
                          className="hover:bg-gray-100"
                          data-testid={`button-edit-${prestation.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(prestation.id)}
                          className="hover:bg-red-100 text-red-600"
                          data-testid={`button-delete-${prestation.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold font-['Poppins']">
              {editingPrestation ? "Modifier la prestation" : "Ajouter une prestation"}
            </DialogTitle>
            <DialogDescription>
              {editingPrestation
                ? "Modifiez les informations de la prestation"
                : "Créez une nouvelle prestation de service"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la prestation *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                  data-testid="input-nom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  data-testid="input-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaireDebut">Horaire début</Label>
                  <Input
                    id="horaireDebut"
                    type="time"
                    value={formData.horaireDebut}
                    onChange={(e) =>
                      setFormData({ ...formData, horaireDebut: e.target.value })
                    }
                    data-testid="input-horaire-debut"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaireFin">Horaire fin</Label>
                  <Input
                    id="horaireFin"
                    type="time"
                    value={formData.horaireFin}
                    onChange={(e) =>
                      setFormData({ ...formData, horaireFin: e.target.value })
                    }
                    data-testid="input-horaire-fin"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prix">Prix</Label>
                  <Input
                    id="prix"
                    type="number"
                    value={formData.prix}
                    onChange={(e) =>
                      setFormData({ ...formData, prix: parseFloat(e.target.value) })
                    }
                    min="0"
                    data-testid="input-prix"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unite">Unité *</Label>
                  <Input
                    id="unite"
                    value={formData.unite}
                    onChange={(e) =>
                      setFormData({ ...formData, unite: e.target.value })
                    }
                    placeholder="ex: FCFA/mois, FCFA/jour"
                    required
                    data-testid="input-unite"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="actif"
                  checked={formData.actif}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, actif: checked })
                  }
                  data-testid="switch-actif"
                />
                <Label htmlFor="actif" className="cursor-pointer">
                  Prestation active
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                data-testid="button-cancel"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[hsl(145,63%,49%)] hover:bg-[hsl(145,63%,42%)]"
                data-testid="button-submit"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Enregistrement..."
                  : editingPrestation
                  ? "Modifier"
                  : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
