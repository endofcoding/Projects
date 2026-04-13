/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Map from './components/Map';
import PlaceAutocomplete from './components/PlaceAutocomplete';
import SafetyAnalysis from './components/SafetyAnalysis';
import { getMockRoutes } from './services/safetyService';
import { Route, Location, SafetyReport, NavigationState, UserRoute } from './types';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Search, Navigation, Shield, Menu, Loader2, MapPin, ChevronRight, Info, Crosshair, Moon, Sun, AlertTriangle, Plus, PenTool, Trash2, X, Check, TrafficCone, LocateFixed } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { auth, db, OperationType, handleFirestoreError, signInWithGoogle } from './lib/firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc, query, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Auth from './components/Auth';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user] = useAuthState(auth);
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location>({ lat: 51.505, lng: -0.09 });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingType, setDrawingType] = useState<'safe' | 'unsafe'>('safe');
  const [userRoutes, setUserRoutes] = useState<UserRoute[]>([]);
  const [showUserRoutes, setShowUserRoutes] = useState(true);
  const [pendingDrawing, setPendingDrawing] = useState<[number, number][] | null>(null);
  const [drawingComments, setDrawingComments] = useState('');
  const [drawingIntensity, setDrawingIntensity] = useState(3);
  const [drawingTimeOfDay, setDrawingTimeOfDay] = useState<'day' | 'night' | 'always'>('always');
  const [droppedPin, setDroppedPin] = useState<{ lat: number, lng: number } | null>(null);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  
  const mapCenter = useMemo(() => [userLocation.lat, userLocation.lng] as [number, number], [userLocation.lat, userLocation.lng]);

  useEffect(() => {
    const q = query(
      collection(db, 'safetyReports'), 
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData: SafetyReport[] = [];
      snapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() } as SafetyReport);
      });
      setReports(reportsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'safetyReports');
    });

    return () => unsubscribe();
  }, []);

  const [navigation, setNavigation] = useState<NavigationState>({
    isActive: false,
    currentStepIndex: 0,
    currentPosition: [51.505, -0.09],
    currentStreet: 'Southwark St',
    nextTurn: 'Turn right onto Borough High St',
    distanceToNextTurn: '200m'
  });

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(), // Will be ignored if already exists due to merge
        role: 'user'
      }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      });
    }
  }, [user]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: Location = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setNavigation(prev => ({ ...prev, currentPosition: [loc.lat, loc.lng] }));
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!destination) return;
    setLoading(true);
    try {
      const timeOfDay = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const foundRoutes = await getMockRoutes('Current Location', destination, timeOfDay, reports);
      setRoutes(foundRoutes);
      setSelectedRouteId(foundRoutes[0].id);
      setIsSheetOpen(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      setDestination(place.name || place.formatted_address || '');
      // Trigger search automatically on selection
      setTimeout(handleSearch, 100);
    }
  };

  const handleDrawComplete = (coordinates: [number, number][]) => {
    setPendingDrawing(coordinates);
    setIsDrawingMode(false);
  };

  const saveUserRoute = () => {
    if (!pendingDrawing) return;
    
    const newRoute: UserRoute = {
      id: Math.random().toString(36).substr(2, 9),
      type: drawingType,
      coordinates: pendingDrawing,
      description: `User marked ${drawingType} route`,
      comments: drawingComments,
      intensity: drawingIntensity,
      timeOfDay: drawingTimeOfDay
    };
    
    setUserRoutes(prev => [...prev, newRoute]);
    setPendingDrawing(null);
    setDrawingComments('');
    setDrawingIntensity(3);
    setDrawingTimeOfDay('always');
  };

  const startNavigation = () => {
    const route = routes.find(r => r.id === selectedRouteId);
    if (!route) return;

    setNavigation({
      isActive: true,
      currentStepIndex: 0,
      currentPosition: route.coordinates[0],
      alert: "Navigation started. Stay alert.",
      currentStreet: "Starting Point",
      nextTurn: "Head North",
      distanceToNextTurn: "100m"
    });

    let step = 0;
    const streets = ["Southwark St", "Borough High St", "London Bridge", "King William St"];
    const interval = setInterval(() => {
      step++;
      if (step >= route.coordinates.length) {
        clearInterval(interval);
        setNavigation(prev => ({ ...prev, isActive: false, alert: "You have arrived safely." }));
        return;
      }

      const nextPos = route.coordinates[step];
      let alert = undefined;
      
      // Check for nearby reports
      const nearbyReport = reports.find(r => 
        Math.abs(r.lat - nextPos[0]) < 0.002 && Math.abs(r.lng - nextPos[1]) < 0.002
      );
      
      if (nearbyReport) {
        alert = `Caution: ${nearbyReport.description} ahead.`;
      } else if (step === 1) {
        alert = "Approaching well-lit intersection.";
      }

      setNavigation({
        isActive: true,
        currentStepIndex: step,
        currentPosition: nextPos,
        alert,
        currentStreet: streets[Math.min(step, streets.length - 1)],
        nextTurn: step < route.coordinates.length - 1 ? "Continue Straight" : "Arrive at Destination",
        distanceToNextTurn: `${(route.coordinates.length - step) * 100}m`
      });
    }, 3000);
  };

  const addReport = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    const newReport = {
      userId: user.uid,
      type: droppedPin ? 'other' : 'lighting',
      lat: droppedPin ? droppedPin.lat : userLocation.lat,
      lng: droppedPin ? droppedPin.lng : userLocation.lng,
      description: 'New community report',
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'safetyReports'), newReport);
      setDroppedPin(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'safetyReports');
    }
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  return (
    <ErrorBoundary>
    <APIProvider 
      apiKey={process.env.GOOGLE_MAPS_API_KEY || ''}
      libraries={['places', 'drawing', 'geometry', 'routes']}
    >
      <div className={`relative h-screen w-full overflow-hidden font-sans transition-all duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'} ${
        isDrawingMode ? `ring-inset ring-8 ${drawingType === 'safe' ? 'ring-green-500/30' : 'ring-red-500/30'} animate-pulse` : ''
      }`}>
      
      {/* Auth Button */}
      <div className="absolute top-4 right-4 z-20">
        <Auth />
      </div>

      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <Map 
          center={mapCenter} 
          routes={routes} 
          selectedRouteId={selectedRouteId} 
          reports={reports}
          navigation={navigation}
          userRoutes={userRoutes}
          showUserRoutes={showUserRoutes}
          isDrawingMode={isDrawingMode}
          pendingDrawing={pendingDrawing}
          drawingType={drawingType}
          onDrawingTypeChange={setDrawingType}
          onDrawComplete={handleDrawComplete}
          onCancelDrawing={() => setIsDrawingMode(false)}
          onPinLocation={(lat, lng) => setDroppedPin({ lat, lng })}
          droppedPin={droppedPin}
          onClearPin={() => setDroppedPin(null)}
          showTraffic={showTraffic}
        />
      </div>

      {/* Header / Search Bar */}
      {!navigation.isActive && !isDrawingMode && (
        <div className="absolute top-0 left-0 right-0 p-4 z-10">
          <div className="max-w-xl mx-auto space-y-2">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <PlaceAutocomplete 
                onPlaceSelect={handlePlaceSelect}
                value={destination}
                onChange={setDestination}
                className="flex-1"
              />
              <Button 
                size="icon" 
                className="rounded-2xl h-12 w-12 shrink-0 shadow-xl"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
              </Button>
            </motion.div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-1">
                {['Home', 'Work', 'Gym', 'Library'].map(place => (
                  <Button 
                    key={place} 
                    variant="secondary" 
                    size="sm" 
                    className="rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-xs font-semibold shrink-0"
                    onClick={() => setDestination(place)}
                  >
                    <MapPin className="w-3 h-3 mr-1" /> {place}
                  </Button>
                ))}
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full backdrop-blur-md ml-2"
              >
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {reports.length} Reports Nearby
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Overlay */}
      <AnimatePresence>
        {navigation.isActive && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="absolute bottom-0 left-0 right-0 p-6 z-20"
          >
            <Card className="max-w-xl mx-auto rounded-[2.5rem] shadow-2xl border-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
              <CardContent className="p-6">
                <SafetyAnalysis navigation={navigation} route={selectedRoute} />
                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="destructive" 
                    className="flex-1 h-14 rounded-2xl font-bold"
                    onClick={() => setNavigation({ ...navigation, isActive: false })}
                  >
                    End Trip
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-14 w-14 rounded-2xl"
                    onClick={addReport}
                  >
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
        <Button 
          variant="destructive" 
          size="icon" 
          className="rounded-full shadow-2xl h-14 w-14 animate-pulse border-4 border-white/20"
          onClick={() => setIsSOSActive(true)}
        >
          <Shield className="w-6 h-6" />
        </Button>

        <div className="flex flex-col gap-2 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-100 dark:border-slate-700 mb-1">
            Draw
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full h-12 w-12 transition-all ${isDrawingMode && drawingType === 'safe' ? 'bg-green-500 text-white shadow-lg scale-110' : 'hover:bg-green-50 text-green-600'}`}
            onClick={() => {
              setIsDrawingMode(true);
              setDrawingType('safe');
            }}
            title="Mark Safe Route"
          >
            <PenTool className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full h-12 w-12 transition-all ${isDrawingMode && drawingType === 'unsafe' ? 'bg-red-500 text-white shadow-lg scale-110' : 'hover:bg-red-50 text-red-600'}`}
            onClick={() => {
              setIsDrawingMode(true);
              setDrawingType('unsafe');
            }}
            title="Mark Unsafe Area"
          >
            <AlertTriangle className="w-5 h-5" />
          </Button>
          {userRoutes.length > 0 && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full h-12 w-12 transition-all ${showUserRoutes ? 'text-primary bg-primary/10' : 'text-slate-400'}`}
                onClick={() => setShowUserRoutes(!showUserRoutes)}
                title={showUserRoutes ? "Hide Custom Routes" : "Show Custom Routes"}
              >
                <Shield className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-12 w-12 text-slate-400 hover:text-red-500 hover:bg-red-50"
                onClick={() => {
                  setUserRoutes([]);
                  setShowUserRoutes(true);
                }}
                title="Clear All Drawings"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full shadow-lg h-12 w-12 transition-all ${showTraffic ? 'bg-blue-500 text-white border-blue-600' : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'}`}
          onClick={() => setShowTraffic(!showTraffic)}
          title={showTraffic ? "Hide Traffic" : "Show Traffic"}
        >
          <TrafficCone className="w-5 h-5" />
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg h-12 w-12"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg h-12 w-12"
          onClick={addReport}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Save Route Modal */}
      <AnimatePresence>
        {pendingDrawing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className={`p-6 text-white flex items-center justify-between ${drawingType === 'safe' ? 'bg-green-600' : 'bg-red-600'}`}>
                <div className="flex items-center gap-3">
                  {drawingType === 'safe' ? <Shield className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  <h2 className="text-xl font-black tracking-tighter uppercase">Save {drawingType} Route</h2>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setPendingDrawing(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Comments</label>
                  <Input 
                    placeholder="Why is this route safe/unsafe?" 
                    className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 border-none"
                    value={drawingComments}
                    onChange={(e) => setDrawingComments(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {drawingType === 'safe' ? 'Safety Level' : 'Danger Level'}
                    </label>
                    <span className="text-sm font-bold">{drawingIntensity}/5</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <Button
                        key={val}
                        variant={drawingIntensity === val ? 'default' : 'outline'}
                        className={`flex-1 h-10 rounded-xl font-bold ${
                          drawingIntensity === val 
                            ? (drawingType === 'safe' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600') 
                            : ''
                        }`}
                        onClick={() => setDrawingIntensity(val)}
                      >
                        {val}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Best Time</label>
                  <div className="flex gap-2">
                    {(['day', 'night', 'always'] as const).map((time) => (
                      <Button
                        key={time}
                        variant={drawingTimeOfDay === time ? 'secondary' : 'outline'}
                        className={`flex-1 h-10 rounded-xl font-bold capitalize ${
                          drawingTimeOfDay === time ? 'bg-slate-100 dark:bg-slate-800' : ''
                        }`}
                        onClick={() => setDrawingTimeOfDay(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-14 rounded-2xl font-bold"
                    onClick={() => setPendingDrawing(null)}
                  >
                    Discard
                  </Button>
                  <Button 
                    className={`flex-1 h-14 rounded-2xl font-bold text-white ${
                      drawingType === 'safe' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={saveUserRoute}
                  >
                    Save Route
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Overlay */}
      <AnimatePresence>
        {isSOSActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-red-600/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="text-center space-y-8 max-w-md">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-32 h-32 bg-white rounded-full mx-auto flex items-center justify-center shadow-2xl"
              >
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tighter">EMERGENCY MODE</h2>
                <p className="text-red-100 font-medium">Alerting local authorities and emergency contacts with your live location.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button size="lg" className="h-16 rounded-2xl bg-white text-red-600 hover:bg-red-50 text-xl font-bold">
                  Call 999
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-16 rounded-2xl border-white text-white hover:bg-white/10 text-xl font-bold"
                  onClick={() => setIsSOSActive(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Selection Sheet */}
      <AnimatePresence>
        {routes.length > 0 && !navigation.isActive && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
              <SheetTrigger
                nativeButton={true}
                render={
                  <Button className="rounded-full px-8 shadow-2xl shadow-primary/20 h-12 text-lg font-bold">
                    View Route Details
                  </Button>
                }
              />
            </div>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-[3rem] p-0 border-none shadow-2xl dark:bg-slate-950">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-4 mb-2" />
              <ScrollArea className="h-full px-6 pb-8">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-3xl font-black tracking-tighter dark:text-white">Safe Passage</SheetTitle>
                  <p className="text-muted-foreground">Comparing routes for your safety</p>
                </SheetHeader>

                <div className="space-y-8">
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {routes.map(route => (
                      <Card 
                        key={route.id}
                        className={`min-w-[200px] cursor-pointer transition-all duration-300 border-2 dark:bg-slate-900 ${
                          selectedRouteId === route.id ? 'border-primary ring-4 ring-primary/10' : 'border-transparent bg-slate-50'
                        }`}
                        onClick={() => setSelectedRouteId(route.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase text-muted-foreground">{route.duration}</span>
                            <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              route.safety.overallScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {route.safety.overallScore}% SAFE
                            </div>
                          </div>
                          <h3 className="font-bold text-sm line-clamp-1 dark:text-white">{route.name}</h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedRoute && (
                    <motion.div
                      key={selectedRoute.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SafetyAnalysis route={selectedRoute} isLoading={loading} />
                    </motion.div>
                  )}

                  <div className="pt-4">
                    <Button 
                      className="w-full h-14 rounded-2xl text-lg font-bold gap-2"
                      onClick={() => {
                        setIsSheetOpen(false);
                        startNavigation();
                      }}
                    >
                      <Navigation className="w-5 h-5" /> Start Navigation
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
    </APIProvider>
    </ErrorBoundary>
  );
}
