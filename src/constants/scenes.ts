// scenes.ts
// 只保留静态描述，不包含 action 逻辑

export interface Scene {
  highlightLines: number[];
  highlightedVars?: string[];
  explanation: string;
  output?: string;
}

export const scenes: Scene[] = [
  {
    highlightLines: [1, 2, 3, 4, 5, 6],
    highlightedVars: ["status", "device_count", "shared_log"],
    explanation: "定义 <code>Device</code> 类及其类变量：<code>status</code>, <code>device_count</code>, <code>shared_log</code>。这些变量属于类本身。",
    output: "",
  },
  {
    highlightLines: [7, 8, 9, 10, 11, 12, 13],
    explanation: "定义 <code>Device</code> 类的构造方法 <code>__init__</code>。当创建实例时，此方法会被调用。<hover-target line={12}><code>self</code></hover-target> 是对新创建实例的引用。",
    output: "",
  },
  {
    highlightLines: [15, 16, 17, 18, 19, 20, 21],
    explanation: "定义类方法 <code>get_device_count</code> 和 <code>change_global_status</code>。<code>@classmethod</code> 装饰器使其第一个参数 <code>cls</code> 引用类本身。",
    output: "",
  },
  {
    highlightLines: [22, 23, 24, 25, 26, 27, 28, 29, 30],
    explanation: "定义实例方法 <code>get_info</code> 和 <code>log_activity</code>。这些方法通过 <code>self</code> 操作实例数据或类数据。",
    output: "",
  },
  {
    highlightLines: [32, 33, 34],
    explanation: "定义 <code>SmartDevice</code> 类，它继承自 <code>Device</code> 类。<code>SmartDevice</code> 拥有自己的类变量 <code>software_version</code>，并继承 <code>Device</code> 的所有属性和方法。",
    output: "",
  },
  {
    highlightLines: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    explanation: "定义 <code>SmartDevice</code> 的 <code>__init__</code>, <code>get_info</code> (覆盖父类方法), 和类方法 <code>upgrade_software_all_smart_devices</code>。<code>super()</code> 用于调用父类的方法。",
    output: "",
  },
  {
    highlightLines: [50, 51],
    explanation: "创建 <code>Device</code> 类的第一个实例 <code>d1</code>。<br>1. 调用 <code>Device.__init__(d1, \"Sensor01\", \"Lab A\")</code>。<br>2. <code>self</code> 在 <code>__init__</code> 中指向 <code>d1</code>。<br>3. 实例变量 <code>d1.device_id</code> 和 <code>d1.location</code> 被设置。<br>4. 类变量 <code>Device.device_count</code> 增加到 1。<br>5. 活动被记录到共享日志 <code>Device.shared_log</code>。",
    output: "",
  },
  {
    highlightLines: [53, 54],
    explanation: "创建 <code>Device</code> 类的第二个实例 <code>d2</code>。<br>1. 调用 <code>Device.__init__(d2, \"Actuator02\", \"Lab B\")</code>。<br>2. 实例变量 <code>d2.device_id</code> 和 <code>d2.location</code> 被设置。<br>3. 类变量 <code>Device.device_count</code> 增加到 2。<br>4. 活动被记录到共享日志。",
    output: "",
  },
  {
    highlightLines: [56, 57],
    explanation: "修改实例 <code>d1</code> 的实例变量 <code>location</code>。<br>这只影响 <code>d1</code>，不影响 <code>d2</code> 的 <code>location</code>，体现了实例变量的独立性。",
    output: "",
  },
  {
    highlightLines: [59, 60],
    explanation: "给实例 <code>d1</code> 的属性 <code>status</code> 赋值为 \"Online\"。<br>由于 <code>d1</code> 原本没有名为 <code>status</code> 的实例变量，Python 会为 <code>d1</code> 创建一个新的实例变量 <code>status</code>。<br>这个实例变量'遮蔽'了类变量 <code>Device.status</code>。<br><code>Device.status</code> (类变量) 和 <code>d2.status</code> (通过类访问) 保持不变。",
    output: "",
  },
  {
    highlightLines: [62, 63],
    explanation: "通过类方法 <code>Device.change_global_status(\"Maintenance\")</code> 修改类变量 <code>Device.status</code>。<br>所有未'覆盖'此变量的实例 (如 <code>d2</code>) 在访问 <code>status</code> 时都会看到新值。<br><code>d1</code> 因为有自己的实例变量 <code>status</code>，所以不受影响。",
    output: "",
  },
  {
    highlightLines: [65, 66, 67],
    explanation: "实例 <code>d1</code> 和 <code>d2</code> 调用 <code>log_activity</code> 方法。<br>此方法通过 <code>self.__class__.shared_log.append(...)</code> 修改了可变的类变量 <code>Device.shared_log</code>。<br>由于 <code>shared_log</code> 是一个列表（可变类型），所有实例共享对这同一个列表对象的引用。因此，一个实例的修改对所有其他实例可见（当它们访问这个类变量时）。",
    output: "",
  },
  {
    highlightLines: [69, 70],
    explanation: "创建 <code>SmartDevice</code> 的实例 <code>sd1</code>。<br>1. 调用 <code>SmartDevice.__init__</code>，它内部调用 <code>super().__init__</code> (即 <code>Device.__init__</code>)。<br>2. <code>sd1</code> 获得实例变量 <code>device_id</code>, <code>location</code> (来自父类初始化) 和 <code>ip_address</code> (来自子类初始化)。<br>3. <code>Device.device_count</code> 增加到 3。<br>4. 活动记录到 <code>Device.shared_log</code>。",
    output: "",
  },
  {
    highlightLines: [72, 73],
    explanation: "修改子类 <code>SmartDevice</code> 的类变量 <code>software_version</code>。<br>这只影响 <code>SmartDevice</code> 类及其未来的实例（或现有未覆盖此变量的实例）。不影响父类 <code>Device</code>。",
    output: "",
  },
  {
    highlightLines: [75, 76, 77],
    explanation: "修改 <code>SmartDevice.status</code> 为 \"Active\"。<br>由于 <code>SmartDevice</code> 本身没有 <code>status</code> 类变量，这会在 <code>SmartDevice</code> 类上创建一个新的类变量 <code>status</code>。<br>它遮蔽了从 <code>Device</code> 继承的 <code>status</code>。<br><code>Device.status</code> 保持不变。",
    output: "",
  },
  {
    highlightLines: [80, 81, 82, 83, 84, 85, 86, 87],
    explanation: "最后，我们打印所有对象的信息来回顾它们当前的状态。",
    output: "",
  },
]; 