import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface MurmurDialogProps {
  trigger?: React.ReactNode;
  onSubmit: (content: string) => Promise<void>;
}

export function MurmurDialog({ trigger, onSubmit }: MurmurDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
      setOpen(false);
    } catch (error) {
      // Error handling is done by the API client
      console.error('Failed to create murmur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="w-full">
            Create New Murmur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Murmur</DialogTitle>
          <DialogDescription>
            Share your thoughts with your followers. You can use text only.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="What's happening?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
            maxLength={280}
          />
          <div className="flex justify-end text-sm text-gray-500">
            {text.length}/280 characters
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting || text.length > 280}
          >
            {isSubmitting ? "Posting..." : "Post Murmur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 