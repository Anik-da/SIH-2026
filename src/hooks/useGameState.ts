import { useCallback, useMemo, useState } from 'react';
import type { PropertyData, PropertyContext } from '@/types';
import { buildPropertyContext } from '@/utils/idUtils';

export interface GameState {
  currentFloorId: string;
  selectedProperty: PropertyData | null;
  exploded: boolean;
  underground: boolean;
  isolated: boolean;
  elevatorOpen: boolean;
  showPropertyPanel: boolean;
  gisTransition: boolean;
  enteredBuilding: boolean;
}

export function useGameState() {
  const [currentFloorId, setCurrentFloorId] = useState('G');
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [exploded, setExploded] = useState(false);
  const [underground, setUnderground] = useState(false);
  const [isolated, setIsolated] = useState(false);
  const [elevatorOpen, setElevatorOpen] = useState(false);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [gisTransition, setGisTransition] = useState(false);
  const [enteredBuilding, setEnteredBuilding] = useState(false);

  const propertyContext = useMemo<PropertyContext | null>(() => {
    return selectedProperty ? buildPropertyContext(selectedProperty) : null;
  }, [selectedProperty]);

  const selectProperty = useCallback((prop: PropertyData | null) => {
    setSelectedProperty(prop);
    setShowPropertyPanel(!!prop);
    if (prop) setIsolated(false);
  }, []);

  const resetView = useCallback(() => {
    setSelectedProperty(null);
    setShowPropertyPanel(false);
    setIsolated(false);
    setExploded(false);
    setUnderground(false);
  }, []);

  return {
    currentFloorId,
    setCurrentFloorId,
    selectedProperty,
    selectProperty,
    exploded,
    setExploded,
    underground,
    setUnderground,
    isolated,
    setIsolated,
    elevatorOpen,
    setElevatorOpen,
    showPropertyPanel,
    setShowPropertyPanel,
    gisTransition,
    setGisTransition,
    enteredBuilding,
    setEnteredBuilding,
    propertyContext,
    resetView,
  };
}
