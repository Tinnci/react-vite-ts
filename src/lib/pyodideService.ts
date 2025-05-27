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