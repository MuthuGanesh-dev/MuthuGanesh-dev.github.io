import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Portfolio from "@/pages/Portfolio";
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Portfolio />
    </ThemeProvider>
  );
}

export default App;
