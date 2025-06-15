import React from 'react';
import { 
  FileText, 
  Mail, 
  Phone, 
  AlignLeft, 
  List, 
  CheckSquare, 
  Circle, 
  Upload, 
  Type,
  Heading
} from 'lucide-react';
import { FormElement } from '@/lib/types';
import { nanoid } from 'nanoid';

interface ElementTypeDefinition {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  createDefault: () => FormElement;
}

// Form element type definitions with their icons and default properties
export const elementTypes: ElementTypeDefinition[] = [
  {
    type: 'text',
    label: 'Text Input',
    icon: <Type className="h-5 w-5" />,
    category: 'basic',
    createDefault: () => ({
      id: nanoid(8),
      type: 'text',
      label: 'Text Input',
      placeholder: 'Enter text here',
      required: false,
      properties: {
        helpText: '',
      },
    }),
  },
  {
    type: 'email',
    label: 'Email',
    icon: <Mail className="h-5 w-5" />,
    category: 'basic',
    createDefault: () => ({
      id: nanoid(8),
      type: 'email',
      label: 'Email Address',
      placeholder: 'email@example.com',
      required: false,
      properties: {
        helpText: '',
      },
    }),
  },
  {
    type: 'phone',
    label: 'Phone',
    icon: <Phone className="h-5 w-5" />,
    category: 'basic',
    createDefault: () => ({
      id: nanoid(8),
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: false,
      properties: {
        helpText: '',
      },
    }),
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: <AlignLeft className="h-5 w-5" />,
    category: 'basic',
    createDefault: () => ({
      id: nanoid(8),
      type: 'textarea',
      label: 'Long Text',
      placeholder: 'Enter your message here',
      required: false,
      properties: {
        helpText: '',
        rows: 4,
      },
    }),
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    icon: <List className="h-5 w-5" />,
    category: 'selection',
    createDefault: () => ({
      id: nanoid(8),
      type: 'dropdown',
      label: 'Select an option',
      placeholder: 'Choose from the list',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      properties: {
        helpText: '',
      },
    }),
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: <CheckSquare className="h-5 w-5" />,
    category: 'selection',
    createDefault: () => ({
      id: nanoid(8),
      type: 'checkbox',
      label: 'I agree to the terms and conditions',
      required: false,
      properties: {
        helpText: '',
      },
    }),
  },
  {
    type: 'radio',
    label: 'Radio',
    icon: <Circle className="h-5 w-5" />,
    category: 'selection',
    createDefault: () => ({
      id: nanoid(8),
      type: 'radio',
      label: 'Choose one option',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      properties: {
        helpText: '',
      },
    }),
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: <Upload className="h-5 w-5" />,
    category: 'advanced',
    createDefault: () => ({
      id: nanoid(8),
      type: 'file',
      label: 'Upload a file',
      required: false,
      properties: {
        helpText: 'Accepted file types: PDF, JPG, PNG',
        maxSize: 5, // in MB
        acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      },
    }),
  },
];

// Helper function to get element type definition by type
export const getElementTypeByType = (type: string): ElementTypeDefinition | undefined => {
  return elementTypes.find(element => element.type === type);
};

// Helper function to create a new element of specified type
export const createNewElement = (type: string): FormElement | null => {
  const elementType = getElementTypeByType(type);
  if (!elementType) return null;
  
  return elementType.createDefault();
};

// Helper function to validate a form element
export const validateElement = (element: FormElement): boolean => {
  if (!element.label.trim()) return false;
  
  if (element.type === 'dropdown' || element.type === 'radio') {
    return Array.isArray(element.options) && element.options.length > 0;
  }
  
  return true;
};

// Group element types by category
export const groupedElementTypes = () => {
  const grouped: Record<string, ElementTypeDefinition[]> = {};
  
  elementTypes.forEach(type => {
    if (!grouped[type.category]) {
      grouped[type.category] = [];
    }
    grouped[type.category].push(type);
  });
  
  return grouped;
};
