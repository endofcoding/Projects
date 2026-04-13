import { Route, NavigationState } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Shield, Sun, Users, AlertTriangle, Info, Clock, MapPin, Bell, Navigation, CornerUpRight } from "lucide-react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "./ui/skeleton";

interface SafetyAnalysisProps {
  route?: Route;
  isLoading?: boolean;
  navigation?: NavigationState;
}

export default function SafetyAnalysis({ route, isLoading, navigation }: SafetyAnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Info;
    return <IconComponent className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-16 w-16 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!route) return null;

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {navigation?.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl mb-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary rounded-2xl">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Location</p>
                  <p className="text-lg font-bold">{navigation.currentStreet}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Next Step</p>
                <p className="text-lg font-bold text-primary">{navigation.distanceToNextTurn}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl border border-white/10">
              <CornerUpRight className="w-5 h-5 text-primary" />
              <p className="font-medium">{navigation.nextTurn}</p>
            </div>

            {navigation.alert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 bg-amber-500/20 border border-amber-500/30 p-3 rounded-2xl flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <p className="text-sm font-bold text-amber-200">{navigation.alert}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{route.name}</h2>
          <div className="flex items-center gap-3 mt-1 text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {route.duration}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {route.distance}</span>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-2xl border flex flex-col items-center ${getScoreColor(route.safety.overallScore)}`}>
          <span className="text-xs font-bold uppercase tracking-wider">Safety Score</span>
          <span className="text-3xl font-black">{route.safety.overallScore}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {route.safety.factors.map((factor, index) => (
          <motion.div
            key={factor.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-none bg-slate-50/50">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  {getIcon(factor.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{factor.name}</span>
                    <span className="text-xs font-bold">{factor.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-amber-100 bg-amber-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-800">
            <Shield className="w-4 h-4" /> Safety Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {route.safety.tips.map((tip, i) => (
              <li key={i} className="text-sm text-amber-900/80 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
