"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  details?: unknown;
}

export function ErrorModal({
  open,
  onOpenChange,
  title = "エラー",
  message,
  details,
}: ErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        {details && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            className="bg-gray-100 border-gray-200 text-black hover:bg-white hover:text-black"
            onClick={() => onOpenChange(false)}
          >
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
