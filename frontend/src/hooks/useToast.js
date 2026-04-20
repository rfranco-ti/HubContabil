import { toast as sonnerToast } from 'sonner';

export function useToast() {
  const toast = (options) => {
    const { title, description, ...rest } = options;

    return sonnerToast(title, {
      description,
      ...rest,
    });
  };

  return {
    toast,
    success: (title, options) => sonnerToast.success(title, options),
    error: (title, options) => sonnerToast.error(title, options),
    warning: (title, options) => sonnerToast.warning(title, options),
    info: (title, options) => sonnerToast.info(title, options),
    promise: (promise, options) => sonnerToast.promise(promise, options),
  };
}
