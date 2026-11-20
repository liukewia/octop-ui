import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';

export type NamePath = string | number | (string | number)[];

export interface FormRule {
  required?: boolean;
  min?: number;
  max?: number;
  len?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'email' | 'url' | 'boolean';
  message?: string;
  validator?: (rule: FormRule, value: unknown, values: Record<string, unknown>) => void | Promise<void>;
  whitespace?: boolean;
}

export interface FieldData {
  name: NamePath;
  value?: unknown;
  errors?: string[];
}

export interface FormInstance<Values = Record<string, unknown>> {
  getFieldValue: (name: NamePath) => unknown;
  getFieldsValue: () => Values;
  setFieldValue: (name: NamePath, value: unknown) => void;
  setFieldsValue: (values: Partial<Values>) => void;
  resetFields: (names?: NamePath[]) => void;
  validateFields: (names?: NamePath[]) => Promise<Values>;
  submit: () => void;
  getFieldError: (name: NamePath) => string[];
  isFieldTouched: (name: NamePath) => boolean;
  scrollToField: (name: NamePath) => void;
}

type Store = {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
};

function pathKey(name: NamePath): string {
  return Array.isArray(name) ? name.join('.') : String(name);
}

function getPath(store: Record<string, unknown>, name: NamePath): unknown {
  return pathKey(name)
    .split('.')
    .reduce<unknown>((acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]), store);
}

function setPath(store: Record<string, unknown>, name: NamePath, value: unknown): Record<string, unknown> {
  const keys = pathKey(name).split('.');
  const next = { ...store };
  let cursor: Record<string, unknown> = next;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    const child = cursor[key];
    cursor[key] = Array.isArray(child) ? [...child] : { ...(child as Record<string, unknown> | undefined) };
    cursor = cursor[key] as Record<string, unknown>;
  });
  return next;
}

const EMPTY: string[] = [];
/** FormStore 挂在 instance 上，避免把 store 暴露到公开类型里 */
const STORE_KEY = '__octopStore';

class FormStore {
  private state: Store = { values: {}, errors: {}, touched: {} };
  private listeners = new Set<() => void>();
  private initialValues: Record<string, unknown> = {};
  private rules = new Map<string, { name: NamePath; rules: FormRule[] }>();
  private onSubmit?: () => void;

  constructor(initial?: Record<string, unknown>) {
    if (initial) {
      this.initialValues = initial;
      this.state.values = initial;
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
    this.listeners.delete(listener);
  };
  };

  getSnapshot = () => this.state;

  private notify() {
    this.state = { ...this.state };
    this.listeners.forEach((listener) => listener());
  }

  registerField(name: NamePath, rules: FormRule[] = []) {
    this.rules.set(pathKey(name), { name, rules });
  }

  unregisterField(name: NamePath) {
    this.rules.delete(pathKey(name));
  }

  setValue(name: NamePath, value: unknown) {
    this.state.values = setPath(this.state.values, name, value);
    this.notify();
  }

  setValues(values: Record<string, unknown>) {
    this.state.values = { ...this.state.values, ...values };
    this.notify();
  }

  setErrors(name: NamePath, errors: string[]) {
    this.state.errors = { ...this.state.errors, [pathKey(name)]: errors };
    this.notify();
  }

  touch(name: NamePath) {
    this.state.touched = { ...this.state.touched, [pathKey(name)]: true };
    this.notify();
  }

  reset(names?: NamePath[]) {
    if (!names) {
      this.state = { values: this.initialValues, errors: {}, touched: {} };
    } else {
      const values = { ...this.state.values };
      names.forEach((name) => {
        values[pathKey(name)] = getPath(this.initialValues, name);
        delete this.state.errors[pathKey(name)];
      });
      this.state.values = values;
    }
    this.notify();
  }

  getFieldError(name: NamePath) {
    return this.state.errors[pathKey(name)] ?? EMPTY;
  }

  async validate(name: NamePath): Promise<string[]> {
    const entry = this.rules.get(pathKey(name));
    if (!entry) return [];
    const value = getPath(this.state.values, name);
    const errors: string[] = [];
    for (const rule of entry.rules) {
      const message = await runRule(rule, value, this.state.values);
      if (message) errors.push(message);
    }
    this.setErrors(name, errors);
    return errors;
  }

  async validateAll(names?: NamePath[]) {
    const keys = names?.map(pathKey) ?? [...this.rules.keys()];
    const fields = keys.map((key) => this.rules.get(key)).filter(Boolean);
    await Promise.all(fields.map((field) => this.validate(field!.name)));
    const invalid = fields
      .map((field) => ({ name: field!.name, errors: this.getFieldError(field!.name) }))
      .filter((item) => item.errors.length > 0);
    if (invalid.length) {
      return { ok: false as const, invalid };
    }
    return { ok: true as const, values: this.state.values };
  }

  setSubmit(fn: () => void) {
    this.onSubmit = fn;
  }

  submit() {
    this.onSubmit?.();
  }
}

async function runRule(
  rule: FormRule,
  value: unknown,
  values: Record<string, unknown>,
): Promise<string | null> {
  if (rule.validator) {
    try {
      await rule.validator(rule, value, values);
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  }
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);
  if (rule.required && isEmpty) return rule.message ?? '此项为必填项';
  if (isEmpty) return null;

  const text = String(value);
  if (rule.whitespace && !text.trim()) return rule.message ?? '此项为必填项';
  if (rule.min !== undefined) {
    const length = typeof value === 'number' ? value : Array.isArray(value) ? value.length : text.length;
    if (length < rule.min) return rule.message ?? `不能少于 ${rule.min}`;
  }
  if (rule.max !== undefined) {
    const length = typeof value === 'number' ? value : Array.isArray(value) ? value.length : text.length;
    if (length > rule.max) return rule.message ?? `不能多于 ${rule.max}`;
  }
  if (rule.len !== undefined && text.length !== rule.len) return rule.message ?? `长度必须为 ${rule.len}`;
  if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return rule.message ?? '邮箱格式不正确';
  }
  if (rule.type === 'url' && !/^https?:\/\/\S+$/.test(text)) return rule.message ?? '链接格式不正确';
  if (rule.type === 'number' && Number.isNaN(Number(value))) return rule.message ?? '请输入数字';
  if (rule.pattern && !rule.pattern.test(text)) return rule.message ?? '格式不正确';
  return null;
}

interface FormContextValue {
  store: FormStore;
  layout: 'horizontal' | 'vertical' | 'inline';
  requiredMark: boolean;
  disabled: boolean;
  size?: 'small' | 'middle' | 'large';
  colon: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);

export function useForm<Values = Record<string, unknown>>(
  form?: FormInstance<Values>,
  initialValues?: Record<string, unknown>,
): [FormInstance<Values>] {
  const storeRef = useRef<FormStore | null>(null);
  if (!storeRef.current) storeRef.current = new FormStore(initialValues);
  const store = storeRef.current;

  const instanceRef = useRef<FormInstance<Values> | null>(null);
  instanceRef.current ??= {
    getFieldValue: (name) => getPath(store.getSnapshot().values, name),
    getFieldsValue: () => store.getSnapshot().values as Values,
    setFieldValue: (name, value) => store.setValue(name, value),
    setFieldsValue: (values) => store.setValues(values as Record<string, unknown>),
    resetFields: (names) => store.reset(names),
    validateFields: async (names) => {
      const result = await store.validateAll(names);
      if (!result.ok) {
        const error = new Error('Validation failed') as Error & {
          errorFields: { name: NamePath; errors: string[] }[];
        };
        error.errorFields = result.invalid;
        throw error;
      }
      return result.values as Values;
    },
    submit: () => store.submit(),
    getFieldError: (name) => store.getFieldError(name),
    isFieldTouched: (name) => !!store.getSnapshot().touched[pathKey(name)],
    scrollToField: (name) => {
      const el = document.querySelector<HTMLElement>(`[data-field="${pathKey(name)}"]`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.querySelector<HTMLElement>('input, textarea, button')?.focus({ preventScroll: true });
    },
  };

  const instance = form ?? instanceRef.current;
  (instance as unknown as Record<string, FormStore>)[STORE_KEY] = store;
  return [instance];
}

export interface FormProps<Values = Record<string, unknown>>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form?: FormInstance<Values>;
  initialValues?: Record<string, unknown>;
  layout?: 'horizontal' | 'vertical' | 'inline';
  requiredMark?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  colon?: boolean;
  labelCol?: { span?: number };
  wrapperCol?: { span?: number };
  onFinish?: (values: Values) => void;
  onFinishFailed?: (info: { values: Values; errorFields: { name: NamePath; errors: string[] }[] }) => void;
  onValuesChange?: (changed: Record<string, unknown>, all: Values) => void;
  children?: ReactNode;
}

function FormRoot<Values = Record<string, unknown>>({
  form,
  initialValues,
  layout = 'horizontal',
  requiredMark = true,
  disabled = false,
  size,
  colon = true,
  onFinish,
  onFinishFailed,
  onValuesChange,
  className,
  children,
  ...rest
}: FormProps<Values>) {
  const [instance] = useForm(form, initialValues);
  const store = (instance as unknown as { __store?: FormStore }).__store;
  void store;

  const handleFinish = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const storeInternal = getStore(instance);
    const result = await storeInternal.validateAll();
    if (!result.ok) {
      onFinishFailed?.({ values: result.values as Values, errorFields: result.invalid });
      return;
    }
    onFinish?.(result.values as Values);
  };

  useEffect(() => {
    getStore(instance).setSubmit(() => {
      void handleFinish();
    });
  });

  const context = useMemo<FormContextValue>(
    () => ({ store: getStore(instance), layout, requiredMark: !!requiredMark, disabled, size, colon }),
    [instance, layout, requiredMark, disabled, size, colon],
  );

  const lastValues = useRef(getInstanceSnapshot(instance).values);
  useEffect(() => {
    const unsubscribe = getStore(instance).subscribe(() => {
      const next = getInstanceSnapshot(instance).values;
      if (next !== lastValues.current) {
        const changed: Record<string, unknown> = {};
        Object.keys(next).forEach((key) => {
          if (next[key] !== lastValues.current[key]) changed[key] = next[key];
        });
        lastValues.current = next;
        if (Object.keys(changed).length) onValuesChange?.(changed, next as Values);
      }
    });
    return unsubscribe;
  }, [instance, onValuesChange]);

  return (
    <FormContext.Provider value={context}>
      <form
        className={cn('w-full', layout === 'inline' && 'flex flex-wrap items-end gap-4', className)}
        onSubmit={handleFinish}
        noValidate
        {...rest}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

function getStore(instance: FormInstance<any>): FormStore {
  return (instance as unknown as Record<string, FormStore>)[STORE_KEY];
}
function getInstanceSnapshot<V>(instance: FormInstance<V>) {
  return getStore(instance).getSnapshot();
}

export interface FormItemProps {
  name?: NamePath;
  label?: ReactNode;
  rules?: FormRule[];
  required?: boolean;
  initialValue?: unknown;
  extra?: ReactNode;
  help?: ReactNode;
  validateStatus?: 'success' | 'warning' | 'error' | 'validating';
  validateTrigger?: string | string[];
  /** 受控属性名，默认 value；Checkbox / Switch 用 checked */
  valuePropName?: string;
  getValueFromEvent?: (...args: unknown[]) => unknown;
  normalize?: (value: unknown, prevValue: unknown, allValues: Record<string, unknown>) => unknown;
  noStyle?: boolean;
  hidden?: boolean;
  colon?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  tooltip?: ReactNode;
  htmlFor?: string;
}

function FormItem({
  name,
  label,
  rules = [],
  required,
  initialValue,
  extra,
  help,
  validateStatus,
  validateTrigger = 'onChange',
  valuePropName = 'value',
  getValueFromEvent,
  normalize,
  noStyle,
  hidden,
  colon,
  className,
  style,
  children,
  htmlFor,
}: FormItemProps) {
  const context = useContext(FormContext);
  const store = context?.store;
  const key = name !== undefined ? pathKey(name) : undefined;

  useEffect(() => {
    if (!store || name === undefined) return;
    if (initialValue !== undefined) store.setValue(name, initialValue);
    store.registerField(name, rules);
    return () => store.unregisterField(name);
  }, [store, key]); // eslint-disable-line react-hooks/exhaustive-deps

  const snapshot = useSyncExternalStore(
    useCallback(
      (listener: () => void) => (store ? store.subscribe(listener) : () => undefined),
      [store],
    ),
    () => (store ? store.getSnapshot() : null),
    () => null,
  );

  if (hidden) return null;

  const value = snapshot && name !== undefined ? getPath(snapshot.values, name) : undefined;
  const errors = (snapshot && key ? snapshot.errors[key] : undefined) ?? EMPTY;
  const status = validateStatus ?? (errors.length ? 'error' : undefined);
  const triggers = Array.isArray(validateTrigger) ? validateTrigger : [validateTrigger];
  const isRequired = required ?? rules.some((rule) => rule.required);

  let control = children;
  if (store && name !== undefined && isValidElement(children)) {
    const child = Children.only(children) as ReactElement<Record<string, unknown>>;
    const originalOnChange = child.props.onChange as ((...args: unknown[]) => void) | undefined;
    const originalOnBlur = child.props.onBlur as ((...args: unknown[]) => void) | undefined;
    const props: Record<string, unknown> = {
      id: child.props.id ?? `field-${key}`,
      [valuePropName]: value,
      status: status === 'error' ? 'error' : child.props.status,
      'aria-invalid': status === 'error' || undefined,
    };

    if (triggers.includes('onChange')) {
      props.onChange = (...args: unknown[]) => {
        originalOnChange?.(...args);
        const event = args[0];
        const raw = getValueFromEvent ? getValueFromEvent(...args) : extractValue(event, args);
        const next = normalize ? normalize(raw, value, store.getSnapshot().values) : raw;
        store.setValue(name, next);
        store.touch(name);
        if (rules.length) void store.validate(name);
      };
    }
    if (triggers.includes('onBlur')) {
      props.onBlur = (...args: unknown[]) => {
        originalOnBlur?.(...args);
        store.touch(name);
        void store.validate(name);
      };
    }
    control = cloneElement(child, props);
  }

  const vertical = context?.layout === 'vertical' || context?.layout === 'inline' || !label;
  const labelNode =
    label !== undefined ? (
      <label
        htmlFor={htmlFor ?? (key ? `field-${key}` : undefined)}
        className={cn(
          'flex items-center gap-1 text-sm font-medium text-fg-secondary',
          vertical
            ? 'mb-1.5'
            : 'mb-0 w-[92px] shrink-0 justify-end pt-2.5 text-end',
        )}
      >
        {isRequired && <span className="text-danger">*</span>}
        <span className="min-w-0">{label}</span>
        {(colon ?? context?.colon) && !vertical ? <span className="text-fg-secondary">：</span> : null}
      </label>
    ) : null;

  const message = errors.length ? errors[0] : (help as string | undefined);

  if (noStyle) return <>{control}</>;

  return (
    <div
      data-field={key}
      className={cn('flex min-w-0', vertical ? 'flex-col' : 'flex-row gap-3', className)}
      style={style}
      data-has-error={errors.length > 0 || undefined}
    >
      {labelNode}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            errors.length > 0 && '[&_.ax-field]:rounded-b-none [&_.ax-field]:border-danger',
          )}
        >
          {control}
        </div>
        {message && (
          <div
            className={cn(
              'text-xs leading-relaxed',
              errors.length > 0
                ? // Astryx 的错误提示是贴在输入框下方的柔和红块（只留下面两角）
                  'rounded-b-element bg-danger-bg px-2 py-1 text-danger-fg'
                : 'mt-1 text-fg-tertiary',
            )}
            role={errors.length ? 'alert' : undefined}
          >
            {message}
          </div>
        )}
        {extra && <div className="mt-1 text-xs text-fg-tertiary">{extra}</div>}
      </div>
    </div>
  );
}

function extractValue(event: unknown, args: unknown[]): unknown {
  if (args.length > 1) return args[0];
  if (event && typeof event === 'object' && 'target' in event) {
    return (event as { target: { value?: unknown; checked?: boolean; files?: unknown } }).target.checked !==
      undefined
      ? (event as { target: { checked: boolean } }).target.checked
      : (event as { target: { value: unknown } }).target.value;
  }
  return event;
}

export function FormList({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export const Form = Object.assign(FormRoot, {
  Item: FormItem,
  List: FormList,
  useForm,
  useWatch: <Values = Record<string, unknown>>(name: NamePath, form: FormInstance<Values>) => {
    const store = (form as unknown as Record<string, FormStore>)[STORE_KEY];
    return useSyncExternalStore(
      (listener) => store.subscribe(listener),
      () => getPath(store.getSnapshot().values, name),
      () => undefined,
    );
  },
});
