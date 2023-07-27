<script lang="ts" setup>
import SunEditor from "../components/SunEditor.vue";
import { ref, onMounted, nextTick } from "vue";
import bus from "../bus";
import { createEditor } from "../editor/editor";
const filepath = "/Users/zxljoly/Desktop/sun-editor/client/demo/case1.c";
const code = `
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

onMounted(() => {
  nextTick(() => {
    createEditor(editableTabs.value[0].name, code, "cpp", filepath);
  });
  bus.on("overrideMonaco", (input) => {
    handleTabsEdit("names", "add", input.resource.path);
  });
});

let tabIndex = 2;
const editableTabsValue = ref("1");
const editableTabs = ref([
  {
    title: "case1.c",
    name: "1",
    content: "Tab 1 content",
  },
]);

const handleTabsEdit = (
  targetName: string,
  action: "remove" | "add",
  filepath
) => {
  const code1 = `/*
 * case1.h
 *
 *  Created on: 2013年11月6日
 *      Author: chenrui
 */

#ifndef CASE1_H_
#define CASE1_H_

#include "common.h"
void case1_main();
void case1_isr();


#endif /* CASE1_H_ */`;
  if (action === "add") {
    const newTabName = `${++tabIndex}`;
    editableTabs.value.push({
      title: filepath.substring(filepath.lastIndexOf("/") + 1),
      name: newTabName,
      content: "New Tab content",
    });
    editableTabsValue.value = newTabName;
    nextTick(() => {
      createEditor(newTabName, new Date() + code1, "cpp", filepath);
    });
  } else if (action === "remove") {
    const tabs = editableTabs.value;
    let activeName = editableTabsValue.value;
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          const nextTab = tabs[index + 1] || tabs[index - 1];
          if (nextTab) {
            activeName = nextTab.name;
          }
        }
      });
    }

    editableTabsValue.value = activeName;
    editableTabs.value = tabs.filter((tab) => tab.name !== targetName);
  }
};
</script>

<template>
  <el-tabs
    v-model="editableTabsValue"
    type="card"
    editable
    @edit="handleTabsEdit"
  >
    <el-tab-pane
      style="height: 100%"
      v-for="item in editableTabs"
      :key="item.name"
      :label="item.title"
      :name="item.name"
    >
      <!-- <sun-editor v-if="item.name === '1'"></sun-editor>
      <span v-if="item.name === '3'">active</span> -->
      <div :id="item.name" style="width: 100%; height: 800px"></div>
    </el-tab-pane>
  </el-tabs>
</template>
