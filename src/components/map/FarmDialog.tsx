import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';
import type { Farm } from './FarmMap';

type FarmFormData = {
  name: string;
  area_hectares: string;
  crop_type: string;
};

type FarmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FarmFormData) => void;
  editingFarm: Farm | null;
  isLoading: boolean;
  location: { lat: number; lng: number } | null;
};

const CROP_TYPES = [
  'Wheat',
  'Corn',
  'Rice',
  'Soybeans',
  'Cotton',
  'Barley',
  'Oats',
  'Sugarcane',
  'Vegetables',
  'Fruits',
  'Other',
];

const FarmDialog = ({ isOpen, onClose, onSave, editingFarm, isLoading, location }: FarmDialogProps) => {
  const [formData, setFormData] = useState<FarmFormData>({
    name: '',
    area_hectares: '',
    crop_type: '',
  });

  useEffect(() => {
    if (editingFarm) {
      setFormData({
        name: editingFarm.name,
        area_hectares: editingFarm.area_hectares?.toString() || '',
        crop_type: editingFarm.crop_type || '',
      });
    } else {
      setFormData({
        name: '',
        area_hectares: '',
        crop_type: '',
      });
    }
  }, [editingFarm, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Form submitted with data:', formData);
    if (!formData.name.trim()) {
      console.log('Name is empty, not submitting');
      return;
    }
    console.log('Calling onSave...');
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingFarm ? 'Edit Farm' : 'Add New Farm'}</DialogTitle>
          <DialogDescription>
            {editingFarm 
              ? 'Update your farm details below'
              : 'Enter the details for your new farm location'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {location && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Farm Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., North Field"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop_type">Crop Type</Label>
            <Select
              value={formData.crop_type}
              onValueChange={(value) => setFormData({ ...formData, crop_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select crop type" />
              </SelectTrigger>
              <SelectContent>
                {CROP_TYPES.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area (hectares)</Label>
            <Input
              id="area"
              type="number"
              step="0.01"
              min="0"
              value={formData.area_hectares}
              onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
              placeholder="e.g., 50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingFarm ? 'Update Farm' : 'Add Farm'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FarmDialog;
