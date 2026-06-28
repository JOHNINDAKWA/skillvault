import { useContext } from "react";
import { ResourcesContext } from "../context/ResourcesContext.jsx";

export function useResources() {
  const context = useContext(ResourcesContext);

  if (!context) {
    throw new Error("useResources must be used inside ResourcesProvider");
  }

  return context;
}