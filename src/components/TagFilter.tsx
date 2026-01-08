import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagFilter = ({ availableTags, selectedTags, onTagsChange }: TagFilterProps) => {
  const toggleTag = (tag: string) => {
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const clearFilters = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filtrar por etiquetas</span>
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer transition-colors"
            onClick={() => toggleTag(tag)}
          >
            {tag}
            {selectedTags.includes(tag) && (
              <X className="h-3 w-3 ml-1" />
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
