import { useState } from 'react';
import { Checkbox, Collapse, Stack } from '@mantine/core';

interface Department {
  deptId: number;
  deptName: string;
  children?: Department[];
}

interface Props {
  data: Department[];
  selected: number[];
  onChange: (selected: number[]) => void;
}

export function DepartmentTree({ data, selected, onChange }: Props) {
  const [openNodes, setOpenNodes] = useState<number[]>([]);

  const toggleNode = (id: number) => {
    setOpenNodes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCheck = (id: number, checked: boolean) => {
    const newSelected = checked
      ? [...selected, id]
      : selected.filter((i) => i !== id);
    onChange(newSelected);
  };

  const renderTree = (nodes: Department[]) => {
    return nodes.map((node) => {
      const isOpen = openNodes.includes(node.deptId);
      const isChecked = selected.includes(node.deptId);

      return (
        <Stack key={node.deptId} gap="xs">
          <Checkbox
            label={node.deptName}
            checked={isChecked}
            onChange={(e) => handleCheck(node.deptId, e.currentTarget.checked)}
            onClick={() => node.children && toggleNode(node.deptId)}
          />
          {node.children && (
            <Collapse in={isOpen} transitionDuration={200}>
              <Stack pl="md">{renderTree(node.children)}</Stack>
            </Collapse>
          )}
        </Stack>
      );
    });
  };

  return <Stack>{renderTree(data)}</Stack>;
}