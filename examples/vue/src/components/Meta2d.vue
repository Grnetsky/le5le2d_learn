<!--
 * @Description:
 * @Author: G
 * @Date: 2021-10-13 11:10:11
 * @LastEditTime: 2021-10-13 14:05:59
-->
<script setup lang="ts">
import { onMounted, ref } from "vue";
// 测试本地使用
import { Meta2d,Pen } from "../../../../packages/core";
import { register as registerEcharts } from "@meta2d/chart-diagram";
// import { Pen, Meta2d } from "@meta2d/core";

onMounted(() => {
  const meta2d = new Meta2d("meta2d"); // 选择器
  // registerEcharts();

  // 监听消息
  meta2d.on("showDialog", ({ pen }: { pen: Pen }) => {
    console.log('触发showDialog');

    currentPen.value = pen;

    // vue 打开弹窗
    visible.value = true;
  });
  (window as any).mainMeta2d = (window as any).meta2d;
});

const visible = ref(false);
const currentPen = ref<Pen>({});

</script>

<template>
  <div class="main">
    <div class="meta2d" id="meta2d"></div>
  </div>

  <a-modal v-model:visible="visible" :title="currentPen.text">
    <p>{{ currentPen.name }}</p>
    <p>{{ currentPen.text }}</p>
  </a-modal>
</template>

<style scoped></style>
