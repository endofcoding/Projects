import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Map as GoogleMap, AdvancedMarker, useMap, useMapsLibrary, MapControl, ControlPosition } from '@vis.gl/react-google-maps';
import { Route, SafetyReport, NavigationState, UserRoute } from '../types';
import { AlertTriangle, Construction, Lightbulb, Users, Info, ShieldCheck, PenTool, Trash2, Check, X, Crosshair, LocateFixed } from 'lucide-react';
import { Button } from './ui/button';

interface MapProps {
  center: [number, number];
  routes: Route[];
  selectedRouteId: string | null;
  reports: SafetyReport[];
  navigation: NavigationState;
  userRoutes: UserRoute[];
  showUserRoutes: boolean;
  isDrawingMode: boolean;
  pendingDrawing: [number, number][] | null;
  drawingType: 'safe' | 'unsafe';
  onDrawingTypeChange: (type: 'safe' | 'unsafe') => void;
  onDrawComplete: (coordinates: [number, number][]) => void;
  onCancelDrawing: () => void;
  onPinLocation?: (lat: number, lng: number) => void;
  droppedPin: { lat: number, lng: number } | null;
  onClearPin?: () => void;
  showTraffic?: boolean;
}

// Helper component to draw polylines
function Polyline({ 
  coordinates, 
  color, 
  weight, 
  opacity, 
  dashed,
  onClick 
}: { 
  key?: string, 
  coordinates: [number, number][], 
  color: string, 
  weight: number, 
  opacity: number, 
  dashed?: boolean,
  onClick?: (e: google.maps.PolyMouseEvent) => void
}) {
  const map = useMap();
  const polyline = useMemo(() => {
    if (typeof google === 'undefined') return null;
    return new google.maps.Polyline({
      path: coordinates.map(([lat, lng]) => ({ lat, lng })),
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: weight,
      clickable: !!onClick,
      icons: dashed ? [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
        offset: '0',
        repeat: '20px'
      }] : [],
    });
  }, [coordinates, color, weight, opacity, dashed, onClick]);

  useEffect(() => {
    if (!map || !polyline) return;
    polyline.setMap(map);
    
    let listener: google.maps.MapsEventListener | null = null;
    if (onClick) {
      listener = polyline.addListener('click', onClick);
    }
    
    return () => {
      polyline.setMap(null);
      if (listener) google.maps.event.removeListener(listener);
    };
  }, [map, polyline, onClick]);

  return null;
}

// Directions Renderer
function Directions({ routes, selectedRouteId }: { routes: Route[], selectedRouteId: string | null }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map, suppressMarkers: true }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !selectedRouteId) {
      directionsRenderer?.setDirections({ routes: [] } as any);
      return;
    }

    const selectedRoute = routes.find(r => r.id === selectedRouteId);
    if (!selectedRoute) return;

    // Use the DirectionsService to get real routes if possible, 
    // or just render the coordinates we have.
    // Since we are using mock routes with coordinates, we can create a DirectionsResult manually
    // or just use a Polyline. The DirectionsRenderer is usually for the service output.
    // Let's try to use the service if we have origin/destination strings.
    
    // For now, since our Route type has coordinates, we'll stick to Polylines 
    // in the main Map component for better control over styling (safety colors).
    // But we'll keep the DirectionsRenderer ready for future real API integration.
    directionsRenderer.setDirections({ routes: [] } as any); 
  }, [directionsService, directionsRenderer, selectedRouteId, routes]);

  return null;
}

// Helper to handle map clicks for drawing
function MapClickListener({ isDrawingMode, onPointAdd, onPinLocation }: { isDrawingMode: boolean, onPointAdd: (lat: number, lng: number) => void, onPinLocation?: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        if (isDrawingMode) {
          onPointAdd(e.latLng.lat(), e.latLng.lng());
        } else if (onPinLocation) {
          onPinLocation(e.latLng.lat(), e.latLng.lng());
        }
      }
    });
    
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, isDrawingMode, onPointAdd, onPinLocation]);
  
  return null;
}

// Helper to handle map view changes
function MapController({ center, navigation }: { center: [number, number], navigation: NavigationState }) {
  const map = useMap();
  const hasPannedToCenter = useRef(false);

  useEffect(() => {
    if (!map) return;
    
    if (navigation.isActive) {
      map.panTo({ lat: navigation.currentPosition[0], lng: navigation.currentPosition[1] });
      map.setZoom(16);
      hasPannedToCenter.current = false; // Reset so it can pan back after navigation
    } else if (!hasPannedToCenter.current) {
      map.panTo({ lat: center[0], lng: center[1] });
      map.setZoom(14);
      hasPannedToCenter.current = true;
    }
  }, [map, center, navigation.isActive, navigation.currentPosition]);
  return null;
}

export default function Map({ 
  center, 
  routes, 
  selectedRouteId, 
  reports, 
  navigation, 
  userRoutes,
  showUserRoutes,
  isDrawingMode,
  pendingDrawing,
  drawingType,
  onDrawingTypeChange,
  onDrawComplete,
  onCancelDrawing,
  onPinLocation,
  droppedPin,
  onClearPin,
  showTraffic
}: MapProps) {
  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const mapId = process.env.GOOGLE_MAPS_MAP_ID || "24a7efa86a68ba0a11b40c2a";
  const [tempPoints, setTempPoints] = useState<[number, number][]>([]);
  const [selectedUserRoute, setSelectedUserRoute] = useState<UserRoute | null>(null);
  const [infoWindowPos, setInfoWindowPos] = useState<google.maps.LatLng | null>(null);
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);
  const map = useMap();

  const handleLocateMe = useCallback(() => {
    if (!map) return;
    map.panTo({ lat: center[0], lng: center[1] });
    map.setZoom(16);
  }, [map, center]);

  useEffect(() => {
    if (!map) return;
    if (showTraffic) {
      const layer = new google.maps.TrafficLayer();
      layer.setMap(map);
      setTrafficLayer(layer);
    } else {
      trafficLayer?.setMap(null);
      setTrafficLayer(null);
    }
  }, [map, showTraffic]);

  const undoLastPoint = () => {
    setTempPoints(prev => prev.slice(0, -1));
  };

  const finishDrawing = () => {
    if (tempPoints.length > 1) {
      onDrawComplete(tempPoints);
    }
    setTempPoints([]);
  };

  const cancelDrawing = () => {
    setTempPoints([]);
    onCancelDrawing();
  };

  return (
    <GoogleMap
      mapId={mapId}
      defaultCenter={{ lat: center[0], lng: center[1] }}
      defaultZoom={13}
      disableDefaultUI={true}
      className="w-full h-full"
      draggableCursor={isDrawingMode ? 'crosshair' : 'grab'}
    >
      <MapController center={center} navigation={navigation} />
      <MapClickListener 
        isDrawingMode={isDrawingMode} 
        onPointAdd={(lat, lng) => setTempPoints(prev => [...prev, [lat, lng]])} 
        onPinLocation={onPinLocation}
      />
      
      {/* Dropped Pin */}
      {droppedPin && (
        <AdvancedMarker 
          position={droppedPin}
          onClick={() => onClearPin?.()}
        >
          <div className="relative flex flex-col items-center group">
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 mb-2 animate-in fade-in zoom-in duration-200">
              <span className="text-[10px] font-black uppercase tracking-widest">Dropped Pin</span>
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-2 rounded-full" onClick={(e) => { e.stopPropagation(); onClearPin?.(); }}>
                <X className="w-2 h-2" />
              </Button>
            </div>
            <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-xl" />
          </div>
        </AdvancedMarker>
      )}

      {/* Drawing Mode Overlay Tint */}
      {isDrawingMode && (
        <div className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-500 ${drawingType === 'safe' ? 'bg-green-500/5' : 'bg-red-500/5'}`} />
      )}
      
      {/* Drawing UI */}
      {isDrawingMode && (
        <>
          <MapControl position={ControlPosition.TOP_CENTER}>
            <div className="mt-24 flex flex-col items-center gap-3 animate-in slide-in-from-top duration-500">
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-2xl border-2 border-slate-200 dark:border-slate-800">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                  <Button 
                    size="sm" 
                    variant={drawingType === 'safe' ? 'default' : 'ghost'}
                    className={`rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-tighter transition-all ${drawingType === 'safe' ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20' : ''}`}
                    onClick={() => onDrawingTypeChange('safe')}
                  >
                    <ShieldCheck className="w-3 h-3 mr-1.5" /> Safe
                  </Button>
                  <Button 
                    size="sm" 
                    variant={drawingType === 'unsafe' ? 'default' : 'ghost'}
                    className={`rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-tighter transition-all ${drawingType === 'unsafe' ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20' : ''}`}
                    onClick={() => onDrawingTypeChange('unsafe')}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1.5" /> Unsafe
                  </Button>
                </div>
                
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">
                    {tempPoints.length} PTS
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="rounded-full h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800" 
                    onClick={undoLastPoint}
                    disabled={tempPoints.length === 0}
                    title="Undo last point"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="default" className="rounded-full h-9 px-6 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" onClick={finishDrawing} disabled={tempPoints.length < 2}>
                    <Check className="w-3.5 h-3.5 mr-1.5" /> Finish
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full h-9 px-4 font-black uppercase text-[10px] tracking-widest border-2" onClick={cancelDrawing}>
                    <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
                  </Button>
                </div>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-2xl border border-white/10">
                {tempPoints.length < 2 
                  ? `Add ${2 - tempPoints.length} more point${tempPoints.length === 1 ? '' : 's'} to mark ${drawingType} route`
                  : `Ready to save ${drawingType} route`
                }
              </div>
            </div>
          </MapControl>
        </>
      )}

      {/* Temporary Drawing Line */}
      {(tempPoints.length > 0 || pendingDrawing) && (
        <Polyline 
          coordinates={tempPoints.length > 0 ? tempPoints : (pendingDrawing || [])} 
          color={drawingType === 'safe' ? '#22c55e' : '#ef4444'} 
          weight={4} 
          opacity={0.8} 
          dashed={tempPoints.length > 0} 
        />
      )}

      {/* User Routes */}
      {showUserRoutes && userRoutes.map(ur => (
        <Polyline 
          key={ur.id}
          coordinates={ur.coordinates}
          color={ur.type === 'safe' ? '#22c55e' : '#ef4444'}
          weight={6}
          opacity={0.6}
          onClick={(e) => {
            setSelectedUserRoute(ur);
            setInfoWindowPos(e.latLng);
          }}
        />
      ))}

      {/* User Route Info Window */}
      {selectedUserRoute && infoWindowPos && (
        <AdvancedMarker 
          position={infoWindowPos}
        >
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 min-w-[200px] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedUserRoute.type === 'safe' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                  {selectedUserRoute.type} Route
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setSelectedUserRoute(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {selectedUserRoute.comments && (
              <p className="text-sm font-bold mb-3 leading-tight">{selectedUserRoute.comments}</p>
            )}
            
            <div className="flex gap-2">
              {selectedUserRoute.intensity && (
                <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] font-bold block opacity-50 uppercase">Level</span>
                  <span className="text-xs font-black">{selectedUserRoute.intensity}/5</span>
                </div>
              )}
              {selectedUserRoute.timeOfDay && (
                <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] font-bold block opacity-50 uppercase">Best Time</span>
                  <span className="text-xs font-black capitalize">{selectedUserRoute.timeOfDay}</span>
                </div>
              )}
            </div>
          </div>
        </AdvancedMarker>
      )}

      {/* Reports */}
      {reports.map(report => (
        <AdvancedMarker
          key={report.id}
          position={{ lat: report.lat, lng: report.lng }}
        >
          <div className={`p-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center ${report.type === 'safe-haven' ? 'bg-green-500' : 'bg-white'}`}>
            {report.type === 'lighting' && <Lightbulb className="w-4 h-4 text-amber-500" />}
            {report.type === 'construction' && <Construction className="w-4 h-4 text-orange-500" />}
            {report.type === 'crowded' && <Users className="w-4 h-4 text-blue-500" />}
            {report.type === 'isolated' && <Info className="w-4 h-4 text-slate-500" />}
            {report.type === 'other' && <AlertTriangle className="w-4 h-4 text-red-500" />}
            {report.type === 'safe-haven' && <ShieldCheck className="w-4 h-4 text-white" />}
          </div>
        </AdvancedMarker>
      ))}

      {/* Routes */}
      {routes.map(route => (
        <Polyline
          key={route.id}
          coordinates={route.coordinates}
          color={route.id === selectedRouteId ? '#3b82f6' : '#94a3b8'}
          weight={route.id === selectedRouteId ? 6 : 4}
          opacity={route.id === selectedRouteId ? 1 : 0.4}
        />
      ))}

      {/* Navigation Marker */}
      {navigation.isActive && (
        <AdvancedMarker position={{ lat: navigation.currentPosition[0], lng: navigation.currentPosition[1] }}>
          <div className="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-xl animate-pulse" />
        </AdvancedMarker>
      )}

      {/* Locate Me Button Overlay */}
      <MapControl position={ControlPosition.RIGHT_BOTTOM}>
        <div className="mr-4 mb-24 flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full bg-primary text-white shadow-2xl h-14 w-14 border-4 border-white dark:border-slate-800 hover:scale-110 transition-transform active:scale-95"
            onClick={handleLocateMe}
            title="Navigate to my location"
          >
            <LocateFixed className="w-6 h-6" />
          </Button>
        </div>
      </MapControl>

      {selectedRoute && !navigation.isActive && (
        <>
          <AdvancedMarker position={{ lat: selectedRoute.coordinates[0][0], lng: selectedRoute.coordinates[0][1] }}>
            <div className="bg-white px-2 py-1 rounded-md shadow-sm text-[10px] font-bold border">START</div>
          </AdvancedMarker>
          <AdvancedMarker position={{ lat: selectedRoute.coordinates[selectedRoute.coordinates.length - 1][0], lng: selectedRoute.coordinates[selectedRoute.coordinates.length - 1][1] }}>
            <div className="bg-primary text-white px-2 py-1 rounded-md shadow-sm text-[10px] font-bold">END</div>
          </AdvancedMarker>
        </>
      )}
    </GoogleMap>
  );
}
