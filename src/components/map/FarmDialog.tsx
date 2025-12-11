import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FarmFormData>({
    name: '',
    area_hectares: '',
    crop_type: '',
  });

  useEffect(() => {
    if (isOpen) {
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
      // Focus the name input after dialog opens
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [editingFarm, isOpen]);

  const handleSave = () => {
    console.log('handleSave called with:', formData);
    
    if (!formData.name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a farm name',
        variant: 'destructive',
      });
      nameInputRef.current?.focus();
      return;
    }
    
    console.log('Calling onSave with:', formData);
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

        <div className="space-y-4 mt-4">
          {location && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Farm Name <span className="text-destructive">*</span></Label>
            <Input
              ref={nameInputRef}
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter farm name (required)"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop_type">Crop Type</Label>
            <Select
              value={formData.crop_type}
              onValueChange={(value) => setFormData({ ...formData, crop_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select crop type (optional)" />
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
              placeholder="e.g., 50 (optional)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="button"
              disabled={isLoading}
              className="flex-1"
              onClick={handleSave}
            >
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FarmDialog;
