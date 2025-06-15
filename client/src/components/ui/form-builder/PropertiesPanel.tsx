"use client"

import type React from "react"
import { useState } from "react"
import type { Form, FormElement, FormSettings, FormTheme } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle } from "lucide-react"

interface PropertiesPanelProps {
  form: Form
  selectedElementId: string | null
  onFormUpdate: (form: Form) => void
  onElementUpdate: (element: FormElement) => void
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  form,
  selectedElementId,
  onFormUpdate,
  onElementUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<string>("element")

  // Remove the user query and premium check
  // const { data: user } = useQuery<UserType>({
  //   queryKey: ['/api/user/profile'],
  // });
  // const isPremium = user?.planType === 'premium';

  // Make all features available
  const isPremium = true

  // Get selected element
  const selectedElement = form.elements.find((el) => el.id === selectedElementId)

  // Update element properties
  const updateElement = (updates: Partial<FormElement>) => {
    if (!selectedElement) return

    onElementUpdate({
      ...selectedElement,
      ...updates,
    })
  }

  // Update element properties object
  const updateElementProperty = (key: string, value: any) => {
    if (!selectedElement) return

    const properties = {
      ...(selectedElement.properties || {}),
      [key]: value,
    }

    updateElement({ properties })
  }

  // Update element options (for dropdown, checkbox, radio)
  const updateElementOptions = (optionsText: string) => {
    if (!selectedElement) return

    const options = optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    updateElement({ options })
  }

  // Update form settings
  const updateFormSettings = (updates: Partial<FormSettings>) => {
    onFormUpdate({
      ...form,
      settings: {
        ...form.settings,
        ...updates,
      },
    })
  }

  // Update form theme
  const updateFormTheme = (updates: Partial<FormTheme>) => {
    onFormUpdate({
      ...form,
      theme: {
        ...form.theme,
        ...updates,
      },
    })
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Properties</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <Tabs defaultValue="element" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="element" disabled={!selectedElementId} className="flex-1">
              Element
            </TabsTrigger>
            <TabsTrigger value="form" className="flex-1">
              Form
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex-1">
              Theme
            </TabsTrigger>
          </TabsList>

          {/* Element Properties Tab */}
          <TabsContent value="element" className="space-y-4">
            {selectedElement ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="element-label">Label</Label>
                    <Input
                      id="element-label"
                      value={selectedElement.label}
                      onChange={(e) => updateElement({ label: e.target.value })}
                    />
                  </div>

                  {(selectedElement.type === "text" ||
                    selectedElement.type === "email" ||
                    selectedElement.type === "phone" ||
                    selectedElement.type === "textarea") && (
                    <div className="space-y-2">
                      <Label htmlFor="element-placeholder">Placeholder</Label>
                      <Input
                        id="element-placeholder"
                        value={selectedElement.placeholder || ""}
                        onChange={(e) => updateElement({ placeholder: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedElement.type === "textarea" && (
                    <div className="space-y-2">
                      <Label htmlFor="element-rows">Rows</Label>
                      <Input
                        id="element-rows"
                        type="number"
                        value={selectedElement.properties?.rows || 3}
                        onChange={(e) => updateElementProperty("rows", Number.parseInt(e.target.value) || 3)}
                        min={1}
                        max={10}
                      />
                    </div>
                  )}

                  {(selectedElement.type === "dropdown" || selectedElement.type === "radio") && (
                    <div className="space-y-2">
                      <Label htmlFor="element-options">Options (one per line)</Label>
                      <Textarea
                        id="element-options"
                        value={(selectedElement.options || []).join("\n")}
                        onChange={(e) => updateElementOptions(e.target.value)}
                        rows={5}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="element-help-text">Help Text</Label>
                    <Input
                      id="element-help-text"
                      value={selectedElement.properties?.helpText || ""}
                      onChange={(e) => updateElementProperty("helpText", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="element-required"
                      checked={selectedElement.required}
                      onCheckedChange={(checked) => updateElement({ required: checked })}
                    />
                    <Label htmlFor="element-required">Required field</Label>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p>Select an element to edit its properties</p>
              </div>
            )}
          </TabsContent>

          {/* Form Settings Tab */}
          <TabsContent value="form" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="success-message">Success Message</Label>
                <Textarea
                  id="success-message"
                  value={form.settings.successMessage}
                  onChange={(e) => updateFormSettings({ successMessage: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="redirect-url">Redirect URL</Label>
                <Input
                  id="redirect-url"
                  value={form.settings.redirectUrl || ""}
                  onChange={(e) => updateFormSettings({ redirectUrl: e.target.value })}
                  placeholder="https://example.com/thank-you"
                />
                <p className="text-xs text-muted-foreground">Redirect users to this URL after form submission</p>
              </div>

              <Separator />

              {/* Remove CAPTCHA settings completely */}

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={form.settings.emailNotifications}
                    onCheckedChange={(checked) => updateFormSettings({ emailNotifications: checked })}
                  />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications when someone submits this form
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="form-expiration">Form Expiration Date</Label>
                <Input
                  id="form-expiration"
                  type="date"
                  value={form.expiresAt ? new Date(form.expiresAt).toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    onFormUpdate({
                      ...form,
                      expiresAt: date,
                    })
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
              </div>
            </div>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme-primary-color">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="theme-primary-color"
                    value={form.theme.primaryColor}
                    onChange={(e) => updateFormTheme({ primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <Input
                    value={form.theme.primaryColor}
                    onChange={(e) => updateFormTheme({ primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme-bg-color">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="theme-bg-color"
                    value={form.theme.backgroundColor}
                    onChange={(e) => updateFormTheme({ backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <Input
                    value={form.theme.backgroundColor}
                    onChange={(e) => updateFormTheme({ backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme-text-color">Text Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="theme-text-color"
                    value={form.theme.textColor || "#000000"}
                    onChange={(e) => updateFormTheme({ textColor: e.target.value })}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <Input
                    value={form.theme.textColor || "#000000"}
                    onChange={(e) => updateFormTheme({ textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme-page-bg-color">Page Background Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="theme-page-bg-color"
                    value={form.theme.pageBackgroundColor || "#f8fafc"}
                    onChange={(e) => updateFormTheme({ pageBackgroundColor: e.target.value })}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <Input
                    value={form.theme.pageBackgroundColor || "#f8fafc"}
                    onChange={(e) => updateFormTheme({ pageBackgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Background color of the entire page around the form</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme-bg-image">Background Image URL</Label>
                <Input
                  id="theme-bg-image"
                  value={form.theme.backgroundImage || ""}
                  onChange={(e) => updateFormTheme({ backgroundImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">Leave empty for no background image</p>
              </div>

              {form.theme.backgroundImage && (
                <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Background images may affect form readability. Ensure sufficient contrast between text and
                      background.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default PropertiesPanel
