<script lang="ts" setup>
import SunEditor from "../components/SunEditor.vue";
import { ref } from "vue";

let tabIndex = 2;
const editableTabsValue = ref("1");
const editableTabs = ref([
  {
    title: "Tab 1",
    name: "1",
    content: "Tab 1 content",
  },
]);

const handleTabsEdit = (targetName: string, action: "remove" | "add") => {
  if (action === "add") {
    const newTabName = `${++tabIndex}`;
    editableTabs.value.push({
      title: "New Tab",
      name: newTabName,
      content: "New Tab content",
    });
    editableTabsValue.value = newTabName;
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
      <div>{{ item.name }}</div>
      <sun-editor v-if="item.name === '1'"></sun-editor>
      <span v-if="item.name === '3'">active</span>
    </el-tab-pane>
  </el-tabs>
</template>
