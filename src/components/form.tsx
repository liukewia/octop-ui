import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
} from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/cn';

/**
 * shadcn 的写法：校验交给 react-hook-form + zod，组件只负责把
 * 根据字段状态显示错误样式。
 *
 *   const form = useForm({ resolver: zodResolver(schema), defaultValues })
 *   <Form {...form}>
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <FormField control={form.control} name="title" render={({ field }) => (
 *         <FormItem>
 *           <FormLabel>标题</FormLabel>
 *           <FormControl><Input {...field} /></FormControl>
 *           <FormMessage />
 *         </FormItem>
 *       )} />
 *     </form>
 *   </Form>
 */
export const Form = FormProvider;

/* ------------------------------------------------------------------ 上下文 */

type FormFieldContextValue = { name: string };
const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName>;

/** Controller 的语法糖：把 name 塞进 context，让下游能自己取到错误 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: FormFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

type FormItemContextValue = {
  id: string;
  layout: 'vertical' | 'horizontal';
};

const FormItemContext = createContext<FormItemContextValue | null>(null);

type FieldState = ReturnType<UseFormReturn<FieldValues>['getFieldState']>;

/** 允许 FormItem / FormLabel 脱离 FormField 单独排版，所以这里不抛错 */
function useOptionalFieldState(): { name: string; state?: FieldState } | null {
  const field = useContext(FormFieldContext);
  const form = useFormContext() as UseFormReturn<FieldValues> | null;
  if (!field) return null;
  const state =
    form && typeof form.getFieldState === 'function'
      ? form.getFieldState(field.name as FieldPath<FieldValues>, form.formState)
      : undefined;
  return { name: field.name, state };
}

export interface UseFormFieldReturn {
  name: string;
  id: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  error: FieldState['error'] | undefined;
}

/** 给自定义控件用：拿到 id / aria 描述符 / 错误 */
export function useFormField(): UseFormFieldReturn {
  const field = useContext(FormFieldContext);
  const item = useContext(FormItemContext);
  if (!field) {
    throw new Error('useFormField 必须在 <FormField> 内使用');
  }
  const resolved = useOptionalFieldState();
  const state = resolved?.state;
  const id = item?.id ?? field.name;
  return {
    name: field.name,
    id,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    invalid: !!state?.invalid,
    isTouched: !!state?.isTouched,
    isDirty: !!state?.isDirty,
    error: state?.error,
  };
}

/* ----------------------------------------------------------------- FormItem */

export interface FormItemProps extends ComponentProps<'div'> {
  /** 标签在控件上方（默认）还是左侧，和 Form 的 vertical / horizontal 对齐 */
  layout?: 'vertical' | 'horizontal';
}

export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(function FormItem(
  { className, layout = 'vertical', children, ...props },
  ref,
) {
  const id = useId();
  const field = useOptionalFieldState();
  const invalid = !!field?.state?.invalid;
  const hasMessage = !!field?.state?.error?.message;

  return (
    <FormItemContext.Provider value={{ id, layout }}>
      <div
        ref={ref}
        data-slot="form-item"
        data-invalid={invalid || undefined}
        data-has-message={hasMessage || undefined}
        className={cn(
          'flex min-w-0',
          layout === 'vertical' ? 'flex-col' : 'flex-row gap-3',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </FormItemContext.Provider>
  );
});

/* ---------------------------------------------------------------- FormLabel */

export interface FormLabelProps extends ComponentProps<typeof LabelPrimitive.Root> {
  /** 只画星号，是否必填以 zod schema 为准 */
  required?: boolean;
  /** 水平布局时标签末尾的冒号 */
  colon?: boolean;
  children?: ReactNode;
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(function FormLabel(
  { className, required, colon, children, ...props },
  ref,
) {
  const item = useContext(FormItemContext);
  const field = useOptionalFieldState();
  const invalid = !!field?.state?.invalid;
  const horizontal = item?.layout === 'horizontal';
  // 与 FormControl 注给控件的 id 保持一致
  const formItemId = `${item?.id ?? field?.name ?? ''}-form-item`;

  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={formItemId}
      data-slot="form-label"
      data-invalid={invalid || undefined}
      className={cn(
        'flex items-center gap-1 text-sm font-medium',
        invalid ? 'text-danger-fg' : 'text-fg-secondary',
        horizontal
          ? 'mb-0 w-[92px] shrink-0 justify-end pt-2.5 text-end'
          : 'mb-1.5',
        className,
      )}
      {...props}
    >
      {required && (
        <span aria-hidden className="text-danger">
          *
        </span>
      )}
      <span className="min-w-0">{children}</span>
      {colon && horizontal ? <span className="text-fg-secondary">：</span> : null}
    </LabelPrimitive.Root>
  );
});

/* -------------------------------------------------------------- FormControl */

/**
 * 把 id / aria-describedby / aria-invalid 注给唯一子元素。
 * 我们的 Input 会把 ...rest 落到真正的 <input> 上，所以 label 的 htmlFor 有效。
 */
export const FormControl = forwardRef<HTMLElement, ComponentProps<typeof Slot>>(
  function FormControl({ className, ...props }, ref) {
    const { formItemId, formDescriptionId, formMessageId, invalid } = useFormField();
    const describedBy = [formDescriptionId, invalid ? formMessageId : null].filter(Boolean).join(' ');
    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={describedBy || undefined}
        aria-invalid={invalid || undefined}
        className={className}
        {...props}
      />
    );
  },
);

/* ---------------------------------------------------------- Description/Message */

export const FormDescription = forwardRef<HTMLParagraphElement, ComponentProps<'p'>>(
  function FormDescription({ className, ...props }, ref) {
    const { formDescriptionId } = useFormField();
    return (
      <p
        ref={ref}
        id={formDescriptionId}
        data-slot="form-description"
        className={cn('mt-1 text-xs leading-relaxed text-fg-tertiary', className)}
        {...props}
      />
    );
  },
);

export interface FormMessageProps extends Omit<ComponentProps<'div'>, 'children'> {
  children?: ReactNode;
}

export const FormMessage = forwardRef<HTMLDivElement, FormMessageProps>(function FormMessage(
  { className, children, ...props },
  ref,
) {
  const { formMessageId, error } = useFormField();
  const body = error?.message ?? children;
  if (!body) return null;

  return (
    <div
      ref={ref}
      id={formMessageId}
      role="alert"
      data-slot="form-message"
      className={cn(
        // 错误提示是贴在输入框下方的柔和红块（只留下面两角）
        'rounded-b-element bg-danger-bg px-2 py-1 text-xs leading-relaxed text-danger-fg',
        className,
      )}
      {...props}
    >
      {body}
    </div>
  );
});
