import React from "react";
import ThemeProvider from "@/components/ui/ThemeProvider";
import Portfolio from "./pages/Portfolio";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="portfolio-theme">
      <Portfolio />
    </ThemeProvider>
  );
}

export default App;
