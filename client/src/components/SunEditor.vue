<template>
  <div ref="root" style="height: 800px"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as monaco from "monaco-editor";
import {
  registerLanguage,
  connectLanguageClient,
  overrideMonaco,
} from "../language";

import { StaticServices } from "monaco-editor/esm/vs/editor/standalone/browser/standaloneServices";

const codeEditorService = StaticServices.codeEditorService.get();

const root = ref<HTMLElement | null>();
const language = "cpp";
const socketUrl = "/cpp";
const rootUri = "/Users/zxljoly/Desktop/sun-editor/client/demo/cache";
const value = `
/*
 * case1.c
 * ģʽ1����������η���֮���ԭ����Υ��
 *
 * R-W-R �������� �������ж� ������д
 *
 *  Created on: 2013��11��6��
 *      Author: chenrui
 */
#include "case1.h"

volatile unsigned char shared1_uchar;


void case1_main(){

	unsigned char tmp;
	/*  R-W-R */
	if(shared1_uchar > 0){
		tmp = shared1_uchar;
	}
}

void case1_isr(){

	idlerun();
	shared1_uchar = 1;  /* bug */
	idlerun();
}
`;

const createEditor = () => {
  const uri = "/Users/zxljoly/Desktop/sun-editor/client/demo/case1.c";
  const modelUri = monaco.Uri.parse(`file://${uri}`); // 为 model 创建的唯一资源标识符
  const model = monaco.editor.createModel(value, language, modelUri);
  const editor = monaco.editor.create(root.value, {
    model,
    glyphMargin: true,
    lightbulb: {
      enabled: true,
    },
  });
  overrideMonaco(editor);
};

onMounted(() => {
  createEditor();
  registerLanguage(monaco, rootUri);
  connectLanguageClient(socketUrl);
});
</script>

<style></style>
