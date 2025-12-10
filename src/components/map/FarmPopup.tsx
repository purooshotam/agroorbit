// This component is for reference - the popup is rendered directly in FarmMap
// because Leaflet requires DOM manipulation for popups

import type { Farm } from './FarmMap';

type FarmPopupProps = {
  farm: Farm;
  onEdit: (farm: Farm) => void;
  onDelete: (farmId: string) => void;
};

const FarmPopup = ({ farm, onEdit, onDelete }: FarmPopupProps) => {
  return (
    <div className="p-2 min-w-[200px]">
      <h3 className="font-bold text-lg mb-1">{farm.name}</h3>
      {farm.crop_type && (
        <p className="text-sm text-muted-foreground">Crop: {farm.crop_type}</p>
      )}
      {farm.area_hectares && (
        <p className="text-sm text-muted-foreground">Area: {farm.area_hectares} ha</p>
      )}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onEdit(farm)}
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(farm.id)}
          className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default FarmPopup;
