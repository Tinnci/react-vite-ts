import { loadPyodide } from 'pyodide';

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
                    "end_col_offset": node.end_col_offset
                })
        self.generic_visit(node)

    def visit(self, node):
        for child in ast.iter_child_nodes(node):
            child.parent = node
        super().visit(node)

def analyze(code):
    result = {}
    # AST 变量位置
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

class PyodideService {
  private pyodide: any = null;

  async initialize(): Promise<void> {
    if (this.pyodide) return;
    this.pyodide = await loadPyodide({
      indexURL: '/pyodide/',
    });
    this.pyodide.runPython(pythonAnalyzerScript);
  }

  async analyzeCode(code: string): Promise<AnalysisResult> {
    await this.initialize();
    if (!this.pyodide) throw new Error('Pyodide not initialized');
    try {
      const analyzeFn = this.pyodide.globals.get('analyze');
      const jsonResult = analyzeFn(code);
      const result: AnalysisResult = JSON.parse(jsonResult);
      return result;
    } catch (error) {
      console.error('Error during Python code analysis:', error);
      return {
        locations: {},
        execution_steps: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export const pyodideService = new PyodideService(); 