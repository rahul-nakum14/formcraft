import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { elementTypes, groupedElementTypes } from '@/lib/form-elements';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ElementsPanelProps {
  onAddElement: (elementType: string) => void;
}

const ElementsPanel: React.FC<ElementsPanelProps> = ({ onAddElement }) => {
  const grouped = groupedElementTypes();
  const categories = {
    basic: 'Basic Fields',
    selection: 'Selection Fields',
    advanced: 'Advanced Fields',
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Form Elements</CardTitle>
        <p className="text-sm text-muted-foreground">Drag elements to your form or click to add</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(grouped).map(([category, elements]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {categories[category as keyof typeof categories] || category}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {elements.map((element) => (
                <ElementButton 
                  key={element.type}
                  type={element.type}
                  label={element.label}
                  icon={element.icon}
                  onClick={() => onAddElement(element.type)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Premium features hint */}
        {/* <div className="mt-6">
          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
            Premium
          </Badge>
          <p className="mt-2 text-xs text-muted-foreground">
            Upgrade to Premium for advanced features like CAPTCHA protection, email notifications, and unlimited submissions.
          </p>
        </div> */}
      </CardContent>
    </Card>
  );
};

interface ElementButtonProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ElementButton: React.FC<ElementButtonProps> = ({ type, label, icon, onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="p-3 flex flex-col items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={onClick}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('element-type', type);
            }}
          >
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              {icon}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add {label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ElementsPanel;
