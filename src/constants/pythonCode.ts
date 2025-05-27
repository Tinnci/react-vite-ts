export const fullPythonCode = `
class Device:
    # --- 类变量 ---
    status = "Offline"  # 所有实例共享
    device_count = 0    # 追踪实例数量
    shared_log = []     # 可变类型类变量

    def __init__(self, device_id, location):
        # --- 实例变量初始化 ---
        # 'self' 指向当前创建的实例
        self.device_id = device_id
        self.location = location
        Device.device_count += 1 # 修改类变量
        self.__class__.shared_log.append(f"{self.device_id}: Initialized")


    @classmethod
    def get_device_count(cls):
        # 'cls' 指向类本身 (Device)
        return cls.device_count

    @classmethod
    def change_global_status(cls, new_status):
        cls.status = new_status # 修改类变量

    def get_info(self):
        # 'self' 指向调用此方法的实例
        # 访问实例变量和类变量
        return f"ID: {self.device_id}, Loc: {self.location}, Status: {self.status}"

    def log_activity(self, activity):
        # 修改可变类变量
        # self.__class__确保访问的是类本身的shared_log
        self.__class__.shared_log.append(f"{self.device_id}: {activity}")


class SmartDevice(Device): # 继承自 Device
    # --- 子类的类变量 ---
    software_version = "1.0"

    def __init__(self, device_id, location, ip_address):
        super().__init__(device_id, location) # 调用父类的__init__
        # --- 子类特有的实例变量 ---
        self.ip_address = ip_address

    def get_info(self): # 方法覆盖
        base_info = super().get_info() # 调用父类的方法
        return f"{base_info}, IP: {self.ip_address}, SW: {self.software_version}"

    @classmethod
    def upgrade_software_all_smart_devices(cls, new_version):
        cls.software_version = new_version # 修改SmartDevice的类变量


# --- 动画开始 ---
# 1. 创建 Device 实例 d1
d1 = Device("Sensor01", "Lab A")

# 2. 创建 Device 实例 d2
d2 = Device("Actuator02", "Lab B")

# 3. 实例变量的独立性
d1.location = "Rooftop" # 只修改 d1 的 location

# 4. 实例"覆盖"类变量
d1.status = "Online" # d1 创建自己的 'status' 实例变量

# 5. 通过类方法修改类变量
Device.change_global_status("Maintenance")

# 6. 修改可变类变量 (shared_log)
d1.log_activity("System Boot")
d2.log_activity("Valve Open")

# 7. 创建 SmartDevice 实例 sd1
sd1 = SmartDevice("Cam03", "Entrance", "192.168.1.100")

# 8. 子类修改其自身的类变量 (不影响父类)
SmartDevice.software_version = "1.1"

# 9. 子类修改继承的类变量 (status)
# 这会在 SmartDevice 类上创建一个 'status' 属性
SmartDevice.status = "Active"


# --- 打印信息查看 ---
# print(f"d1 info: {d1.get_info()}")
# print(f"d2 info: {d2.get_info()}")
# print(f"sd1 info: {sd1.get_info()}")
# print(f"Total devices: {Device.get_device_count()}")
# print(f"Device class status: {Device.status}")
# print(f"SmartDevice class status: {SmartDevice.status}")
# print(f"Shared Log: {Device.shared_log}")
`; 