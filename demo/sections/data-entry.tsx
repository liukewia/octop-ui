import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, Lock, Plus, Search as SearchIcon, UploadCloud } from 'lucide-react';
import {
  Button,
  Cascader,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputNumber,
  Mentions,
  message,
  Radio,
  RadioGroup,
  Rate,
  Segmented,
  Select,
  Slider,
  Switch,
  Text,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
  type UploadFile,
} from '../../src';
import { Demo, Hint, Row, Section, Stack } from '../primitives';

const { TextArea, Password, Search, OTP } = Input;
const { RangePicker } = DatePicker;

const FRUIT = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
  { label: '西瓜', value: 'watermelon', disabled: true },
];

const GROUPED = [
  {
    label: '华东',
    options: [
      { label: '上海', value: 'sh' },
      { label: '杭州', value: 'hz' },
    ],
  },
  {
    label: '华南',
    options: [
      { label: '广州', value: 'gz' },
      { label: '深圳', value: 'sz' },
    ],
  },
];

const CASCADER = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      {
        value: 'hz',
        label: '杭州',
        children: [
          { value: 'xh', label: '西湖区' },
          { value: 'yh', label: '余杭区' },
        ],
      },
      { value: 'nb', label: '宁波', children: [{ value: 'hs', label: '海曙区' }] },
    ],
  },
  {
    value: 'js',
    label: '江苏',
    children: [
      { value: 'nj', label: '南京', children: [{ value: 'gl', label: '鼓楼区' }] },
    ],
  },
];

const TREE = [
  {
    key: 'design',
    title: '设计',
    children: [
      { key: 'design-token', title: '令牌' },
      { key: 'design-motion', title: '动效' },
    ],
  },
  {
    key: 'dev',
    title: '研发',
    children: [
      { key: 'dev-web', title: 'Web' },
      { key: 'dev-mini', title: '小程序' },
    ],
  },
];

/* --------------------------------------------------------------- 表单示例 */

const bugSchema = z.object({
  title: z
    .string()
    .min(5, '标题至少 5 个字。')
    .max(32, '标题最多 32 个字。'),
  description: z
    .string()
    .min(20, '描述至少 20 个字。')
    .max(100, '描述最多 100 个字。'),
  severity: z.enum(['blocker', 'normal', 'minor']),
  notify: z.boolean(),
});

type BugValues = z.infer<typeof bugSchema>;

function BugReportForm() {
  const form = useForm<BugValues>({
    resolver: zodResolver(bugSchema),
    defaultValues: { title: '', description: '', severity: 'normal', notify: true },
    mode: 'onTouched',
  });

  function onSubmit(values: BugValues) {
    message.success(`已提交：${values.title}`);
    form.reset(values); // 清掉 isDirty，内容留在框里
    // eslint-disable-next-line no-console
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-[520px] flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>标题</FormLabel>
              <FormControl>
                <Input placeholder="比如：抽屉关闭后焦点没回到触发按钮" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>一句话说清「在哪儿、做了什么、发生了什么」。</FormDescription>
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>严重程度</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { label: '阻塞发布', value: 'blocker' },
                      { label: '影响使用', value: 'normal' },
                      { label: '小瑕疵', value: 'minor' },
                    ]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notify"
            render={({ field }) => (
              <FormItem>
                <FormLabel>修复后通知我</FormLabel>
                <div className="flex h-10 items-center">
                  <FormControl>
                    <Switch checked={field.value} onChange={(next) => field.onChange(next)} />
                  </FormControl>
                  <span className="ms-3 text-xs text-fg-tertiary">有新进展时发信</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>复现步骤</FormLabel>
              <FormControl>
                <TextArea
                  rows={3}
                  maxLength={100}
                  showCount
                  placeholder="1. 打开结算页  2. 连点两次提交  3. 订单创建了两笔……"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button type="primary" htmlType="submit">
            提交工单
          </Button>
          <Button htmlType="button" onClick={() => form.reset()}>
            重置
          </Button>
          <span className="ms-auto text-xs text-fg-tertiary">
            {form.formState.isDirty ? '有未提交的修改' : '尚未修改'}
          </span>
        </div>
      </form>
    </Form>
  );
}

export function DataEntry() {
  const [count, setCount] = useState(0);
  const [tags, setTags] = useState<string[]>(['design']);
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>([
    dayjs(),
    dayjs().add(6, 'day'),
  ]);
  const [files, setFiles] = useState<UploadFile[]>([
    { uid: '1', name: '需求文档.pdf', status: 'done', size: 48213 },
  ]);
  const [keys, setKeys] = useState<string[]>(['a']);
  const [agree, setAgree] = useState(false);

  return (
    <Section
      id="data-entry"
      title="数据录入"
      api="Input / Select / DatePicker / Form"
      desc="输入框、选择器、日期选择和表单。"
    >
      <Demo label="输入框" code="Input" dir="column">
        <Input placeholder="基础输入框" />
        <Input placeholder="带前缀" prefix={<Lock size={14} />} />
        <Input placeholder="可清空" allowClear defaultValue="清我一下" />
        <Input placeholder="后缀图标" suffix={<Eye size={14} />} />
        <Input placeholder="计数" showCount maxLength={20} defaultValue="20 字上限" />
      </Demo>

      <Demo label="尺寸 / 状态 / 变体" code="size / status / variant" dir="column">
        <Row>
          <Input size="small" placeholder="small" className="!w-[96px]" />
          <Input placeholder="middle" className="!w-[96px]" />
          <Input size="large" placeholder="large" className="!w-[96px]" />
        </Row>
        <Input status="error" defaultValue="错误态" prefix={<Lock size={14} />} />
        <Input variant="filled" placeholder="filled（无描边）" />
        <Input variant="borderless" placeholder="borderless" />
      </Demo>

      <Demo label="前后缀组合" code="addonBefore / addonAfter" span="full" dir="column">
        <Input addonBefore="https://" addonAfter=".octop.dev" defaultValue="docs" />
        <Input placeholder="搜索框" prefix={<SearchIcon size={14} />} allowClear />
      </Demo>

      <Demo label="多行与密码" code="TextArea / Password" dir="column">
        <TextArea placeholder="固定行数" rows={3} />
        <TextArea placeholder="autoSize：1–4 行" autoSize={{ minRows: 1, maxRows: 4 }} />
        <Password placeholder="密码" visibilityToggle />
        <Search
          placeholder="回车搜索"
          enterButton
          onSearch={(v, _e, info) => {
            // eslint-disable-next-line no-console
            console.log('search', v, info?.source);
          }}
        />
      </Demo>

      <Demo label="验证码" code="Input.OTP" span="full">
        <Stack className="w-auto items-center gap-2">
          <OTP length={6} />
          <Hint>支持整串粘贴与方向键移动，退格回到上一格。</Hint>
        </Stack>
        <Stack className="w-auto items-center gap-2">
          <OTP length={4} mask separator={<span className="px-1 text-fg-disabled">·</span>} />
          <Hint>mask 遮罩 + 自定义分隔符。</Hint>
        </Stack>
      </Demo>

      <Demo label="数字输入" code="InputNumber" dir="column">
        <InputNumber defaultValue={1280} min={0} max={9999} step={10} className="!w-full" />
        <InputNumber
          defaultValue={1299}
          prefix="¥"
          precision={2}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(d) => d.replace(/,/g, '')}
          className="!w-full"
        />
        <InputNumber placeholder="不可输入" controls={false} className="!w-full" />
      </Demo>

      <Demo label="选择器" code="Select options" dir="column">
        <Select options={FRUIT} placeholder="单选" allowClear className="!w-full" />
        <Select options={GROUPED} placeholder="分组" className="!w-full" />
        <Select
          mode="multiple"
          options={FRUIT}
          placeholder="多选"
          defaultValue={['apple']}
          maxTagCount={2}
          allowClear
          className="!w-full"
        />
        <Select
          mode="tags"
          placeholder="输入即建标签"
          tokenSeparators={[',', ' ']}
          className="!w-full"
        />
      </Demo>

      <Demo label="级联 / 树选择" code="Cascader / TreeSelect" dir="column">
        <Cascader options={CASCADER} placeholder="省 / 市 / 区" changeOnSelect className="!w-full" />
        <TreeSelect
          treeData={TREE}
          placeholder="选一个节点"
          treeDefaultExpandAll
          showSearch
          className="!w-full"
        />
        <TreeSelect
          treeData={TREE}
          multiple
          treeCheckable
          treeDefaultExpandAll
          maxTagCount={2}
          placeholder="可勾选"
          className="!w-full"
        />
      </Demo>

      <Demo label="日期与时间" code="DatePicker / RangePicker" span="full" dir="column">
        <Row>
          <DatePicker placeholder="选择日期" />
          <DatePicker picker="month" placeholder="选择月份" />
          <TimePicker placeholder="选择时间" minuteStep={5} />
        </Row>
        <RangePicker value={range} onChange={(v) => setRange(v)} className="!w-full" />
        <Hint>
          <code>onChange(date, dateString)</code> 两个参数：第一个是 dayjs 对象，第二个是格式化字符串。
        </Hint>
      </Demo>

      <Demo label="勾选与单选" code="Checkbox / Radio" dir="column">
        <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>
          我已阅读并同意协议
        </Checkbox>
        <Checkbox indeterminate>半选</Checkbox>
        <Checkbox disabled>禁用</Checkbox>
        <CheckboxGroup
          options={[
            { label: '设计', value: 'design' },
            { label: '研发', value: 'dev' },
            { label: '测试', value: 'qa' },
          ]}
          defaultValue={['design']}
        />
      </Demo>

      <Demo label="单选组" code="RadioGroup optionType" dir="column">
        <RadioGroup
          options={[
            { label: '按天', value: 'day' },
            { label: '按周', value: 'week' },
            { label: '按月', value: 'month' },
          ]}
          defaultValue="week"
        />
        <RadioGroup
          optionType="button"
          options={[
            { label: '日', value: 'd' },
            { label: '周', value: 'w' },
            { label: '月', value: 'm' },
          ]}
          defaultValue="w"
        />
        <Row>
          <Radio defaultChecked name="pay">
            微信
          </Radio>
          <Radio name="pay">支付宝</Radio>
          <Radio name="pay" disabled>
            银行卡
          </Radio>
        </Row>
      </Demo>

      <Demo label="开关" code="Switch checkedChildren" dir="column">
        <Row>
          <Switch defaultChecked />
          <Switch />
          <Switch size="small" defaultChecked />
          <Switch loading defaultChecked />
        </Row>
        <Row>
          <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Row>
      </Demo>

      <Demo label="滑块 / 评分" code="Slider / Rate" dir="column">
        <Slider defaultValue={42} />
        <Slider range defaultValue={[20, 68]} />
        <Slider
          defaultValue={30}
          dots
          marks={{ 0: '0', 50: '50', 100: '100' }}
          tooltip={{ formatter: (v) => `${v}%` }}
        />
        <Row className="justify-center">
          <Rate defaultValue={4} allowHalf />
          <Rate defaultValue={3} count={5} tooltips={['很差', '一般', '还行', '不错', '很好']} />
        </Row>
      </Demo>

      <Demo label="分段控件" code="Segmented" span="full" dir="column">
        <Segmented
          options={[
            { label: '日', value: 'day' },
            { label: '周', value: 'week' },
            { label: '月', value: 'month' },
          ]}
          defaultValue="week"
        />
        <Segmented block shape="round" defaultValue="全部" options={['全部', '待付款', '已完成']} />
        <Hint>滑块随选项移动，并适应标签宽度。</Hint>
      </Demo>

      <Demo label="表单" code="Form + react-hook-form + zod" span="full" dir="column">
        <BugReportForm />
        <Hint>
          <code>&lt;Form&gt;</code> 只是 <code>FormProvider</code>，校验交给 zod：
          <code>FormField</code> 包一层 <code>Controller</code>，
          <code>FormControl</code> 把 id / aria-invalid / aria-describedby 注给控件，
          <code>FormMessage</code> 读同一份字段状态，所以错误样式和读屏软件永远同步。
        </Hint>
      </Demo>

      <Demo label="上传" code="Upload drag" span="full" dir="column">
        <Upload
          drag
          multiple
          fileList={files}
          onChange={({ fileList }) => setFiles(fileList)}
          onRemove={(file) => {
            setFiles((prev) => prev.filter((f) => f.uid !== file.uid));
            return true;
          }}
        >
          <div className="flex flex-col items-center gap-1.5 py-4">
            <span className="text-fg-tertiary">
              <UploadCloud size={22} />
            </span>
            <span className="text-base text-fg">拖文件到这，或点击选择</span>
            <span className="text-xs text-fg-disabled">没有 customRequest 时本地模拟 320ms 完成</span>
          </div>
        </Upload>
        <Row className="mt-3">
          <Upload showUploadList={false}>
            <Button icon={<Plus size={16} />}>上传附件</Button>
          </Upload>
        </Row>
      </Demo>

      <Demo label="穿梭框" code="Transfer" span="full" dir="block">
        <Transfer
          dataSource={[
            { key: 'a', title: '设计令牌' },
            { key: 'b', title: '动效曲线' },
            { key: 'c', title: '焦点语言' },
            { key: 'd', title: '组件文档' },
            { key: 'e', title: '迁移指南', disabled: true },
          ]}
          targetKeys={keys}
          onChange={(next) => setKeys(next)}
          titles={['待选', '已选']}
          showSearch
        />
        <Hint>
          <code>onChange(nextKeys, direction, moveKeys)</code> 三个参数：新目标列、移动方向、本次移动的键。
        </Hint>
      </Demo>

      <Demo label="提及" code="Mentions" span="full" dir="column">
        <Mentions
          rows={3}
          placeholder="输入 @ 试试"
          options={[
            { value: 'ada', label: 'Ada Lovelace' },
            { value: 'linus', label: 'Linus Torvalds' },
            { value: 'grace', label: 'Grace Hopper' },
          ]}
        />
        <Hint>
          当前输入 <Text code>{count || '—'}</Text>
          <Button type="link" size="small" onClick={() => setCount(count + 1)}>
            计数 +1
          </Button>
        </Hint>
      </Demo>

      <Demo label="标签输入同理" code="Select mode=tags" span="full" dir="column">
        <Select
          mode="tags"
          value={tags}
          onChange={(v) => setTags(v as string[])}
          tokenSeparators={[',']}
          placeholder="输入后回车"
          className="!w-full"
        />
        <Hint>
          已选 {tags.length} 个：<Text code>{tags.join(', ') || '空'}</Text>
        </Hint>
      </Demo>
    </Section>
  );
}
