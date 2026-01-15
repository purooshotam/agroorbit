import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Crosshair, Loader2, Layers, Map as MapIcon, Satellite } from 'lucide-react';
import FarmDialog from './FarmDialog';
import FarmPopup from './FarmPopup';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export type Farm = {
  id: string;
  name: string;
  location_lat: number;
  location_lng: number;
  area_hectares: number | null;
  crop_type: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type FarmFormData = {
  name: string;
  area_hectares: string;
  crop_type: string;
};

const FarmMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const userLocationMarker = useRef<L.Marker | null>(null);
  const streetLayer = useRef<L.TileLayer | null>(null);
  const satelliteLayer = useRef<L.TileLayer | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);

  // Fetch farms
  const fetchFarms = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching farms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load farms',
        variant: 'destructive',
      });
      return;
    }
    
    setFarms(data || []);
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView([20, 0], 2);

    // Street layer (default)
    streetLayer.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Satellite layer (Esri World Imagery)
    satelliteLayer.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19,
    });

    markersLayer.current = L.layerGroup().addTo(map.current);

    // Click to add farm
    map.current.on('click', (e: L.LeafletMouseEvent) => {
      setSelectedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      setEditingFarm(null);
      setIsDialogOpen(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
      streetLayer.current = null;
      satelliteLayer.current = null;
    };
  }, []);

  // Toggle satellite view
  const toggleSatelliteView = () => {
    if (!map.current || !streetLayer.current || !satelliteLayer.current) return;

    if (isSatelliteView) {
      map.current.removeLayer(satelliteLayer.current);
      map.current.addLayer(streetLayer.current);
    } else {
      map.current.removeLayer(streetLayer.current);
      map.current.addLayer(satelliteLayer.current);
    }
    setIsSatelliteView(!isSatelliteView);
  };

  // Load farms
  useEffect(() => {
    if (user) {
      fetchFarms();
    }
  }, [user]);

  // Get user's current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Got location:', latitude, longitude);

        // Update user location marker
        if (userLocationMarker.current) {
          userLocationMarker.current.setLatLng([latitude, longitude]);
        } else if (map.current) {
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div style="
              width: 20px;
              height: 20px;
              background: #3b82f6;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          userLocationMarker.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map.current)
            .bindPopup('Your location');
        }

        // Center map on user location
        map.current?.setView([latitude, longitude], 15);

        // Set selected location and open dialog to add farm
        setSelectedLocation({ lat: latitude, lng: longitude });
        setEditingFarm(null);
        setIsDialogOpen(true);

        setIsLocating(false);
        toast({
          title: 'Location Found',
          description: 'Add a farm at your current location',
        });
      },
      (error) => {
        setIsLocating(false);
        console.error('Geolocation error:', error);
        
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        toast({
          title: 'Location Error',
          description: errorMessage,
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Update markers when farms change
  useEffect(() => {
    if (!markersLayer.current) return;
    
    markersLayer.current.clearLayers();

    farms.forEach((farm) => {
      const marker = L.marker([farm.location_lat, farm.location_lng]);
      
      // Create popup content using DOM methods to prevent XSS
      const popupContent = document.createElement('div');
      
      const wrapper = document.createElement('div');
      wrapper.className = 'p-2 min-w-[200px]';
      
      const title = document.createElement('h3');
      title.className = 'font-bold text-lg mb-1';
      title.textContent = farm.name; // Safe - uses textContent which escapes HTML
      wrapper.appendChild(title);
      
      if (farm.crop_type) {
        const cropP = document.createElement('p');
        cropP.className = 'text-sm text-gray-600';
        cropP.textContent = `Crop: ${farm.crop_type}`;
        wrapper.appendChild(cropP);
      }
      
      if (farm.area_hectares) {
        const areaP = document.createElement('p');
        areaP.className = 'text-sm text-gray-600';
        areaP.textContent = `Area: ${farm.area_hectares} ha`;
        wrapper.appendChild(areaP);
      }
      
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex gap-2 mt-3';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600';
      editBtn.textContent = 'Edit';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600';
      deleteBtn.textContent = 'Delete';
      
      buttonContainer.appendChild(editBtn);
      buttonContainer.appendChild(deleteBtn);
      wrapper.appendChild(buttonContainer);
      popupContent.appendChild(wrapper);

      popupContent.querySelector('.edit-btn')?.addEventListener('click', () => {
        setEditingFarm(farm);
        setSelectedLocation({ lat: farm.location_lat, lng: farm.location_lng });
        setIsDialogOpen(true);
        marker.closePopup();
      });

      popupContent.querySelector('.delete-btn')?.addEventListener('click', () => {
        handleDeleteFarm(farm.id);
        marker.closePopup();
      });

      marker.bindPopup(popupContent);
      markersLayer.current?.addLayer(marker);
    });

    // Fit bounds if farms exist
    if (farms.length > 0 && map.current) {
      const bounds = L.latLngBounds(farms.map(f => [f.location_lat, f.location_lng]));
      map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [farms]);

  const generateNDVIReading = async (farmId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-ndvi', {
        body: { farm_id: farmId },
      });

      if (error) {
        console.error('Error generating NDVI:', error);
        return;
      }

      console.log('NDVI generated:', data);
      toast({
        title: 'NDVI Analysis Complete',
        description: `Health status: ${data.reading?.health_status} (NDVI: ${data.reading?.ndvi_value})`,
      });
    } catch (error) {
      console.error('Error calling generate-ndvi:', error);
    }
  };

  const handleSaveFarm = async (formData: FarmFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add a farm',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedLocation) {
      toast({
        title: 'Error',
        description: 'No location selected',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const farmData = {
      name: formData.name.trim(),
      location_lat: selectedLocation.lat,
      location_lng: selectedLocation.lng,
      area_hectares: formData.area_hectares ? parseFloat(formData.area_hectares) : null,
      crop_type: formData.crop_type || null,
      user_id: user.id,
    };

    try {
      if (editingFarm) {
        const { error } = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', editingFarm.id);

        if (error) throw error;

        toast({
          title: 'Farm Updated',
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        const { data: newFarm, error } = await supabase
          .from('farms')
          .insert(farmData)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Farm Added',
          description: `${formData.name} has been added. Generating NDVI analysis...`,
        });

        // Auto-generate NDVI reading for new farm
        if (newFarm) {
          generateNDVIReading(newFarm.id);
        }
      }

      setIsDialogOpen(false);
      setSelectedLocation(null);
      setEditingFarm(null);
      fetchFarms();
    } catch (error) {
      console.error('Error saving farm:', error);
      toast({
        title: 'Error',
        description: 'Failed to save farm',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!confirm('Are you sure you want to delete this farm?')) return;

    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);

      if (error) throw error;

      toast({
        title: 'Farm Deleted',
        description: 'Farm has been removed',
      });

      fetchFarms();
    } catch (error) {
      console.error('Error deleting farm:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete farm',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
        <h3 className="font-semibold text-foreground mb-1">Your Farms</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {farms.length === 0 
            ? 'Click on the map to add a farm'
            : `${farms.length} farm${farms.length === 1 ? '' : 's'} registered`
          }
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={handleGetLocation} 
            disabled={isLocating}
            size="sm"
            className="flex-1"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Crosshair className="w-4 h-4 mr-1" />
                Location
              </>
            )}
          </Button>
          <Button 
            onClick={toggleSatelliteView}
            size="sm"
            variant={isSatelliteView ? "default" : "outline"}
          >
            {isSatelliteView ? (
              <>
                <MapIcon className="w-4 h-4 mr-1" />
                Map
              </>
            ) : (
              <>
                <Satellite className="w-4 h-4 mr-1" />
                Satellite
              </>
            )}
          </Button>
        </div>
      </div>

      <FarmDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedLocation(null);
          setEditingFarm(null);
        }}
        onSave={handleSaveFarm}
        editingFarm={editingFarm}
        isLoading={isLoading}
        location={selectedLocation}
      />
    </div>
  );
};

export default FarmMap;
