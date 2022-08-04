import type { ReactElement } from 'react';
import type { ReducerAction } from './useForm';

export type InternalNamePath = (string | number)[];
export type NamePath = string | number | InternalNamePath;

export type StoreValue = any;
export type Store = Record<string, StoreValue>;

export interface Meta {
  touched: boolean;
  validating: boolean;
  errors: string[];
  warnings: string[];
  name: InternalNamePath;
}

export interface InternalFieldData extends Meta {
  value: StoreValue;
}

/**
 * Used by `setFields` config
 */
export interface FieldData extends Partial<Omit<InternalFieldData, 'name'>> {
  name: NamePath;
}

export type RuleType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'method'
  | 'regexp'
  | 'integer'
  | 'float'
  | 'object'
  | 'enum'
  | 'date'
  | 'url'
  | 'hex'
  | 'email';

type Validator = (
  rule: RuleObject,
  value: StoreValue,
  callback: (error?: string) => void,
) => Promise<void | any> | void;

export type RuleRender = (form: FormInstance) => RuleObject;

export interface ValidatorRule {
  warningOnly?: boolean;
  message?: string | ReactElement;
  validator: Validator;
}

interface BaseRule {
  warningOnly?: boolean;
  enum?: StoreValue[];
  len?: number;
  max?: number;
  message?: string | ReactElement;
  min?: number;
  pattern?: RegExp;
  required?: boolean;
  transform?: (value: StoreValue) => StoreValue;
  type?: RuleType;
  whitespace?: boolean;

  /** Customize rule level `validateTrigger`. Must be subset of Field `validateTrigger` */
  validateTrigger?: string | string[];
}

type AggregationRule = BaseRule & Partial<ValidatorRule>;

interface ArrayRule extends Omit<AggregationRule, 'type'> {
  type: 'array';
  defaultField?: RuleObject;
}

export type RuleObject = AggregationRule | ArrayRule;

export type Rule = RuleObject | RuleRender;

export interface ValidateErrorEntity<Values = any> {
  values: Values;
  errorFields: { name: InternalNamePath; errors: string[] }[];
  outOfDate: boolean;
}

export interface FieldEntity {
  onStoreChange: (
    store: Store,
    namePathList: InternalNamePath[] | null,
    info: ValuedNotifyInfo,
  ) => void;
  isFieldTouched: () => boolean;
  isFieldDirty: () => boolean;
  isFieldValidating: () => boolean;
  isListField: () => boolean;
  isList: () => boolean;
  isPreserve: () => boolean;
  validateRules: (options?: ValidateOptions) => Promise<RuleError[]>;
  getMeta: () => Meta;
  getNamePath: () => InternalNamePath;
  getErrors: () => string[];
  getWarnings: () => string[];
  props: {
    name?: NamePath;
    rules?: Rule[];
    dependencies?: NamePath[];
    initialValue?: any;
  };
}

export interface FieldError {
  name: InternalNamePath;
  errors: string[];
  warnings: string[];
}

export interface RuleError {
  errors: string[];
  rule: RuleObject;
}

export interface ValidateOptions {
  triggerName?: string;
  validateMessages?: ValidateMessages;
  /**
   * Recursive validate. It will validate all the name path that contains the provided one.
   * e.g. ['a'] will validate ['a'] , ['a', 'b'] and ['a', 1].
   */
  recursive?: boolean;
}

export type InternalValidateFields<Values = any> = (
  nameList?: NamePath[],
  options?: ValidateOptions,
) => Promise<Values>;
export type ValidateFields<Values = any> = (nameList?: NamePath[]) => Promise<Values>;

// >>>>>> Info
interface ValueUpdateInfo {
  type: 'valueUpdate';
  source: 'internal' | 'external';
}

interface ValidateFinishInfo {
  type: 'validateFinish';
}

interface ResetInfo {
  type: 'reset';
}

interface SetFieldInfo {
  type: 'setField';
  data: FieldData;
}

interface DependenciesUpdateInfo {
  type: 'dependenciesUpdate';
  /**
   * Contains all the related `InternalNamePath[]`.
   * a <- b <- c : change `a`
   * relatedFields=[a, b, c]
   */
  relatedFields: InternalNamePath[];
}

export type NotifyInfo =
  | ValueUpdateInfo
  | ValidateFinishInfo
  | ResetInfo
  | SetFieldInfo
  | DependenciesUpdateInfo;

export type ValuedNotifyInfo = NotifyInfo & {
  store: Store;
};

export interface Callbacks<Values = any> {
  onValuesChange?: (changedValues: any, values: Values) => void;
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void;
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;
}

export interface InternalHooks {
  dispatch: (action: ReducerAction) => void;
  initEntityValue: (entity: FieldEntity) => void;
  registerField: (entity: FieldEntity) => () => void;
  useSubscribe: (subscribable: boolean) => void;
  setInitialValues: (values: Store, init: boolean) => void;
  setCallbacks: (callbacks: Callbacks) => void;
  getFields: (namePathList?: InternalNamePath[]) => FieldData[];
  setValidateMessages: (validateMessages: ValidateMessages) => void;
  setPreserve: (preserve?: boolean) => void;
}

/** Only return partial when type is not any */
type RecursivePartial<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object
        ? RecursivePartial<T[P]>
        : T[P];
    }
  : any;

export interface FormInstance<Values = any> {
  // Origin Form API
  // 按名称路径获取字段值
  getFieldValue: (name: NamePath) => StoreValue;

  // 按名称路径列表获取字段值列表
  getFieldsValue: (() => Values) & ((nameList: NamePath[] | true, filterFunc?: (meta: Meta) => boolean) => any);
  getFieldError: (name: NamePath) => string[];

  // 按名称路径列表获取字段错误列表
  getFieldsError: (nameList?: NamePath[]) => FieldError[];

  // 按名称路径获取字段警告
  getFieldWarning: (name: NamePath) => string[];

  // 检查是否触摸了字段列表
  isFieldsTouched: ((nameList?: NamePath[], allFieldsTouched?: boolean) => boolean) & ((allFieldsTouched?: boolean) => boolean);
  isFieldTouched: (name: NamePath) => boolean;

  // 检查字段是否正在验证
  isFieldValidating: (name: NamePath) => boolean;

  // 检查字段列表是否正在验证
  isFieldsValidating: (nameList: NamePath[]) => boolean;

  // 重置字段状态
  resetFields: (fields?: NamePath[]) => void;

  // 设置字段状态
  setFields: (fields: FieldData[]) => void;

   // 设置字段值
  setFieldsValue: (value: RecursivePartial<Values>) => void;

  // 触发字段进行验证
  validateFields: ValidateFields<Values>;

  // New API, 触发表单提交
  submit: () => void;
}

export type InternalFormInstance = Omit<FormInstance, 'validateFields'> & {
  validateFields: InternalValidateFields;

  /**
   * Passed by field context props
   */
  prefixName?: InternalNamePath;

  validateTrigger?: string | string[] | false;

  /**
   * Form component should register some content into store.
   * We pass the `HOOK_MARK` as key to avoid user call the function.
   */
  getInternalHooks: (secret: string) => InternalHooks | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventArgs = any[];

type ValidateMessage = string | (() => string);
export interface ValidateMessages {
  default?: ValidateMessage;
  required?: ValidateMessage;
  enum?: ValidateMessage;
  whitespace?: ValidateMessage;
  date?: {
    format?: ValidateMessage;
    parse?: ValidateMessage;
    invalid?: ValidateMessage;
  };
  types?: {
    string?: ValidateMessage;
    method?: ValidateMessage;
    array?: ValidateMessage;
    object?: ValidateMessage;
    number?: ValidateMessage;
    date?: ValidateMessage;
    boolean?: ValidateMessage;
    integer?: ValidateMessage;
    float?: ValidateMessage;
    regexp?: ValidateMessage;
    email?: ValidateMessage;
    url?: ValidateMessage;
    hex?: ValidateMessage;
  };
  string?: {
    len?: ValidateMessage;
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
  };
  number?: {
    len?: ValidateMessage;
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
  };
  array?: {
    len?: ValidateMessage;
    min?: ValidateMessage;
    max?: ValidateMessage;
    range?: ValidateMessage;
  };
  pattern?: {
    mismatch?: ValidateMessage;
  };
}

export type BaseFormProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>;

export type RenderProps = (values: Store, form: FormInstance) => JSX.Element | React.ReactNode;

export interface FormProps<Values = any> extends BaseFormProps {
  // Form 的初始值
  initialValues?: Store;

  // 设置由创建的表单实例 useForm
  form?: FormInstance<Values>;

  // 孩子元素
  children?: RenderProps | React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  // 	自定义表单渲染组件
  component?: false | string | React.FC<any> | React.ComponentClass<any>;

  // 控制表单字段状态。仅在 Redux 中使用
  fields?: FieldData[];

  // 带有 FormProvider 的配置名称
  name?: string;

  // 设置验证消息模板
  validateMessages?: ValidateMessages;

  // 当 Field 的值改变时触发
  onValuesChange?: Callbacks<Values>['onValuesChange'];

  // 当 Field 的任何值改变时触发
  onFieldsChange?: Callbacks<Values>['onFieldsChange'];

  // 表单提交成功时触发
  onFinish?: Callbacks<Values>['onFinish'];

  // 表单提交失败时触发
  onFinishFailed?: Callbacks<Values>['onFinishFailed'];

  // 使用规则验证配置触发点(触发时机), 值一般为 onBlur、 onChange
  validateTrigger?: string | string[] | false;

  // 删除字段时是否保留值
  preserve?: boolean;
}
