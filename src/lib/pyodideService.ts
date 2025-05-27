import { type PyodideInterface, loadPyodide } from 'pyodide';

export interface NodeLocation {
  lineno: number;
  col_offset: number;
  end_lineno: number;
  end_col_offset: number;
}
export type VariableLocations = Map<string, NodeLocation[]>;

class PyodideService {
  private pyodideInstance: PyodideInterface | null = null;

  async load() {
    if (this.pyodideInstance) return this.pyodideInstance;
    const pyodide = await loadPyodide({ indexURL: '/pyodide/' });
    this.pyodideInstance = pyodide;
    return pyodide;
  }

  async analyzeCode(code: string): Promise<VariableLocations> {
    const pyodide = await this.load();
    const analysisScript = `
import ast
import json

class LocationVisitor(ast.NodeVisitor):
    def __init__(self):
        self.locations = {}

    def visit_Name(self, node):
        # 只处理变量名（非属性、非关键字参数等）
        # node.ctx: ast.Load, ast.Store, ast.Del
        # 只高亮变量引用和赋值，不高亮属性名
        if isinstance(node.ctx, (ast.Load, ast.Store, ast.Del)):
            # 进一步排除 Attribute（obj.name 里的 name）
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
        # 给每个节点加 parent 属性，便于判断 Attribute
        for child in ast.iter_child_nodes(node):
            child.parent = node
        super().visit(node)

def analyze(code):
    try:
        tree = ast.parse(code)
        visitor = LocationVisitor()
        visitor.visit(tree)
        return json.dumps(visitor.locations)
    except SyntaxError as e:
        return json.dumps({"error": str(e)})

analyze
`;
    pyodide.runPython(analysisScript);
    const analyzeFn = pyodide.globals.get('analyze');
    const locationsJSON = analyzeFn(code);
    const locations = JSON.parse(locationsJSON);
    if (locations.error) {
      console.error("AST analysis failed:", locations.error);
      return new Map();
    }
    return new Map(Object.entries(locations)) as VariableLocations;
  }
}

export const pyodideService = new PyodideService(); 