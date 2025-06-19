import { useEffect } from "react";
import { toast } from "sonner";

interface UseErrorHandlerProps {
  error: string | null;
  clearError: () => void;
  title?: string;
}

export function useErrorHandler({
  error,
  clearError,
  title = "Lỗi",
}: UseErrorHandlerProps) {
  useEffect(() => {
    if (error) {
      toast.error(title, {
        description: error,
      });
      clearError();
    }
  }, [error, clearError, title]);
}

export function useSuccessHandler() {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
    });
  };

  return { showSuccess };
}
