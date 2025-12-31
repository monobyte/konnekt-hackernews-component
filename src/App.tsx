import { useState } from 'react';
import Placeholder from './Placeholder';
import * as ExportedComponents from './components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './shadcn/ui/select';

// Filter to only get actual React components (functions/classes, not interfaces or other exports)
const componentEntries = Object.entries(ExportedComponents).filter(([, value]) => typeof value === 'function');

function App() {
  const [selectedComponent, setSelectedComponent] = useState<string>(componentEntries[0]?.[0] ?? '');

  // No components exported - show placeholder
  if (componentEntries.length === 0) {
    return (
      <div className="w-full h-full">
        <Placeholder />
      </div>
    );
  }

  // Single component - render it directly
  if (componentEntries.length === 1) {
    const [, Component] = componentEntries[0];
    return (
      <div className="w-full h-full">
        <Component />
      </div>
    );
  }

  // Multiple components - show selector
  const SelectedComponent = componentEntries.find(([name]) => name === selectedComponent)?.[1];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-3 border-b border-zinc-800 bg-zinc-950 flex items-center gap-3">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Component</span>
        <Select value={selectedComponent} onValueChange={setSelectedComponent}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select component" />
          </SelectTrigger>
          <SelectContent>
            {componentEntries.map(([name]) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-h-0">{SelectedComponent ? <SelectedComponent /> : <Placeholder />}</div>
    </div>
  );
}

export default App;
