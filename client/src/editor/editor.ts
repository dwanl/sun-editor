import * as monaco from "monaco-editor";
import {
  registerCppLanguage,
  connectLanguageClient,
  overrideMonaco,
} from "./language/cpp";

const rootUri = "/Users/zxljoly/Desktop/sun-editor/client/demo/cache";
const socketUrl = "/cpp";
export function createEditor(
  ref: string,
  code: string,
  language: string | undefined,
  filePath: string
) {
  // 为 model 创建的唯一资源标识符
  const modelUri = monaco.Uri.parse("file://" + filePath);
  let model = monaco.editor.getModel(modelUri);
  if (!model) {
    model = monaco.editor.createModel(code, language, modelUri);
  }

  const editor = monaco.editor.create(
    document.getElementById(ref) as HTMLElement,
    {
      model,
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
      readOnly: true
    },
    {
      textModelService: {
        createModelReference: function (uri: any) {
          console.log(this.getModel(uri));
          
          return this.getModel(uri);
        },
        registerTextModelContentProvider: function () {
          return { dispose: function () {} };
        },
        hasTextModelContentProvider: function (schema: any) {
          return true;
        },
        _buildReference: function (model: any) {
          var lifecycle = require("monaco-editor/esm/vs/base/common/lifecycle");
          var ref = new lifecycle.ImmortalReference({ textEditorModel: model });
          return {
            object: ref.object,
            dispose: function () {
              ref.dispose();
            },
          };
        },
        getModel: function (uri: monaco.Uri) {
          console.log(uri);
          
          var _this = this;
          return new Promise(function (resolve) {
            var model = monaco.editor.getModel(uri);
            console.log(model);
            
          });
        },
      },
    }
  );
  if (language === "cpp" || language === "c") {
    registerCppLanguage(monaco, rootUri);
    connectLanguageClient(socketUrl);
    overrideMonaco(editor);
  }
  return editor;
}
