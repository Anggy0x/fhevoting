import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X, Calendar } from 'lucide-react';
import { votingContract } from '@/lib/contract';
import { toast } from '@/hooks/use-toast';

const proposalSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
});

type ProposalForm = z.infer<typeof proposalSchema>;

interface CreateProposalDialogProps {
  onSuccess: () => void;
}

export function CreateProposalDialog({ onSuccess }: CreateProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProposalForm>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: 24, // Default 24 hours
    },
  });

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const onSubmit = async (data: ProposalForm) => {
    const validOptions = options.filter(option => option.trim() !== '');
    
    if (validOptions.length < 2) {
      toast({
        title: "Invalid Options",
        description: "At least 2 valid options are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const durationInSeconds = data.duration * 60 * 60; // Convert hours to seconds
      
      const success = await votingContract.createProposal(
        data.title,
        data.description,
        validOptions,
        durationInSeconds
      );

      if (success) {
        toast({
          title: "Proposal Created",
          description: "Your proposal has been submitted to the DAO.",
        });
        
        // Reset form
        form.reset();
        setOptions(['', '']);
        setOpen(false);
        onSuccess();
      } else {
        throw new Error('Proposal creation failed');
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "There was an error creating your proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Proposal</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogDescription>
            Create a new voting proposal for the DAO. All votes will be encrypted using FHE.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              placeholder="Enter proposal title..."
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed description of the proposal..."
              rows={4}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Voting Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="720"
              placeholder="24"
              {...form.register('duration', { valueAsNumber: true })}
            />
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Voting will end {form.watch('duration') || 24} hours after creation
            </div>
            {form.formState.errors.duration && (
              <p className="text-sm text-red-500">{form.formState.errors.duration.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Voting Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
            
            <p className="text-xs text-muted-foreground">
              You can add up to 10 options. At least 2 options are required.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Proposal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}