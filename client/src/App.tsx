import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

// ============================================================================
// ROUTING
// The Router component maps URLs to page components.
// We only have a single page (Home) in this application.
// ============================================================================
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Fallback to 404 for any other unmatched routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

// ============================================================================
// APP ENTRY POINT
// Sets up all the global context providers needed by our app.
// ============================================================================
function App() {
  return (
    // QueryClientProvider gives all our components access to TanStack Query
    // for caching, fetching, and mutating data via hooks.
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Toaster provides global pop-up notifications if needed */}
        <Toaster />
        {/* The router handles injecting the correct page based on the URL */}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
