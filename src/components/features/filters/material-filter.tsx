"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MaterialFilterProps {
  materials: string[];
  initialSelectedMaterials?: string[];
  onApplyFilter: (selectedMaterials: string[]) => void;
}

const MaterialFilter: React.FC<MaterialFilterProps> = ({
  materials,
  initialSelectedMaterials = [],
  onApplyFilter,
}) => {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    initialSelectedMaterials,
  );

  const handleCheckboxChange = (material: string, isChecked: boolean) => {
    let newSelectedMaterials;
    if (isChecked) {
      newSelectedMaterials = [...selectedMaterials, material];
    } else {
      newSelectedMaterials = selectedMaterials.filter((m) => m !== material);
    }
    setSelectedMaterials(newSelectedMaterials);
    onApplyFilter(newSelectedMaterials);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {materials.map((material) => (
            <div key={material} className="flex items-center space-x-2">
              <Checkbox
                id={`material-${material}`}
                checked={selectedMaterials.includes(material)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(material, checked as boolean)
                }
              />
              <Label htmlFor={`material-${material}`}>{material}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialFilter;
