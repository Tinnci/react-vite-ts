import { loadPyodide, PyodideInterface } from 'pyodide';

// ------------------- Type Definitions -------------------

export interface CodeLocation {
  lineno: number;
  col_offset: number;
  end_lineno: number;
  end_col_offset: number;
}
export type VariableLocations = Record<string, CodeLocation[]>;

export interface ExecutionStep {
  lineno: number;
  globals: Record<string, any>;
  locals: Record<string, any>;
}

export interface AnalysisResult {
  locations: VariableLocations;
  execution_steps: ExecutionStep[];
  error?: string;
  runtime_error?: string;
}

// ------------------- Python Analysis Script -------------------

const pythonAnalyzerScript = `
import ast
import sys
import json

class LocationVisitor(ast.NodeVisitor):
    def __init__(self):
        self.locations = {}

    def visit_Name(self, node):
        if isinstance(node.ctx, (ast.Load, ast.Store, ast.Del)):
            if not (hasattr(node, 'parent') and isinstance(node.parent, ast.Attribute) and node.parent.attr == node.id):
                var_name = node.id
                if var_name not in self.locations:
                    self.locations[var_name] = []
                self.locations[var_name].append({
                    "lineno": node.lineno,
                    "col_offset": node.col_offset,
                    "end_lineno": node.end_lineno,
                    "end_col_offset": node.end_col_offset,
                    "type": "variable"
                })
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        class_name = node.name
        if class_name not in self.locations:
            self.locations[class_name] = []
        self.locations[class_name].append({
            "lineno": node.lineno,
            "col_offset": node.col_offset,
            "end_lineno": node.end_lineno,
            "end_col_offset": node.end_col_offset,
            "type": "class"
        })
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        func_name = node.name
        if func_name not in self.locations:
            self.locations[func_name] = []
        self.locations[func_name].append({
            "lineno": node.lineno,
            "col_offset": node.col_offset,
            "end_lineno": node.end_lineno,
            "end_col_offset": node.end_col_offset,
            "type": "function"
        })
        self.generic_visit(node)

    def visit(self, node):
        for child in ast.iter_child_nodes(node):
            child.parent = node
        super().visit(node)

def analyze(code):
    result = {}
    # AST 变量、类、函数位置
    try:
        tree = ast.parse(code)
        visitor = LocationVisitor()
        visitor.visit(tree)
        result['locations'] = visitor.locations
    except SyntaxError as e:
        return json.dumps({"error": f"Syntax Error: {e}", "locations": {}, "execution_steps": []})

    # 执行流跟踪
    steps = []
    def tracer(frame, event, arg):
        if event == 'line':
            lineno = frame.f_lineno
            if 1 <= lineno <= len(code.splitlines()):
                def safe_serialize(val):
                    try:
                        json.dumps(val)
                        return val
                    except Exception:
                        return str(val)
                user_globals = {k: safe_serialize(v) for k, v in frame.f_globals.items() if not k.startswith('__')}
                user_locals = {k: safe_serialize(v) for k, v in frame.f_locals.items() if not k.startswith('__')}
                steps.append({
                    'lineno': lineno,
                    'globals': user_globals,
                    'locals': user_locals
                })
        return tracer

    old_trace = sys.gettrace()
    sys.settrace(tracer)
    try:
        exec(compile(code, '<string>', 'exec'), {})
    except Exception as e:
        result['runtime_error'] = str(e)
    finally:
        sys.settrace(old_trace)
    result['execution_steps'] = steps
    return json.dumps(result)
`;

// ------------------- Pyodide Service -------------------

type ProgressCallback = (status: string) => void;

class PyodideService {
  private pyodide: PyodideInterface | null = null;
  private isInitialized = false;

  async init(onProgress?: ProgressCallback): Promise<void> {
    if (this.isInitialized) return;
    if (onProgress) onProgress('正在加载 Pyodide 运行时...');
    this.pyodide = await loadPyodide({
      indexURL: '/pyodide/',
    });
    if (onProgress) onProgress('Pyodide 加载完成，正在加载分析脚本...');
    this.pyodide.runPython(pythonAnalyzerScript);
    this.isInitialized = true;
    if (onProgress) onProgress('Pyodide 初始化完成');
  }

  async analyzeCode(code: string, onProgress?: ProgressCallback): Promise<AnalysisResult> {
    await this.init(onProgress);
    if (!this.pyodide) throw new Error('Pyodide 未初始化');
    try {
      if (onProgress) onProgress('正在分析 Python 代码...');
      const analyzeFn = this.pyodide.globals.get('analyze');
      const jsonResult = analyzeFn(code);
      const result: AnalysisResult = JSON.parse(jsonResult);
      if (onProgress) onProgress('分析完成');
      return result;
    } catch (error: any) {
      if (onProgress) onProgress('分析出错');
      console.error('Python 代码分析出错:', error);
      return {
        locations: {},
        execution_steps: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export const pyodideService = new PyodideService(); 